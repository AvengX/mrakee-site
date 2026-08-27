/* ================================================================
   Real speech, when a key is available.

   The browser's speechSynthesis is free and needs no key, and it also
   sounds like what it is. This endpoint returns actual generated audio
   instead, which is the single biggest difference between "a website
   with a bot on it" and "someone is talking to me".

   IT IS OFF UNTIL A KEY EXISTS. With no OPENAI_API_KEY set this
   answers 503 and the client falls straight back to the browser voice,
   so deploying this changes nothing until the key is added.

   WHY NOT THE REALTIME API, which the brief asked for: Realtime is
   speech-to-speech. It listens, thinks and speaks as one model, which
   means it would REPLACE Claude as the brain — and with it every
   grounding rule in assistantPrompt.js, the refusals for price and
   timelines, the structured "matches" that drive the solution cards,
   and the origin and rate limits in chat.js. The visitor would get a
   better voice attached to a model that will happily invent a price.
   Claude stays the brain and this supplies the mouth, which keeps both.
   ================================================================ */

const MAX_CHARS = 900;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // Not an error worth logging: this is the expected state until the
    // key is added, and the client treats it as "use the browser voice".
    return res.status(503).json({ error: "tts-not-configured" });
  }

  const text = String(req.body?.text || "").slice(0, MAX_CHARS).trim();
  if (!text) return res.status(400).json({ error: "empty" });

  const voice = String(req.body?.voice || "shimmer");
  const instructions = String(req.body?.instructions || "");

  try {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        instructions,
        // Opus in a webm container: about a third the bytes of mp3 at
        // this quality, and every browser that can run this page can
        // decode it.
        response_format: "opus",
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error("tts upstream", r.status, detail.slice(0, 300));
      return res.status(502).json({ error: "tts-upstream" });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/ogg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buf);
  } catch (e) {
    console.error("tts failed", e);
    return res.status(502).json({ error: "tts-failed" });
  }
}
