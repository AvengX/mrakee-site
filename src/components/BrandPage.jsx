import Reveal from "./Reveal";
import Logo from "./Logo";

/* --- Content model -------------------------------------------------
   Structure mirrors a digital-signage company's information
   architecture (solutions → industries → products → services). All copy
   below is original to Mrakee. -------------------------------------- */

const SOLUTIONS = [
  { i: "◧", t: "Interactive Kiosk", d: "Self-serve touchpoints that let customers browse, order and pay — and hand you the interaction data afterwards." },
  { i: "◈", t: "Wayfinding", d: "Floor-aware directories for malls, hospitals and campuses. Search a shop, get a route on the screen and on your phone." },
  { i: "▦", t: "Video Walls", d: "Tiled arrays driven as a single canvas, from a four-panel lobby feature to a full atrium façade." },
  { i: "▤", t: "Digital Menu Boards", d: "Dayparted menus that flip breakfast to lunch on schedule, and grey out an item the moment stock runs dry.", gold: true },
  { i: "✈", t: "Flight & Transit Displays", d: "FIDS and PIDS driven off live operational feeds, with the failover behaviour terminals actually require." },
  { i: "☰", t: "Queue Management", d: "Ticketing, calling and live wait times — routing people to the right counter instead of the longest line." },
  { i: "◐", t: "Smart Fitting Room", d: "In-room screens that read the garment tag and offer sizes, colours and pairings without a trip back to the floor.", gold: true },
  { i: "◉", t: "Virtual Concierge", d: "Remote-assist stations putting a live specialist on screen wherever staffing one in person doesn't add up." },
  { i: "⬒", t: "Self Check-In", d: "Hotel and clinic arrival kiosks handling ID, payment and key issue, with a staffed path always one tap away." },
];

const INDUSTRIES = [
  "Retail", "Quick Service Restaurants", "Transportation", "Banking & Finance",
  "Education", "Healthcare", "Hotel & Hospitality", "Corporate Communications",
  "Grocery", "Automotive", "Government", "Out-of-Home Media",
];

const PILLARS = [
  { t: "Software", d: "The content platform: scheduling, playlists, templating and estate-wide rollout control.", items: ["Content Manager", "Rule-based dayparting", "Template & brand locking", "Proof-of-play reporting"] },
  { t: "Hardware", d: "Displays, media players and enclosures specified for the environment they'll live in.", items: ["Commercial panels", "Media players", "Kiosk enclosures", "Shelf-edge displays"] },
  { t: "Managed SaaS", d: "We host, monitor and patch it, so your team ships content instead of babysitting infrastructure.", items: ["Hosted platform", "Health monitoring", "Staged rollouts", "Support & SLA"] },
];

/* The stats band is hidden for the client demo because it had no real
   figures in it, and a row of dashes reads as unfinished.
   To bring it back: put real values in STATS and flip SHOW_STATS to true. */
const SHOW_STATS = false;

const STATS = [
  { n: "—", l: "Screens deployed" },
  { n: "—", l: "Markets served" },
  { n: "—", l: "Years in operation" },
  { n: "—", l: "Uptime SLA" },
];

