/* ================================================================
   ONE PLACE TO CHANGE THE VOICE.

   Nothing else in the app names a provider, a voice or a rate.

   Claude is the brain and stays the brain — this file only decides what
   the answer SOUNDS like. Recognition -> Claude -> text -> here.

   PROVIDER ORDER, not a single choice. The client asks for the first
   one whose key is present on the server, falling through the list, and
   lands on the browser's own voice if none is configured. So the site
   talks in every state, and adding a key upgrades it with no code
   change and no redeploy of the front end.

     "elevenlabs"  the most natural of the three, and the reason it is
                   first: this is the only one most listeners will not
                   immediately clock as synthetic. Needs
                   ELEVENLABS_API_KEY.
     "openai"      very close behind, materially cheaper, and the only
                   one that takes a plain-English delivery instruction.
                   Needs OPENAI_API_KEY.
     "browser"     speechSynthesis. Free, no key, no network, and
                   audibly a robot. Present so nothing ever fails
                   silently.
   ================================================================ */

export const VOICE = {
  order: ["elevenlabs", "openai", "browser"],

  elevenlabs: {
    /* Leave voiceId empty and the server picks a female voice from the
       account's own library on first use, then caches it. That avoids
       hardcoding an ID that may not exist on this account — set one
       here to pin it, from elevenlabs.io/app/voice-library. */
    voiceId: "",

    /* Quality over latency, which is the stated priority.
       eleven_turbo_v2_5 is roughly half the latency and slightly less
       expressive if that trade is ever wanted. */
    model: "eleven_multilingual_v2",

    settings: {
      /* Lower stability is counter-intuitive: it means MORE variation
         between sentences. At 0.5+ the reading flattens into the
         even, unbothered tone that gives a synthetic voice away. */
      stability: 0.38,
      similarity_boost: 0.75,
      /* A little performance. Past ~0.4 it starts acting. */
      style: 0.28,
      use_speaker_boost: true,
    },
  },

  openai: {
    model: "gpt-4o-mini-tts",
    /* Female-presenting: shimmer, nova, coral, sage, ballad. */
    voice: "shimmer",
    instructions:
      "Speak as a warm, confident woman in her thirties who works in customer " +
      "experience at a technology company. Natural conversational pace — not " +
      "presenter-bright, not slow. Let your intonation move: sentences should " +
      "fall at the end rather than hold one flat pitch. Small natural pauses " +
      "at commas. Friendly and genuinely helpful, never bubbly, never robotic.",
  },

  browser: {
    lang: "en-IN",
    rate: 1.04,
    pitch: 1.02,
    /* SpeechSynthesisVoice carries name, lang, localService and default
       and nothing else — there is no gender field — so the only handle
       on "female" is the name. Best first. */
    prefer: [
      "heera", "kalpana", "veena", "raveena", "priya", "isha", "neerja",
      "aria", "jenny", "sonia", "zira", "hazel", "susan", "catherine",
      "samantha", "serena", "victoria", "karen", "moira", "tessa", "fiona",
      "female", "woman",
      "google uk english female", "google us english",
    ],
  },
};
