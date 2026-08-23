import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   WHY MRAKEE — a sticky panel beside a scrolling column

   Adapted from a shadcn/Tailwind/motion component. This project has
   none of those, so the behaviour was kept and rebuilt on the site's
   own tokens and on GSAP, which is already here driving the film and
   the card stack. Adding `motion` alongside it would mean two
   animation runtimes and two scroll listeners for one page.

   What the original does, and what is kept: a panel pins beside a
   column of items; each item fades up, holds while it is the one being
   read, then fades away; and the panel switches to whichever item is
   currently in the middle.

   Two departures:

   · The original picks the active item when its progress happens to
     land between 0.4 and 0.6, which a fast scroll steps straight over
     — the panel then keeps showing whatever it last caught. Here the
     active item is whichever is CLOSEST to its own midpoint, which is
     always defined, at any scroll speed.
   · The panel carries the reason's number rather than a photograph.
     There is no photography of "Technology Agnostic", and pairing
     these six with the signage stock the rest of the site uses would
     read as filler. Each item takes an optional `img`, so the day
     photographs exist the panel shows them instead with no change
     here.

   Below 900px the pinning and the fading both go: on a phone the panel
   would take most of the screen and the fade would hide text that has
   nowhere else to be. It becomes a plain numbered list.

   Reduced motion keeps the panel tracking and drops only the fade and
   the drift — see the note in the effect.
   ================================================================ */

/* The original's opacity curve: in, hold, out — mapped across the
   item's own passage through the viewport. The first item starts
   visible rather than at zero, so the column is not blank when the
   section is first reached. */
const STOPS = [0, 0.3, 0.7, 1];
const FADE = [0, 0.7, 1, 0];
const FADE_FIRST = [1, 0.7, 1, 0];
/* The last one holds instead of leaving. In the original every item
   fades out, which at the foot of the list empties the column while the
   section is still on screen — it reads as a gap, not as an ending. */
const FADE_LAST = [0, 0.7, 1, 1];

function ramp(p, values) {
  for (let i = 1; i < STOPS.length; i++) {
    if (p <= STOPS[i]) {
      const span = STOPS[i] - STOPS[i - 1];
      const t = span === 0 ? 0 : (p - STOPS[i - 1]) / span;
      return values[i - 1] + (values[i] - values[i - 1]) * t;
    }
  }
  return values[values.length - 1];
}

export default function WhyScroll({ items }) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    /* Reduced motion suppresses the MOVEMENT, never the tracking.
       Gating the whole effect on it — which is what this used to do —
       left the panel showing 01 while you read reason four, because the
       panel is content and not decoration. So the triggers are always
       built and the panel always follows; only the fade and the drift
       below are skipped, and the stylesheet's defaults then hold every
       reason at full opacity where it belongs. */
    const animate = motionAllowed();

    const mm = gsap.matchMedia();

    // gsap.matchMedia, not a bare check: it tears the whole thing down
    // and rebuilds it when the viewport crosses the breakpoint, which a
    // one-shot effect would not, leaving faded-out text on a phone.
    mm.add("(min-width: 900px)", () => {
      const cards = gsap.utils.toArray(root.querySelectorAll(".why__item"));
      const slides = gsap.utils.toArray(root.querySelectorAll(".why__slide"));
      const ticks = gsap.utils.toArray(root.querySelectorAll(".why__tick"));
      if (!cards.length) return undefined;

      // Custom properties, not opacity and transform directly. An inline
      // style beats any stylesheet rule, so if a teardown ever failed to
      // clear one — and crossing this breakpoint did exactly that — the
      // phone layout inherited `opacity: 0` and five of the six reasons
      // were invisible with no way for CSS to overrule it. Setting only
      // the variables leaves the properties themselves to the sheet,
      // where the mobile rule can and does win.
      const set = cards.map((c) => ({
        o: gsap.quickSetter(c, "--why-o"),
        y: gsap.quickSetter(c, "--why-ty", "px"),
      }));
      const progress = cards.map(() => 0);
      let shown = -1;

      const syncPanel = () => {
        // Whichever item is nearest its own midpoint owns the panel.
        //
        // Two ties have to break the right way. Above the section every
        // item sits at progress 0 and below it every item sits at 1, so
        // both ends are a six-way tie: items that have not started are
        // skipped, which leaves the first one on top; and among those
        // that have, a later index wins, so scrolling out of the foot
        // of the list does not snap the panel back to reason one.
        let best = 0;
        let bestGap = Infinity;
        for (let i = 0; i < progress.length; i++) {
          if (progress[i] <= 0) continue;
          const gap = Math.abs(progress[i] - 0.5);
          if (gap <= bestGap) {
            bestGap = gap;
            best = i;
          }
        }
        if (best === shown) return;
        shown = best;
        slides.forEach((s, i) => s.classList.toggle("is-on", i === best));
        ticks.forEach((t, i) => t.classList.toggle("is-on", i <= best));
      };

      const last = cards.length - 1;
      const curve = (i) =>
        i === 0 ? FADE_FIRST : i === last ? FADE_LAST : FADE;

      const draw = (i, p) => {
        progress[i] = p; // the panel needs this either way
        if (!animate) return;
        set[i].o(ramp(p, curve(i)));
        set[i].y(20 - 40 * p);
      };

      const triggers = cards.map((card, i) =>
        ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          end: "bottom 15%",
          onUpdate: (self) => {
            draw(i, self.progress);
            syncPanel();
          },
        })
      );

      // Paint every item now. onUpdate only fires once a trigger has
      // been entered, so without this the items still below the fold
      // sit at their CSS default — fully opaque — until first touched,
      // and the one under the item being read is visible when it should
      // not be.
      const drawAll = () => {
        triggers.forEach((t, i) => draw(i, t.progress));
        syncPanel();
      };
      drawAll();
      ScrollTrigger.addEventListener("refresh", drawAll);

      return () => {
        ScrollTrigger.removeEventListener("refresh", drawAll);
        triggers.forEach((t) => t.kill());
        cards.forEach((c) => {
          c.style.removeProperty("--why-o");
          c.style.removeProperty("--why-ty");
        });
      };
    });

    return () => mm.revert();
  }, [items]);

  return (
    <div className="why" ref={rootRef}>
      {/* ---- the panel that pins ----
          aria-hidden: it is the numbering of the list beside it, drawn
          large. A screen reader that read it would hear every reason
          announced twice. */}
      <div className="why__panel" aria-hidden="true">
        <div className="why__stage">
          {items.map((s, i) => (
            <div
              className={`why__slide${i === 0 ? " is-on" : ""}`}
              key={s.t}
              style={{ "--i": i }}
            >
              {s.img ? (
                <img src={s.img} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="why__slideNo">
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
            </div>
          ))}

          <div className="why__rail">
            {items.map((s, i) => (
              <span
                className={`why__tick${i === 0 ? " is-on" : ""}`}
                key={s.t}
              />
            ))}
          </div>
        </div>
      </div>

      <ol className="why__list">
        {items.map((s, i) => (
          <li className="why__item" key={s.t}>
            <span className="why__no">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