export default function BrandPage() {
  return (
    <div className="brand">
      {/* ---------------- SOLUTIONS ---------------- */}
      <section className="band" id="solutions">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Solutions</p>
            <h2>One platform, every touchpoint.</h2>
            <p className="lede">
              Each of these runs on the same content engine and the same
              management console — so a shopping centre can run wayfinding,
              menu boards and window displays as one estate.
            </p>
          </Reveal>

          <Reveal className="grid grid--3" stagger>
            {SOLUTIONS.map((s) => (
              <article className="card" key={s.t}>
                <div className={`card__icon${s.gold ? " card__icon--gold" : ""}`}>
                  {s.i}
                </div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- INDUSTRIES ---------------- */}
      <section className="band band--alt" id="industries">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Industries</p>
            <h2>Different floors, different rules.</h2>
            <p className="lede">
              A drive-thru menu board and an immigration hall have almost
              nothing in common except the need to never go dark. We specify
              per environment rather than selling one box for all of them.
            </p>
          </Reveal>

          <Reveal className="pills" stagger>
            {INDUSTRIES.map((n) => (
              <span className="pill" key={n}>{n}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- PRODUCTS ---------------- */}
      <section className="band" id="products">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Products</p>
            <h2>Software, hardware, or the whole thing managed.</h2>
            <p className="lede">
              Take the parts you need. Most teams start with one site fully
              managed, then bring it in-house as they scale.
            </p>
          </Reveal>

          <Reveal className="split" stagger>
            {PILLARS.map((p) => (
              <div className="pillar" key={p.t}>
                <h3 style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>{p.t}</h3>
                <p style={{ marginTop: ".7rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {p.d}
                </p>
                <ul>
                  {p.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- STATS (dark contrast band) ---------------- */}
      {SHOW_STATS && (
        <section className="band band--dark">
          <div className="band__inner">
            <Reveal className="band__head" style={{ textAlign: "center" }}>
              <h2 style={{ margin: "0 auto", textAlign: "center" }}>
                Measured where it matters.
              </h2>
            </Reveal>
            <Reveal className="stats" stagger>
              {STATS.map((s) => (
                <div key={s.l}>
                  <div className="stat__num">{s.n}</div>
                  <div className="stat__label">{s.l}</div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------- SERVICES ---------------- */}
      <section className="band" id="services">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Professional Services</p>
            <h2>The screen is the easy part.</h2>
          </Reveal>
          <Reveal className="grid grid--3" stagger>
            <article className="card">
              <div className="card__icon card__icon--gold">◇</div>
              <h3>Technical Consulting</h3>
              <p>Site surveys, network and power planning, integration with your POS, PMS or operations feed, and a rollout plan that survives contact with a live store.</p>
            </article>
            <article className="card">
              <div className="card__icon">✎</div>
              <h3>Creative Services</h3>
              <p>Motion, layout and templating built for the viewing distance and dwell time of the actual space — not a desktop mockup.</p>
            </article>
            <article className="card">
              <div className="card__icon card__icon--gold">⟳</div>
              <h3>Support & Maintenance</h3>
              <p>Monitoring, spares logistics and on-site response, with escalation paths agreed before you need them.</p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="band band--alt" id="contact">
        <div className="band__inner">
          <Reveal className="cta">
            <p className="eyebrow" style={{ justifyContent: "center" }}>Get started</p>
            <h2 style={{ margin: "0 auto", textAlign: "center" }}>
              Tell us about the space.
            </h2>
            <p className="lede" style={{ textAlign: "center" }}>
              Send us the floor plan and the problem. We'll come back with a
              specification, a rollout shape and a number.
            </p>
            <div className="cta__actions">
              <a className="btn btn--primary" href="mailto:sales@mrakee.com">Book a demo</a>
              <a className="btn btn--ghost" href="#solutions">See solutions</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="footer">
        <div className="footer__inner">
          <div>
            <Logo />
            <p style={{ marginTop: "1.1rem", fontSize: ".92rem", lineHeight: 1.65, maxWidth: "30ch" }}>
              Digital signage, kiosks and display software for Asia-Pacific.
            </p>
          </div>
          <div>
            <h4>Solutions</h4>
            <ul>
              <li><a href="#solutions">Interactive Kiosk</a></li>
              <li><a href="#solutions">Wayfinding</a></li>
              <li><a href="#solutions">Video Walls</a></li>
              <li><a href="#solutions">Menu Boards</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#products">Products</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#industries">Industries</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Singapore</li>
              {/* TODO: confirm the real address before this goes public */}
              <li><a href="mailto:sales@mrakee.com">sales@mrakee.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Mrakee Technologies. All rights reserved.</span>
          <span>Privacy · Cookies · Sitemap</span>
        </div>
      </footer>
    </div>
  );
}
