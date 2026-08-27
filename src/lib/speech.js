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

import { VOICE } from "./voiceConfig.js";

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

/* ----------------------------------------------------------------
   SPEAKING

   Two paths behind one call. `speak()` tries the server voice and falls
   back to the browser's own on any failure, so the site keeps talking
   whatever the key situation is.
   ---------------------------------------------------------------- */

let current = null; // the audio element or utterance in flight

/* The browser fallback. There is no gender field on
   SpeechSynthesisVoice, so the only handle on "female" is the name;
   the ordered list lives in voiceConfig. */
function pickBrowserVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // list loads late; the default is used
  const { lang, prefer } = VOICE.browser;
  const rank = (v) => {
    const n = v.name.toLowerCase();
    const i = prefer.findIndex((h) => n.includes(h));
    return i === -1 ? 999 : i;
  };
  const inLang = voices.filter((v) => v.lang === lang);
  const inEn = voices.filter((v) => v.lang?.startsWith("en"));
  const best = (xs) => xs.filter((v) => rank(v) < 999).sort((a, b) => rank(a) - rank(b))[0];
  return best(inLang) || best(inEn) || inLang[0] || inEn[0] || null;
}

function speakInBrowser(text, onEnd) {
  if (!canSpeak) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = VOICE.browser.lang;
  u.rate = VOICE.browser.rate;
  u.pitch = VOICE.browser.pitch;
  u.voice = pickBrowserVoice();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  current = { stop: () => window.speechSynthesis.cancel() };
  window.speechSynthesis.speak(u);
}

/**
 * Say something. Resolves nothing; call `onEnd` when the mouth should
 * stop moving, and `onStart` when audio actually begins — which for the
 * server path is after a network round trip, so the interface must not
 * assume the two are simultaneous.
 */
export function speak(text, { onEnd, onStart } = {}) {
  if (!text) { onEnd?.(); return () => {}; }
  stopSpeaking();

  let cancelled = false;
  const done = () => { if (!cancelled) { cancelled = true; onEnd?.(); } };

  if (VOICE.provider !== "server") {
    onStart?.();
    speakInBrowser(text, done);
    return stopSpeaking;
  }

  fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice: VOICE.name, instructions: VOICE.instructions }),
  })
    .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then((blob) => {
      if (cancelled) return;
      const url = URL.createObjectURL(blob);
      const el = new Audio(url);
      /* Revoked on both paths — an object URL held open per reply is a
         leak that only shows up in a long conversation. */
      const cleanup = () => { URL.revokeObjectURL(url); done(); };
      el.onended = cleanup;
      el.onerror = cleanup;
      current = { stop: () => { el.pause(); URL.revokeObjectURL(url); } };
      el.play().then(() => onStart?.()).catch(cleanup);
    })
    .catch(() => {
      /* 503 means no key, anything else means the service is unhappy.
         Either way the visitor should still hear an answer. */
      if (cancelled) return;
      onStart?.();
      speakInBrowser(text, done);
    });

  return stopSpeaking;
}

export function stopSpeaking() {
  if (current) { try { current.stop(); } catch { /* already gone */ } current = null; }
  if (canSpeak) window.speechSynthesis.cancel();
}

/* ----------------------------------------------------------------
   BARGE-IN

   Watch the microphone while the assistant is talking, and report the
   moment the visitor starts. Nobody should have to sit through a reply
   they have already heard enough of.

   Why an AnalyserNode rather than just leaving SpeechRecognition
   running: a recogniser open during playback transcribes the assistant
   and answers its own reply. This only measures LOUDNESS, so it can
   sit alongside playback and tell us when to stop it — the recogniser
   opens afterwards, on a quiet room.

   echoCancellation is what makes that possible at all. Without it the
   assistant's own voice coming back through the speakers trips the
   detector instantly and it interrupts itself on the first syllable.
   With it the browser subtracts what it is playing from what it hears.
   On speakers in a hard room this is imperfect; on headphones or a
   laptop it is reliable.
   ---------------------------------------------------------------- */

export function watchForSpeech({ onSpeech, threshold = 0.055, sustainMs = 220 } = {}) {
  let stop = () => {};
  if (!navigator?.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
    return () => {};
  }

  let cancelled = false;
  navigator.mediaDevices
    .getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    .then((stream) => {
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);

      let loudSince = 0;
      let raf = 0;
      const tick = () => {
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);

        /* Sustained, not instantaneous. A door closing or a cough is a
           spike; speech stays above the floor for a couple of hundred
           milliseconds. Requiring that is the difference between
           barge-in and a hair trigger. */
        if (rms > threshold) {
          if (!loudSince) loudSince = performance.now();
          else if (performance.now() - loudSince > sustainMs) { onSpeech?.(); stop(); return; }
        } else {
          loudSince = 0;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      stop = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
        stop = () => {};
      };
    })
    .catch(() => { /* no mic, or refused — barge-in is simply unavailable */ });

  return () => { cancelled = true; stop(); };
}
