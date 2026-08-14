import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import Reveal from "./Reveal";
import SplitWords from "./SplitWords";
import Counter from "./Counter";
import Logo from "./Logo";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";
import SolutionsExplorer from "./SolutionsExplorer";
import { usePointerGlow } from "../hooks/usePointerGlow";

/* --- Content model -------------------------------------------------
   Structure mirrors a digital-signage company's information
   architecture (solutions → industries → products → services). All copy
   below is original to Mrakee. -------------------------------------- */

/* The full solution set carried over from the acquired APAC business.
   `frame` is the still shown alongside each one, picked from the film's
   own frames by chapter so the environment matches the solution —
   retail solutions get retail footage, transport gets the concourse.
   Chapter ranges: object 0-53 · wakes 49-108 · retail 104-163 ·
   qsr 159-218 · transport 214-273 · scale 269-333. */
const SOLUTIONS = [
  { t: "Interactive Kiosk", frame: 38, d: "Self-serve touchpoints that let customers browse, order and pay — and hand you the interaction data afterwards." },
  { t: "Wayfinder", frame: 240, d: "Floor-aware directories for malls, hospitals and campuses. Search a destination, get a route on the screen and on your phone." },
  { t: "Video Walls", frame: 300, d: "Tiled arrays driven as a single canvas, from a four-panel lobby feature to a full atrium façade." },
  { t: "Digital Menu Board", frame: 178, d: "Dayparted menus that flip breakfast to lunch on schedule, and grey out an item the moment stock runs dry." },
  { t: "FIDS", frame: 222, d: "Flight information displays driven off live operational feeds, with the failover behaviour terminals actually require." },
  { t: "PIDS", frame: 258, d: "Platform and train passenger information, synchronised across a line and readable the length of a platform." },
  { t: "Biometric Immigration", frame: 268, d: "Automated border-control gates pairing document reading with facial matching under government security requirements." },
  { t: "Virtual Concierge — Transport", frame: 232, d: "Remote-assist stations putting a live specialist on screen anywhere in a terminal, staffed centrally." },
  { t: "Virtual Concierge — Mall & Hotel", frame: 150, d: "The same remote-assist model for malls, hotels and offices, where staffing every desk in person doesn't add up." },
  { t: "Interactive Retail", frame: 118, d: "Endless-aisle browsing on the shop floor, tying in-store screens to the full catalogue and live stock." },
  { t: "Smart Fitting Room", frame: 134, d: "In-room screens that read the garment tag and offer sizes, colours and pairings without a trip back to the floor." },
  { t: "Queue Management", frame: 200, d: "Ticketing, calling and live wait times — routing people to the right counter instead of the longest line." },
  { t: "Meeting Room Manager", frame: 20, d: "Door-side panels showing occupancy and next booking, with book-now for the room you're standing in front of." },
  { t: "Smart Product Finder", frame: 112, d: "Search a product and get its aisle, bay and shelf — cutting the most common question staff get asked." },
  { t: "Digital Standee", frame: 72, d: "Free-standing portrait displays for promotions and campaigns, moved and re-tasked without an installer." },
  { t: "Hotel Self Check-In / Out", frame: 92, d: "Arrival and departure kiosks handling ID, payment and key issue, with a staffed path always one tap away." },
  { t: "Feedback System", frame: 60, d: "One-tap satisfaction capture at the point of experience, reported by site, hour and staff shift." },
];

/* The 13 industries served by the acquired business. */
const INDUSTRIES = [
  "Retail", "Quick Service Restaurants", "Transportation", "Banking & Finance",
  "Education", "DOOH & Outdoor", "Corporate Communications", "Grocery",
  "Automotive", "Hotel & Casino", "Government", "Entertainment", "Healthcare",
];

const PILLARS = [
  { t: "Software", d: "The content platform: scheduling, playlists, templating and estate-wide rollout control.", items: ["Content Manager", "Player", "Rule-based dayparting", "Proof-of-play reporting"] },
  { t: "Hardware", d: "Displays, media players and enclosures specified for the environment they'll live in.", items: ["Media Players", "LINQ Shelf Edge displays", "Commercial panels", "Kiosk enclosures"] },
  { t: "Managed SaaS", d: "We host, monitor and patch it, so your team ships content instead of babysitting infrastructure.", items: ["Hosted platform", "Health monitoring", "Staged rollouts", "Support & SLA"] },
];

const SERVICES = [
  { t: "Technical Consulting", d: "Site surveys, network and power planning, integration with your POS, PMS or operations feed, and a rollout plan that survives contact with a live store." },
  { t: "Creative Services", d: "Motion, layout and templating built for the viewing distance and dwell time of the actual space — not a desktop mockup." },
  { t: "Support & Maintenance", d: "Monitoring, spares logistics and on-site response, with escalation paths agreed before you need them." },
];

/* Real figures, carried over from the acquired business.
   NOTE: the source site is internally inconsistent — its homepage claims
   4.0M signs / 1,200+ staff / 30 offices / 26 languages while its About
   page says 3.1M / 1,000+ / 28 / 23. These are the homepage (headline)
   numbers. Confirm which set is current before any press use. */
const SHOW_STATS = true;

/* The APAC office carried over from the acquired business. The phone and
   address were confirmed; the email was NOT — see the footer's note. */
