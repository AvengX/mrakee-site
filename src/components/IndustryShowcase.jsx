import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   INDUSTRIES — one featured environment, thirteen to choose from

   Replaces a field of identical pills. The argument the section has to
   make is "this technology is already in all these rooms", and a pill
   cannot show a room. So: one large environment on screen at a time,
   with a numbered rail underneath to move between them.

   Three decisions worth knowing about:

   · Two image layers, not one. The incoming environment is decoded in
     the hidden layer and only then are the opacities swapped, so the
     crossfade never shows a gap. One <img> with a src swap flashes; all
     thirteen stacked would download thirteen images.
   · Hover selects, but it is not the only way. Hover-only is unusable
     by keyboard and on touch, so this is a tablist underneath: arrows
     move, Home/End jump, click commits. Hover is a 120ms-delayed
     convenience on top, long enough that dragging the pointer across
     the rail does not strobe through six environments.
   · The rail scrolls horizontally and therefore has arrow buttons. A
     wheel emits deltaY, which does nothing to a horizontal container —
     without the buttons the last industries are unreachable with a
     mouse. This project has shipped that bug before.
   ================================================================ */

export default function IndustryShowcase({ items }) {
  const [active, setActive] = useState(0);
  const [layerA, setLayerA] = useState({ i: 0, src: items[0].fallback });
  const [layerB, setLayerB] = useState(null);
  const [showB, setShowB] = useState(false);

  const railRef = useRef(null);
  const tabsRef = useRef([]);
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const hoverTimer = useRef(0);
  const [focusIdx, setFocusIdx] = useState(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const current = items[active];

  /* ---- crossfade to the selected environment -------------------- */
  useEffect(() => {
    const it = items[active];
    const visible = showB ? layerB : layerA;
    if (visible && visible.i === active) return;

    let alive = true;
    const load = (src, onDone) => {
      const im = new Image();
      im.onload = () => alive && onDone(src);
      im.onerror = () => alive && onDone(it.fallback);
      im.src = src;
    };
    // try the commissioned environment, fall back to a related still
    load(it.img || it.fallback, (src) => {
      if (showB) {
        setLayerA({ i: active, src });
        setShowB(false);
      } else {
        setLayerB({ i: active, src });
        setShowB(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [active, items, showB, layerA, layerB]);

  /* ---- keyboard, and focus that follows only the keyboard -------- */
  useEffect(() => {
    if (focusIdx === null) return;
    tabsRef.current[focusIdx]?.focus();
    tabsRef.current[focusIdx]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    setFocusIdx(null);
  }, [focusIdx]);

  const onKeyDown = useCallback(
    (e) => {
      const last = items.length - 1;
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
    [active, items.length]
  );

  const onHover = (i) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setActive(i), 120);
  };
  const cancelHover = () => clearTimeout(hoverTimer.current);

  /* ---- rail edge state, so the arrows disable at the ends -------- */
  const readEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft > 4,
      end: el.scrollLeft < el.scrollWidth - el.clientWidth - 4,
    });
  }, []);

  useEffect(() => {
    readEdges();
    const el = railRef.current;
    el?.addEventListener("scroll", readEdges, { passive: true });
    window.addEventListener("resize", readEdges);
    return () => {
      el?.removeEventListener("scroll", readEdges);
      window.removeEventListener("resize", readEdges);
    };
  }, [readEdges]);

  const nudge = (dir) =>
    railRef.current?.scrollBy({ left: dir * Math.min(360, railRef.current.clientWidth * 0.7), behavior: "smooth" });

  /* ---- entrance + a very small parallax on the environment ------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        stageRef.current,
        { opacity: 0, y: 34, clipPath: "inset(8% 6% 8% 6% round 20px)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0% round 20px)",
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: stageRef.current, start: "top 86%", once: true },
        }
      );
      gsap.fromTo(
        imageRef.current,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        }
      );
    }, stageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="ind">
      <div className="ind__stage" ref={stageRef}>
        <div className="ind__frame">
          <div className="ind__layers" ref={imageRef}>
            {layerA && (
              <img
                className={`ind__img${showB ? "" : " is-on"}`}
                src={layerA.src}
                alt=""
                width="1600"
                height="900"
                decoding="async"
              />
            )}
            {layerB && (
              <img
                className={`ind__img${showB ? " is-on" : ""}`}
                src={layerB.src}
                alt=""
                width="1600"
                height="900"
                decoding="async"
              />
            )}
          </div>

          {/* the light sweep — one pass, rarely, never a strobe */}
          <span className="ind__scan" aria-hidden="true" />

          <div className="ind__caption">
            <span className="ind__index">
              {String(active + 1).padStart(2, "0")}
              <i aria-hidden="true" />
              {current.t}
            </span>
            <p key={active}>{current.d}</p>
          </div>
        </div>
      </div>

      <div className="ind__nav">
        <button
          type="button"
          className="ind__arrow"
          onClick={() => nudge(-1)}
          disabled={!edges.start}
          aria-label="Scroll industries left"
        >
          ‹
        </button>

        <div
          className="ind__rail"
          role="tablist"
          aria-label="Industries"
          ref={railRef}
          onKeyDown={onKeyDown}
          onMouseLeave={cancelHover}
        >
          {items.map((it, i) => (
            <button
              key={it.t}
              ref={(el) => (tabsRef.current[i] = el)}
              role="tab"
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={`ind__tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              onMouseEnter={() => onHover(i)}
              onFocus={() => setActive(i)}
            >
              <span className="ind__tabNo">{String(i + 1).padStart(2, "0")}</span>
              <span className="ind__tabName">{it.short || it.t}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="ind__arrow"
          onClick={() => nudge(1)}
          disabled={!edges.end}
          aria-label="Scroll industries right"
        >
          ›
        </button>
      </div>
    </div>
  );
}
