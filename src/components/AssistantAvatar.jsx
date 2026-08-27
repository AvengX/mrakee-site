import { useEffect, useState } from "react";

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
const fileFor = (pose) =>
  `assistant/avatar-${pose === "thinking" ? "listening" : pose}.png`;

export default function AssistantAvatar({ state = "idle", size = 84 }) {
  const pose = POSES.includes(state) ? state : "idle";
  const [custom, setCustom] = useState(null);

  useEffect(() => {
    let alive = true;
    const src = fileFor(pose);
    const probe = new Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth > 1) setCustom(src);
    };
    probe.onerror = () => alive && setCustom(null);
    probe.src = src;
    return () => { alive = false; };
  }, [pose]);

  const talking = pose === "answering";
  const attentive = pose === "listening" || pose === "thinking";

  return (
    <span
      className={`avatar avatar--${state}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {custom ? (
        <img src={custom} alt="" width={size} height={size} />
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
            <ellipse cx="43.4" cy="45" rx="2.1" ry="2.4" fill="#2a1d15" />
            <ellipse cx="56.6" cy="45" rx="2.1" ry="2.4" fill="#2a1d15" />
            <circle cx="44.1" cy="44.2" r="0.7" fill="#fff" />
            <circle cx="57.3" cy="44.2" r="0.7" fill="#fff" />

            {/* mouth: closed smile, or open mid-sentence while answering */}
            {talking ? (
              <ellipse cx="50" cy="54" rx="3.1" ry="2.3" fill="#8c3d3d" />
            ) : (
              <path d="M46.4 53.4q3.6 3 7.2 0" stroke="#8c3d3d" strokeWidth="1.6"
                    strokeLinecap="round" fill="none" />
            )}

            {/* the presenting hand, only while answering */}
            {talking && (
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

