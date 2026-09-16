import { useEffect, useRef, useState } from "react";
import { Phone, Mail } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { href: "#about", label: "About", hint: "Who we are" },
  { href: "#solutions", label: "Solutions", hint: "9 portfolios" },
  { href: "#industries", label: "Industries", hint: "8 sectors" },
  { href: "#services", label: "Expertise", hint: "Concept to care" },
  { href: "#insights", label: "Insights", hint: "Technology" },
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
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const wrap = useRef(null);
  const contactWrapRef = useRef(null);
  const contactBtnRef = useRef(null);
  const leaveTimerRef = useRef(null);

  /* THE MARK APPEARS ONCE THE HERO HAS GONE, and then it is the way
     home from anywhere on the page.

     The threshold is derived rather than picked. The film is 640vh with
     a sticky 100vh stage, so its scrub runs over `height - viewport` of
     scrolling, and FilmStage's opening caption is out at 0.06 of that
     progress — about 32vh. Reading the element means this keeps working
     if the film's height ever changes, instead of drifting away from a
     hard-coded number. The extra 60px is so the mark arrives after the
     lockup has finished fading rather than crossing it.

     Both booleans share one listener; `solid` is the bar's existing
     scrolled state and is left alone. */
  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 80);
      const film = document.getElementById("film");
      const span = film ? film.offsetHeight - window.innerHeight : 0;
      const heroGone = span > 0 ? span * 0.06 : window.innerHeight * 0.5;
      setPastHero(window.scrollY > heroGone + 60);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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

  /* Dynamic alignment of pointer to the Talk to us button */
  useEffect(() => {
    const updateCenter = () => {
      if (contactBtnRef.current && contactWrapRef.current) {
        const btnWidth = contactBtnRef.current.offsetWidth;
        const isCompact = window.innerWidth <= 880;
        // Below 880px, hamburger toggle (44px + 8px gap = 52px) is to the right
        const offset = isCompact ? btnWidth / 2 + 52 : btnWidth / 2;
        contactWrapRef.current.style.setProperty("--talk-btn-center", `${offset - 6}px`);
      }
    };
    updateCenter();
    window.addEventListener("resize", updateCenter);
    return () => window.removeEventListener("resize", updateCenter);
  }, []);

  /* Dismiss contact dropdown on Escape or outside click/tap */
  useEffect(() => {
    if (!contactOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setContactOpen(false);
        contactBtnRef.current?.focus();
      }
    };
    const onDown = (e) => {
      if (!contactWrapRef.current?.contains(e.target)) {
        setContactOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [contactOpen]);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setContactOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setContactOpen(false);
    }, 150);
  };

  const handleFocus = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setContactOpen(true);
  };

  const handleBlur = (e) => {
    if (!contactWrapRef.current?.contains(e.relatedTarget)) {
      setContactOpen(false);
    }
  };

  const handleTalkClick = (e) => {
    e.preventDefault();
    setContactOpen((prev) => !prev);
  };

  return (
    <div ref={wrap}>
      <nav className={`nav${solid ? " nav--solid" : ""}`}>
        {/* Logo already renders an <a href="#top"> with a home label, so
            this is the home button rather than something that imitates
            one. inert while hidden, so it is not a stop in the keyboard
            order before it exists on screen. */}
        <span className={`nav__brand${pastHero ? " is-shown" : ""}`} inert={!pastHero}>
          <Logo size={36} />
        </span>
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
          <div
            className="nav__talk"
            ref={contactWrapRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <a
              ref={contactBtnRef}
              className="btn btn--primary btn--sm nav__talkBtn"
              href="#contact"
              role="button"
              aria-haspopup="dialog"
              aria-expanded={contactOpen}
              aria-controls="nav-talk-card"
              aria-label="Talk to us contact options"
              onClick={handleTalkClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setContactOpen((prev) => !prev);
                }
              }}
            >
              Talk to us
              <span className="arrow" aria-hidden="true">→</span>
            </a>

            <div
              id="nav-talk-card"
              className={`nav__talkCard${contactOpen ? " is-open" : ""}`}
              role="region"
              aria-label="Contact Information"
            >
              <div className="nav__talkPointer" aria-hidden="true" />

              {/* Phone Section */}
              <div className="nav__talkSection">
                <div className="nav__talkIconBox">
                  <Phone size={17} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="nav__talkDetails">
                  <span className="nav__talkLabel">PHONE</span>
                  <div className="nav__talkLinks">
                    <a href="tel:9319015591" className="nav__talkLink">
                      9319015591
                    </a>
                  </div>
                </div>
              </div>

              <div className="nav__talkDivider" aria-hidden="true" />

              {/* Email Section */}
              <div className="nav__talkSection">
                <div className="nav__talkIconBox">
                  <Mail size={17} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <div className="nav__talkDetails">
                  <span className="nav__talkLabel">EMAIL</span>
                  <div className="nav__talkLinks">
                    <a href="mailto:Info@mrakeetechnologies.com" className="nav__talkLink">
                      Info@mrakeetechnologies.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
