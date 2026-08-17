import Reveal from "./Reveal";
import SplitWords from "./SplitWords";
import Logo from "./Logo";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";
import FeatureRows from "./FeatureRows";
import AboutShowcase from "./AboutShowcase";
import IndustryShowcase from "./IndustryShowcase";
import { usePointerGlow } from "../hooks/usePointerGlow";
import {
  ABOUT, APPROACH, EXPERTISE, EXPERTS, FAQ, FOOTER,
  INDUSTRIES, INSIGHTS, SOLUTIONS, WHY,
} from "../content/mrakee";

/* --- Page assembly --------------------------------------------------
   All copy comes from src/content/mrakee.js, which is the client's
   document verbatim. This file only decides which existing component
   each block of it lands in — no new UI patterns, no invented facts.

   What went: the acquired APAC business's 17 signage products, its 13
   industries, its Singapore head-office details, and the headline
   statistics band (4.0M signs / 1,200 employees / 30 offices). None of
   that is in the client's content and the figures were another
   company's, so the aurora band now carries the client's own "Our
   Experts" copy instead of being deleted.
   -------------------------------------------------------------------- */

/* FeatureRows wants a single description; most portfolios lead with a
   line in quotes and then list what they support. */
const SOLUTION_ROWS = SOLUTIONS.map((s) => ({ ...s, d: s.d || s.quote }));

export default function BrandPage() {
  const whySurface = usePointerGlow(".pillar");
  const expertiseSurface = usePointerGlow(".pillar");
  const insightsSurface = usePointerGlow(".pillar");

  return (
    <div className="brand">
      {/* ---------------- ABOUT ----------------
          Text column + tabbed media panel. The five approach stages are
          the disclosure list; the panel shows the three commissioned
          service photographs, which are the only images on the site of
          people doing the work rather than of screens. */}
      <section className="band" id="about">
        <div className="band__inner">
          <Reveal>
            <AboutShowcase
              eyebrow="About Us"
              title={ABOUT.title}
              paragraphs={[ABOUT.lede, ...ABOUT.body]}
              chips={["Design", "Integrate", "Connect", "Perform"]}
              steps={APPROACH}
              ctas={[
                { label: "Talk to Our Experts", href: "#contact" },
                { label: "Explore Our Solutions", href: "#solutions" },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ---------------- SOLUTIONS PORTFOLIO ---------------- */}
      <section className="band band--rule" id="solutions">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Solutions Portfolio</p>
            <SplitWords
              words={["Built", "around", { t: "how", grad: true }, { t: "customers", grad: true }, { t: "work.", grad: true }]}
            />
            <p className="lede">
              MRAKEE Technologies solutions portfolios are developed around
              customers. How customers work, how customers learn, how customers
              communicate and how customers engage.
            </p>
          </Reveal>

          <FeatureRows items={SOLUTION_ROWS} />
        </div>
      </section>

      {/* ---------------- INDUSTRIES ---------------- */}
      <section className="band band--alt" id="industries">
        <div className="band__inner ind__grid">
          <Reveal className="band__head ind__head">
            <p className="eyebrow">Industries</p>
            <SplitWords
              words={["Catered", "to", { t: "every", grad: true, br: true }, { t: "environment.", grad: true }]}
            />
            <p className="lede">
              Our solutions portfolios are catered to every environment.
            </p>
          </Reveal>

          <IndustryShowcase items={INDUSTRIES} />
        </div>
      </section>

      {/* ---------------- WHY MRAKEE ---------------- */}
      <section className="band band--rule" id="why">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Why MRAKEE Technologies</p>
            <SplitWords words={["Solutions", "are", "just", "the", { t: "beginning.", grad: true }]} />
            <p className="lede">
              We understand that choosing the right technology is only one part
              of a successful AV project. That's why we believe in the following.
            </p>
          </Reveal>

          <div ref={whySurface}>
            <Reveal className="split" stagger>
              {WHY.map((s) => (
                <div className="pillar" key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- OUR EXPERTISE ---------------- */}
      <section className="band" id="services">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Our Expertise</p>
            <SplitWords words={["Across", "the", "whole", { t: "project", grad: true }, { t: "life-cycle.", grad: true }]} />
            <p className="lede">
              Our experts work closely with customers throughout the project
              life-cycle, allowing customers to feel empowered to find the right
              solution for their business needs.
            </p>
          </Reveal>

          <div ref={expertiseSurface}>
            <Reveal className="split" stagger>
              {EXPERTISE.map((s, i) => (
                <div className="pillar" key={s.t}>
                  <span className="pillar__no">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- OUR EXPERTS ----------------
          The aurora band, previously the statistics plate. */}
      <section className="band band--aurora" id="experts">
        <div className="band__inner">
          <Reveal className="aurora">
            <div style={{ maxWidth: "62ch", margin: "0 auto", textAlign: "center" }}>
              <p className="eyebrow" style={{ justifyContent: "center" }}>Our Experts</p>
              <SplitWords
                words={["One", "Team,", "One", "Goal,", { t: "One", grad: true }, { t: "Seamless", grad: true }, { t: "AV", grad: true }, { t: "experience.", grad: true }]}
                style={{ margin: "0 auto", textAlign: "center" }}
              />
              {EXPERTS.body.map((p) => (
                <p className="lede" key={p} style={{ textAlign: "center", margin: "1.25rem auto 0" }}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- TECHNOLOGY INSIGHTS ---------------- */}
      <section className="band band--rule" id="insights">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">Technology Insights</p>
            <SplitWords words={["Shaping", "modern", "technology", { t: "today", grad: true }, { t: "and", grad: true }, { t: "beyond.", grad: true }]} />
            <p className="lede">{INSIGHTS.title}</p>
          </Reveal>

          <div ref={insightsSurface}>
            <Reveal className="split" stagger>
              {INSIGHTS.items.map((s) => (
                <div className="pillar" key={s.t}>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="band" id="faq">
        <div className="band__inner">
          <Reveal className="band__head">
            <p className="eyebrow">FAQ</p>
            <SplitWords words={["Frequently", "asked", { t: "questions.", grad: true }]} />
          </Reveal>

          <Reveal className="faq" stagger y={22}>
            {FAQ.map((f) => (
              <div className="faq__item" key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------- CONTACT ----------------
          contactInfo is empty on purpose: the client's document gives
          "+91 XXXXX XXXXX", "info@yourMRAKEE Technologies.com" and
          "[Company Address]", all placeholders. The previous Singapore
          details belonged to the acquired business, so showing them
          would be worse than showing none. */}
      <section className="band" id="contact">
        <div className="band__inner">
          <Reveal>
            <ContactCard
              eyebrow="Contact Us"
              title="Ready to start your Technology Journey?"
              description="Get in touch with our experts."
              contactInfo={[]}
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
            <p style={{ marginTop: "1.1rem", fontSize: ".92rem", lineHeight: 1.65, maxWidth: "32ch" }}>
              {FOOTER.strap}
            </p>
          </div>
          <div>
            <h4>What we do</h4>
            <ul>
              {FOOTER.disciplines.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Quick links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#solutions">Solutions</a></li>
              <li><a href="#industries">Industries</a></li>
              <li><a href="#services">Our Expertise</a></li>
              <li><a href="#insights">Insights</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            {/* Named in the client's document, but no URLs were supplied —
                listed rather than linked, so there are no dead links. */}
            <h4>Connect with us</h4>
            <ul>
              {FOOTER.social.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} MRAKEE TECHNOLOGIES. All Rights Reserved.</span>
          <span>Privacy Policy · Terms &amp; Conditions</span>
        </div>
      </footer>
    </div>
  );
}
