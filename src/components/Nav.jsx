import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";

const LINKS = [
  { href: "#solutions", label: "Solutions", hint: "17 touchpoints" },
  { href: "#industries", label: "Industries", hint: "13 sectors" },
  { href: "#products", label: "Products", hint: "Software · Hardware" },
  { href: "#services", label: "Services", hint: "Plan · Build · Run" },
];

/**
 * Floating glass nav. Barely there over the film, frosted and lifted once
 * you scroll past it, with the current section marked underneath.
 *
 * The scroll state is read from a plain listener rather than a
 * ScrollTrigger: it is one boolean, it has to survive Lenis driving the
 * scroll, and ScrollTrigger.refresh() on a 640vh sticky film is not
 * something to invite for a background swap.
 */
export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const wrap = useRef(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Which section is being read. rootMargin pulls the detection band up
     to just under the nav and down to the middle of the screen, so a
     section counts as "current" when it fills the reading area — not the
     instant one pixel of it appears. */
  useEffect(() => {
    const targets = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  /* Dismiss the mobile sheet on Escape or an outside click. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={wrap}>
      <nav className={`nav${solid ? " nav--solid" : ""}`}>
        <Logo />

        <ul className="nav__links">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={active === l.href ? "is-active" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav__cta">
          <a className="btn btn--primary btn--sm" href="#contact">
            Talk to us
          </a>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </nav>

      <div
        id="nav-sheet"
        className={`sheet${open ? " sheet--open" : ""}`}
        inert={!open}
      >
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
                <span>{l.hint}</span>
              </a>
            </li>
          ))}
        </ul>
        <a className="btn btn--primary" href="#contact" onClick={() => setOpen(false)}>
          Talk to us
        </a>
      </div>
    </div>
  );
}
