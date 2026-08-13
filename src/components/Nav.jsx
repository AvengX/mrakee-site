import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Logo from "./Logo";

gsap.registerPlugin(ScrollTrigger);

/** Sticky nav. Transparent over the 3D film, frosted once you scroll past it. */
export default function Nav() {
  const nav = useRef();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -80", // 80px down the page
        onUpdate: (self) =>
          nav.current.classList.toggle("nav--solid", self.scroll() > 80),
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <nav className="nav" ref={nav}>
      <Logo />
      <ul className="nav__links">
        <li><a href="#solutions">Solutions</a></li>
        <li><a href="#industries">Industries</a></li>
        <li><a href="#products">Products</a></li>
        <li><a href="#services">Services</a></li>
        <li>
          <a className="btn btn--mint" href="#contact" style={{ color: "#06312a" }}>
            Talk to us
          </a>
        </li>
      </ul>
    </nav>
  );
}
