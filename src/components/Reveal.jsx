import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades content in when it enters the viewport: up, into focus, and to
 * full size.
 *
 * Not a scrub — brand-page sections should animate once and settle. Only
 * the film is tied to the scrollbar.
 *
 * `stagger` animates the direct children one after another instead of
 * the wrapper as a whole, which is what card grids want.
 *
 * The blur is the expensive part (it repaints rather than composites),
 * so it is off by default for staggered runs: seventeen cards blurring
 * at once is a visible hitch on an integrated GPU, while one heading
 * block coming into focus costs nothing and reads as depth-of-field.
 *
 * The hidden start state is set with gsap.set() inside useLayoutEffect,
 * which runs before the browser paints, so there is no flash of
 * un-animated content.
 */
export default function Reveal({
  children,
  stagger = false,
  blur,
  y = 30,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  const el = useRef(null);
  const useBlur = blur ?? !stagger;

  useLayoutEffect(() => {
    const targets = stagger
      ? gsap.utils.toArray(el.current.children)
      : [el.current];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
          scale: 0.985,
          filter: useBlur ? "blur(9px)" : "none",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          stagger: stagger ? 0.07 : 0,
          // drop the compositor hints once the run is over, so 20 idle
          // elements aren't each holding their own layer for the rest of
          // the session
          clearProps: "filter,scale,willChange",
          scrollTrigger: {
            trigger: el.current,
            start: "top 84%", // fire slightly before it is fully on screen
            once: true,
          },
        }
      );
    }, el);

    return () => {
      ctx.revert();
      // GSAP reads an element's existing inline transform as its BASE and
      // measures from there, so a translate left behind by a previous
      // mount — StrictMode's double-invoke in dev, or an HMR update —
      // makes "y: 0" mean "30px below where it belongs". Wipe it.
      targets.forEach((t) => {
        t.style.transform = "";
      });
    };
  }, [stagger, useBlur, y]);

  return (
    <Tag ref={el} className={className} {...rest}>
      {children}
    </Tag>
  );
}
