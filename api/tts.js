/* ================================================================
   The voice. Claude is still the brain — this endpoint only turns the
   text Claude already produced into audio.

   THE KEYS NEVER LEAVE THE SERVER. The client posts text and the name
   of the provider it would like; the key lives in the environment here
   and is never sent to the browser, never in the bundle, never in a URL.

   Providers are tried in the order the client asks for, and one is only
   attempted if its key exists. With no keys at all this answers 503 and
   the client speaks with the browser's own voice, so the site is never
   mute and adding a key needs no code change.
   ================================================================ */

/* EXACT NAMES ONLY.
   
   A previous version matched on a normalised name so that spellings like
   eleven_labs_key would also resolve. That is removed on request: an
   alias makes a misconfigured variable look configured, and the name a
   deployment depends on should be the one written down in README.md and
   nothing else. A key under any other name now reads as absent, which
   is what it is. */
const KEYS = {
  elevenlabs: "ELEVENLABS_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

const envKey = (provider) => process.env[KEYS[provider]] || null;

const MAX_CHARS = 900;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30; // roughly a continuous conversation, not a scraper

const buckets = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 500) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < WINDOW_MS)) buckets.delete(k);
  }
  return hits.length > MAX_PER_WINDOW;
}

/* Resolved once per instance. Looking up a voice on every reply would
   add a round trip to every sentence the assistant speaks. */
let cachedElevenVoice = null;

async function elevenVoiceId(key, configured) {
  if (configured) return configured;
  if (cachedElevenVoice) return cachedElevenVoice;

  const r = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key } });
  /* 401 here means the key was found but ElevenLabs rejected it, which
     is a different problem from a missing key and points at the value
     rather than the name or the deployment. */
  if (r.status === 401) throw new Error("key rejected by ElevenLabs (401) - check the value, not the name");
  if (!r.ok) throw new Error(`voices ${r.status}`);
  const { voices = [] } = await r.json();

  /* Pick a female voice from the account's own library rather than
     hardcoding an ID that may not exist on it. labels.gender is what
     ElevenLabs itself tags them with. */
  const female = voices.find((v) => String(v.labels?.gender || "").toLowerCase() === "female");
  cachedElevenVoice = (female || voices[0])?.voice_id;
  if (!cachedElevenVoice) throw new Error("no voices on this account");
  return cachedElevenVoice;
}

async function speakElevenLabs(text, opts) {
  const key = envKey("elevenlabs");
  if (!key) return null;

  const id = await elevenVoiceId(key, opts?.voiceId);

  /* THE with-timestamps VARIANT, which is the whole reason the voice
     can be lip-synced properly. It returns the audio AND where every
     character of the text falls inside it.
     
     CHARACTER alignment, not phoneme alignment — the API does not
     expose phonemes. The grapheme-to-viseme approximation lives in
     visemeMap.js and is honest about being one. */
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${id}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: opts?.model || "eleven_multilingual_v2",
        voice_settings: opts?.settings,
      }),
    }
  );
  if (!r.ok) throw new Error(`elevenlabs ${r.status} ${(await r.text()).slice(0, 200)}`);

  const data = await r.json();
  return {
    audio: data.audio_base64,
    type: "audio/mpeg",
    /* normalized_alignment follows the text as the model actually spoke
       it — expanded numbers and abbreviations — so it lines up with the
       audio where the raw alignment can drift. */
    alignment: data.normalized_alignment || data.alignment || null,
  };
}

async function speakOpenAI(text, opts) {
  const key = envKey("openai");
  if (!key) return null;

  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts?.model || "gpt-4o-mini-tts",
      voice: opts?.voice || "shimmer",
      input: text,
      instructions: opts?.instructions || "",
      response_format: "mp3",
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status} ${(await r.text()).slice(0, 200)}`);
  /* No alignment: OpenAI's speech endpoint returns audio only. That
     path falls back to amplitude-driven mouth openness on the client. */
  return {
    audio: Buffer.from(await r.arrayBuffer()).toString("base64"),
    type: "audio/mpeg",
    alignment: null,
  };
}

const PROVIDERS = { elevenlabs: speakElevenLabs, openai: speakOpenAI };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return res.status(429).json({ error: "slow-down" });

  const text = String(req.body?.text || "").slice(0, MAX_CHARS).trim();
  if (!text) return res.status(400).json({ error: "empty" });

  /* The client sends its configured order; anything not in PROVIDERS is
     dropped rather than trusted, so the request cannot name an
     arbitrary upstream. */
  const asked = Array.isArray(req.body?.order) ? req.body.order : ["elevenlabs", "openai"];
  const order = asked.filter((p) => p in PROVIDERS);
  const options = req.body?.options || {};

  const tried = [];
  for (const name of order) {
    try {
      const out = await PROVIDERS[name](text, options[name]);
      if (!out) { tried.push(`${name}:no-key`); continue; }
      /* One JSON shape for every provider, so the client never has to
         branch on which one answered. Base64 costs a third more bytes
         than raw audio and buys a single code path plus somewhere to
         put the alignment. */
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-TTS-Provider", name);
      return res.status(200).json({
        provider: name,
        mime: out.type,
        audio: out.audio,
        alignment: out.alignment,
      });
    } catch (e) {
      /* A provider that is configured but failing should not take the
         voice down — fall through to the next one, and to the browser
         if there is none. */
      console.error("tts", name, e.message);
      tried.push(`${name}:${e.message.slice(0, 60)}`);
    }
  }

  /* NAMES ONLY, never values. "no-key" is ambiguous on its own -- it
     cannot tell a variable that was never added from one added under a
     slightly different name, and chasing that difference through a
     dashboard is slow. This reports whether each expected name is
     present, plus any OTHER variable whose name looks like it was meant
     to be one of them, which is what catches ELEVEN_LABS_API_KEY and
     friends. No value is ever read or returned. */
  const configured = {
    elevenlabs: !!envKey("elevenlabs"),
    openai: !!envKey("openai"),
    anthropic: !!envKey("anthropic"),
  };
  const lookalikes = Object.keys(process.env).filter(
    (k) => /eleven|tts|voice|speech/i.test(k) && !(k in configured)
  );

  return res.status(503).json({
    error: "tts-unavailable",
    /* Which resolution rule this build uses. Lets a deploy be confirmed
       live without spending an upstream call to find out. */
    keyLookup: "exact",
    tried,
    configured,
    lookalikes,
  });
}
