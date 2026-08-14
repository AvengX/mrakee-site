import { useEffect, useRef } from "react";

/**
 * Card spotlight: writes --mx / --my (the pointer's position inside the
 * card) so `.card::before` can paint a soft highlight that follows it.
 *
 * One listener on the container, not one per card — with 17 solution
 * cards that is the difference between 1 and 17 live handlers, and the
 * gradient only ever repaints on the single card under the pointer.
 *
 * Returns a ref to spread onto the grid element.
 */
export function usePointerGlow(selector = ".card") {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let frame = 0;
    let pending = null;

    const apply = () => {
      frame = 0;
      if (!pending) return;
      const { card, x, y } = pending;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      pending = null;
    };

    const onMove = (e) => {
      const card = e.target.closest(selector);
      if (!card || !root.contains(card)) return;
      const r = card.getBoundingClientRect();
      pending = { card, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [selector]);

  return ref;
}
