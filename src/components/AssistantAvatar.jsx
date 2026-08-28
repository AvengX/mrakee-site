import { useEffect, useState } from "react";
import { visemeForOpenness } from "../lib/voice/visemeMap.js";

/* ================================================================
   The assistant's face.

   Drawn rather than generated, for a reason that matters more than it
   sounds: the poses have to be the SAME character. Ask an image model
   for one figure in three poses and you get three people who look
   related. Here every pose shares one base — head, hair, shoulders are
   literally the same elements — and only the mouth, brows and arms
   change. It also scales to any size, weighs nothing, and takes its
   colours from the site's own tokens, so it can never drift out of
   brand the way a flat PNG does.

   The reference works exactly this way. Its avatar is not animated: it
   is a small set of static illustrated poses swapped by state —
   greeting on the home screen, neutral while listening, gesturing while
   presenting results.

   Style is deliberately a clean corporate illustration rather than the
   reference's photoreal 3D render. On a B2B integrator's site an
   almost-real face reads as uncanny; a drawn one reads as an interface.

   A real illustration still wins if one arrives: drop square PNGs at
   public/assistant/avatar-idle.png (and -listening / -answering) and
   they take over per state, with no code change.
   ================================================================ */

const POSES = ["idle", "listening", "thinking", "answering"];
/* WebP first, PNG second. The renders are 3D with soft gradients and an
   alpha edge, which is the case PNG handles worst — 18 kB against 222.
   PNG stays in the list so a file dropped in later still works without
   anyone having to know this. */
const EXTS = ["webp", "png"];
const baseFor = (pose) =>
  `assistant/avatar-${pose === "thinking" ? "listening" : pose}`;
const fileFor = (pose) => `${baseFor(pose)}.${resolvedExt}`;
let resolvedExt = EXTS[0];

