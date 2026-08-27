/* ================================================================
   Characters in, mouth shapes out.

   WHAT THIS IS NOT: phoneme recognition. ElevenLabs' timestamps
   endpoint returns CHARACTER alignment — where each letter of the text
   falls in the audio — not phonemes. English spelling is not
   phonetic, so this is a grapheme approximation with the digraphs that
   matter handled explicitly. "th" is one sound, "sh" is one sound, and
   a silent final "e" is no sound at all.

   Ten shapes, matching the images in public/assistant/visemes.
   ================================================================ */

export const VISEMES = ["rest", "A", "E", "I", "O", "U", "MBP", "FV", "TH", "LDNT"];

/* Digraphs first — they are the whole reason this is a function rather
   than a lookup table. Checked longest-first at each position. */
const DIGRAPHS = [
  ["th", "TH"],
  ["sh", "I"], ["ch", "I"], ["zh", "I"],
  ["ph", "FV"],
  ["ck", "LDNT"], ["ng", "LDNT"],
  ["oo", "U"], ["ou", "O"], ["ow", "O"], ["oi", "O"], ["oy", "O"],
  ["ee", "E"], ["ea", "E"], ["ie", "E"], ["ei", "E"],
  ["ai", "A"], ["ay", "A"], ["au", "O"], ["aw", "O"],
  ["qu", "U"],
];

const SINGLE = {
  a: "A", e: "E", i: "I", o: "O", u: "U", y: "I",
  m: "MBP", b: "MBP", p: "MBP",
  f: "FV", v: "FV",
  l: "LDNT", d: "LDNT", n: "LDNT", t: "LDNT",
  s: "I", z: "I", c: "I", j: "I", x: "I",
  k: "LDNT", g: "LDNT",
  r: "O", w: "U",
  h: "A", q: "U",
};

/**
 * Which mouth shape belongs to the character at `i` of `text`.
 * Returns a viseme name, or null for anything that makes no shape at
 * all — spaces, punctuation, and the silent "e" that ends a word.
 */
export function visemeAt(text, i) {
  const lower = text.toLowerCase();
  const ch = lower[i];
  if (!ch || !/[a-z]/.test(ch)) return null;

  /* Only treat a digraph as one shape at its FIRST character; its
     second character then maps to nothing, so "th" holds one mouth
     rather than flicking through two. */
  for (const [pair, v] of DIGRAPHS) {
    if (lower.startsWith(pair, i)) return v;
    if (i > 0 && lower.startsWith(pair, i - 1)) return null;
  }

  /* Silent final e: "make", "some", "wide". Sounded when the word is
     two letters ("be", "we"), so length is checked. */
  if (ch === "e") {
    const next = lower[i + 1];
    const isWordEnd = !next || !/[a-z]/.test(next);
    if (isWordEnd) {
      let start = i;
      while (start > 0 && /[a-z]/.test(lower[start - 1])) start--;
      if (i - start >= 3) return null;
    }
  }

  return SINGLE[ch] || "LDNT";
}

/**
 * Turn ElevenLabs character alignment into a viseme timeline.
 *
 * Adjacent identical shapes are merged: "hello" would otherwise fire
 * LDNT twice in a row for the two l's, and re-triggering the same mouth
 * reads as a stutter rather than a held sound.
 */
export function buildTimeline({ characters, character_start_times_seconds, character_end_times_seconds }) {
  if (!characters?.length) return [];
  const text = characters.join("");
  const out = [];

  for (let i = 0; i < characters.length; i++) {
    const v = visemeAt(text, i);
    const start = character_start_times_seconds[i];
    const end = character_end_times_seconds[i];
    if (typeof start !== "number") continue;

    if (!v) {
      /* Silence and punctuation close the mouth, but only if the gap is
         long enough to see — closing between every word looks frantic. */
      if (end - start > 0.09 && out.length && out[out.length - 1].v !== "rest") {
        out.push({ t: start, v: "rest" });
      }
      continue;
    }
    if (out.length && out[out.length - 1].v === v) continue;
    out.push({ t: start, v });
  }

  if (out.length) {
    const last = character_end_times_seconds[character_end_times_seconds.length - 1];
    out.push({ t: last, v: "rest" });
  }
  return out;
}
