import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";

/**
 * Everything that touches three.js lives behind this one module, and
 * this module is only ever reached through a dynamic import.
 *
 * That boundary is worth keeping strict. three + fiber + drei are ~900kB
 * raw; with them in the main chunk the browser cannot paint the nav, the
 * type or the brand page until all of it has arrived. Split out, the
 * page renders immediately and the sequence streams in behind the static
 * fallback — which is a real panel, not a spinner.
 */
export default function Stage3D({ progress, pointer, cols, rows, tier, live }) {
  return (
    <Canvas
      className="forge__canvas"
      flat
      dpr={[1, tier === "high" ? 2 : 1.5]}
      frameloop={live ? "always" : "never"}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        // needed for toDataURL in the dev frame grabber; off in prod
        preserveDrawingBuffer: import.meta.env.DEV,
      }}
      camera={{ fov: 33, near: 0.1, far: 60, position: [0, 0.25, 9.8] }}
    >
      <Suspense fallback={null}>
        <Scene progress={progress} cols={cols} rows={rows} pointer={pointer} />
      </Suspense>
    </Canvas>
  );
}
