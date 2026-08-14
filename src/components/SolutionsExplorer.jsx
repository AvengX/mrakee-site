import { useCallback, useEffect, useRef, useState } from "react";


/* ================================================================
   SOLUTIONS — index + panel

   Seventeen cards in a grid asked the visitor to read seventeen
   descriptions to find the one that applied to them. This shows the
   whole range as a scannable index and one solution in depth, which is
   how someone actually shops: skim the list, stop at the thing that
   matches your building.

   Behaviour is the WAI-ARIA tabs pattern — roving tabindex, arrow keys
   move selection, Home/End jump to the ends. Manual activation is
   deliberate: arrowing through with automatic activation would swap the
   panel image seventeen times on the way past.

   The visuals are frames from the company's own film rather than stock
   — already WebP, already served, already in the browser cache from the
   hero, and honestly of the product rather than of a lookalike.
   ================================================================ */

const frameSrc = (n) => `frames/film/${String(n).padStart(4, "0")}.webp`;

/* Bespoke art per solution, once it exists: drop 01.jpg … 17.jpg into
   public/solutions/ in the same order as the SOLUTIONS array and each
   one takes over automatically. Until then every panel falls back to a
   still from the film, so the section is never broken and the handoff
   needs no code change. See film-src/SOLUTION_PROMPTS.md. */
const artSrc = (i) => `solutions/${String(i + 1).padStart(2, "0")}.jpg`;

export default function SolutionsExplorer({ solutions }) {
  const [active, setActive] = useState(0);
  const tabsRef = useRef([]);
  const [focusIndex, setFocusIndex] = useState(null);
  // indices whose bespoke image has been confirmed loadable
  const [hasArt, setHasArt] = useState(() => new Set());

  // Move DOM focus only when the visitor is actually driving with the
  // keyboard — doing it on every state change would steal focus from a
  // mouse user mid-click.
  useEffect(() => {
    if (focusIndex === null) return;
    tabsRef.current[focusIndex]?.focus();
    setFocusIndex(null);
  }, [focusIndex]);

  /* Probe the bespoke image for whichever solution is on screen and only
     swap it in once it has actually decoded.
     Doing it the other way round — render the bespoke path and fall back
     on error — does not work here: the panel image is lazy, so a missing
     file is never requested, never errors, and the panel just sits blank.
     Probing off-DOM also means no broken-image flash on the way past. */
  useEffect(() => {
    if (hasArt.has(active)) return;
    let alive = true;
    const probe = new Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth > 1) {
        setHasArt((s) => new Set(s).add(active));
      }
    };
    probe.src = artSrc(active);
    return () => {
      alive = false;
      probe.onload = null;
    };
  }, [active, hasArt]);

  const onKeyDown = useCallback(
    (e) => {
      const last = solutions.length - 1;
      let next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next === null) return;
      e.preventDefault();
      setActive(next);
      setFocusIndex(next);
    },
    [active, solutions.length]
  );

  const current = solutions[active];

  return (
    <div className="sx">
      <div
        className="sx__index"
        role="tablist"
        aria-orientation="vertical"
        aria-label="Solutions"
        onKeyDown={onKeyDown}
      >
        {solutions.map((s, i) => (
          <button
            key={s.t}
            ref={(el) => (tabsRef.current[i] = el)}
            role="tab"
            id={`sx-tab-${i}`}
            aria-selected={i === active}
            aria-controls="sx-panel"
            tabIndex={i === active ? 0 : -1}
            className={`sx__item${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="sx__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="sx__name">{s.t}</span>
          </button>
        ))}
      </div>

      <div
        className="sx__panel"
        id="sx-panel"
        role="tabpanel"
        aria-labelledby={`sx-tab-${active}`}
        tabIndex={0}
      >
        {/* keyed so React remounts it and the entrance animation replays
            on every change — a 350ms fade-up, matching the rest of the
            page's reveal timing */}
        <div className="sx__panelInner" key={active}>
          <div className="sx__media">
            <img
              key={active}
              src={hasArt.has(active) ? artSrc(active) : frameSrc(current.frame)}
              alt=""
              width="1400"
              height="788"
              loading="lazy"
              decoding="async"
            />
            <span className="sx__badge">
              {String(active + 1).padStart(2, "0")} / {String(solutions.length).padStart(2, "0")}
            </span>
          </div>

          <div className="sx__copy">
            <h3>{current.t}</h3>
            <p>{current.d}</p>
            <a className="sx__link" href="#contact">
              Talk to us about this
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
