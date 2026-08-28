/* ================================================================
   A VOICE SESSION: the microphone stays open, the conversation keeps
   going, and nobody presses anything between turns.

   The old model treated the microphone as one recording per utterance —
   open it, capture a sentence, close it. That is why every turn needed
   another click, and why the browser re-negotiated permission each
   time.

   Here the MediaStream is opened ONCE and held for the whole session.
   getTracks().forEach(t => t.stop()) happens only when the session
   genuinely ends.

   WHAT DOES stop between turns is RECOGNITION, not the microphone, and
   that distinction is the whole design. A recogniser left running while
   the assistant speaks transcribes the assistant, answers its own
   reply, and does that forever. So recognition pauses while the voice
   plays; the stream stays open underneath it, which is what lets
   barge-in keep listening from the same device with no second
   getUserMedia and no second permission prompt.
   ================================================================ */

const Recognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/* Chrome ends recognition on its own every so often — after a silence,
   after a result, sometimes for no reason it shares. While a session is
   live that is not the end of anything, it is something to restart. But
   restarting instantly forever, when the real cause is a dead
   microphone, spins the CPU and never tells anyone. */
const RESTART_DELAY = 250;
const MAX_CONSECUTIVE_FAILURES = 4;

export function createVoiceSession({
  lang = "en-IN",
  onPartial,
  onUtterance,
  onError,
  onListening,
} = {}) {
  let stream = null;
  let rec = null;
  let active = false;      // the SESSION, not the turn
  let listening = false;   // recognition is meant to be running now
  let muted = false;
  let failures = 0;
  let restartTimer = 0;
  let audioCtx = null;
  let bargeStop = null;

  /* ---- the microphone, opened once ---- */
  async function start() {
    if (stream) return true;
    if (!navigator?.mediaDevices?.getUserMedia) {
      onError?.({ code: "audio-capture", message: "This browser cannot open a microphone." });
      return false;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        /* echoCancellation is what makes barge-in possible at all: it
           subtracts what is being played from what is heard, so the
           assistant does not interrupt itself on its own first
           syllable. */
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      active = true;
      failures = 0;
      return true;
    } catch (e) {
      onError?.({
        code: e?.name === "NotFoundError" ? "audio-capture" : "not-allowed",
        message: e?.message || "Microphone unavailable",
      });
      return false;
    }
  }

  /* ---- recognition, restarted for as long as the session lives ---- */
  function buildRecogniser() {
    const r = new Recognition();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;

    let finalText = "";
    let lastInterim = "";

    r.onstart = () => { failures = 0; onListening?.(); };

    r.onresult = (e) => {
      if (muted) return; // a muted session hears nothing, by definition
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      if (interim.trim()) lastInterim = (finalText + interim).trim();
      onPartial?.((finalText + interim).trim());
    };

    r.onerror = (e) => {
      /* no-speech is someone thinking, not a failure. aborted is us
         stopping it on purpose. Neither should end a session. */
      if (e.error === "no-speech" || e.error === "aborted") return;
      failures += 1;
      onError?.({ code: e.error, message: e.error });
    };

    r.onend = () => {
      /* Chrome does not reliably promote the last phrase to isFinal
         before ending, so the interim is kept and used. Without this a
         short utterance is heard, displayed, and then silently lost. */
      const said = (finalText.trim() || lastInterim).trim();
      finalText = "";
      lastInterim = "";
      if (said && !muted) onUtterance?.(said);

      /* THE LINE THAT MAKES IT CONTINUOUS. Recognition ending is not
         the conversation ending — while the session is active and we
         are still meant to be listening, it starts again. */
      if (active && listening) {
        if (failures >= MAX_CONSECUTIVE_FAILURES) {
          listening = false;
          onError?.({
            code: "recognition-unstable",
            message: "Speech recognition kept stopping. Tap the microphone to try again.",
          });
          return;
        }
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
          if (active && listening) startRecogniser();
        }, RESTART_DELAY);
      }
    };

    return r;
  }

  function startRecogniser() {
    if (!active || !listening) return;
    try {
      rec = buildRecogniser();
      rec.start();
    } catch {
      /* Already running, or the engine refused. onend will not fire, so
         schedule the retry here instead. */
      failures += 1;
      if (failures < MAX_CONSECUTIVE_FAILURES) {
        clearTimeout(restartTimer);
        restartTimer = setTimeout(startRecogniser, RESTART_DELAY * 2);
      }
    }
  }

  /** Begin, or resume, hearing the visitor. */
  function listen() {
    if (!active || !Recognition) return;
    if (listening) return;
    listening = true;
    startRecogniser();
  }

  /** Stop hearing, WITHOUT closing the microphone. Used while the
      assistant speaks, so it cannot transcribe itself. */
  function pause() {
    listening = false;
    clearTimeout(restartTimer);
    try { rec?.abort(); } catch { /* not running */ }
    rec = null;
  }

  /* ---- barge-in, from the stream we already hold ---- */
  function watchBargeIn(onSpeech, { threshold = 0.055, sustainMs = 220 } = {}) {
    stopBargeIn();
    if (!stream || typeof AudioContext === "undefined") return;
    try {
      audioCtx = audioCtx || new AudioContext();
      if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
      const src = audioCtx.createMediaStreamSource(stream);
      const an = audioCtx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      let loudSince = 0;
      let raf = 0;
      const tick = () => {
        if (muted) { loudSince = 0; raf = requestAnimationFrame(tick); return; }
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        /* Sustained rather than instantaneous: a cough or a closing
           door is a spike, speech stays up for a couple of hundred
           milliseconds. */
        if (rms > threshold) {
          if (!loudSince) loudSince = performance.now();
          else if (performance.now() - loudSince > sustainMs) { onSpeech?.(); return; }
        } else loudSince = 0;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      bargeStop = () => { cancelAnimationFrame(raf); try { src.disconnect(); } catch {} };
    } catch {
      /* barge-in is an enhancement; a session without it still works */
    }
  }

  function stopBargeIn() {
    if (bargeStop) { bargeStop(); bargeStop = null; }
  }

  /** Mute keeps the session and the stream; it only stops the input. */
  function setMuted(next) {
    muted = !!next;
    stream?.getAudioTracks().forEach((t) => { t.enabled = !muted; });
    return muted;
  }

  /** End the session and actually release the device. */
  function stop() {
    active = false;
    listening = false;
    clearTimeout(restartTimer);
    stopBargeIn();
    try { rec?.abort(); } catch { /* not running */ }
    rec = null;
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    audioCtx?.close().catch(() => {});
    audioCtx = null;
  }

  return {
    start,
    listen,
    pause,
    setMuted,
    watchBargeIn,
    stopBargeIn,
    stop,
    get active() { return active; },
    get listening() { return listening; },
    get muted() { return muted; },
  };
}

export const canRunVoiceSession = !!Recognition;