export default function AssistantAvatar({ state = "idle", size = 84, mouth = 0, viseme = null, className = "" }) {
  const pose = POSES.includes(state) ? state : "idle";
  const [custom, setCustom] = useState(null);

  useEffect(() => {
    let alive = true;
    const tryExt = (i) => {
      if (!alive || i >= EXTS.length) { if (alive) setCustom(null); return; }
      const src = `${baseFor(pose)}.${EXTS[i]}`;
      const probe = new Image();
      probe.onload = () => {
        if (!alive) return;
        if (probe.naturalWidth > 1) { resolvedExt = EXTS[i]; setCustom(src); }
        else tryExt(i + 1);
      };
      probe.onerror = () => tryExt(i + 1);
      probe.src = src;
    };
    tryExt(0);
    return () => { alive = false; };
  }, [pose]);

  /* `mouth` is 0..1 and comes from the audio that is actually playing.
     It is a prop, not a timer: this component decides how a mouth
     LOOKS at a given openness and nothing about when it moves. */
  const open = pose === "answering" ? Math.max(0, Math.min(1, mouth)) : 0;

  /* Blinking, for both the still and the drawn avatar. Human blink
     spacing is irregular — a fixed interval reads as a tic — so each
     one schedules the next somewhere between 2.4 and 7 seconds. */
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let t;
    const next = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 110);
        next();
      }, 2400 + Math.random() * 4600);
    };
    next();
    return () => clearTimeout(t);
  }, []);
  const attentive = pose === "listening" || pose === "thinking";

  return (
    <span
      className={`avatar avatar--${state}${className ? " " + className : ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {custom ? (
        /* TWO ALIGNED STILLS, CROSSFADED BY THE AUDIO.

           These renders share a head position — measured at generation
           time: identical hair-top row, head widths within 2.7% — which
           is the only reason this works. The closed-mouth frame sits
           underneath and the open-mouth frame fades in over it in
           proportion to how loud the voice is right now, so the mouth
           moves continuously with the speech rather than switching
           between two states.

           What it CANNOT do, and no crossfade of two photographs can:
           tell an "oo" from an "ee". That needs a viseme set or a rig,
           and this asset has neither. */
        <span className="avatar__stack" style={{ width: size, height: size }}>
          <img src={fileFor("idle")} alt="" width={size} height={size} />

          {/* VISEME PATH. Ten mouth shapes cut from these same two
              renders, so every pixel outside the mouth is identical and
              swapping between them cannot shift the face. The shape
              comes from the provider's character alignment; the CSS
              crossfade below is what stops it flicking. */}
          {pose === "answering" && viseme && viseme !== "rest" && (
            <img
              className="avatar__viseme"
              src={`assistant/visemes/${viseme}.webp`}
              alt=""
              width={size}
              height={size}
            />
          )}

          {/* AMPLITUDE PATH, for providers that send no alignment and
              for the browser voice.

              It picks a viseme by loudness and draws it FULLY OPAQUE.
              It used to cross-fade the whole answering face over the
              idle one at the openness value, and because both are
              complete opaque faces, every intermediate opacity painted
              two mouths at once — the baked smile showing through the
              open one. One face at a time, always. */}
          {pose === "answering" && !viseme && visemeForOpenness(open) && (
            <img
              className="avatar__viseme"
              src={`assistant/visemes/${visemeForOpenness(open)}.webp`}
              alt=""
              width={size}
              height={size}
            />
          )}
          {pose !== "answering" && custom !== fileFor("idle") && (
            <img className="avatar__mouthFrame" src={custom} alt="" width={size} height={size} style={{ opacity: 1 }} />
          )}
        </span>
      ) : (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <clipPath id="avClip"><circle cx="50" cy="50" r="50" /></clipPath>
            <linearGradient id="avBg" x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="var(--gold-lite)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
            <linearGradient id="avCoat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--teal)" />
              <stop offset="100%" stopColor="var(--teal-deep)" />
            </linearGradient>
          </defs>

          <g clipPath="url(#avClip)">
            <circle cx="50" cy="50" r="50" fill="url(#avBg)" />

            {/* shoulders and jacket */}
            <path d="M2 108c0-22 21-33 48-33s48 11 48 33z" fill="url(#avCoat)" />
            {/* shirt */}
            <path d="M50 74l-8.5 5 8.5 29 8.5-29z" fill="#f7f8f6" />
            {/* lapels */}
            <path d="M41.5 79l8.5-5v10l-5.5 20z" fill="var(--teal-deep)" opacity="0.5" />
            <path d="M58.5 79l-8.5-5v10l5.5 20z" fill="var(--teal-deep)" opacity="0.5" />

            {/* neck */}
            <path d="M43.5 60h13v10a6.5 6.5 0 0 1-13 0z" fill="#e0aa7e" />
            {/* head */}
            <ellipse cx="50" cy="45" rx="15.5" ry="17.5" fill="#f0c39a" />
            {/* ears */}
            <ellipse cx="34.6" cy="46" rx="2.4" ry="3.4" fill="#e8b98f" />
            <ellipse cx="65.4" cy="46" rx="2.4" ry="3.4" fill="#e8b98f" />

            {/* hair: crown, then the two lengths framing the face */}
            <path d="M50 25c-11 0-17.5 7-17.5 16.5 0 2.6.3 4.6.7 6.2 1-6.4 2.6-9.9 4.6-11.9 4.8 3 16.7 3.4 22.9.4 2.9 2 4.7 5.5 5.6 11.5.4-1.6.7-3.6.7-6.2C67 32 61 25 50 25z" fill="#2a1d15" />
            <path d="M33.2 41c-1.8 7-1.6 14.4.4 21 .9-4 1-9.4.6-13.6z" fill="#2a1d15" />
            <path d="M66.8 41c1.8 7 1.6 14.4-.4 21-.9-4-1-9.4-.6-13.6z" fill="#2a1d15" />

            {/* brows — lift a little when listening */}
            <path
              d={attentive ? "M41 37.5q3.5-2 7-.4" : "M41 38.8q3.5-1.8 7-.2"}
              stroke="#2a1d15" strokeWidth="1.5" strokeLinecap="round" fill="none"
            />
            <path
              d={attentive ? "M59 37.5q-3.5-2-7-.4" : "M59 38.8q-3.5-1.8-7-.2"}
              stroke="#2a1d15" strokeWidth="1.5" strokeLinecap="round" fill="none"
            />

            {/* eyes */}
            {/* Eyes collapse to a line on a blink — possible here
                because they are drawn elements. The photographic avatar
                gets no blink: an eyelid painted over a rendered face
                reads as a smudge, and a bad blink is worse than none. */}
            <ellipse cx="43.4" cy="45" rx="2.1" ry={blink ? 0.35 : 2.4} fill="#2a1d15" />
            <ellipse cx="56.6" cy="45" rx="2.1" ry={blink ? 0.35 : 2.4} fill="#2a1d15" />
            {!blink && <circle cx="44.1" cy="44.2" r="0.7" fill="#fff" />}
            {!blink && <circle cx="57.3" cy="44.2" r="0.7" fill="#fff" />}

            {/* mouth: closed smile, or open mid-sentence while answering */}
            {open > 0.04 ? (
              /* ry scales with the audio, so this is a real analogue
                 mouth rather than two states: 0.5 closed-ish, 3.4 at a
                 shout. rx widens a little too — a mouth that only grows
                 downward looks like a hinge. */
              <ellipse
                cx="50"
                cy={53.6 + open * 0.7}
                rx={2.4 + open * 1.3}
                ry={0.5 + open * 2.9}
                fill="#8c3d3d"
              />
            ) : (
              <path d="M46.4 53.4q3.6 3 7.2 0" stroke="#8c3d3d" strokeWidth="1.6"
                    strokeLinecap="round" fill="none" />
            )}

            {/* the presenting hand, only while answering */}
            {open > 0.3 && (
              <g>
                <path d="M74 108c-4-9-9-14-14-16l4-7 8 3z" fill="url(#avCoat)" />
                <ellipse cx="68" cy="83" rx="5" ry="4.3" fill="#f0c39a"
                         transform="rotate(-18 68 83)" />
              </g>
            )}
          </g>
        </svg>
      )}
      <i className="avatar__pulse" />
    </span>
  );
}

