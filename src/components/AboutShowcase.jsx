import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ================================================================
   ABOUT — text column + tabbed media panel

   Adapted from a shadcn/Tailwind/Next component. This project has none
   of those, so the structure was kept and rebuilt on the site's own
   tokens: eyebrow, headline, copy, chips, a disclosure list, two CTAs,
   and a tall panel whose image is switched by pills along its foot.

   Two accessibility decisions, both from the guidance rather than taste:

   · The chips are NOT buttons. In the original they are Badge
     components that look tappable and do nothing — a clickable-looking
     element with no behaviour is the failure the "compact control
     semantics" rule calls critical. They are plain text here.
   · The pills ARE buttons, in a tablist, with roving tabindex and arrow
     keys. Tab reaches the group once, arrows move within it, which
     keeps tab order aligned with visual order.

   The disclosure list uses button + aria-expanded + aria-controls. No
   database guidance existed for accordions specifically; this is the
   standard pattern.
   ================================================================ */

export default function AboutShowcase({
  eyebrow,
  title,
  paragraphs = [],
  chips = [],
  steps = [],
  media = [],
  ctas = [],
}) {
  const uid = useId();
  const [open, setOpen] = useState(0); // single-open, collapsible
  const [tab, setTab] = useState(0);
  const [loaded, setLoaded] = useState(() => new Set([0]));
  const tabRefs = useRef([]);
  const [focusIdx, setFocusIdx] = useState(null);

  useEffect(() => {
    if (focusIdx === null) return;
    tabRefs.current[focusIdx]?.focus();
    setFocusIdx(null);
  }, [focusIdx]);

  // only fetch a panel image once its tab has been selected
  useEffect(() => {
    setLoaded((s) => (s.has(tab) ? s : new Set(s).add(tab)));
  }, [tab]);

  const onTabKey = useCallback(
    (e) => {
      const last = media.length - 1;
      let next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = tab === last ? 0 : tab + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = tab === 0 ? last : tab - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      setTab(next);
      setFocusIdx(next);
    },
    [tab, media.length]
  );

  return (
    <div className="abt">
      {/* ---- text column ---- */}
      <div className="abt__col">
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

        {steps.length > 0 && (
          <div className="abt__steps">
            {steps.map((s, i) => {
              const isOpen = open === i;
              return (
                <div className={`abt__step${isOpen ? " is-open" : ""}`} key={s.t}>
                  <h3>
                    <button
                      type="button"
                      id={`${uid}-t${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-p${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                    >
                      <span className="abt__stepNo">{String(i + 1).padStart(2, "0")}</span>
                      <span className="abt__stepName">{s.t}</span>
                      <span className="abt__chev" aria-hidden="true" />
                    </button>
                  </h3>
                  {/* grid-template-rows 0fr -> 1fr animates to the content's
                      real height; max-height needs a guessed number that is
                      either too small (clipping) or too big (lazy easing) */}
                  <div
                    className="abt__stepBody"
                    id={`${uid}-p${i}`}
                    role="region"
                    aria-labelledby={`${uid}-t${i}`}
                  >
                    <div>
                      <p>{s.d}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

      {/* ---- media panel ---- */}
      {media.length > 0 && (
        <div className="abt__panel">
          <div className="abt__media">
            {media.map((m, i) => (
              <img
                key={m.src}
                className={`abt__img${i === tab ? " is-on" : ""}`}
                src={loaded.has(i) ? m.src : undefined}
                alt=""
                width="1600"
                height="900"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>

          <div
            className="abt__pills"
            role="tablist"
            aria-label="Views of our work"
            onKeyDown={onTabKey}
          >
            {media.map((m, i) => (
              <button
                key={m.label}
                ref={(el) => (tabRefs.current[i] = el)}
                role="tab"
                aria-selected={i === tab}
                tabIndex={i === tab ? 0 : -1}
                className={`abt__pill${i === tab ? " is-active" : ""}`}
                onClick={() => setTab(i)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
