import { Fragment, useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Headline reveal: each word rises out of its own clipping box, one after
 * the next.
 *
 * Why the DOM is built here rather than by splitting text with JS: the
 * markup ships already split, so there is no flash of un-split text and
 * no layout thrash on mount. Pass an array of strings — or of
 * `{ t, grad: true }` to run a word through the brand gradient.
 *
 * Screen readers get the whole line from aria-label; the per-word spans
 * are hidden from them, otherwise the headline is announced one word at
 * a time.
 */
export default function SplitWords({
  words,
  as: Tag = "h2",
  delay = 0,
  className = "",
  ...rest
}) {
  const el = useRef(null);
  const label = words.map((w) => (typeof w === "string" ? w : w.t)).join(" ");

  useLayoutEffect(() => {
    const targets = [...el.current.querySelectorAll(".word > i")];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.05,
          delay,
          ease: "power3.out",
          stagger: 0.055,
          scrollTrigger: { trigger: el.current, start: "top 88%", once: true },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      // GSAP reads an element's existing inline transform as its BASE and
      // measures percentages from there. A translate left behind by a
      // previous mount — StrictMode's double-invoke in dev, or an HMR
      // update — therefore turns "yPercent: 0" into "118% below where it
      // should be", and the headline never arrives. Wipe it.
      targets.forEach((t) => {
        t.style.transform = "";
      });
    };
  }, [delay]);

  return (
    <Tag ref={el} className={className} aria-label={label} {...rest}>
      {words.map((w, i) => {
        const text = typeof w === "string" ? w : w.t;
        const grad = typeof w === "object" && w.grad;
        const br = typeof w === "object" && w.br;
        return (
          /* The space sits OUTSIDE the clipping box. Inside it, trailing
             whitespace is swallowed and every word runs together. */
          <Fragment key={i}>
            <span className="word" aria-hidden="true">
              <i className={grad ? "grad-text" : undefined}>{text}</i>
            </span>
            {br ? <br aria-hidden="true" /> : i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
