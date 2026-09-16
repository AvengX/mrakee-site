import { useId, useRef, useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import PhoneField from "./PhoneField";
import { checkPhone, digitsOf, findCountry } from "../lib/countries";
import { SOLUTIONS } from "../content/mrakee";

/* ================================================================
   The enquiry form.

   Enquiries are delivered via the /api/enquiry endpoint to Web3Forms
   and on to the sales inbox. Everything else — validation, the
   pending state, the success state, the error handling — works
   against a promise and maintains full visual parity.
   ================================================================ */

const SALES_EMAIL = "Sales@mrakeetechnologies.com";

const FIELDS = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", required: true },
  { name: "company", label: "Company", type: "text", autoComplete: "organization" },
  { name: "email", label: "Email", type: "email", autoComplete: "email", required: true },
];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!values.email.trim()) {
    errors.email = "We need an email to reply to.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That doesn't look like a complete email address.";
  }
  // The phone is optional, so an empty one is fine — but a half-typed
  // one is worse than none at all, because we would try to ring it.
  const phoneState = checkPhone(values.phone, findCountry(values.country));
  if (phoneState === "short" || phoneState === "long") {
    errors.phone = "Please finish the phone number, or clear it.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "A sentence or two about the space helps us reply usefully.";
  }
  return errors;
}

/* India, because that is where the client is and where most enquiries
   will come from. The list covers fifty-two others. */
const EMPTY = {
  name: "",
  company: "",
  email: "",
  phone: "",
  country: "IN",
  city: "",
  projectType: "",
  message: "",
  website: "",
};

/* The final document asks for a Project Type but does not say what the
   types are. Rather than invent a list, these are the client's own nine
   solution portfolios — which is what a project type means for this
   business — plus an escape hatch, so nobody is forced into a box that
   does not fit. */
const PROJECT_TYPES = [...SOLUTIONS.map((s) => s.t), "Something else"];

export default function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle · sending · sent · failed
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef(null);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    // clear a field's error as soon as the visitor starts fixing it —
    // leaving it up while they type reads as the form arguing back
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  async function send(payload) {
    const formattedPhone = payload.phone
      ? `${findCountry(payload.country)?.dial || ""} ${digitsOf(payload.phone)}`.trim()
      : "";

    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...payload,
        phoneFormatted: formattedPhone,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || `Submission failed (${res.status})`);
    }
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
      const first = ["name", "email", "phone", "message"].find((k) => found[k]);
      formRef.current?.querySelector(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    try {
      await send(values);
      setStatus("sent");
      setValues(EMPTY);
    } catch (err) {
      setErrorMessage(err.message || "");
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact__done" role="status">
        <span className="contact__doneIcon">
          <Check size={22} strokeWidth={2.4} aria-hidden="true" />
        </span>
        <h3>Enquiry sent successfully.</h3>
        <p>
          Thank you for reaching out. We reply within one business day. You can also write to us directly at{" "}
          <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a>.
        </p>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setStatus("idle");
            setErrorMessage("");
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <p className="form__head">Quick Enquiry</p>

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

      <PhoneField
        id={`${uid}-phone`}
        country={values.country}
        onCountryChange={(code) => setValues((v) => ({ ...v, country: code }))}
        value={values.phone}
        onChange={(phone) => {
          setValues((v) => ({ ...v, phone }));
          if (errors.phone) setErrors((x) => ({ ...x, phone: undefined }));
        }}
      />
      {errors.phone && (
        <p className="field__err" role="alert">
          {errors.phone}
        </p>
      )}

      <div className="field">
        <label htmlFor={`${uid}-city`}>City / Location</label>
        <input
          id={`${uid}-city`}
          name="city"
          type="text"
          autoComplete="address-level2"
          value={values.city}
          onChange={set("city")}
        />
      </div>

      <div className="field">
        <label htmlFor={`${uid}-projectType`}>Project Type</label>
        <select
          id={`${uid}-projectType`}
          name="projectType"
          className="field__select"
          value={values.projectType}
          onChange={set("projectType")}
        >
          <option value="">Select a project type</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`${uid}-message`}>
          Tell us about your requirement
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
          {errorMessage ? `${errorMessage} ` : "That didn't go through. "}
          Please email <a href={`mailto:${SALES_EMAIL}`}>{SALES_EMAIL}</a> instead.
        </p>
      )}

      <button className="btn btn--primary form__submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 size={16} className="spin" aria-hidden="true" /> Sending
          </>
        ) : (
          <>
            Submit Enquiry <Send size={16} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="form__fine">
        We'll only use this to answer your enquiry.
      </p>
    </form>
  );
}
