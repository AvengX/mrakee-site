import { useState } from "react";

/**
 * The Mrakee Technologies lockup.
 *
 * Prefers the real artwork at `public/logo.png` and falls back to the
 * SVG approximation below if that file is not there — so the site never
 * shows a broken image, and the real mark appears the moment the file
 * is dropped in.
 *
 * The supplied artwork is a STACKED lockup: the M mark on top, "MRAKEE"
 * and "TECHNOLOGIES" beneath it. A nav bar is ~40px tall, and at that
 * height a baked-in wordmark is about six pixels of type — unreadable.
 * So the image is cropped to the mark alone and paired with live text
 * for the wordmark, which stays crisp at any size and is selectable and
 * searchable. The crop is expressed as custom properties because it has
 * to be eyeballed against the real file:
 *
 *   --logo-zoom    how much bigger than the box the image is drawn
 *   --logo-x/y     where the mark sits inside that
 *
 * The wordmark uses the *ink* variants of the brand colours. The true
 * gold and teal score 2.2:1 and 1.9:1 against white — fine as the fill
 * of a shape, illegible as 16px type.
 */
export default function Logo({ size = 36, showWordmark = true }) {
  const [artwork, setArtwork] = useState(true);

  return (
    <a href="#top" className="logo" aria-label="Mrakee Technologies — home">
      {artwork ? (
        // the artwork is 480x372, so the box keeps a 1.29:1 ratio
        <span className="logo__markBox" style={{ height: size, width: Math.round(size * 1.29) }}>
          <img
            src="logo.png"
            alt=""
            onError={() => setArtwork(false)}
            draggable="false"
          />
        </span>
      ) : (
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            {/* the real mark's gold is a metallic sweep, not a flat
                fill — bright along the top-left, deepening to bronze */}
            <linearGradient id="mk-gold" x1="0.1" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#f3d488" />
              <stop offset="38%" stopColor="#d4a339" />
              <stop offset="72%" stopColor="#c08f28" />
              <stop offset="100%" stopColor="#9d6f16" />
            </linearGradient>
            <linearGradient id="mk-red" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#d8232f" />
              <stop offset="100%" stopColor="#9c111c" />
            </linearGradient>
            <linearGradient id="mk-teal" x1="0.15" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#2ab3ba" />
              <stop offset="100%" stopColor="#0e7178" />
            </linearGradient>
          </defs>

          {/* The M is a folded gold ribbon: a stem down the left, a
              valley, then a sweep up and out to a point on the right.
              The crimson is the underside of that fold showing through
              behind the left leg. */}
          <path d="M27 36 L38 52 L38 86 L27 86 Z" fill="url(#mk-red)" />
          <path
            d="M16 86 L16 25 Q16 18 24 18 L31 18 L52 56 L76 17 L88 22 L74 33 L56 67 L48 67 L27 35 L27 86 Z"
            fill="url(#mk-gold)"
          />

          {/* the teal 'r' rising beside it */}
          <path
            d="M62 86 L62 50 Q62 42 71 42 L90 42 L81 56 L74 56 L74 86 Z"
            fill="url(#mk-teal)"
          />

          {/* three pixels breaking away from the tip — kept clear of the
              ribbon so they still read as separate at 36px */}
          <rect className="logo__px" x="82" y="2" width="10" height="10" rx="1.5" fill="#d9a63c" />
          <rect className="logo__px" x="71" y="9" width="7" height="7" rx="1.5" fill="#c41e2a" />
          <rect className="logo__px" x="90" y="14" width="7" height="7" rx="1.5" fill="#d9a63c" />
        </svg>
      )}

      {showWordmark && (
        <span className="logo__word">
          <span className="logo__name">MRAKEE</span>
          <span className="logo__sub">TECHNOLOGIES</span>
        </span>
      )}
    </a>
  );
}
