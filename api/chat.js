import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../src/lib/assistantPrompt.js";
import { SOLUTIONS } from "../src/content/mrakee.js";

/* ================================================================
   The assistant's server side.

   This exists because an API key cannot live in the browser. Vite
   compiles src/ into a public bundle, so a key placed anywhere in the
   app is readable by anyone who opens devtools. Here it is only ever
   process.env on Vercel's side.

   An unauthenticated endpoint that spends money on every call is an
   open wallet, so the limits below are not optional decoration:
   per-IP rate limiting, a cap on message length, a cap on turns, and
   an origin check. The in-memory bucket is per serverless instance
   rather than global — it stops a loop from one machine, not a
   distributed flood. The hard backstop is the monthly cap set in the
   Anthropic Console, which belongs there rather than here.
   ================================================================ */

/* MODEL, and why it is not Opus.
   Opus 5 runs adaptive thinking whenever `thinking` is omitted, so every
   "Hello" was reasoned about before it was answered. Measured against
   production: 3.8-4.7s to produce ~65 tokens, which is far longer than
   65 tokens take to generate — the difference was thinking.
   This is a scoped FAQ assistant answering one to three sentences from a
   cached reference. It needs time-to-first-token, not reasoning depth.
   Haiku 4.5 does not think unless asked and is the fastest model in the
   family. Note it REJECTS output_config.effort, which is why that is
   gone rather than lowered.

   SONNET 5 WAS TRIED AND LOST, so nobody needs to try it again. It was
   measured in production with thinking explicitly disabled: median TTFT
   3,525ms against Haiku's ~1,600ms. It caches this prompt where Haiku
   does not (minimums are 1,024 and 4,096 tokens; ours is ~2,329), and
   it still lost by more than two to one — which settles that the
   uncached prefill is not the term that matters here.

   THE CACHE COST OF THIS CHOICE IS REAL AND ACCEPTED. Below 4,096
   tokens Haiku ignores cache_control silently, with no error, so every
   request re-reads ~2,329 input tokens. At Haiku's rate that is about
   $0.002 per message. The cache_control below is kept deliberately: it
   costs nothing today and starts working the moment the reference grows
   past the threshold. */
const MODEL = "claude-haiku-4-5";

/* The control line the model appends, and the client never sees. It
   carries the two things the prose cannot: which solution cards to show,
   and whether to offer the team. Streaming plain prose and parsing this
   at the end keeps both, where structured output would have made every
   delta a fragment of JSON — unreadable to stream. */
const META = "@@";
const MAX_MESSAGE_CHARS = 600;
const MAX_TURNS = 16;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

const SYSTEM = buildSystemPrompt();
const TITLES = SOLUTIONS.map((s) => s.t);

