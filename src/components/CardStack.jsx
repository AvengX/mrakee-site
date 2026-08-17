import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   STACKING CARDS

   The pattern from the reference: each card is `position: sticky`, so
   it pins under the nav and the next one covers it. The section reads
   as a deck being dealt rather than as nine rows going past.

   Two things make the pile work, and both are easy to get wrong:

   · The cards must be OPAQUE. Everything else on this site is
     translucent so the atmosphere shows through — do that here and you
     see straight through card three to card one underneath it.
   · Each card needs its own runway, which comes from being a
     normal-flow sibling. The stagger on `top` is what leaves the edge
     of the card beneath visible, so the pile is legible as a pile.

   THE DEPARTURE FROM THE REFERENCE: there, every card rises from below.
   Here they arrive from alternating sides — left, right, from below,
   and round again — so the deck is dealt from several directions.

   How the arrival is driven, and why not the obvious way:

   ScrollTrigger cannot use a sticky card as its own trigger. It
   measures with getBoundingClientRect, which on a stuck element reports
   where it is PAINTED, not where it sits in the layout, so every window
   would be computed from the wrong place the moment anything refreshed
   mid-page. So there is one trigger on the container (never sticky,
   always safe to measure) and each card's window is derived from
   `offsetTop`, which is layout and therefore immune to sticking.

   Sticky is dropped below 860px. On a phone a pinned card leaves almost
   nothing moving and the effect reads as a stuck page; the arrivals
   stay, at a shorter distance.
   ================================================================ */

/* left, right, from below — then round again */
const DIRS = [
  [-1, 0],
  [1, 0],
  [0, 1],
];

export default function CardStack({ items }) {
  const stackRef = useRef(null);
  const [ready, setReady] = useState(() => new Set());

  // Probe off-DOM and only swap in a real image once it has decoded —
  // these are lazy, so a missing file is never requested and onError
  // would never fire.
  useEffect(() => {
    let alive = true;
    items.forEach((it, i) => {
      if (!it.img) return;
      const probe = new Image();
      probe.onload = () => {
        if (alive && probe.naturalWidth > 1) {
          setReady((s) => (s.has(i) ? s : new Set(s).add(i)));
        }
      };
      probe.src = it.img;
    });
    return () => {
      alive = false;
    };
  }, [items]);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    const cards = gsap.utils.toArray(stack.children);
    if (!cards.length) return undefined;

    // Someone who has asked for less movement gets the pile without the
    // travel: the cards are simply there.
    //
    // ?motion=on overrides that, and exists because automated browsers
    // — the Claude Browser pane among them — report `reduce` whatever
    // the machine is set to, which would leave this effect impossible
    // to verify anywhere but by eye. It is opt-in via the URL, so no
    // visitor who has asked for less movement is ever given more.
    const forced = new URLSearchParams(window.location.search).get("motion") === "on";
    if (!forced && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const set = cards.map((c) => ({
      x: gsap.quickSetter(c, "x", "px"),
      y: gsap.quickSetter(c, "y", "px"),
      rot: gsap.quickSetter(c, "rotate", "deg"),
      o: gsap.quickSetter(c, "opacity"),
    }));

    let plan = [];

    const measure = () => {
      // The container is never sticky, so its rect is the honest one.
      const stackTop = stack.getBoundingClientRect().top + window.scrollY;
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      const vh = window.innerHeight;
      // Walk the heights rather than reading offsetTop. offsetTop looks
      // like layout but is not: on a stuck element Chrome reports the
      // PAINTED offset, so it changes as you scroll and every window
      // computed from it moves with the scroll it is meant to measure.
      // offsetHeight and the container's rect are both immune to that.
      let run = 0;
      plan = cards.map((c, i) => {
        const top = stackTop + run;
        run += c.offsetHeight + gap;
        // Where the card comes to rest: its sticky offset on a desktop.
        // Below 860px the cards are static and `top` computes to auto,
        // so they land a third of the way up the screen instead —
        // otherwise the arrival would not finish until the card had
        // crossed the entire viewport.
        const stickTop = parseFloat(getComputedStyle(c).top);
        const rest = Number.isFinite(stickTop) ? stickTop : vh * 0.35;
        const from = top - vh; // its top edge touches the viewport floor
        const to = top - rest; // it arrives at its resting place
        const [dx, dy] = DIRS[i % DIRS.length];
        return {
          from,
          to: Math.max(to, from + 1), // never a zero-length window
          dx,
          dy,
          // Capped: a card that starts a whole screen out to the side
          // spends the first half of its travel invisible.
          dist: Math.min(c.offsetWidth * 0.42, 340),
        };
      });
    };

    const apply = () => {
      const y = window.scrollY;
      for (let i = 0; i < plan.length; i++) {
        const p = plan[i];
        const t = gsap.utils.clamp(0, 1, (y - p.from) / (p.to - p.from));
        const eased = 1 - Math.pow(1 - t, 3);
        const left = 1 - eased; // 1 while away, 0 once landed
        set[i].x(p.dx * p.dist * left);
        set[i].y(p.dy * p.dist * 0.6 * left);
        set[i].rot(p.dx * 2.2 * left); // a slight tilt on the side entries
        set[i].o(gsap.utils.clamp(0, 1, eased * 2.4));
      }
    };

    const st = ScrollTrigger.create({
      trigger: stack,
      start: "top bottom",
      end: "bottom top",
      onUpdate: apply,
      onToggle: apply,
      onRefresh: () => {
        measure();
        apply();
      },
    });

    measure();
    apply(); // so the first paint is already correct, before any scroll

    return () => {
      st.kill();
      cards.forEach((c) => {
        // GSAP reads an element's existing inline transform as its BASE,
        // so anything left behind here becomes the zero point of the
        // next mount's maths. Wipe it.
        c.style.transform = "";
        c.style.opacity = "";
      });
    };
  }, [items]);

  return (
    <div className="stack" ref={stackRef}>
      {items.map((s, i) => (
        <article className="stack__card" key={s.t} style={{ "--i": i }}>
          <div className="stack__media">
            <img
              src={ready.has(i) && s.img ? s.img : s.fallback}
              alt=""
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="stack__body">
            <span className="stack__no">
              {String(i + 1).padStart(2, "0")}
              <i aria-hidden="true" />
              {String(items.length).padStart(2, "0")}
            </span>
            <h3>{s.t}</h3>
            {s.quote && <p className="stack__quote">{s.quote}</p>}
            {s.d && <p className="stack__lede">{s.d}</p>}
            {s.points?.length > 0 && (
              <ul className="stack__points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            <a className="stack__link" href="#contact">
              Talk to us about this
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