const CONTACT_INFO = [
  {
    icon: MailIcon,
    label: "Email",
    value: "sales@mrakee.com",
    href: "mailto:sales@mrakee.com",
  },
  {
    icon: PhoneIcon,
    label: "Phone",
    value: "+65 6509 4235",
    href: "tel:+6565094235",
  },
  {
    icon: MapPinIcon,
    label: "APAC Headquarters",
    value: "Keck Seng Tower, 133 Cecil Street #04-02, Singapore 069535",
    wide: true,
  },
];

const STATS = [
  { n: "4.0M", l: "Digital signs" },
  { n: "1,200+", l: "Employees worldwide" },
  { n: "100+", l: "Countries represented" },
  { n: "30", l: "Offices" },
  { n: "26", l: "Languages" },
];

export default function BrandPage() {
  /* One delegated pointer listener per section, not one per card. It
     goes on the section wrapper rather than on <Reveal>, which owns its
     own ref for the entrance animation. */
  const productsSurface = usePointerGlow(".pillar");

  return (
    <div className="brand">
      {/* ---------------- SOLUTIONS ----------------
          Lead card + grid. The first solution carries the section
          instead of a second paragraph doing it. */}
      <section className="band" id="solutions">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Solutions</p>
            <SplitWords words={["One", "platform,", { t: "every", grad: true }, { t: "touchpoint.", grad: true }]} />
            <p className="lede">
              Each of these runs on the same content engine and the same
              management console — so a shopping centre can run wayfinding,
              menu boards and window displays as one estate.
            </p>
          </Reveal>

          <Reveal>
            <SolutionsExplorer solutions={SOLUTIONS} />
          </Reveal>
        </div>
      </section>

      {/* ---------------- INDUSTRIES ----------------
          Text + visual: the heading holds its position while the chip
          field scrolls past it. */}
      <section className="band band--alt" id="industries">
        <div className="band__inner band__split">
          <Reveal className="band__head">
            <p className="eyebrow">Industries</p>
            <SplitWords words={["Different", "floors,", "different", "rules."]} />
            <p className="lede">
              A drive-thru menu board and an immigration hall have almost
              nothing in common except the need to never go dark. We specify
              per environment rather than selling one box for all of them.
            </p>
          </Reveal>

          <Reveal className="pills" stagger y={18}>
            {INDUSTRIES.map((n) => (
              <span className="pill" key={n}>{n}</span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- PRODUCTS ---------------- */}
      <section className="band band--rule" id="products">
        <div className="band__inner" ref={productsSurface}>
          <Reveal className="band__head">
            <p className="eyebrow">Products</p>
            <SplitWords words={["Software,", "hardware,", "or", "the", { t: "whole", grad: true }, { t: "thing", grad: true }, { t: "managed.", grad: true }]} />
            <p className="lede">
              Take the parts you need. Most teams start with one site fully
              managed, then bring it in-house as they scale.
            </p>
          </Reveal>

          <Reveal className="split" stagger>
            {PILLARS.map((p, i) => (
              <div className="pillar" key={p.t}>
                <span className="pillar__no">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <ul>
                  {p.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- STATS ----------------
          Was a dark plate; now a lit panel, so the page never breaks
          out of its own light. */}
      {SHOW_STATS && (
        <section className="band band--aurora">
          <div className="band__inner">
            <Reveal className="aurora">
              <div style={{ maxWidth: "60ch", margin: "0 auto 3.2rem", textAlign: "center" }}>
                <SplitWords
                  words={["Thirty", { t: "years", grad: true }, "of", "it."]}
                  style={{ margin: "0 auto", textAlign: "center" }}
                />
                <p className="lede" style={{ textAlign: "center", margin: "1.25rem auto 0" }}>
                  Mrakee Technologies carries forward a three-decade digital
                  signage business — its platform, its installed base and the
                  teams who run it across Asia-Pacific.
                </p>
              </div>
              <div className="stats">
                {STATS.map((s) => (
                  <div className="stat" key={s.l}>
                    <Counter value={s.n} />
                    <div className="stat__label">{s.l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------------- SERVICES ----------------
          Numbered steps on a line, not a third card grid. */}
      <section className="band band--rule" id="services">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Professional Services</p>
            <SplitWords words={["The", "screen", "is", "the", { t: "easy", grad: true }, { t: "part.", grad: true }]} />
            <p className="lede">
              Specification, content and the years after go-live are where a
              signage estate is actually won or lost.
            </p>
          </Reveal>

          <Reveal className="steps" stagger>
            {SERVICES.map((s, i) => (
              <div className="step" key={s.t}>
                <div className="step__no">{String(i + 1).padStart(2, "0")}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- CONTACT ----------------
          Replaced the centred CTA panel: the nav's "Talk to us" and every
          "Book a demo" on the page point at #contact, and they should
          arrive somewhere you can actually make contact rather than at
          another button. */}
      <section className="band" id="contact">
        <div className="band__inner">
          <Reveal>
            <ContactCard
              eyebrow="Talk to us"
              title="Tell us about the space."
              description="Send us the floor plan and the problem. We'll come back with a specification, a rollout shape and a number — usually within one business day."
              contactInfo={CONTACT_INFO}
            >
              <ContactForm />
            </ContactCard>
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
            <h4>APAC Headquarters</h4>
            <ul>
              <li>Keck Seng Tower</li>
              <li>133 Cecil Street, #04-02</li>
              <li>Singapore 069535</li>
              <li><a href="tel:+6565094235">+65 6509 4235</a></li>
              {/* TODO: the acquired business used sales@stratacache-apac.com.
                  Confirm the Mrakee address that replaces it — this one is
                  assumed, not verified. */}
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
