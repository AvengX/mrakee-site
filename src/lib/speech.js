/* ================================================================
   Voice, using what the browser already has.

   Neither half is a paid service: SpeechRecognition and
   speechSynthesis ship with the browser. That keeps voice free and
   keeps audio off the server — but support is uneven and has to be
   detected rather than assumed:

     · Recognition: Chrome and Edge yes, Safari behind a webkit prefix
       and unreliable on iOS, Firefox not at all.
     · Synthesis: everywhere, though the voice list is the operating
       system's and quality varies wildly between machines.

   So both are optional enhancements. The typed path stays the primary
   one and never depends on either.
   ================================================================ */

const Recognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const canListen = !!Recognition;
export const canSpeak =
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * One dictation. Resolves with the final transcript, or rejects with a
 * reason the interface can actually show someone.
 */
/* Every code the spec defines, in words a visitor can act on. Leaving
   these unmapped is what made a failure look like a dead button: the
   only one that ever surfaced was not-allowed, so no-speech, network
   and language-not-supported were all silently swallowed and the
   assistant just sat there. */
export const SPEECH_ERRORS = {
  "no-speech": "I didn't catch anything — try again, and speak just after the mic turns red.",
  "audio-capture": "No microphone was found on this device.",
  "not-allowed": "Microphone access was blocked. You can still type your question.",
  "service-not-allowed": "This browser blocked the speech service. You can still type your question.",
  "network": "Speech recognition needs a connection to work and could not reach the service.",
  "language-not-supported": "This browser does not support the language setting for speech.",
  "bad-grammar": "Speech recognition failed to start properly.",
};

/* Ask for the microphone BEFORE recognition starts.
 *
 * Chrome raises its permission bubble at the moment rec.start() runs,
 * and the engine is live behind it — so on a first visit the visitor
 * taps, the bubble appears, they speak into a session that is not
 * capturing, they grant access, and by then the session has ended with
 * nothing. Nothing restarts, and it reads exactly like a microphone
 * that cannot hear them.
 *
 * getUserMedia settles only once the visitor has actually answered, so
 * awaiting it puts the prompt before the recording instead of during
 * it. The stream is stopped immediately — it was only ever the
 * question, not the capture; recognition opens its own.
 *
 * It is SKIPPED once permission is already granted, and that is not an
 * optimisation. Opening the device and closing it again milliseconds
 * before the recogniser asks for it is real churn on Windows audio
 * drivers, and the recogniser can end up holding a stream that is not
 * live yet. There is no prompt to get ahead of in that case, so the
 * safe thing is to not touch the device at all. */
export async function ensureMicPermission() {
  if (!navigator?.mediaDevices?.getUserMedia) return; // let start() report it

  try {
    const st = await navigator.permissions?.query({ name: "microphone" });
    if (st?.state === "granted") return;
  } catch {
    /* Firefox and older Safari do not accept "microphone" as a
       permission name. Fall through and ask properly. */
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

export function listen({ onPartial, onStart, lang = "en-IN" } = {}) {
  if (!Recognition) return { start: () => {}, stop: () => {}, promise: Promise.reject(new Error("unsupported")) };

  const rec = new Recognition();
  // en-IN because this client and most of its enquiries are Indian; the
  // engine still understands other English accents, it just weights
  // toward this one. Not every build ships it though, so the caller
  // retries in en-US on language-not-supported.
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let finalText = "";
  let lastInterim = "";
  let settled = false;
  let reject;

  const promise = new Promise((resolve, _reject) => {
    reject = _reject;
    rec.onstart = () => onStart?.();
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (interim.trim()) lastInterim = (finalText + interim).trim();
      onPartial?.((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      if (settled) return;
      settled = true;
      // "no-speech" and "aborted" are ordinary, not failures worth a
      // red message — the caller decides
      reject(Object.assign(new Error(e.error || "speech-error"), { code: e.error }));
    };
    rec.onend = () => {
      if (settled) return;
      settled = true;
      /* Fall back to the last interim transcript. Chrome does not always
         promote the final phrase before firing onend — especially on a
         short utterance — and resolving with "" there means the visitor
         speaks, sees their words appear, and then watches them vanish
         with nothing sent. That is the "it is not reading my voice"
         failure, and it is a dropped result rather than a deaf mic. */
      resolve((finalText.trim() || lastInterim).trim());
    };
  });

  return {
    lang,
    start: () => {
      try {
        rec.start();
      } catch (e) {
        /* Not swallowed. start() throws if the engine is already
           running or unavailable, and eating that exception is what
           turns a broken microphone into a button that does nothing at
           all. */
        if (!settled) {
          settled = true;
          reject(Object.assign(new Error(e.message || "start-failed"), { code: "bad-grammar" }));
        }
      }
    },
    stop: () => { try { rec.stop(); } catch { /* not running */ } },
    abort: () => { try { rec.abort(); } catch { /* not running */ } },
    promise,
  };
}

/** Speak, and call back when the mouth should stop moving. */
export function speak(text, { onEnd } = {}) {
  if (!canSpeak || !text) { onEnd?.(); return () => {}; }
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-IN";
  u.rate = 1.02;
  u.pitch = 1;

  // Prefer an Indian English voice when the machine has one, then any
  // English voice, then whatever the default is.
  const voices = window.speechSynthesis.getVoices();
  u.voice =
    voices.find((v) => v.lang === "en-IN") ||
    voices.find((v) => v.lang?.startsWith("en")) ||
    null;

  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);

  return () => window.speechSynthesis.cancel();
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}
