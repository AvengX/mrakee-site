import { useEffect, useState } from "react";
import Reveal from "./Reveal";

/* ================================================================
   Alternating feature rows — image one side, copy the other.

   Used by both Solutions and Services. It is the pattern the client
   picked as reference: a handful of offers, each given a full row,
   rather than a grid of cards nobody reads to the end of.

   It only works at small counts. Solutions runs five and names its
   remaining twelve in a line beneath; Services runs three. Past about
   six this becomes a scroll marathon.

   `fallback` is a film still used until bespoke photography exists for
   a row, so the section is never broken mid-commission. The image is
   probed off-DOM first and only swapped in once it has decoded —
   rendering the real path and catching onError does NOT work here,
   because these images are lazy, so a missing file is never requested
   and never errors.
   ================================================================ */

export default function FeatureRows({ items, rest, variant = "" }) {
  const [ready, setReady] = useState(() => new Set());

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
    <div className={`feats${variant ? ` feats--${variant}` : ""}`}>
      {items.map((s, i) => (
        <Reveal key={s.t} as="article" className="feat" y={36}>
          <div className="feat__media">
            <img
              src={ready.has(i) && s.img ? s.img : s.fallback}
              alt=""
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="feat__body">
            <span className="feat__no">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.t}</h3>
            <p className="feat__lede">{s.d}</p>
            {s.points?.length > 0 && (
              <ul className="feat__points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            <a className="feat__link" href="#contact">
              Talk to us about this
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </Reveal>
      ))}

      {rest?.length > 0 && (
        <Reveal className="feats__rest" y={20}>
          <p>
            <span>Also built on the same platform</span>
            {rest.join(" · ")}
          </p>
        </Reveal>
      )}
    </div>
  );
}
