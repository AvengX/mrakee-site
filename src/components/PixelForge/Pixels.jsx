import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { PANEL } from "./dimensions";

/* ================================================================
   The pixel field.

   One InstancedBufferGeometry, one draw call, and every particle's
   entire journey — drift, gather, snap, settle, hand off — computed in
   the vertex shader from three uniforms. The CPU writes three floats a
   frame; it never touches a matrix.

   That matters at this count. Composing 5,184 Matrix4s per frame on the
   main thread is roughly 300k operations a frame and will not hold 60fps
   next to a scroll-scrubbed page. Done this way the cost is a uniform
   upload.

   Quads are axis-aligned in the panel's own XY plane rather than
   billboarded. Billboards look better in the cloud, but these have to
   BECOME the screen's pixel matrix, and a billboard fights that the
   moment the camera leaves dead centre.
   ================================================================ */

const VERT = /* glsl */ `
  attribute vec3 aGrid;     // where this pixel ends up, on the panel
  attribute vec3 aOrigin;   // where it starts, out in the field
  attribute vec2 aScreenUv; // its cell in the screen image
  attribute vec4 aSeed;     // x delay · y phase · z size · w palette

  uniform float uTime;
  uniform float uDrift;     // how freely the field still floats
  uniform float uGather;    // pull toward the panel volume
  uniform float uGrid;      // lock to the exact cell
  uniform float uHandoff;   // dissolve into the real screen
  uniform float uEntrance;
  uniform float uCell;      // one cell's width in world units

  varying vec2 vQuadUv;
  varying vec2 vScreenUv;
  varying float vAlpha;
  varying float vTintIdx;
  varying float vBright;

  // overshoot: arrive, go slightly past, settle back
  float easeOutBack(float t) {
    float k = 1.22;
    float f = t - 1.0;
    return 1.0 + (k + 1.0) * f * f * f + k * f * f;
  }

  void main() {
    vQuadUv = uv;
    vScreenUv = aScreenUv;

    float delay = aSeed.x;
    float phase = aSeed.y;

    // --- 1. the free-floating field -------------------------------
    float t = uTime * 0.22 + phase * 6.2831;
    vec3 wobble = vec3(
      sin(t) * 0.30 + sin(t * 0.43) * 0.16,
      cos(t * 0.81) * 0.26 + sin(t * 0.29) * 0.12,
      sin(t * 0.62) * 0.22
    );
    vec3 cloud = aOrigin + wobble * uDrift;

    // --- 2. gathered: a loose slab roughly the panel's shape, still
    //        thick in Z and jittered, so it reads as "converging on
    //        something" rather than "snapping to a plane" ----------
    vec3 spread = vec3(1.34, 1.20, 1.0);
    vec3 jitter = vec3(
      sin(phase * 21.3) * 0.30,
      cos(phase * 17.7) * 0.30,
      sin(phase * 11.1) * 0.85
    );
    vec3 gathered = aGrid * spread + jitter;

    // per-particle delay: the leading edge arrives well before the
    // stragglers, which is what makes a crowd look like a crowd
    float g1 = smoothstep(0.0, 1.0, clamp((uGather - delay * 0.34) / 0.66, 0.0, 1.0));
    float g2raw = clamp((uGrid - delay * 0.38) / 0.62, 0.0, 1.0);
    float g2 = easeOutBack(g2raw);

    vec3 pos = mix(cloud, gathered, g1);
    pos = mix(pos, aGrid, g2);

    // --- 3. size. Small and soft while loose, exact cell size once
    //        it is part of the matrix --------------------------------
    float loose = uCell * (1.55 + aSeed.z * 1.5);
    float exact = uCell * 0.84;
    float size = mix(loose, exact, g2raw);

    vec3 local = vec3(position.xy * size, 0.0);
    vec4 mv = modelViewMatrix * vec4(pos + local, 1.0);
    gl_Position = projectionMatrix * mv;

    vBright = 0.55 + aSeed.z * 0.45;
    vTintIdx = aSeed.w;

    float born = smoothstep(0.0, 1.0, clamp((uEntrance - delay * 0.5) / 0.5, 0.0, 1.0));
    float gone = smoothstep(0.0, 1.0, clamp((uHandoff - (1.0 - delay) * 0.35) / 0.65, 0.0, 1.0));
    vAlpha = born * (1.0 - gone) * (0.42 + 0.58 * g2raw);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uContent;
  uniform float uContentMix;
  uniform vec3 uTint0;
  uniform vec3 uTint1;
  uniform vec3 uTint2;
  uniform vec3 uTint3;

  varying vec2 vQuadUv;
  varying vec2 vScreenUv;
  varying float vAlpha;
  varying float vTintIdx;
  varying float vBright;

  void main() {
    if (vAlpha < 0.004) discard;

    // palette pick without a branch per fragment
    vec3 tint = mix(
      mix(uTint0, uTint1, smoothstep(0.20, 0.30, vTintIdx)),
      mix(uTint2, uTint3, smoothstep(0.70, 0.80, vTintIdx)),
      smoothstep(0.45, 0.55, vTintIdx)
    );
    tint *= vBright;

    // once the panel exists, every pixel takes the colour of the cell it
    // occupies. By the time it fades out it is already indistinguishable
    // from the screen underneath — which is what makes the handoff read
    // as the pixels LIGHTING UP rather than a crossfade.
    vec3 content = texture2D(uContent, vScreenUv).rgb;
    vec3 col = mix(tint, content, uContentMix);

    // soft-edged square, not a circle: these are pixels
    vec2 d = abs(vQuadUv - 0.5);
    float m = 1.0 - smoothstep(0.30, 0.5, max(d.x, d.y));

    gl_FragColor = vec4(col, vAlpha * m);
  }
`;

