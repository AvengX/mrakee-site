/* ================================================================
   Measure the audio that is ACTUALLY PLAYING.

   One stream, two destinations: the speakers the visitor hears, and an
   AnalyserNode the mouth is driven from. There is no second request and
   no second decode — the mouth cannot drift from the voice because it
   is reading the same samples.

   THE TRAP THIS EXISTS TO AVOID: createMediaElementSource can be called
   only ONCE per element, for the life of that element. Call it twice
   and the browser throws, and worse, the element is permanently routed
   into a graph you no longer hold a reference to — it goes silent. The
   WeakMap below is the whole reason this is a module rather than three
   lines inline.
   ================================================================ */

let ctx = null;
const sources = new WeakMap(); // HTMLAudioElement -> MediaElementAudioSourceNode

function audioContext() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  /* Autoplay policy can leave the context suspended even though play()
     succeeded, which shows up as a mouth that never opens. */
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/**
 * Attach to a playing <audio> and report its loudness, 0..1, every frame.
 * Returns a teardown function. Safe to call again for the same element.
 */
export function analyseElement(el, onLevel) {
  const ac = audioContext();
  if (!ac) return () => {};

  let src = sources.get(el);
  if (!src) {
    try {
      src = ac.createMediaElementSource(el);
      sources.set(el, src);
    } catch {
      /* Already routed by something else. Better a silent mouth than a
         silent assistant. */
      return () => {};
    }
  }

  const an = ac.createAnalyser();
  an.fftSize = 1024;
  an.smoothingTimeConstant = 0.55;
  src.connect(an);
  // Speakers as well, or connecting the source would mute playback.
  src.connect(ac.destination);

  const buf = new Float32Array(an.fftSize);
  let raf = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    onLevel(Math.sqrt(sum / buf.length));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    try { src.disconnect(an); } catch { /* graph already torn down */ }
    an.disconnect();
    /* The source stays connected to destination and stays in the
       WeakMap: it belongs to the element, not to this playback. */
  };
}
