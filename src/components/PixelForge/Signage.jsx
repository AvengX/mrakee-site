import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { PANEL, outerW, outerH } from "./dimensions";

/* ================================================================
   The signage itself — built in code, not loaded.

   There is no GLB in this project, and for this sequence that turns out
   to be the better position: the pixels have to land exactly on the
   screen surface, and the chassis has to grow out of that same surface.
   Both are driven from ./dimensions, so they cannot drift apart. A
   loaded mesh would have to be measured and then trusted.

   Nothing here fades in. Fading a product in is the move the brief
   rules out — instead the bezel grows out of the pixel plane, the
   chassis extrudes backward from a front face that never moves, and
   the stand arrives last.
   ================================================================ */

const SCREEN_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SCREEN_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uMix;
  uniform float uMode;    // 0 dissolve · 1 scan · 2 wipe
  uniform float uPower;   // backlight coming up
  uniform float uScanPos; // position of the wake-up bar, 0-1 top to bottom
  uniform float uScanAmt;
  uniform vec2 uGrid;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 a = texture2D(uTexA, vUv).rgb;
    vec3 b = texture2D(uTexB, vUv).rgb;

    float m;
    if (uMode < 0.5) {
      // dissolve cell by cell on the panel's own pixel grid, so the
      // transition is made of the same pixels the sequence assembled
      vec2 cell = floor(vUv * uGrid);
      m = smoothstep(0.0, 0.35, uMix - hash(cell) * 0.85);
    } else if (uMode < 1.5) {
      float edge = uMix * 1.3 - 0.15;
      m = smoothstep(edge - 0.07, edge + 0.07, 1.0 - vUv.y);
    } else {
      float edge = uMix * 1.24 - 0.12;
      m = smoothstep(edge - 0.05, edge + 0.05, vUv.x);
    }

    vec3 col = mix(a, b, m);

    // An unpowered LED panel in a bright room is a dark grey mirror.
    // This page is not allowed to go dark, so it wakes from a pale
    // neutral instead — same read, none of the black hole.
    col = mix(vec3(0.855, 0.878, 0.910), col, uPower);

    // one bright bar travelling down the panel as it comes up
    float band = smoothstep(0.11, 0.0, abs((1.0 - vUv.y) - uScanPos));
    col += band * uScanAmt * 0.30;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const Signage = forwardRef(function Signage({ cols, rows }, ref) {
  const bezel = useRef();
  const chassis = useRef();
  const stand = useRef();
  const screen = useRef();
  const screenMat = useRef();

  const screenUniforms = useMemo(
    () => ({
      uTexA: { value: null },
      uTexB: { value: null },
      uMix: { value: 0 },
      uMode: { value: 0 },
      uPower: { value: 0 },
      uScanPos: { value: 0 },
      uScanAmt: { value: 0 },
      uGrid: { value: new THREE.Vector2(cols, rows) },
    }),
    [cols, rows]
  );

  useImperativeHandle(
    ref,
    () => ({
      /* Off the material, not off the memo — see the same note in
         Pixels. The object handed to <shaderMaterial> is not guaranteed
         to be the one the shader ends up reading. */
      get screenUniforms() {
        return screenMat.current?.uniforms;
      },
      /** Drive every part of the object from one progress snapshot. */
      apply(ph) {
        const { frame, depth } = ph;

        // The screen plate must not exist before the panel does. Until
        // the bezel starts forming, the pixels ARE the display — a pale
        // rectangle sitting behind them from scroll 0 gives the ending
        // away and puts a grey slab in the middle of the opening shot.
        if (screen.current) screen.current.visible = frame > 0.001;

        // --- bezel: grows out of the pixel plane, edges first --------
        if (bezel.current) {
          const g = bezel.current;
          g.visible = frame > 0.001;
          // opens outward from the screen it is framing
          g.scale.set(0.9 + 0.1 * frame, 0.9 + 0.1 * frame, Math.max(0.02, frame));
          g.children.forEach((c) => {
            if (c.material) c.material.opacity = frame;
          });
        }

        // --- chassis: extrudes backward, front face fixed ------------
        if (chassis.current) {
          const g = chassis.current;
          g.visible = depth > 0.001;
          const d = Math.max(0.02, depth);
          g.scale.z = d;
          // the box is unit-depth and anchored at its front face, so
          // scaling z pushes the body away from the viewer only
          g.position.z = -PANEL.bezelDepth - (PANEL.depth * d) / 2;
          g.children.forEach((c) => {
            if (c.material) c.material.opacity = Math.min(1, depth * 1.6);
          });
        }

        // --- stand: arrives last, rises into place -------------------
        if (stand.current) {
          const t = Math.max(0, (depth - 0.35) / 0.65);
          stand.current.visible = t > 0.001;
          stand.current.scale.setScalar(0.6 + 0.4 * t);
          stand.current.position.y = -outerH / 2 - PANEL.standH * 0.5 + (1 - t) * 0.25;
          stand.current.children.forEach((c) => {
            if (c.material) c.material.opacity = t;
          });
        }
      },
    }),
    // nothing captured — every member reads through a ref at call time
    []
  );

  return (
    <group>
      {/* ---- the screen surface the pixels resolve into ---- */}
      <mesh ref={screen} position={[0, 0, PANEL.screenZ]} renderOrder={1}>
        <planeGeometry args={[PANEL.screenW, PANEL.screenH]} />
        <shaderMaterial
          ref={screenMat}
          vertexShader={SCREEN_VERT}
          fragmentShader={SCREEN_FRAG}
          uniforms={screenUniforms}
          toneMapped={false}
        />
      </mesh>

      {/* ---- bezel plate: a rounded frame, screen sits inside it ---- */}
      <group ref={bezel} position={[0, 0, -PANEL.bezelDepth / 2]} visible={false}>
        <RoundedBox
          args={[outerW, outerH, PANEL.bezelDepth]}
          radius={0.026}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial
            color="#e9edf3"
            roughness={0.34}
            metalness={0.55}
            transparent
            opacity={0}
          />
        </RoundedBox>
      </group>

      {/* ---- chassis behind it ---- */}
      <group ref={chassis} visible={false}>
        <RoundedBox
          args={[outerW - 0.05, outerH - 0.05, PANEL.depth]}
          radius={0.022}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial
            color="#cfd6e0"
            roughness={0.52}
            metalness={0.42}
            transparent
            opacity={0}
          />
        </RoundedBox>
      </group>

      {/* ---- floor stand ---- */}
      <group ref={stand} visible={false}>
        {/* spine */}
        <mesh position={[0, 0, -PANEL.depth * 0.4]} castShadow>
          <boxGeometry args={[0.26, PANEL.standH, 0.16]} />
          <meshStandardMaterial
            color="#dbe1ea"
            roughness={0.4}
            metalness={0.5}
            transparent
            opacity={0}
          />
        </mesh>
        {/* foot */}
        <mesh position={[0, -PANEL.standH / 2 + 0.02, -PANEL.depth * 0.4]} castShadow>
          <cylinderGeometry args={[0.52, 0.56, 0.05, 48]} />
          <meshStandardMaterial
            color="#c8d0dc"
            roughness={0.45}
            metalness={0.45}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
});

export default Signage;
