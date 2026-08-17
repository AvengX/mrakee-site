import { useEffect, useState } from "react";

/* ================================================================
   SERVICES — stacking cards

   The pattern from the reference, which I first read wrong: its three
   service sections are `position: sticky; top: 70px`, each a fixed
   height. Each card pins under the header and the next one scrolls up
   and covers it, so the section reads as a deck being dealt rather than
   as three rows going past.

   Two things make it work, and both are easy to get wrong:

   · The cards must be OPAQUE. Everything else on this site is
     translucent so the atmosphere shows through — do that here and you
     see straight through card three to card one underneath it.
   · Each card needs its own scroll runway, which comes from being a
     normal-flow sibling. The stagger on `top` is what leaves the edge
     of the card beneath visible, so the pile is legible as a pile.

   Sticky is dropped below 860px. On a phone a 62vh card pinned under a
   nav leaves almost nothing moving, and the effect reads as a bug.
   ================================================================ */

export default function ServiceStack({ items }) {
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

  return (
    <div className="stack">
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
            <p className="stack__lede">{s.d}</p>
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
