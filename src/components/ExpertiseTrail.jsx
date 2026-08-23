import { useLayoutEffect, useRef, useState } from "react";
import { Pin } from "lucide-react";

/* ================================================================
   OUR EXPERTISE — pinned cards on a dashed trail

   Adapted from a shadcn/Tailwind/motion component. This project has
   none of those, so the idea was kept — numbered cards pinned down the
   page, tilted, joined by a marching dashed line — and everything under
   it rebuilt.

   THE PART THAT HAD TO CHANGE, not for taste but because it cannot
   work here: the original positions every card by hand
   (`md:top-[450px] md:left-[15%]`) inside a container whose height is a
   hard-coded 1130px, and then draws the joining line as literal
   coordinates:

     M 290 150 C 500 150, 550 270, 710 270 ...

   Those numbers are true for the demo's copy at one width and nothing
   else. This client's descriptions run two or three lines rather than
   two, so the cards would sit where the line is not. Here the cards lay
   themselves out — alternating sides, in normal flow — and the trail is
   MEASURED from where they actually ended up, redrawn by a
   ResizeObserver whenever they move. It cannot fall out of step,
   because it has no opinion of its own about where anything is.

   Two smaller departures:

   · The numerals are set in the site's own face. The original asks for
     Comic Sans, which is a choice a brand either makes everywhere or
     not at all.
   · Orange/blue/purple become the brand's gold and teal, alternating.

   Below 860px the trail is dropped and the cards stack square and
   untilted: a dashed line between two edges of a phone is a scribble,
   and tilted cards on a narrow screen just lose their corners.
   ================================================================ */

const BREAK = "(min-width: 860px)";

export default function ExpertiseTrail({ items }) {
  const wrapRef = useRef(null);
  const cardRefs = useRef([]);
  const [trail, setTrail] = useState({ d: "", w: 0, h: 0 });

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const draw = () => {
      if (!window.matchMedia(BREAK).matches) {
        setTrail((t) => (t.d ? { d: "", w: 0, h: 0 } : t));
        return;
      }
      const wr = wrap.getBoundingClientRect();
      const pts = cardRefs.current
        .filter(Boolean)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            cx: r.left - wr.left + r.width / 2,
            top: r.top - wr.top,
            bottom: r.bottom - wr.top,
          };
        });
      if (pts.length < 2) return;

      // Leave from the foot of one card, arrive at the head of the next,
      // with the handles pulled straight down and up so the line leaves
      // and lands vertically instead of cutting the corner.
      let d = `M ${pts[0].cx.toFixed(1)} ${pts[0].bottom.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const pull = Math.max(30, (b.top - a.bottom) * 0.6);
        d +=
          ` C ${a.cx.toFixed(1)} ${(a.bottom + pull).toFixed(1)},` +
          ` ${b.cx.toFixed(1)} ${(b.top - pull).toFixed(1)},` +
          ` ${b.cx.toFixed(1)} ${b.top.toFixed(1)}`;
      }
      setTrail({ d, w: wr.width, h: wr.height });
    };

    draw();

    // Fonts land after first paint and change every card's height, so a
    // one-shot measurement is wrong by the time anyone sees it.
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(draw);
      ro.observe(wrap);
      cardRefs.current.forEach((el) => el && ro.observe(el));
    }
    window.addEventListener("resize", draw);
    document.fonts?.ready?.then(draw).catch(() => {});

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [items]);

  return (
    <div className="xp" ref={wrapRef}>
      {trail.d && (
        <svg
          className="xp__trail"
          viewBox={`0 0 ${trail.w} ${trail.h}`}
          width={trail.w}
          height={trail.h}
          aria-hidden="true"
          focusable="false"
        >
          <path d={trail.d} />
        </svg>
      )}

      <ol className="xp__list">
        {items.map((s, i) => (
          <li className="xp__item" key={s.t} ref={(el) => (cardRefs.current[i] = el)}>
            <article className="xp__card">
              <span className="xp__pin">
                <Pin size={19} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="xp__tint">
                <span className="xp__no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
