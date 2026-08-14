import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Dev-only hand crank for the animation clock.
 *
 * Some embedded/automated browsers (the Claude Browser pane among them)
 * never composite a frame, which means requestAnimationFrame never fires
 * — so GSAP's ticker never runs, no ScrollTrigger ever updates, and
 * every reveal on this page stays parked at opacity 0. The page looks
 * completely broken while being completely fine.
 *
 * This exposes window.__pump so the clock can be advanced by hand:
 *
 *   __pump.to(2400)     scroll there and settle the animations
 *   __pump.tick(30)     advance ~30 frames where they are
 *   __pump.settle()     run everything currently in flight to its end
 *
 * Stripped from production builds by the import.meta.env.DEV guard.
 * Pair it with ?smooth=off, since Lenis is stepped from the same ticker.
 */
export function installDevPump() {
  if (!import.meta.env.DEV) return;

  const tick = (frames = 1) => {
    // gsap.ticker.tick() advances by real elapsed wall-clock time, so a
    // tight loop would pass ~0ms per call and move nothing. Stepping the
    // root by a fixed 1/60s makes each call a real frame.
    for (let i = 0; i < frames; i++) {
      gsap.updateRoot(gsap.globalTimeline.time() + 1 / 60);
    }
    ScrollTrigger.update();
  };

  window.__pump = {
    gsap,
    ScrollTrigger,
    tick,
    to(y, frames = 90) {
      window.scrollTo(0, y);
      ScrollTrigger.update();
      tick(frames);
      return Math.round(window.scrollY);
    },
    settle(frames = 120) {
      tick(frames);
    },
    /** total scrollable height, for picking positions by fraction */
    get height() {
      return document.documentElement.scrollHeight - window.innerHeight;
    },
  };
}
