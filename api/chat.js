import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
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

const MODEL = "claude-opus-5";
const MAX_MESSAGE_CHARS = 600;
const MAX_TURNS = 16;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

const SYSTEM = buildSystemPrompt();
const TITLES = SOLUTIONS.map((s) => s.t);

const Answer = z.object({
  reply: z
    .string()
    .describe(
      "One to three sentences, spoken aloud to a visitor. Conversational, contractions, " +
        "no opening filler like Certainly or Of course, no lists read out."
    ),
  matches: z
    .array(z.string())
    .describe("Exact solution portfolio titles, at most three. Empty when none apply."),
  handoff: z
    .boolean()
    .describe("True when the reference cannot answer this and the team should."),
});

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

  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4096,
      output_config: {
        effort: "low",
        format: zodOutputFormat(Answer, "answer"),
      },
      // marked cacheable: identical on every request, ~2,300 tokens, so
      // it is written once and read back at a fraction on every message
      // after
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: clean,
    });

    const out = response.parsed_output;
    if (!out) {
      return res.status(502).json({ error: "The answer came back malformed. Try again." });
    }

    return res.status(200).json({
      reply: out.reply,
      // never trust the model with the card list: drop anything that is
      // not one of the nine real portfolio titles
      matches: (out.matches || []).filter((t) => TITLES.includes(t)).slice(0, 3),
      handoff: !!out.handoff,
      usage: {
        input: response.usage?.input_tokens ?? null,
        cacheRead: response.usage?.cache_read_input_tokens ?? null,
        output: response.usage?.output_tokens ?? null,
      },
    });
  } catch (err) {
    const status = err?.status;
    const detail = String(err?.message || "");

    if (status === 401) {
      return res.status(503).json({
        error: "The assistant is not configured correctly.",
        detail: "The API key was rejected. Check ANTHROPIC_API_KEY in Vercel.",
      });
    }
    /* Its own case rather than a generic 500. An empty account answers
       with a 400 that looks like a malformed request, and the first time
       it happened it cost a round-trip through the runtime logs to find
       out the code was fine and the balance was zero. Say so here. */
    if (status === 400 && /credit balance|purchase credits/i.test(detail)) {
      return res.status(503).json({
        error: "The assistant is temporarily unavailable.",
        detail:
          "The Anthropic account has no credit. Console -> Plans & Billing -> Purchase credits.",
      });
    }
    if (status === 429 || status === 529) {
      return res.status(503).json({ error: "Busy right now — try again in a moment." });
    }
    console.error("assistant:", err?.message || err);
    return res.status(500).json({ error: "Something went wrong answering that." });
  }
}
