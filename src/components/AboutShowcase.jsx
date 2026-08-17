import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ================================================================
   ABOUT — stage list + media panel

   Adapted from a shadcn/Tailwind/Next component. This project has none
   of those, so the structure was kept and rebuilt on the site's own
   tokens: eyebrow, headline, copy, chips, the five approach stages, two
   CTAs, and a panel showing the selected stage.

   Two departures from the original, both because the content is one
   idea rather than two:

   · The original's pills switch output styles while its list explains a
     process — unrelated controls for unrelated things. Here they were
     the same five stages twice over, so the list is gone and the pills
     are the one control. They sit on the panel they change, which also
     means there is no version of this that puts a control a screen away
     from its effect.
   · Nothing expands in place. The stage's description reads under its
     own picture, so picture and words are taken in together.

   Nothing was lost with the list: the pills carry the short stage name,
   the caption carries the full one and the description.

   Accessibility notes:
   · The chips are NOT buttons. In the source they are Badge components
     that look pressable and do nothing — a clickable-looking element
     with no behaviour is what the guidance calls a critical failure.
   · The pills are a tablist with roving tabindex and arrow keys, so Tab
     reaches the group once and arrows move within it. The caption is
     its tabpanel.
   ================================================================ */

export default function AboutShowcase({
  eyebrow,
  title,
  paragraphs = [],
  chips = [],
  steps = [],
  ctas = [],
}) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(() => new Set([0]));
  const pillRefs = useRef([]);
  const [focusIdx, setFocusIdx] = useState(null);

  useEffect(() => {
    if (focusIdx === null) return;
    pillRefs.current[focusIdx]?.focus();
    setFocusIdx(null);
  }, [focusIdx]);

  // only fetch a stage's image once it has been selected
  useEffect(() => {
    setLoaded((s) => (s.has(active) ? s : new Set(s).add(active)));
  }, [active]);

  const onPillKey = useCallback(
    (e) => {
      const last = steps.length - 1;
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = active === last ? 0 : active + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = active === 0 ? last : active - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      setActive(next);
      setFocusIdx(next);
    },
    [active, steps.length]
  );

  return (
    <div className="abt">
      {/* ---- intro ---- */}
      <div className="abt__intro">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="abt__title">{title}</h2>

        {paragraphs.map((p) => (
          <p className="abt__para" key={p}>
            {p}
          </p>
        ))}

        {chips.length > 0 && (
          <ul className="abt__chips">
            {chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ---- media panel: the selected stage, pictured and described ---- */}
      <div className="abt__panel">
        <div className="abt__media">
          {steps.map((s, i) => (
            <img
              key={s.t}
              className={`abt__img${i === active ? " is-on" : ""}`}
              src={loaded.has(i) ? s.img : undefined}
              alt=""
              width="1600"
              height="900"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}

          {/* The only control, so it is on every width — the bar wraps
              to two rows on a phone rather than becoming a horizontal
              scroller, which a wheel and a keyboard cannot drive. */}
          <div
            className="abt__pills"
            role="tablist"
            aria-label="Our approach"
            onKeyDown={onPillKey}
          >
            {steps.map((s, i) => (
              <button
                key={s.t}
                type="button"
                ref={(el) => (pillRefs.current[i] = el)}
                id={`${uid}-t${i}`}
                role="tab"
                aria-selected={i === active}
                aria-controls={panelId}
                tabIndex={i === active ? 0 : -1}
                className={`abt__pill${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                {s.short || s.t}
              </button>
            ))}
          </div>
        </div>

        {/* All five captions are stacked in one grid cell, so the block
            is as tall as the longest and the panel does not resize as
            you move between stages. */}
        <div
          className="abt__cap"
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${uid}-t${active}`}
          tabIndex={0}
        >
          {steps.map((s, i) => (
            <div
              className={`abt__capItem${i === active ? " is-on" : ""}`}
              key={s.t}
              aria-hidden={i !== active}
            >
              <p className="abt__capName">
                <i aria-hidden="true">{String(i + 1).padStart(2, "0")}</i>
                {s.t}
              </p>
              <p className="abt__capText">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {ctas.length > 0 && (
        <div className="abt__ctas">
          {ctas.map((c, i) => (
            <a
              key={c.href}
              className={`btn ${i === 0 ? "btn--primary" : "btn--ghost"}`}
              href={c.href}
            >
              {c.label}
              {i === 0 && (
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
