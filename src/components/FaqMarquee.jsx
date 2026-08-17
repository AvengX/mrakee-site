import { useState } from "react";
import { motionAllowed } from "../lib/motion";

/* ================================================================
   FAQ — questions on two moving rows

   Adapted from a shadcn/Tailwind component. This project has neither,
   so the behaviour was kept and rebuilt on the site's own tokens: two
   rows of cards sliding in opposite directions, each row a track of two
   identical sets translated by exactly half its width, which is what
   makes the loop seamless.

   WHAT THE SOURCE IS MISSING, and why it is not optional:

   Content that moves automatically, runs for more than five seconds and
   sits beside other content has to be stoppable — WCAG 2.2.2, and it is
   a failure rather than a nicety. The source carries a `group` class
   but never a `group-hover:` rule to go with it, so hovering does
   nothing at all.

   Here a pointer stops a row by resting on it, and the button stops
   both rows outright — which is the mechanism that actually counts,
   since a touch screen has no hover and a keyboard cannot reach into a
   row: the cards hold a heading and a paragraph and nothing focusable.
   (The stylesheet also pauses on :focus-within. That is dead today for
   exactly that reason, and kept only so the rows behave if a card ever
   gains a link.)

   Reduced motion does not get a slower marquee, it gets no marquee: the
   same questions as a plain grid. A moving row is hard to read even
   when you asked for it.

   Sizing rule that matters: one set must be WIDER than the row, or two
   copies of the same question are on screen at once and it reads as a
   bug rather than as a loop. Three cards at a 300-400px clamp beats the
   1200px column at every width the site has.
   ================================================================ */

/* Different speeds so the two rows never lock into step and look like
   one block sliding. A cycle carries a row exactly one set — about
   1280px — so these are roughly 32 and 40 px/s: slow enough to read a
   card as it passes, fast enough not to look like a still image. */
const SPEEDS = ["40s", "32s"];

function chunk(list, parts) {
  const size = Math.ceil(list.length / parts);
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function Card({ item }) {
  return (
    <li className="faqm__card">
      <h3>{item.q}</h3>
      <p>{item.a}</p>
    </li>
  );
}

export default function FaqMarquee({ items, rows = 2 }) {
  // read once: this decides the markup, not just a style
  const [animate] = useState(() => motionAllowed());
  const [paused, setPaused] = useState(false);

  if (!animate) {
    return (
      <ul className="faqm faqm--still">
        {items.map((f) => (
          <Card item={f} key={f.q} />
        ))}
      </ul>
    );
  }

  const lanes = chunk(items, rows);

  return (
    <div className={`faqm${paused ? " is-paused" : ""}`}>
      {lanes.map((lane, r) => (
        <div
          className="faqm__row"
          key={lane[0].q}
          style={{ "--dur": SPEEDS[r % SPEEDS.length] }}
          data-dir={r % 2 === 1 ? "right" : "left"}
        >
          <div className="faqm__track">
            <ul className="faqm__set">
              {lane.map((f) => (
                <Card item={f} key={f.q} />
              ))}
            </ul>
            {/* The second copy is what the loop translates onto, so it
                is decoration — hidden from assistive technology, and
                holding nothing focusable, so it cannot be tabbed into
                either. */}
            <ul className="faqm__set" aria-hidden="true">
              {lane.map((f) => (
                <Card item={f} key={f.q} />
              ))}
            </ul>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="faqm__toggle"
        onClick={() => setPaused((p) => !p)}
        aria-label={
          paused ? "Play the moving questions" : "Pause the moving questions"
        }
      >
        <span className="faqm__toggleIcon" aria-hidden="true" data-state={paused ? "play" : "pause"} />
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
