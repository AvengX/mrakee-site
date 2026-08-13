import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "../hooks/useFrameSequence";

gsap.registerPlugin(ScrollTrigger);

/**
 * The scroll film: 334 WebP frames scrubbed by scroll position on a sticky
 * canvas, with captions timed to the chapter boundaries.
 *
 * `in`/`out` below are scroll fractions printed by film-src/build_film.py.
 * The chapters land at:
 *   object 0.00-0.16 · wakes 0.15-0.32 · retail 0.31-0.49
 *   qsr 0.48-0.66 · transport 0.64-0.82 · scale 0.81-1.00
 *
 * The opening caption uses a NEGATIVE `in` on purpose — a caption with
 * in=0.00 is invisible at exactly scroll 0, which is where the page loads.
 */
const CAPTIONS = [
  {
    in: -0.06, out: 0.13, align: "center",
    eyebrow: "Digital Signage · Kiosks · Singapore",
    title: <>Screens that <span className="grad-text">do more</span> than show.</>,
    body: "Displays, kiosks and the software behind them — deployed as one estate, managed from one place.",
    hero: true,
  },
  {
    in: 0.175, out: 0.30, align: "left",
    eyebrow: "Built to be seen",
    title: <>Readable at noon.<br />Bright at midnight.</>,
    body: "High-nit bonded panels that hold their colour in a shopfront window and dim themselves for an overnight lobby.",
  },
  {
    in: 0.345, out: 0.465, align: "right",
    eyebrow: "Retail",
    title: <>The shelf that<br />answers back.</>,
    body: "Let a shopper find a size, compare a fit and check stock without waiting for the one free staff member on the floor.",
  },
  {
    in: 0.51, out: 0.63, align: "left",
    eyebrow: "Quick service",
    title: <>Menus that move<br />with the day.</>,
    body: "Breakfast flips to lunch on schedule. An item greys out the moment stock runs dry. No one climbs a ladder.",
  },
  {
    in: 0.675, out: 0.795, align: "right",
    eyebrow: "Transport",
    title: <>Never dark,<br />never wrong.</>,
    body: "Live operational feeds driving concourse-length display walls, with the failover behaviour terminals actually require.",
  },
  {
    in: 0.845, out: 1.08, align: "center",
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

export default function FilmStage() {
  const root = useRef();
  const canvas = useRef();
  const capRefs = useRef([]);
  const { ready, draw } = useFrameSequence("film");

  useLayoutEffect(() => {
    if (!ready) return;

    const ctx = gsap.context(() => {
      const paint = (p) => {
        draw(canvas.current, p);
        capRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = CAPTIONS[i];
          const o = opacityAt(p, c.in, c.out);
          el.style.opacity = o;
          // drift up slightly as it fades through its window. Written as a
          // custom property so the centring transforms in CSS survive.
          const t = (p - c.in) / (c.out - c.in);
          el.style.setProperty("--drift", `${(0.5 - t) * 26}px`);
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        });
      };

      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
        onUpdate: () => paint(state.p),
      });

      paint(0); // first paint before any scrolling happens

      const onResize = () => paint(state.p);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, root);

    return () => ctx.revert();
  }, [ready, draw]);

  return (
    <section className="film" id="film" ref={root}>
      <div className="film__stage">
        <canvas ref={canvas} className="film__canvas" />
        <div className="film__mask" />

        {CAPTIONS.map((c, i) => (
          <div
            key={i}
            ref={(el) => (capRefs.current[i] = el)}
            className={`cap cap--${c.align}`}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <p className="eyebrow">{c.eyebrow}</p>
            {c.hero ? <h1>{c.title}</h1> : <h2>{c.title}</h2>}
            <p className="lede">{c.body}</p>
            {c.hero && (
              <div className="hero__cta">
                <a className="btn btn--primary" href="#contact">Book a demo</a>
                <a className="btn btn--ghost" href="#solutions">Explore solutions</a>
              </div>
            )}
          </div>
        ))}

        {!ready && <div className="film__loading">Loading film…</div>}
        <p className="scroll-hint">Scroll</p>
      </div>
    </section>
  );
}
