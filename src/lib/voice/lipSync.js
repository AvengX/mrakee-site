/* ================================================================
   Loudness in, mouth openness out.

   Raw RMS is not a mouth. Speech sits in a narrow band well below 1.0,
   it is spiky, and it never quite reaches silence between words — fed
   straight to a mouth it produces a permanent quiver that reads as
   nervousness rather than speech.

   So: a noise floor, a gain, a curve, and asymmetric smoothing.
   ================================================================ */

const FLOOR = 0.012;   // below this is room tone, not a voice
const GAIN = 7.5;      // speech RMS lives around 0.03-0.14
const OPEN = 0.55;     // how fast the mouth may open, per frame
const CLOSE = 0.22;    // and close — slower, because lips have mass

/** Stateful smoother. One per playback. */
export function createLipSync({ onChange } = {}) {
  let value = 0;
  let raf = 0;
  let target = 0;
  let running = false;

  const loop = () => {
    if (!running) return;
    /* Asymmetric: opening on a consonant should be immediate, closing
       should trail. Symmetric smoothing makes speech look chewed. */
    const k = target > value ? OPEN : CLOSE;
    value += (target - value) * k;
    if (value < 0.002) value = 0;
    onChange?.(value);
    raf = requestAnimationFrame(loop);
  };

  return {
    /** Feed a raw RMS reading. */
    push(rms) {
      const lifted = Math.max(0, rms - FLOOR) * GAIN;
      /* Square-root curve: quiet speech still opens the mouth a useful
         amount, where a linear map leaves it barely moving until a
         shout. */
      target = Math.min(1, Math.sqrt(lifted));
    },
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      target = 0;
      value = 0;
      onChange?.(0); // never leave a mouth hanging open
    },
  };
}

/* ----------------------------------------------------------------
   THE FALLBACK, kept deliberately separate.

   speechSynthesis gives no access to its audio — there is no stream,
   no element, nothing an AnalyserNode can attach to. So when the
   browser voice is speaking there is nothing real to measure, and this
   is an ENVELOPE rather than lip sync. It is named for what it is so
   nobody later mistakes it for the real path.

   Shaped like speech rather than a metronome: syllable-rate wobble with
   an unhurried drift over it, so it neither pulses evenly nor holds
   open.
   ---------------------------------------------------------------- */
export function createSyntheticEnvelope({ onChange } = {}) {
  let raf = 0, t0 = 0, running = false;

  const loop = (t) => {
    if (!running) return;
    const s = (t - t0) / 1000;
    const syllable = 0.5 + 0.5 * Math.sin(s * 11.5);
    const phrase = 0.55 + 0.45 * Math.sin(s * 1.7 + 1.1);
    const grain = 0.85 + 0.15 * Math.sin(s * 27.3);
    onChange?.(Math.max(0, Math.min(1, syllable * phrase * grain)));
    raf = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (running) return;
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(loop);
    },
    stop() { running = false; cancelAnimationFrame(raf); onChange?.(0); },
  };
}
