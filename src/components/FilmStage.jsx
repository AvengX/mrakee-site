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
/* INK IS PER CAPTION, because this film has two acts with opposite
   luminance: a glass-walled airport terminal that is bright throughout,
   then a restaurant lit for evening. Measured on the built frames, over
   the area each caption actually occupies at 1440x900, across every
   frame of its own window -- so these are the real backdrops, not a
   sample:

                   Premium Black       Off White
     opening        7.06:1  43% fail   -
     solutions      5.76:1  37% fail   3.61:1  74% fail
     spaces         2.26:1  94% fail   9.87:1  17% fail
     closing        -                  7.43:1  41% fail

   No single ink survives both halves, so the first two keep Premium
   Black and the last two flip to Off White. Deep Teal was measured too
   and fails everywhere -- it is mid-luminance, so it has nowhere to
   hide on either a bright frame or a dark one.

   The percentages are the share of the caption's area under 4.5:1, and
   they never reach zero because the type sits on raw footage with no
   scrim. What matters is that each one is the best of the three inks
   over its own window, and that no caption sits where the backdrop is
   mid-tone -- which is what the re-timing below fixes. */
const CAPTIONS = [
  {
    // Solid at rest, starts going the moment you scroll, gone by ~32vh.
    in: -0.05, out: 0.06, fade: 0.03, align: "center",
    title: <>Integration made <span className="grad-text">Simple</span>.</>,
    body: "Re-engineering the way technology connects the future. Design. Integrate. Connect. Perform.",
    hero: true,
  },
  // The three below are placed against what the commercial is actually
  // showing at that moment — the terminal's world-map display around
  // 0.25, the kiosk and menu board around 0.7, the branded kiosk at the
  // close. The Retail and Transport captions were retired with the
  // footage they described; they are in git at a229ad8 if those
  // chapters come back.
  //
  // RE-TIMED for the 2026-08-29 footage. This caption used to run
  // 0.26-0.44 on the left, which on the new clip lands on the whip-pan
  // past a mid-brown column: 59% of its area fell under 4.5:1 and
  // neither ink could rescue it, because the backdrop is mid-luminance
  // and both inks need an extreme.
  //
  // Moved earlier, onto the terminal's world-map display — which is a
  // light panel, so Premium Black holds, and which is also the right
  // picture for a line about getting the right message to the right
  // audience. Best of every window and alignment measured, on all three
  // numbers: 7.06:1 mean, 30% of the area under 4.5:1, 2.73:1 at the
  // fifth percentile.
  {
    in: 0.18, out: 0.36, align: "center",
    title: <>Centrally Managed for<br />Seamless <span className="grad-text">Distribution</span>.</>,
    body: "Deliver the right message to the right audience at the right time — centrally managed for seamless distribution.",
  },
  {
    // Left rather than right: same window, but the restaurant's dark
    // panelling sits on that side, so Off White reads at 9.87:1 with
    // 17% of the area failing, against 10.18:1 / 24% on the right. It
    // also restores the alternation — centre, right, left, centre.
    in: 0.62, out: 0.8, align: "left", ink: "light",
    title: <>Spaces that are<br />intuitive to use.</>,
    body: "Technology, engineering expertise and intentional design, brought together into one coordinated environment.",
  },
  {
    // Right, not centre. Centred put the line straight across the
    // branded kiosk in the closing shot — white type on a lit white
    // screen, over the one frame where the client's logo is legible.
    // The mean contrast hid it (7.43:1) because the box average was
    // fine; the fifth percentile is what caught it, at 1.44:1. Moved
    // right it is 3.04:1 there and 8.87:1 across the box, and the text
    // now sits beside the kiosk instead of on it.
    in: 0.86, out: 1.08, align: "right", ink: "light",
    title: <>One Team, One Goal,<br />One Seamless experience.</>,
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
      /* Last written value per caption, so a caption that is off screen
         costs nothing. Three of the four are hidden at any moment and
         were being handed four style writes each per tick anyway —
         including a blur(), which is the one property here that forces
         the element to repaint. Skipping the no-ops leaves the visuals
         identical and takes the steady-state write count from 16 to 4. */
      const wrote = CAPTIONS.map(() => null);

      const paint = (p) => {
        draw(canvas.current, p);
        capRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = CAPTIONS[i];
          const o = opacityAt(p, c.in, c.out, c.fade);
          const hidden = o <= 0.001;
          if (hidden && wrote[i] === "hidden") return;
          wrote[i] = hidden ? "hidden" : o;

          el.style.opacity = o;
          // drift up slightly as it fades through its window, and come
          // out of a light blur as it arrives. Written as custom
          // properties so the centring transforms in CSS survive.
          const t = (p - c.in) / (c.out - c.in);
          el.style.setProperty("--drift", `${(0.5 - t) * 26}px`);
          el.style.filter = o > 0.995 ? "none" : `blur(${(1 - o) * 5}px)`;
          el.style.visibility = hidden ? "hidden" : "visible";
        });

        // the scroll cue is only true while you have not scrolled
        if (hint.current) {
          const fade = Math.max(0, 1 - p * 22);
          if (!(fade <= 0.01 && hint.__gone)) {
            hint.__gone = fade <= 0.01;
            hint.current.style.opacity = fade;
            hint.current.style.visibility = fade <= 0.01 ? "hidden" : "visible";
          }
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
            className={`cap cap--${c.align}${c.ink === "light" ? " cap--light" : ""}`}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            {/* No eyebrow on any caption. The pills were removed on
                request; over the footage they read as chrome stuck on
                the picture rather than as part of it, and the headline
                already says which part of the film you are looking at. */}
            {c.hero ? <h1>{c.title}</h1> : <h2>{c.title}</h2>}
            <p className="lede">{c.body}</p>
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
