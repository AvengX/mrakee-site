import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Counts a stat up to its value the first time it is seen.
 *
 * Takes the final string as authored ("4.0M", "1,200+", "100+") and
 * works backwards, so the content stays readable in the markup and
 * nobody has to keep a number and its formatting in sync by hand. The
 * decimal places and the thousands separators of the source string are
 * both preserved on the way up — otherwise 1,200 counts through "1200"
 * and the column width jumps on every frame.
 *
 * The element carries the finished string as its text until the tween
 * starts, so with JS broken or the tween never firing, the real number
 * is still what is on screen.
 */
export default function Counter({ value }) {
  const el = useRef(null);

  useLayoutEffect(() => {
    const match = /^([\d.,]+)(.*)$/.exec(value);
    if (!match) return;

    const [, rawNum, suffix] = match;
    const target = parseFloat(rawNum.replace(/,/g, ""));
    if (!isFinite(target)) return;

    const decimals = rawNum.includes(".") ? rawNum.split(".")[1].length : 0;
    const grouped = rawNum.includes(",");
    const format = (n) =>
      (grouped
        ? n.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : n.toFixed(decimals)) + suffix;

    const ctx = gsap.context(() => {
      const state = { n: 0 };
      gsap.to(state, {
        n: target,
        duration: 1.9,
        ease: "power2.out",
        onUpdate: () => {
          el.current.textContent = format(state.n);
        },
        scrollTrigger: { trigger: el.current, start: "top 90%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [value]);

  return (
    <div className="stat__num" ref={el}>
      {value}
    </div>
  );
}
