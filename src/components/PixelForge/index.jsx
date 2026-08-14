import { useEffect, useLayoutEffect, useMemo, useRef, useState, Suspense, lazy } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Fallback from "./Fallback";
import { GRID } from "./dimensions";
import { CAPTIONS } from "./timeline";

gsap.registerPlugin(ScrollTrigger);

/* three.js and everything that imports it are loaded on demand — see
   Stage3D for why that boundary matters. */
const Stage3D = lazy(() => import("./Stage3D"));

/* ================================================================
   PIXEL FORGE — the signature sequence.

   A 700vh runway with a sticky stage. Scroll position drives one
   number, and that number drives everything: where five thousand
   pixels are, whether the chassis exists, where the camera is standing
   and what the screen is showing.

   The canvas is transparent. The page's own atmosphere layer shows
   through it, so the product is standing in the same light as the rest
   of the site rather than in a box that has been dropped onto it.
   ================================================================ */

/** Ramp a caption in and out around its window. */
function opacityAt(p, from, to, fade = 0.04) {
  if (p <= from || p >= to) return 0;
  return Math.min(1, (p - from) / fade, (to - p) / fade);
}

/**
 * How much machine we are on.
 *
 * The particle count is the one number worth scaling: everything else
 * in the scene is a handful of triangles. 5,184 instances is one draw
 * call either way, but the fragment cost of that many soft-edged quads
 * overlapping in the cloud phase is real on integrated graphics.
 */
function pickTier() {
  if (typeof window === "undefined") return "none";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "none";
    const lose = gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
  } catch {
    return "none";
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse || window.innerWidth < 820) return "low";
  if ((navigator.deviceMemory || 8) <= 4 || window.innerWidth < 1400) return "mid";
  return "high";
}

export default function PixelForge() {
  const root = useRef(null);
  const capRefs = useRef([]);
  const hint = useRef(null);
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const [tier, setTier] = useState(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    // ?forge=low|mid|high|none forces a tier, for checking the others
    const forced = new URLSearchParams(window.location.search).get("forge");
    setTier(["low", "mid", "high", "none"].includes(forced) ? forced : pickTier());
  }, []);

  const grid = useMemo(() => GRID[tier === "high" ? "high" : tier === "mid" ? "mid" : "low"], [tier]);

  /* ---- scroll drives everything ---------------------------------- */
  useLayoutEffect(() => {
    if (!tier) return;

    const ctx = gsap.context(() => {
      const paint = (p) => {
        progress.current = p;

        capRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = CAPTIONS[i];
          const o = opacityAt(p, c.in, c.out);
          el.style.opacity = o;
          const t = (p - c.in) / (c.out - c.in);
          el.style.setProperty("--drift", `${(0.5 - t) * 26}px`);
          el.style.filter = o > 0.995 ? "none" : `blur(${(1 - o) * 5}px)`;
          el.style.visibility = o <= 0.001 ? "hidden" : "visible";
        });

        if (hint.current) {
          const fade = Math.max(0, 1 - p * 24);
          hint.current.style.opacity = fade;
          hint.current.style.visibility = fade <= 0.01 ? "hidden" : "visible";
        }
      };

      const state = { p: 0 };
      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.55,
        },
        onUpdate: () => paint(state.p),
      });

      // Stop rendering entirely once the sequence is off screen. There
      // is a continuously drifting particle field in here; leaving it
      // running while someone reads the footer is pure waste.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setLive(self.isActive),
      });

      paint(0);
    }, root);

    return () => ctx.revert();
  }, [tier]);

  /* ---- pointer parallax ------------------------------------------ */
  useEffect(() => {
    if (tier !== "high" && tier !== "mid") return;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [tier]);

  return (
    <section className="forge" id="forge" ref={root}>
      <div className="forge__stage">
        {/* the cool key light the product is standing in */}
        <div className="forge__key" aria-hidden="true" />

        {tier && tier !== "none" && (
          // the fallback panel holds the frame while the 3D chunk
          // arrives, so the hero is never an empty white screen
          <Suspense fallback={<Fallback />}>
            <Stage3D
              progress={progress}
              pointer={pointer}
              cols={grid.cols}
              rows={grid.rows}
              tier={tier}
              live={live}
            />
          </Suspense>
        )}

        {tier === "none" && <Fallback />}

        {CAPTIONS.map((c, i) => (
          <div
            key={i}
            ref={(el) => (capRefs.current[i] = el)}
            className={`cap cap--${c.align}`}
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <p className={`eyebrow${c.hero ? " eyebrow--badge" : ""}`}>{c.eyebrow}</p>
            {c.hero ? (
              <h1>
                {c.title.map((w, k) => (
                  <span key={k} className={c.grad?.includes(k) ? "grad-text" : undefined}>
                    {w}{k < c.title.length - 1 ? " " : ""}
                  </span>
                ))}
              </h1>
            ) : (
              <h2>
                {c.title.map((w, k) => (
                  <span key={k} className={c.grad?.includes(k) ? "grad-text" : undefined}>
                    {w}{k < c.title.length - 1 ? " " : ""}
                  </span>
                ))}
              </h2>
            )}
            <p className="lede">{c.body}</p>
            {(c.hero || c.cta) && (
              <div className="hero__cta">
                <a className="btn btn--primary" href="#contact">
                  Book a demo <span className="arrow" aria-hidden="true">→</span>
                </a>
                <a className="btn btn--ghost" href="#solutions">
                  Explore solutions
                </a>
              </div>
            )}
          </div>
        ))}

        <p className="scroll-hint" ref={hint}>
          <i aria-hidden="true" />
          Scroll to build it
        </p>
      </div>
    </section>
  );
}
