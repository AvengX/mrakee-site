import { useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MINT = "#6fc8b6";
const GOLD = "#d4a339";

/**
 * Placeholder Mrakee kiosk: a light anodised tower with a mint screen and
 * a gold accent bar — the logo palette in 3D.
 *
 * Swap for <primitive object={gltf.scene} /> when the real model exists;
 * the scroll animation targets the <group>, so it keeps working.
 */
export default function Kiosk() {
  const group = useRef();
  const screen = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // The film is the first 3 viewport-height sections. Everything is
      // scrubbed across exactly that range, so the 3D story finishes right
      // as the brand page begins.
      const scrollSpan = {
        trigger: "#film",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      };

      // 360° turn across the film
      gsap.to(group.current.rotation, {
        y: Math.PI * 2,
        ease: "none",
        scrollTrigger: scrollSpan,
      });

      // pull back, then come forward
      gsap.to(group.current.scale, {
        keyframes: [
          { x: 0.84, y: 0.84, z: 0.84 },
          { x: 1.02, y: 1.02, z: 1.02 },
        ],
        ease: "none",
        scrollTrigger: scrollSpan,
      });

      // drift up and off to one side so the copy has room
      gsap.to(group.current.position, {
        keyframes: [
          { x: 1.5, y: 0.1 },
          { x: -1.4, y: 0.3 },
        ],
        ease: "none",
        scrollTrigger: scrollSpan,
      });

      // the screen "wakes up" as you scroll
      gsap.to(screen.current.material, {
        emissiveIntensity: 1.5,
        ease: "none",
        scrollTrigger: scrollSpan,
      });
    });

    return () => ctx.revert();
  }, []);

  // slow idle tilt, layered on top of the scrubbed rotation (different axis)
  useFrame(({ clock }) => {
    group.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.045;
  });

  return (
    <group ref={group} position={[1.5, 0, 0]}>
      {/* Body — light anodised aluminium */}
      <RoundedBox args={[1.5, 3.4, 0.34]} radius={0.09} smoothness={6}>
        <meshStandardMaterial color="#eceae4" metalness={0.55} roughness={0.32} />
      </RoundedBox>

      {/* Screen — mint glow, sits just proud of the body face */}
      <mesh ref={screen} position={[0, 0.25, 0.176]}>
        <planeGeometry args={[1.28, 2.5]} />
        <meshStandardMaterial
          color="#0d3f3a"
          emissive={MINT}
          emissiveIntensity={0.55}
          roughness={0.12}
          metalness={0.2}
        />
      </mesh>

      {/* Gold accent bar on the lower bezel */}
      <mesh position={[0, -1.28, 0.176]}>
        <planeGeometry args={[0.62, 0.038]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>

      {/* Base — brushed gold */}
      <mesh position={[0, -1.85, 0]}>
        <cylinderGeometry args={[0.78, 0.92, 0.16, 64]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.34} />
      </mesh>
    </group>
  );
}