const buckets = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const hits = (buckets.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  buckets.set(ip, hits);
  // the map would otherwise grow for the life of the instance
  if (buckets.size > 500) {
    for (const [k, v] of buckets) {
      if (!v.length || now - v[v.length - 1] > WINDOW_MS) buckets.delete(k);
    }
  }
  return hits.length > MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  /* TEMPORARY INSTRUMENTATION for the second latency pass. Reports where
     the wall-clock actually goes, so the next change is aimed rather
     than guessed. Removed before this pass is finished. */
  const T = { recv: Date.now() };
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  // Same-origin only. Not a security boundary on its own — a header is
  // trivially forged — but it turns away the casual "someone found your
  // endpoint" traffic that costs real money.
  const origin = req.headers.origin || "";
  const host = req.headers.host || "";
  if (origin && !origin.includes(host)) {
    return res.status(403).json({ error: "Cross-origin requests are not accepted." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({
      error: "That is a lot of questions at once. Give it a minute and try again.",
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: "The assistant is not configured yet.",
      detail: "ANTHROPIC_API_KEY is not set on this deployment.",
    });
  }

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!messages || !messages.length) {
    return res.status(400).json({ error: "No messages supplied." });
  }
  if (messages.length > MAX_TURNS) {
    return res.status(400).json({
      error: "This conversation has run long. Start a new one, or send us an enquiry.",
    });
  }
  const clean = messages.slice(-MAX_TURNS).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, MAX_MESSAGE_CHARS),
  }));
  if (!clean.some((m) => m.content.trim())) {
    return res.status(400).json({ error: "Nothing to answer." });
  }

  /* SERVER-SENT EVENTS, so the first words reach the browser as soon as
     the model produces them instead of after the whole answer exists.
     X-Accel-Buffering:no matters as much as the content type — without
     it a proxy is free to hold the body until it is complete, which
     would give back exactly the latency this removes. */
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  /* One SSE frame: `data: ` + JSON + a blank line. The blank line is
     the frame terminator, so it is written explicitly rather than as
     two real newlines in the template — a formatter would eat those. */
  const FRAME_END = "\n\n";
  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}${FRAME_END}`);

  /* Sent before the model is called, so the client can separate
     "reaching the function" from "the model thinking". */
  send({ ready: 1 });

  try {
    T.clientReady = Date.now();
    const client = new Anthropic();
    T.modelStart = Date.now();
    const stream = client.messages.stream({
      model: MODEL,
      /* 1024, not 4096. The reply is one to three sentences; a cap this
         far above the real length only risks a long tail. */
      max_tokens: 1024,
      // identical on every request, so it is written once and read back
      // at a fraction on every message after
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: clean,
    });

    /* Everything before the control line is prose and goes straight out.
       The line itself must never reach the browser, so the tail of the
       buffer is held back until it is long enough to prove it is not the
       start of the marker. */
    let full = "";
    let sent = 0;
    let cut = -1;

    stream.on("text", (delta) => {
      if (!T.firstDelta) T.firstDelta = Date.now();
      full += delta;
      if (cut === -1) {
        const at = full.indexOf(META);
        if (at !== -1) cut = at;
      }
      const limit = cut === -1 ? Math.max(0, full.length - META.length) : cut;
      if (limit > sent) {
        send({ t: full.slice(sent, limit) });
        sent = limit;
      }
    });

    await stream.done();

    // whatever prose is left, minus the control line
    const body = (cut === -1 ? full : full.slice(0, cut)).trimEnd();
    if (body.length > sent) send({ t: body.slice(sent) });

    /* The model is never trusted with the card list: parse what it sent,
       then keep only titles that are actually one of the nine. A missing
       or malformed line costs the cards, not the answer. */
    let matches = [];
    let handoff = false;
    if (cut !== -1) {
      try {
        const meta = JSON.parse(full.slice(cut + META.length).trim());
        matches = (meta.matches || []).filter((t) => TITLES.includes(t)).slice(0, 3);
        handoff = !!meta.handoff;
      } catch {
        /* prose already delivered; cards simply do not appear */
      }
    }

    const msg = await stream.finalMessage();
    send({
      done: true,
      reply: body,
      matches,
      handoff,
      timing: {
        sdkInit: T.clientReady - T.recv,
        toModelCall: T.modelStart - T.recv,
        anthropicTTFT: (T.firstDelta || Date.now()) - T.modelStart,
        serverTotal: Date.now() - T.recv,
      },
      usage: {
        input: msg?.usage?.input_tokens ?? null,
        cacheRead: msg?.usage?.cache_read_input_tokens ?? null,
        output: msg?.usage?.output_tokens ?? null,
      },
    });
    return res.end();
  } catch (err) {
    const status = err?.status;
    const detail = String(err?.message || "");

    /* The headers went out before the model was called, so the old
       res.status().json() path would throw here and leave the browser
       holding an open connection and a spinner that never resolves.
       Once streaming has begun the only way to report a failure is
       through the stream itself. */
    const fail = (message, extra) => {
      if (res.headersSent) {
        send({ error: message, ...(extra ? { detail: extra } : {}) });
        return res.end();
      }
      return res
        .status(status === 429 || status === 529 ? 503 : 503)
        .json({ error: message, ...(extra ? { detail: extra } : {}) });
    };

    if (status === 401) {
      return fail(
        "The assistant is not configured correctly.",
        "The API key was rejected. Check ANTHROPIC_API_KEY in Vercel."
      );
    }
    /* Its own case rather than a generic 500. An empty account answers
       with a 400 that looks like a malformed request, and the first time
       it happened it cost a round-trip through the runtime logs to find
       out the code was fine and the balance was zero. Say so here. */
    if (status === 400 && /credit balance|purchase credits/i.test(detail)) {
      return fail(
        "The assistant is temporarily unavailable.",
        "The Anthropic account has no credit. Console -> Plans & Billing -> Purchase credits."
      );
    }
    if (status === 429 || status === 529) {
      return fail("Busy right now — try again in a moment.");
    }
    console.error("assistant:", err?.message || err);
    return fail("Something went wrong answering that.");
  }
}
