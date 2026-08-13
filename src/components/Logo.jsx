/**
 * SVG approximation of the Mrakee Technologies mark: gold "M" whose right
 * leg rises as a mint pillar, with three gold pixels breaking away.
 *
 * To use the real artwork instead, drop the PNG at `public/logo.png` and
 * swap this component's body for:
 *   <img src="logo.png" alt="Mrakee Technologies" style={{height: size}} />
 */
export default function Logo({ size = 34, showWordmark = true }) {
  return (
    <a
      href="#top"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        textDecoration: "none",
      }}
    >
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

        {/* Gold M: left stem, valley, rise to the right shoulder */}
        <path
          d="M14 88 V16 L26 16 L50 58 L74 16 L86 16 L86 30 L74 30 L54 66 L46 66 L26 32 L26 88 Z"
          fill="url(#mk-gold)"
        />
        {/* Mint pillar forming the right leg / T-stroke */}
        <path
          d="M60 40 H86 L78 52 H74 V88 H62 V52 Z"
          fill="url(#mk-mint)"
        />
        {/* Three pixels breaking away, top-right */}
        <rect x="80" y="24" width="7" height="7" rx="1.4" fill="#d4a339" />
        <rect x="88" y="15" width="6" height="6" rx="1.2" fill="#d4a339" />
        <rect x="82" y="8" width="5" height="5" rx="1" fill="#e6bd5f" />
      </svg>

      {showWordmark && (
        <span style={{ lineHeight: 1 }}>
          <span
            style={{
              display: "block",
              fontSize: "1.02rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "var(--mint-deep)",
            }}
          >
            MRAKEE
          </span>
          <span
            style={{
              display: "block",
              fontSize: "0.52rem",
              fontWeight: 600,
              letterSpacing: "0.34em",
              color: "var(--gold-deep)",
              marginTop: "2px",
            }}
          >
            TECHNOLOGIES
          </span>
        </span>
      )}
    </a>
  );
}
