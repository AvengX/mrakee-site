import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Momentum scrolling, and the anchor navigation that has to come with it.
 *
 * Three things have to agree or the film desyncs from the page:
 *   1. Lenis drives scroll position, so ScrollTrigger must be told to
 *      update from Lenis's own scroll event rather than the window's.
 *   2. Lenis must be stepped from GSAP's ticker, not its own rAF —
 *      two independent loops means the frame the film paints and the
 *      frame the page moved on are one apart, which reads as a shudder.
 *   3. lagSmoothing(0) stops GSAP from swallowing a slow frame, which
 *      would otherwise make the scrub jump after a stall.
 *
 * Touch is left alone. Hijacking a phone's native scroll physics makes it
 * feel broken, and it costs battery for nothing.
 */
export function initSmoothScroll() {
  const fine = window.matchMedia("(pointer: fine)").matches;

  const lenis = fine
    ? new Lenis({
        duration: 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 1,
      })
    : null;

  let tick;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    tick = (time) => lenis.raf(time * 1000); // GSAP's ticker is in seconds
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  }

  /* Anchor links. Lenis turns off CSS smooth scrolling, so without this
     every nav link becomes a hard jump — and the target would land under
     the floating nav bar either way. */
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;

    const target = id === "#top" ? 0 : document.querySelector(id);
    if (target === null) return; // let an unknown hash fall through
    e.preventDefault();

    const offset = -84; // clear the nav
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.15 });
    else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
    else {
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
    if (lenis) {
      gsap.ticker.remove(tick);
      lenis.destroy();
    }
  };
}
