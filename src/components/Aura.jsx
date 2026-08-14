import { useEffect, useRef } from "react";

/**
 * The atmosphere: a fixed field of cool gradient light behind the entire
 * page, plus a soft glow that trails the cursor.
 *
 * This is the layer that keeps a white site from reading as paper. Every
 * band above it is translucent, so the same light runs from the film all
 * the way down to the footer — one room, not seven sections.
 *
 * Cost control:
 *   · blobs are radial-gradients that only ever `translate`, so the
 *     compositor handles them and the main thread never sees a repaint.
 *     (A filter: blur() of this size repaints the full screen per frame.)
 *   · the cursor glow is lerped inside ONE rAF loop that parks itself
 *     when the pointer stops moving.
 *   · nothing here runs on touch devices — CSS hides the glow, and we
 *     never attach the listener without a fine pointer.
 */
export default function Aura() {
  const glow = useRef(null);

  useEffect(() => {
    const el = glow.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // target = where the pointer is, current = where the light is. The
    // gap between them is the whole effect: the glow arrives late and
    // settles, instead of being welded to the cursor.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.4;
    let cx = tx;
    let cy = ty;
    let raf = 0;
    let idle = true;

    const tick = () => {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      el.style.setProperty("--gx", `${cx}px`);
      el.style.setProperty("--gy", `${cy}px`);

      // stop the loop once it has effectively caught up
      if (Math.abs(tx - cx) < 0.5 && Math.abs(ty - cy) < 0.5) {
        idle = true;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add("aura__cursor--on");
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="aura" aria-hidden="true">
      <div className="aura__blob aura__blob--1" />
      <div className="aura__blob aura__blob--2" />
      <div className="aura__blob aura__blob--3" />
      <div className="aura__cursor" ref={glow} />
      <div className="aura__grain" />
    </div>
  );
}
