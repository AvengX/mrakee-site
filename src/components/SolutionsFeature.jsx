import Reveal from "./Reveal";

/* ================================================================
   SOLUTIONS — alternating feature rows

   Third structure for this section, and the reason is worth recording.
   Seventeen cards was a wall. Seventeen index rows plus a detail panel
   fixed the wall but still asked the visitor to work the list. The
   reference the client picked does neither: a handful of offers, each
   given a full row of its own, image one side and copy the other,
   alternating down the page.

   That only works because it is FIVE items. The other twelve are named
   in a single line underneath rather than dropped — they are real
   capabilities and a buyer searching for "queue management" should still
   find the word on the page.
   ================================================================ */

export default function SolutionsFeature({ solutions, rest }) {
  return (
    <div className="feats">
      {solutions.map((s, i) => (
        <Reveal key={s.t} as="article" className="feat" y={36}>
          <div className="feat__media">
            <img
              src={s.img}
              alt=""
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="feat__body">
            <span className="feat__no">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.t}</h3>
            <p className="feat__lede">{s.d}</p>
            {s.points?.length > 0 && (
              <ul className="feat__points">
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            <a className="feat__link" href="#contact">
              Talk to us about this
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </Reveal>
      ))}

      {rest?.length > 0 && (
        <Reveal className="feats__rest" y={20}>
          <p>
            <span>Also built on the same platform</span>
            {rest.join(" · ")}
          </p>
        </Reveal>
      )}
    </div>
  );
}
