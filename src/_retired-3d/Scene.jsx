import { useRef, useLayoutEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Kiosk from "./Kiosk";

gsap.registerPlugin(ScrollTrigger);

/**
 * The 3D stage. Fixed behind the page for the length of the film, then
 * faded out so the brand page below gets a clean bright background.
 */
export default function Scene() {
  const layer = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // fade the whole canvas out over the last stretch of the film
      gsap.to(layer.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#film",
          start: "bottom bottom-=45%",
          end: "bottom top+=15%",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="canvas-layer" ref={layer}>
      <Canvas camera={{ position: [0, 0.4, 7], fov: 35 }} dpr={[1, 2]}>
        {/* Bright key + fill: a light room, not a dark studio */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={2.4} />

        {/* Brand-coloured rim lights — mint one side, gold the other */}
        <pointLight position={[-4.5, 1, 2]} intensity={26} color="#6fc8b6" />
        <pointLight position={[4.5, -1, -2]} intensity={20} color="#d4a339" />

        <Kiosk />

        <ContactShadows
          position={[0, -1.98, 0]}
          opacity={0.3}
          scale={12}
          blur={2.8}
          far={4}
        />

        {/* Metal needs reflections. Built from Lightformers rather than an
            HDR download, so nothing hits the network. Bright/white-heavy
            here to suit the light page. */}
        <Environment resolution={256}>
          <Lightformer intensity={3} position={[0, 4, 2]} scale={[10, 4, 1]} color="#ffffff" />
          <Lightformer
            intensity={2.4}
            position={[-4, 0, 1]}
            rotation-y={Math.PI / 2}
            scale={[7, 5, 1]}
            color="#cdeee6"
          />
          <Lightformer
            intensity={2}
            position={[4, 0, 1]}
            rotation-y={-Math.PI / 2}
            scale={[7, 5, 1]}
            color="#ffe9bd"
          />
        </Environment>
      </Canvas>
    </div>
  );
}
