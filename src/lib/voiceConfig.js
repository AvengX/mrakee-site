/* ================================================================
   ONE PLACE TO CHANGE THE VOICE.

   Nothing else in the app names a voice, a rate or a provider. Swapping
   the assistant's voice is an edit to this file and nothing else.

   PROVIDER is the important switch:

     "browser"  speechSynthesis, free, no key, no network. Quality is
                whatever the visitor's operating system ships, which is
                the honest weakness — Windows Heera is intelligible but
                plainly synthetic.

     "server"   POST /api/tts, which returns real audio. Falls back to
                "browser" on its own if that endpoint is not configured
                or fails, so setting this without a key degrades rather
                than breaks.

   The server path is the one worth having and it needs a key the
   project does not currently hold. See api/tts.js.
   ================================================================ */

export const VOICE = {
  provider: "server",

  /* The server voice. Named here rather than in the endpoint so that
     changing it never means touching server code. */
  name: "shimmer",

  /* Steer the delivery. Providers that accept an instruction use this;
     the browser path ignores it. */
  instructions:
    "Speak as a warm, confident woman in her thirties working in customer " +
    "experience at a technology company. Natural conversational pace, not " +
    "presenter-fast and not slow. Vary your intonation — let sentences fall " +
    "at the end rather than holding one flat pitch. Small natural pauses at " +
    "commas. Friendly and genuinely helpful, never bubbly and never robotic.",

  /* The browser fallback. rate slightly above 1 because the default of
     most system voices reads noticeably slower than speech. */
  browser: {
    lang: "en-IN",
    rate: 1.04,
    pitch: 1.02,

    /* There is no gender field on SpeechSynthesisVoice — it carries
       name, lang, localService and default and nothing else — so the
       only handle on "female" is the name. These are the ones the
       platforms actually ship, best first. */
    prefer: [
      "heera", "kalpana", "veena", "raveena", "priya", "isha", "neerja",
      "aria", "jenny", "sonia", "zira", "hazel", "susan", "catherine",
      "samantha", "serena", "victoria", "karen", "moira", "tessa", "fiona",
      "female", "woman",
      "google uk english female", "google us english",
    ],
  },
};
