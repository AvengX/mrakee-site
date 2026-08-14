import { useEffect } from "react";
import Aura from "./components/Aura";
import Nav from "./components/Nav";
import PixelForge from "./components/PixelForge";
import FilmStage from "./components/FilmStage";
import BrandPage from "./components/BrandPage";
import { initSmoothScroll } from "./lib/smoothScroll";
import { installDevPump } from "./lib/devPump";

export default function App() {
  // One momentum-scroll instance for the whole document, torn down with
  // the app. StrictMode mounts effects twice in dev — hence the cleanup.
  //
  // ?smooth=off leaves the browser's native scrolling alone. Lenis is
  // driven by GSAP's ticker, so in an automated browser that never
  // composites, momentum scroll would swallow the wheel and never move.
  useEffect(() => {
    installDevPump();
    if (new URLSearchParams(window.location.search).get("smooth") === "off") return;
    return initSmoothScroll();
  }, []);

  return (
    <>
      {/* The light everything else sits in. */}
      <Aura />
      <Nav />
      <main className="overlay">
        {/* Pixels become the product — the opening act. */}
        <PixelForge />
        {/* Then the film shows that product where it actually lives... */}
        <FilmStage />
        {/* ...and the brand page continues the same story below it. */}
        <BrandPage />
      </main>
    </>
  );
}
