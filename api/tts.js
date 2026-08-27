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
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;

  const id = await elevenVoiceId(key, opts?.voiceId);
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`,
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
  return { buf: Buffer.from(await r.arrayBuffer()), type: "audio/mpeg" };
}

async function speakOpenAI(text, opts) {
  const key = process.env.OPENAI_API_KEY;
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
  return { buf: Buffer.from(await r.arrayBuffer()), type: "audio/mpeg" };
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
      res.setHeader("Content-Type", out.type);
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-TTS-Provider", name);
      return res.status(200).send(out.buf);
    } catch (e) {
      /* A provider that is configured but failing should not take the
         voice down — fall through to the next one, and to the browser
         if there is none. */
      console.error("tts", name, e.message);
      tried.push(`${name}:${e.message.slice(0, 60)}`);
    }
  }

  return res.status(503).json({ error: "tts-unavailable", tried });
}
