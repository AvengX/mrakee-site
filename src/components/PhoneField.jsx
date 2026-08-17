import { CircleCheck, CircleX } from "lucide-react";
import { COUNTRIES, checkPhone, digitsOf, findCountry } from "../lib/countries";

/* ================================================================
   Phone field — dialling code + national number

   Adapted from a shadcn/Tailwind component built on Radix Select. This
   project has neither, and the country picker is the one place where
   the native control is genuinely better: <select> gives type-ahead
   free, so typing "ind" jumps to India in a list of fifty-two, and on a
   phone it opens the platform's own wheel instead of a div that has to
   reimplement one. Radix would have been a dependency to get something
   worse here.

   Validation is the source's, rewritten — see lib/countries.js for why
   its regexes could never pass for the country it defaults to.

   The tick and cross are not the whole message. Colour alone cannot
   carry state (WCAG 1.4.1), so the field also writes what is wrong in
   words, and that line is what the input points at with
   aria-describedby.
   ================================================================ */

/* Phrased around the country name rather than in front of it: "a
   India number" and "an United Kingdom number" are both wrong, and no
   article is right for every one of the fifty-two. */
const span = (c) => (c.min === c.max ? `${c.min}` : `${c.min}–${c.max}`);

const MESSAGE = {
  short: (c) => `${c.name} numbers have ${span(c)} digits after ${c.dial}.`,
  long: (c) => `That is more than ${c.name} numbers take — ${span(c)} digits after ${c.dial}.`,
};

export default function PhoneField({
  id,
  label = "Phone",
  country: countryCode,
  onCountryChange,
  value,
  onChange,
  autoComplete = "tel-national",
}) {
  const country = findCountry(countryCode);
  const state = checkPhone(value, country);
  const showState = state !== "empty";
  const valid = state === "ok";
  const noteId = `${id}-note`;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className={`phone${showState ? (valid ? " is-ok" : " is-bad") : ""}`}>
        <select
          className="phone__country"
          value={country.code}
          onChange={(e) => onCountryChange(e.target.value)}
          aria-label="Country dialling code"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name} ({c.dial})
            </option>
          ))}
        </select>

        <input
          id={id}
          className="phone__input"
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          placeholder={country.eg}
          value={value}
          /* Digits, spaces, dashes and brackets only — anything else in
             a phone number is a typo, and stripping it as it is typed
             beats telling someone off for it afterwards. */
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s\-()+]/g, ""))}
          aria-invalid={showState && !valid ? "true" : undefined}
          aria-describedby={showState ? noteId : undefined}
        />

        {showState && (
          <span className="phone__state" aria-hidden="true">
            {valid ? (
              <CircleCheck size={17} strokeWidth={2.2} />
            ) : (
              <CircleX size={17} strokeWidth={2.2} />
            )}
          </span>
        )}
      </div>

      {/* Always rendered once anything is typed, so the reason is text
          and not just a colour. role="status" rather than "alert": this
          updates on every keystroke and an alert would interrupt a
          screen reader mid-word, over and over. */}
      {showState && (
        <p
          className={`phone__note${valid ? " is-ok" : ""}`}
          id={noteId}
          role="status"
        >
          {valid
            ? `${country.dial} ${digitsOf(value)} looks complete.`
            : MESSAGE[state](country)}
        </p>
      )}
    </div>
  );
}
