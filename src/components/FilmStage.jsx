import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFrameSequence } from "../hooks/useFrameSequence";

gsap.registerPlugin(ScrollTrigger);

/**
 * The scroll film: 239 WebP frames scrubbed by scroll position on a sticky
 * canvas.
 *
 * One chapter now — the hero commercial, complete, spanning 0.00-1.00.
 * At 24fps over a 640vh runway that is ~2.3vh of scroll per frame, so a
 * full screen of scrolling advances under two seconds of footage. The
 * other five chapters are parked in film-src/build_film.py; if they come
 * back, re-run it and copy the printed fractions into the `in`/`out`
 * values below, because they will all move.
 *
 * `in`/`out` are scroll fractions, not seconds.
 *
 * The opening caption uses a NEGATIVE `in` on purpose — a caption with
 * in=0.00 is invisible at exactly scroll 0, which is where the page loads.
 */
const CAPTIONS = [
  {
    // Solid at rest, starts going the moment you scroll, gone by ~32vh.
    in: -0.05, out: 0.06, fade: 0.03, align: "center",
    eyebrow: "AV Systems Integration",
    title: <>Visibly <span className="grad-text">Different</span>.</>,
    body: "Re-engineering the way technology connects the future. Design. Integrate. Connect. Perform.",
    hero: true,
  },
  // The three below are placed against what the commercial is actually
  // showing at that moment — storefront windows around 0.3, the menu
  // board around 0.7, the branded kiosks at the close. The Retail and
  // Transport captions were retired with the footage they described;
  // they are in git at a229ad8 if those chapters come back.
  {
    in: 0.26, out: 0.44, align: "left",
    eyebrow: "Digital Signage",
    title: <>Capturing<br />Media Magic.</>,
    body: "Deliver the right message to the right audience at the right time — centrally managed for seamless distribution.",
  },
  {
    in: 0.62, out: 0.8, align: "right",
    eyebrow: "Smart Spaces",
    title: <>Spaces that are<br />intuitive to use.</>,
    body: "AV technology, engineering expertise and intentional design, brought together into one coordinated environment.",
  },
  {
    in: 0.86, out: 1.08, align: "center",
    eyebrow: "One team",
    title: <>One Team, One Goal,<br />One Seamless AV experience.</>,
    body: "From concept, design and installation through to training, after care and on-going support.",
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
                  Talk to Our Experts <span className="arrow" aria-hidden="true">→</span>
                </a>
                <a className="btn btn--ghost" href="#solutions">Explore Our Solutions</a>
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
