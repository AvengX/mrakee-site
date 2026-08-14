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

        <div className="contact__infos">
          {contactInfo.map((info) => (
            <ContactInfo key={info.label} {...info} />
          ))}
        </div>
      </div>

      <div className="contact__form">{children}</div>
    </div>
  );
}
