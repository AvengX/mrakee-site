import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionAllowed } from "../lib/motion";

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   SOLUTIONS — a pinned horizontal rail

   The pattern from goobaexport.com's products section: the section
   pins, and the track slides sideways as you scroll down. Nine
   portfolios read as a run of cards you travel along rather than a
   column you fall past.

   Three guards, all of which matter:

   · Desktop only. On a phone the pin would eat the screen and leave a
     few pixels of travel; below the breakpoint the rail is just a
     touch-scrollable row, which is the gesture a phone already has.
   · If the track fits the viewport there is nothing to travel, and
     pinning a zero-length range freezes the section instead of
     animating it. Under 120px of overrun, don't pin at all.
   · scrollWidth on an overflowing flex row omits the trailing padding
     and clientWidth excludes the scrollbar, so the distance is measured
     with both accounted for — otherwise the last card stops under the
     scrollbar or short of the gutter.
   ================================================================ */

const BREAK = "(min-width: 861px)";

export default function SolutionRail({ items }) {
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [ready, setReady] = useState(() => new Set());

  // probe off-DOM: a lazy image that 404s never fires onError
  useLayoutEffect(() => {
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
    return () => { alive = false; };
  }, [items]);

  /* WHEN MOTION IS OFF, THE RAIL BECOMES A PLAIN SCROLLER.

     Respecting prefers-reduced-motion must not mean hiding content, and
     it did: the track is width:max-content and .rail clips it, so with
     the scrub tween never created there was no way to reach cards three
     to nine. Measured on a machine reporting `reduce`: 3,036px of the
     rail simply unreachable, two of nine cards visible, no scrollbar,
     no keyboard route.

     So the pinned scrub is the enhancement and native horizontal
     scrolling is the floor. Same cards, same order, no animation. */
  const [still] = useState(() => !motionAllowed());

  useLayoutEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track || !motionAllowed()) return undefined;

    const mm = gsap.matchMedia();
    mm.add(BREAK, () => {
      const distance = () => {
        const padRight = parseFloat(getComputedStyle(track).paddingRight) || 0;
        return Math.max(
          0,
          track.scrollWidth + padRight - document.documentElement.clientWidth
        );
      };
      if (distance() < 120) {
        if (barRef.current) barRef.current.style.width = "100%";
        return undefined;
      }

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top 92px",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (barRef.current) {
              barRef.current.style.width = (8 + self.progress * 92) + "%";
            }
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { clearProps: "transform" });
      };
    });

    return () => mm.revert();
  }, [items]);

  return (
    <div className={`rail${still ? " rail--static" : ""}`} ref={pinRef}>
      <div className="rail__track" ref={trackRef}>
        {items.map((s, i) => (
          <article className="rail__card" key={s.t}>
            <div className="rail__media">
              <img
                src={ready.has(i) && s.img ? s.img : s.fallback}
                alt=""
                width="1600"
                height="900"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="rail__body">
              <span className="rail__no">
                {String(i + 1).padStart(2, "0")}
                <i aria-hidden="true" />
                {String(items.length).padStart(2, "0")}
              </span>
              <h3>{s.t}</h3>
              {s.quote && <p className="rail__quote">{s.quote}</p>}
              {s.d && <p className="rail__lede">{s.d}</p>}
              {s.points?.length > 0 && (
                <ul className="rail__points">
                  {s.points.slice(0, 6).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <a className="rail__link" href="#contact">
                Talk to us about this
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="rail__bar" aria-hidden="true">
        <i ref={barRef} />
      </div>
    </div>
  );
}