const Pixels = forwardRef(function Pixels({ cols, rows }, ref) {
  const material = useRef();

  const geometry = useMemo(() => {
    const count = cols * rows;
    const geo = new THREE.InstancedBufferGeometry();
    const quad = new THREE.PlaneGeometry(1, 1);

    geo.index = quad.index;
    geo.attributes.position = quad.attributes.position;
    geo.attributes.uv = quad.attributes.uv;
    geo.instanceCount = count;

    const grid = new Float32Array(count * 3);
    const origin = new Float32Array(count * 3);
    const screenUv = new Float32Array(count * 2);
    const seed = new Float32Array(count * 4);

    const cw = PANEL.screenW / cols;
    const chh = PANEL.screenH / rows;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const n = j * cols + i;

        const x = (i + 0.5) * cw - PANEL.screenW / 2;
        const y = PANEL.screenH / 2 - (j + 0.5) * chh;
        grid[n * 3] = x;
        grid[n * 3 + 1] = y;
        grid[n * 3 + 2] = PANEL.pixelZ;

        screenUv[n * 2] = (i + 0.5) / cols;
        screenUv[n * 2 + 1] = 1 - (j + 0.5) / rows;

        // Start in a wide ring rather than a filled box: a filled box
        // reads as fog, a ring reads as a field with the stage empty in
        // the middle — which is where the product is about to appear.
        // Sized to the opening shot: at the start camera the frame is
        // ~10 x 5.8 world units, so the ring runs to ±6 x ±3.2 — filling
        // the screen edge to edge with only a little spill.
        const a = Math.random() * Math.PI * 2;
        const r = 1.8 + Math.pow(Math.random(), 0.62) * 3.4;
        origin[n * 3] = Math.cos(a) * r * 1.16;
        origin[n * 3 + 1] = Math.sin(a) * r * 0.62 + (Math.random() - 0.5) * 1.1;
        origin[n * 3 + 2] = (Math.random() - 0.5) * 5.0 - 0.4;

        // Delay correlates with distance from the centre, with noise on
        // top: the outermost pixels leave last and arrive last, so the
        // field collapses inward instead of uniformly.
        const dist = Math.min(1, (r - 1.8) / 3.4);
        seed[n * 4] = Math.min(1, dist * 0.7 + Math.random() * 0.45);
        seed[n * 4 + 1] = Math.random();
        seed[n * 4 + 2] = Math.random();
        seed[n * 4 + 3] = Math.random();
      }
    }

    geo.setAttribute("aGrid", new THREE.InstancedBufferAttribute(grid, 3));
    geo.setAttribute("aOrigin", new THREE.InstancedBufferAttribute(origin, 3));
    geo.setAttribute("aScreenUv", new THREE.InstancedBufferAttribute(screenUv, 2));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 4));

    // The field is far larger than the panel; without this the whole
    // thing pops out of existence the moment the panel leaves frame.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 16);

    // NOT quad.dispose(). The instanced geometry borrows the plane's
    // position/uv/index attribute objects rather than copying them, and
    // dispose() tells the renderer to free the GPU buffers those
    // attributes own — deleting the geometry out from under this mesh.
    // Nothing errors; the field simply never draws.
    return geo;
  }, [cols, rows]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: 1 },
      uGather: { value: 0 },
      uGrid: { value: 0 },
      uHandoff: { value: 0 },
      uEntrance: { value: 0 },
      uCell: { value: PANEL.screenW / cols },
      uContent: { value: null },
      uContentMix: { value: 0 },
      uTint0: { value: new THREE.Color("#635bff") },
      uTint1: { value: new THREE.Color("#06b6d4") },
      uTint2: { value: new THREE.Color("#8b5cf6") },
      uTint3: { value: new THREE.Color("#94a3b8") },
    }),
    [cols]
  );

  /* Read the uniforms off the MATERIAL, never off the object above.
     three does not necessarily adopt the object it is handed — the
     material can end up holding a clone, and then every per-frame write
     lands on a detached copy while the shader sits at its initial
     values. Nothing errors; the effect simply never starts. */
  useImperativeHandle(
    ref,
    () => ({
      get uniforms() {
        return material.current?.uniforms;
      },
    }),
    []
  );

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={2}>
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
});

export default Pixels;
