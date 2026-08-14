import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "../hooks/useFrameSequence";

gsap.registerPlugin(ScrollTrigger);

/**
 * The scroll film: 399 WebP frames scrubbed by scroll position on a sticky
 * canvas, with captions timed to the chapter boundaries.
 *
 * `in`/`out` below are scroll fractions printed by film-src/build_film.py.
 * Re-run it after ANY change to the clips and copy the numbers across —
 * chapter one is the full 10s commercial and takes up 30% of the film on
 * its own, so these are nothing like an even six-way split:
 *   object 0.00-0.30 · wakes 0.29-0.44 · retail 0.43-0.58
 *   qsr 0.57-0.71 · transport 0.70-0.85 · scale 0.84-1.00
 *
 * The opening caption uses a NEGATIVE `in` on purpose — a caption with
 * in=0.00 is invisible at exactly scroll 0, which is where the page loads.
 */
const CAPTIONS = [
  {
    // Solid at rest, starts going the moment you scroll, gone by ~32vh.
    in: -0.05, out: 0.06, fade: 0.03, align: "center",
    eyebrow: "Digital Signage · Kiosks · Singapore",
    title: <>Screens that <span className="grad-text">do more</span> than show.</>,
    body: "Displays, kiosks and the software behind them — deployed as one estate, managed from one place.",
    hero: true,
  },
  {
    in: 0.305, out: 0.425, align: "left",
    eyebrow: "Built to be seen",
    title: <>Readable at noon.<br />Bright at midnight.</>,
    body: "High-nit bonded panels that hold their colour in a shopfront window and dim themselves for an overnight lobby.",
  },
  {
    in: 0.443, out: 0.563, align: "right",
    eyebrow: "Retail",
    title: <>The shelf that<br />answers back.</>,
    body: "Let a shopper find a size, compare a fit and check stock without waiting for the one free staff member on the floor.",
  },
  {
    in: 0.581, out: 0.702, align: "left",
    eyebrow: "Quick service",
    title: <>Menus that move<br />with the day.</>,
    body: "Breakfast flips to lunch on schedule. An item greys out the moment stock runs dry. No one climbs a ladder.",
  },
  {
    in: 0.72, out: 0.84, align: "right",
    eyebrow: "Transport",
    title: <>Never dark,<br />never wrong.</>,
    body: "Live operational feeds driving concourse-length display walls, with the failover behaviour terminals actually require.",
  },
  {
    in: 0.858, out: 1.08, align: "center",
    eyebrow: "At scale",
    title: <>One estate.<br />One dashboard.</>,
    body: "A thousand screens across a dozen sites, provisioned and monitored from a single pane of glass.",
  },
];

/** Ramp a caption in and out around its window. */
function opacityAt(p, from, to, fade = 0.045) {
  if (p <= from || p >= to) return 0;
  return Math.min(1, (p - from) / fade, (to - p) / fade);
}

/* The film is 640vh, so one unit of `p` is about 540vh of scrolling —
   a window of 0.13 is most of a screen and a half before the text is
   gone. The hero needs to answer the scroll much sooner than the
   chapter captions, which the visitor is reading at a steadier pace. */

export default function FilmStage() {
  const root = useRef();
  const canvas = useRef();
  const capRefs = useRef([]);
  const hint = useRef();
  const { ready, draw, progressLoaded } = useFrameSequence("film");

  useLayoutEffect(() => {
    if (!ready) return;

    const ctx = gsap.context(() => {
      const paint = (p) => {
        draw(canvas.current, p);
        capRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = CAPTIONS[i];
          const o = opacityAt(p, c.in, c.out, c.fade);
          el.style.opacity = o;
          // drift up slightly as it fades through its window, and come
          // out of a light blur as it arrives. Written as custom
          // properties so the centring transforms in CSS survive.
          const t = (p - c.in) / (c.out - c.in);
          el.style.setProperty("--drift", `${(0.5 - t) * 26}px`);
          el.style.filter = o > 0.995 ? "none" : `blur(${(1 - o) * 5}px)`;
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        });

        // the scroll cue is only true while you have not scrolled
        if (hint.current) {
          const fade = Math.max(0, 1 - p * 22);
          hint.current.style.opacity = fade;
          hint.current.style.visibility = fade <= 0.01 ? "hidden" : "visible";
        }
      };

      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          // 0.6 was fine before momentum scrolling existed. Lenis already
          // takes ~1s to resolve a wheel tick, and stacking a 0.6s scrub
          // on top of that is what made the hero feel like it was fading
          // a beat after you asked it to.
          scrub: 0.3,
        },
        onUpdate: () => paint(state.p),
      });

      paint(0); // first paint before any scrolling happens

      // Watching the stage itself rather than the window covers both cases:
      // a genuine resize, AND the first moment the element actually has a
      // size (draw() refuses to paint into a zero-sized canvas, so without
      // this the hero could stay blank until the visitor scrolled).
      const ro = new ResizeObserver(() => paint(state.p));
      ro.observe(canvas.current);

      const onResize = () => paint(state.p);
      window.addEventListener("resize", onResize);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", onResize);
      };
    }, root);

    return () => ctx.revert();
  }, [ready, draw]);

  return (
    <section className="film" id="film" ref={root}>
      <div className="film__stage">
        {/* cool key light behind the subject, under the frame */}
        <div className="film__key" aria-hidden="true" />
        <canvas ref={canvas} className="film__canvas" />
        <div className="film__mask" aria-hidden="true" />

        {CAPTIONS.map((c, i) => (
          <div
            key={i}
            ref={(el) => (capRefs.current[i] = el)}
            className={`cap cap--${c.align}`}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <p className={`eyebrow${c.hero ? " eyebrow--badge" : ""}`}>{c.eyebrow}</p>
            {c.hero ? <h1>{c.title}</h1> : <h2>{c.title}</h2>}
            <p className="lede">{c.body}</p>
            {c.hero && (
              <div className="hero__cta">
                <a className="btn btn--primary" href="#contact">
                  Book a demo <span className="arrow" aria-hidden="true">→</span>
                </a>
                <a className="btn btn--ghost" href="#solutions">Explore solutions</a>
              </div>
            )}
          </div>
        ))}

        {!ready && (
          <div className="film__loading">
            <div className="film__bar">
              {/* scaleX rather than width: a transform composites, a width
                  reflows the stage on every progress update */}
              <i style={{ transform: `scaleX(${Math.max(0.04, progressLoaded)})` }} />
            </div>
            Loading film
          </div>
        )}

        <p className="scroll-hint" ref={hint}>
          <i aria-hidden="true" />
          Scroll
        </p>
      </div>
    </section>
  );
}
