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
export function listen({ onPartial, onStart } = {}) {
  if (!Recognition) return { start: () => {}, stop: () => {}, promise: Promise.reject(new Error("unsupported")) };

  const rec = new Recognition();
  // en-IN because this client and most of its enquiries are Indian; the
  // engine still understands other English accents, it just weights
  // toward this one.
  rec.lang = "en-IN";
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let finalText = "";
  let lastInterim = "";
  let settled = false;

  const promise = new Promise((resolve, reject) => {
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
    start: () => { try { rec.start(); } catch { /* already started */ } },
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
