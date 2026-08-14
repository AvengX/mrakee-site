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
        <span className="logo__markBox" style={{ height: size, width: size * 1.06 }}>
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
            <linearGradient id="mk-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0cc77" />
              <stop offset="55%" stopColor="#d4a339" />
              <stop offset="100%" stopColor="#b1801f" />
            </linearGradient>
            <linearGradient id="mk-mint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8ad8c8" />
              <stop offset="100%" stopColor="#5cbba8" />
            </linearGradient>
          </defs>
          <path
            d="M14 88 V16 L26 16 L50 58 L74 16 L86 16 L86 30 L74 30 L54 66 L46 66 L26 32 L26 88 Z"
            fill="url(#mk-gold)"
          />
          <path d="M60 40 H86 L78 52 H74 V88 H62 V52 Z" fill="url(#mk-mint)" />
          <rect className="logo__px" x="80" y="24" width="7" height="7" rx="1.4" fill="#d4a339" />
          <rect className="logo__px" x="88" y="15" width="6" height="6" rx="1.2" fill="#d4a339" />
          <rect className="logo__px" x="82" y="8" width="5" height="5" rx="1" fill="#e6bd5f" />
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
