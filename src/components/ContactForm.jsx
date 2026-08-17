import { useId, useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

/* ================================================================
   The enquiry form.

   There is no backend on this project, so `send()` below composes a
   pre-filled email and hands it to the visitor's mail client. That is a
   real, working path today rather than a button that lies — but it is
   NOT what you want in production, because it depends on the visitor
   having a mail client configured and it never reaches you if they
   abandon the compose window.

   To make it a real submission, replace the marked block in `send()`
   with a POST to your endpoint. Everything else — validation, the
   pending state, the success state, the error handling — already works
   against a promise and needs no changes.
   ================================================================ */

/* LAUNCH BLOCKER. The client's content document gives
   "info@yourMRAKEE Technologies.com", which is a placeholder, and this
   address is a leftover guess from the previous (acquired-business)
   content. Every enquiry the form produces goes here, so it must be
   replaced with the real inbox before the site is public. */
const SALES_EMAIL = "sales@mrakee.com";

const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", required: true },
  { name: "company", label: "Company", type: "text", autoComplete: "organization" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!values.email.trim()) {
    errors.email = "We need an email to reply to.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That doesn't look like a complete email address.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "A sentence or two about the space helps us reply usefully.";
  }
  return errors;
}

const EMPTY = { name: "", company: "", email: "", phone: "", message: "", website: "" };

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle · sending · sent · failed
  const formRef = useRef(null);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    // clear a field's error as soon as the visitor starts fixing it —
    // leaving it up while they type reads as the form arguing back
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  async function send(payload) {
    /* ---- REPLACE FROM HERE to POST somewhere real -----------------
       await fetch("/api/enquiry", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(payload),
       }).then((r) => { if (!r.ok) throw new Error(r.statusText); });
       ---------------------------------------------------------------- */
    const subject = `Enquiry from ${payload.name}${payload.company ? ` · ${payload.company}` : ""}`;
    const body = [
      `Name: ${payload.name}`,
      payload.company && `Company: ${payload.company}`,
      `Email: ${payload.email}`,
      payload.phone && `Phone: ${payload.phone}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    /* ---- REPLACE TO HERE ------------------------------------------ */
  }

  async function onSubmit(e) {
    e.preventDefault();

    // Honeypot: a real person never fills a field they cannot see, so
    // anything in here is a bot. Fail silently — telling a bot it was
    // caught just teaches whoever wrote it to fill the field better.
    if (values.website) {
      setStatus("sent");
      return;
    }

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      // send focus to the first thing that needs fixing
      const first = ["name", "email", "message"].find((k) => found[k]);
      formRef.current?.querySelector(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      await send(values);
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact__done" role="status">
        <span className="contact__doneIcon">
          <Check size={22} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <h3>Your mail client should be open.</h3>
        <p>
          If nothing happened, write to us directly at{" "}
          <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>. We reply within one
          business day.
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <p className="form__head">Tell us about the space</p>

      {FIELDS.map((f) => (
        <div className="field" key={f.name}>
          <label htmlFor={`${uid}-${f.name}`}>
            {f.label}
            {f.required && (
              <span className="field__req" aria-hidden="true">
                *
              </span>
            )}
          </label>
          <input
            id={`${uid}-${f.name}`}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            value={values[f.name]}
            onChange={set(f.name)}
            aria-invalid={errors[f.name] ? "true" : undefined}
            aria-describedby={errors[f.name] ? `${uid}-${f.name}-err` : undefined}
          />
          {errors[f.name] && (
            <p className="field__err" id={`${uid}-${f.name}-err`} role="alert">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}

      <div className="field">
        <label htmlFor={`${uid}-message`}>
          What are you trying to solve?
          <span className="field__req" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          placeholder="Sites, screen count, the environment, and when you need it live."
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? `${uid}-message-err` : undefined}
        />
        {errors.message && (
          <p className="field__err" id={`${uid}-message-err`} role="alert">
            {errors.message}
          </p>
        )}
      </div>

      {/* Not display:none — some bots skip hidden fields. Off-screen and
          removed from the tab order instead. */}
      <div className="field field--trap" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={set("website")}
        />
      </div>

      {status === "failed" && (
        <p className="field__err" role="alert">
          That didn't go through. Please email{" "}
          <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a> instead.
        </p>
      )}

      <button className="btn btn--primary form__submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 size={16} className="spin" aria-hidden="true" /> Sending
          </>
        ) : (
          <>
            Send enquiry <Send size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="form__fine">
        We'll only use this to answer your enquiry.
      </p>
    </form>
  );
}
