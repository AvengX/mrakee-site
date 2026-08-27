import { useEffect, useState } from "react";

/* ================================================================
   The assistant's face.

   Drawn in SVG so it ships with the bundle, needs no asset pipeline,
   and stays sharp at any size — but a real illustration takes
   precedence the moment one exists. Drop a square image at
   public/assistant/avatar.png and it is used instead; the probe is the
   same off-DOM trick the rest of this site uses, because a lazy <img>
   that 404s never fires onError.

   Deliberately not photoreal and deliberately not a specific person:
   an illustrated figure raises no likeness questions, and on a B2B
   site an uncanny face costs more trust than it earns.
   ================================================================ */

const CUSTOM = "assistant/avatar.png";

export default function AssistantAvatar({ state = "idle", size = 84 }) {
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    let alive = true;
    const probe = new Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth > 1) setCustom(true);
    };
    probe.src = CUSTOM;
    return () => { alive = false; };
  }, []);

  return (
    <span
      className={`avatar avatar--${state}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {custom ? (
        <img src={CUSTOM} alt="" width={size} height={size} />
      ) : (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <defs>
            <clipPath id="avatarClip">
              <circle cx="50" cy="50" r="50" />
            </clipPath>
            <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-lite)" />
              <stop offset="100%" stopColor="var(--gold)" />
            </linearGradient>
          </defs>
          <g clipPath="url(#avatarClip)">
            <circle cx="50" cy="50" r="50" fill="url(#avatarBg)" />
            {/* shoulders */}
            <path
              d="M12 104c0-19 17-30 38-30s38 11 38 30z"
              fill="var(--teal-deep)"
            />
            {/* collar */}
            <path d="M39 76l11 12 11-12-11-6z" fill="var(--teal)" />
            {/* neck */}
            <rect x="43" y="60" width="14" height="16" rx="7" fill="#e8b98f" />
            {/* head */}
            <ellipse cx="50" cy="45" rx="17" ry="19" fill="#f2c9a0" />
            {/* hair */}
            <path
              d="M50 22c-12 0-19 8-19 19 0 5 1 8 2 10 1-8 3-13 6-16 5 3 13 4 21 2 4-1 6-3 7-5 1 5 2 11 2 19 2-3 3-6 3-11 0-11-8-18-22-18z"
              fill="#241a12"
            />
            {/* eyes and mouth */}
            <circle cx="43" cy="45" r="1.9" fill="#241a12" />
            <circle cx="57" cy="45" r="1.9" fill="#241a12" />
            <path
              d="M45 53q5 4 10 0"
              stroke="#241a12"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      )}
      <i className="avatar__pulse" />
    </span>
  );
}
