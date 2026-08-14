import { useMemo } from "react";

/**
 * What the sequence becomes with no WebGL.
 *
 * Not an apology image — the same idea told statically: a matrix of
 * pixels already assembled into a panel, with the outermost ones still
 * loose. Roughly 600 divs, drawn once, animated by nothing.
 */
export default function Fallback() {
  const cells = useMemo(() => {
    const cols = 18;
    const rows = 32;
    const out = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        // distance from the panel's edge, used to decide which pixels
        // are still "loose" and which have locked into the matrix
        const edge = Math.min(i, cols - 1 - i, j, rows - 1 - j);
        const settled = Math.min(1, edge / 3);
        out.push({
          o: 0.14 + settled * 0.7,
          hue: (i * 7 + j * 3) % 3,
          off: settled > 0.99 ? 0 : (1 - settled) * (i % 2 ? 3 : -3),
        });
      }
    }
    return out;
  }, []);

  return (
    <div className="forge__fallback" aria-hidden="true">
      <div className="forge__panel">
        {cells.map((c, i) => (
          <span
            key={i}
            style={{
              opacity: c.o,
              background: ["var(--indigo)", "var(--cyan)", "var(--violet)"][c.hue],
              transform: `translate(${c.off}px, ${-c.off}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
