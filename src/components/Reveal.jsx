import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Fades/slides content in when it enters the viewport.
 *
 * Not a scrub: brand-page sections should animate once and settle. Only
 * the 3D film is tied to the scrollbar.
 *
 * `stagger` animates the direct children one after another instead of the
 * wrapper as a whole — what you want for card grids.
 *
 * The hidden start state is set with gsap.set() inside useLayoutEffect,
 * which runs before the browser paints, so there is no flash of
 * un-animated content.
 */
export default function Reveal({
  children,
  stagger = false,
  className = "",
  as: Tag = "div",
  ...rest
}) {
  const el = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = stagger
        ? gsap.utils.toArray(el.current.children)
        : [el.current];

      gsap.set(targets, { opacity: 0, y: 28 });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: {
          trigger: el.current,
          start: "top 82%", // fire slightly before it is fully on screen
          once: true,
        },
      });
    }, el);

    return () => ctx.revert(); // also restores the inline styles gsap set
  }, [stagger]);

  return (
    <Tag ref={el} className={className} {...rest}>
      {children}
    </Tag>
  );
}
