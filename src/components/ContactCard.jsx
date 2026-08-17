import { Plus } from "lucide-react";

/* ================================================================
   The contact card shell.

   Adapted from a shadcn/Tailwind component. This project has neither —
   no Tailwind, no TypeScript, no `cn()`, no CSS variables named
   `--muted-foreground` — so the structure was kept and the styling
   rewritten against this site's own tokens. What survives from the
   original: the two-column split (story + contact rail on the left, form
   on the right), the contact-info rows, and the four corner plus marks.

   Those plus marks are the reason to keep it. They read as registration
   marks on a technical drawing, which is exactly the "instrument panel"
   note the rest of the page is going for, and they cost four SVGs.
   ================================================================ */

function ContactInfo({ icon: Icon, label, value, href, wide }) {
  const body = (
    <>
      <span className="contact__infoIcon">
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span>
        <span className="contact__infoLabel">{label}</span>
        <span className="contact__infoValue">{value}</span>
      </span>
    </>
  );

  const className = `contact__info${wide ? " contact__info--wide" : ""}`;

  // An address is not actionable; a phone number and an email are. Only
  // the ones you can actually do something with become links.
  return href ? (
    <a className={className} href={href}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function ContactCard({
  eyebrow,
  title,
  description,
  contactInfo = [],
  steps = [],
  stepsLabel,
  media,
  children,
}) {
  return (
    <div className="contact">
      <Plus className="contact__mark contact__mark--tl" aria-hidden="true" />
      <Plus className="contact__mark contact__mark--tr" aria-hidden="true" />
      <Plus className="contact__mark contact__mark--bl" aria-hidden="true" />
      <Plus className="contact__mark contact__mark--br" aria-hidden="true" />

      <div className="contact__body">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        <p className="lede">{description}</p>

        {/* Ruled rows, from the reference. What the reference puts in
            them — "risk-free 60-day pilot" and the rest — is an offer
            this client has never made, so these carry the client's own
            words about their own process instead. */}
        {steps.length > 0 && (
          <div className="contact__steps">
            {stepsLabel && <p className="contact__stepsLabel">{stepsLabel}</p>}
            <ul>
              {steps.map(({ icon: Icon, t, d }) => (
                <li key={t}>
                  <span className="contact__stepIcon">
                    <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <span>
                    <b>{t}</b>
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Skipped entirely when there is nothing real to put in it —
            an empty rail is a rule and a gap, which reads as broken. */}
        {contactInfo.length > 0 && (
          <div className="contact__infos">
            {contactInfo.map((info) => (
              <ContactInfo key={info.label} {...info} />
            ))}
          </div>
        )}
      </div>

      <div className="contact__form">
        {media && (
          <img className="contact__bg" src={media} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        )}
        <div className="contact__formInner">{children}</div>
      </div>
    </div>
  );
}
