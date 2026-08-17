import { useCallback, useEffect, useId, useRef, useState } from "react";

/* ================================================================
   ABOUT — text column + media panel

   Adapted from a shadcn/Tailwind/Next component. This project has none
   of those, so the structure was kept and rebuilt on the site's own
   tokens: eyebrow, headline, copy, chips, a disclosure list, two CTAs,
   and a tall panel with pills along its foot.

   One departure that matters: in the original the pills and the steps
   are unrelated — the steps explain the process, the pills switch
   between output styles. Here they are the SAME five stages, so having
   two independent controls for one idea would be a lie about the
   content. There is a single `active` index: the open step, the lit
   pill and the panel image are all it. Selecting either control moves
   both.

   That also removes the collapse-to-nothing state. With the panel
   bound to the selection, "no step open" would mean "no image", which
   is a worse thing to be able to reach than it is to gain.

   Accessibility notes:
   · The chips are NOT buttons. In the source they are Badge components
     that look pressable and do nothing — a clickable-looking element
     with no behaviour is what the guidance calls a critical failure.
   · The pills ARE buttons, in a tablist with roving tabindex and arrow
     keys, so Tab reaches the group once and arrows move within it.
   · The disclosure uses button + aria-expanded + aria-controls.
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

        <div className="abt__steps">
          {steps.map((s, i) => {
            const isOpen = active === i;
            return (
              <div className={`abt__step${isOpen ? " is-open" : ""}`} key={s.t}>
                <h3>
                  <button
                    type="button"
                    id={`${uid}-t${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-p${i}`}
                    onClick={() => setActive(i)}
                  >
                    <span className="abt__stepNo">{String(i + 1).padStart(2, "0")}</span>
                    <span className="abt__stepName">{s.t}</span>
                    <span className="abt__chev" aria-hidden="true" />
                  </button>
                </h3>
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
          {/* the stage's name over the image, so the panel says what it
              is showing without depending on the pills being visible */}
          <span className="abt__stageTag">
            <i aria-hidden="true">{String(active + 1).padStart(2, "0")}</i>
            {steps[active]?.t}
          </span>
        </div>

        {/* Hidden below 900px: five pills do not fit a phone without a
            horizontal scroller, and the disclosure list sits directly
            under the panel there and already names all five. */}
        <div
          className="abt__pills"
          role="tablist"
          aria-label="Our approach"
          onKeyDown={onPillKey}
        >
          {steps.map((s, i) => (
            <button
              key={s.t}
              ref={(el) => (pillRefs.current[i] = el)}
              role="tab"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={`abt__pill${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {s.short || s.t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
