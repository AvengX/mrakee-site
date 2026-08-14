import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Pixels from "./Pixels";
import Signage from "./Signage";
import { PANEL, outerH, outerW } from "./dimensions";
import { buildScreenTextures } from "./screenContent";
import { phases, cameraAt, screenAt, range, composeShift } from "./timeline";

/* ================================================================
   The scene.

   React renders this once. After that nothing here re-renders: the
   whole sequence is uniform writes and three transform assignments per
   frame, driven from a mutable progress ref that ScrollTrigger writes
   to. Re-rendering React at 60fps to animate a scroll sequence is the
   usual reason these things stutter.
   ================================================================ */

/** 1x1 white stand-in so the screen shader always has a sampler bound. */
function placeholder() {
  const t = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
}

export default function Scene({ progress, cols, rows, pointer }) {
  const pixels = useRef();
  const signage = useRef();
  const group = useRef();
  const { camera, gl, advance, scene, size } = useThree();

  const blank = useMemo(placeholder, []);
  const [textures, setTextures] = useState(null);

  /* The slides are painted with Inter. Painting them before the font
     has loaded bakes a system fallback into the texture permanently —
     and it is a texture, so it never re-flows once it is wrong. */
  useEffect(() => {
    let alive = true;
    const build = () => {
      if (!alive) return;
      setTextures(buildScreenTextures());
    };
    if (document.fonts?.ready) document.fonts.ready.then(build);
    else build();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => textures?.forEach((t) => t.dispose());
  }, [textures]);

  /* ---- dev handle: render any frame on demand ------------------- */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // A synthetic clock. advance() derives its delta from the timestamp
    // it is handed, so calling it in a tight loop with performance.now()
    // passes ~0ms each time and the damped camera never moves. Stepping
    // a virtual clock by one frame per call gives real deltas.
    let vt = performance.now();

    window.__forge = {
      /** Jump to p and run enough frames for the damping to settle. */
      seek(p, frames = 70) {
        progress.current = p;
        for (let i = 0; i < frames; i++) {
          vt += 16.7;
          advance(vt);
        }
        return p;
      },
      settle(frames = 40) {
        for (let i = 0; i < frames; i++) {
          vt += 16.7;
          advance(vt);
        }
      },
      size(w, h) {
        gl.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        advance(performance.now());
      },
      /* Composite onto white before encoding. The canvas is transparent
         by design — the page behind it is the product's environment —
         so a raw grab has an empty alpha channel and every viewer
         guesses a different backdrop for it. This is what a visitor
         actually sees. */
      shot() {
        vt += 16.7;
        advance(vt);
        const src = gl.domElement;
        const out = document.createElement("canvas");
        out.width = src.width;
        out.height = src.height;
        const c = out.getContext("2d");
        c.fillStyle = "#ffffff";
        c.fillRect(0, 0, out.width, out.height);
        c.drawImage(src, 0, 0);
        return out.toDataURL("image/png");
      },
      /**
       * The panel's projected rectangle in CSS pixels.
       *
       * The frame grabber only captures the WebGL canvas, so it cannot
       * show whether a DOM caption is sitting on top of the product.
       * This gives a box to compare against getBoundingClientRect().
       */
      bounds() {
        // the WHOLE object, stand included — the panel alone reports a
        // bottom edge well above where the product actually ends
        const w = outerW / 2;
        const top = outerH / 2;
        const bot = -outerH / 2 - PANEL.standH;
        const d = -PANEL.depth;
        const pts = [
          [-w, bot, 0],
          [w, bot, 0],
          [-w, top, 0],
          [w, top, 0],
          [-w, bot, d],
          [w, bot, d],
          [-w, top, d],
          [w, top, d],
        ];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        const v = new THREE.Vector3();
        for (const [x, y, z] of pts) {
          v.set(x, y + 0.17, z).project(camera);
          const sx = ((v.x + 1) / 2) * size.width;
          const sy = ((1 - v.y) / 2) * size.height;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
        return {
          left: Math.round(minX),
          right: Math.round(maxX),
          top: Math.round(minY),
          bottom: Math.round(maxY),
          viewport: [size.width, size.height],
        };
      },

      /** Walk the scene — the only way to inspect it from a console. */
      debug() {
        const out = [];
        scene.traverse((o) => {
          if (!o.isMesh) return;
          const g = o.geometry;
          out.push({
            name: o.material.type + (g.isInstancedBufferGeometry ? " [inst]" : ""),
            visible: o.visible,
            ancestorsVisible: (() => {
              let n = o.parent;
              while (n) {
                if (!n.visible) return false;
                n = n.parent;
              }
              return true;
            })(),
            instanceCount: g.instanceCount ?? null,
            attrs: Object.keys(g.attributes).join(","),
            index: g.index ? g.index.count : null,
            program: !!o.material.program,
            opacity: o.material.opacity,
            // is the material actually holding the uniform object we
            // think we are writing to every frame?
            uniforms: o.material.uniforms
              ? Object.fromEntries(
                  Object.entries(o.material.uniforms).map(([k, v]) => [
                    k,
                    typeof v.value === "number" ? +v.value.toFixed(3) : typeof v.value,
                  ])
                )
              : null,
            pos: o.getWorldPosition(new THREE.Vector3()).toArray().map((v) => +v.toFixed(2)),
          });
        });
        return out;
      },
      get info() {
        return {
          progress: progress.current,
          instances: cols * rows,
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          textures: !!textures,
          children: scene.children.length,
        };
      },
    };
    return () => delete window.__forge;
  }, [advance, camera, gl, progress, cols, rows, textures, scene, size.width, size.height]);

  const lastFov = useRef(-1);

  useFrame((state, dt) => {
    const p = Math.min(1, Math.max(0, progress.current));
    const ph = phases(p);
    const t = state.clock.elapsedTime;

    /* ---- pixels ---- */
    const pu = pixels.current?.uniforms;
    if (pu) {
      pu.uTime.value = t;
      pu.uDrift.value = ph.drift;
      pu.uGather.value = ph.gather;
      pu.uGrid.value = ph.grid;
      pu.uHandoff.value = ph.handoff;
      pu.uEntrance.value = ph.entrance;
      // as the backlight comes up, every pixel adopts the colour of the
      // cell it is sitting on — so by the time it fades it has already
      // become the screen
      pu.uContentMix.value = ph.power;
      pu.uContent.value = textures ? textures[0] : blank;
    }

    /* ---- chassis ---- */
    signage.current?.apply(ph);

    /* ---- screen ---- */
    const su = signage.current?.screenUniforms;
    if (su) {
      const s = screenAt(p);
      su.uTexA.value = textures ? textures[s.from] : blank;
      su.uTexB.value = textures ? textures[s.to] : blank;
      su.uMix.value = s.mix;
      su.uMode.value = s.mode;
      su.uPower.value = ph.power;
      su.uScanPos.value = range(p, 0.6, 0.82);
      su.uScanAmt.value = ph.scan;
    }

    /* ---- camera ---- */
    const cam = cameraAt(p);

    /* How landscape are we? 0 = phone portrait, 1 = a laptop.
       The composition rules differ completely between the two: on a wide
       screen there is room to pan the product aside and give the copy a
       column, on a phone there is not — there the product moves UP and
       the captions take the bottom of the screen instead. */
    const wide = Math.max(0, Math.min(1, (size.width / size.height - 0.85) / 0.65));

    const shift = composeShift(p);
    const lateral = -0.92 * shift * wide; // pan left → product sits right
    const lift = -0.58 * shift * (1 - wide); // aim low → product sits high
    // Portrait needs more distance: the same object has to fit above the
    // captions rather than beside them, and the stand adds a third of a
    // panel height that the wide framing never has to account for.
    const zBoost = 1 + (1 - wide) * 0.72;

    // a little pointer parallax, damped, and only ever a nudge — the
    // scroll is directing this shot, not the mouse
    const px = pointer.current.x * 0.16;
    const py = pointer.current.y * 0.1;
    const k = 1 - Math.pow(0.001, dt || 0.016);
    camera.position.x += (cam.position[0] + px - camera.position.x) * k;
    camera.position.y += (cam.position[1] + py - camera.position.y) * k;
    camera.position.z += (cam.position[2] * zBoost - camera.position.z) * k;
    camera.lookAt(
      cam.target[0] + lateral,
      cam.target[1] + 0.17 + lift,
      cam.target[2]
    );

    if (Math.abs(cam.fov - lastFov.current) > 0.01) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
      lastFov.current = cam.fov;
    }
  });

  return (
    <>
      {/* Bright showroom key light. No environment map: drei's presets
          fetch an HDR from a CDN, which would make the hero depend on a
          third-party host and break offline. Four lights get there. */}
      <ambientLight intensity={1.05} />
      <directionalLight position={[4.5, 6, 6]} intensity={1.5} />
      <directionalLight position={[-6, 2.5, 3.5]} intensity={0.55} color="#dbe6ff" />
      <directionalLight position={[0, 2, -6]} intensity={1.1} color="#eaf6ff" />
      <pointLight position={[1.6, -1.4, 2.6]} intensity={7} color="#ffffff" distance={9} decay={2} />

      <group ref={group} position={[0, 0.17, 0]}>
        <Pixels ref={pixels} cols={cols} rows={rows} />
        <Signage ref={signage} cols={cols} rows={rows} />
      </group>

      {/* Grounds the object without a floor plane — a floor would need a
          colour, and any colour reads as a box around a page that is
          meant to be open white. */}
      <ContactShadows
        position={[0, -outerH / 2 - PANEL.standH + 0.16, 0]}
        scale={7}
        blur={2.8}
        opacity={0.3}
        far={3}
        resolution={512}
        color="#334155"
      />
    </>
  );
}
