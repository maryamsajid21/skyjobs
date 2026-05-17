/**
 * SkyJobsLogo — reusable brand identity component.
 *
 * Renders the paper-plane SVG mark alongside the "Sky Jobs" wordmark.
 * The paper-plane motif ties together two core product ideas:
 *   • "Sky"  — altitude, ambition, freedom
 *   • "Jobs" — sending proposals (like paper planes) through the marketplace
 *
 * Props:
 *   size         — pixel width/height of the mark (default 36)
 *   showWordmark — whether to render the text alongside the mark (default true)
 *   light        — true = white wordmark for dark/gradient backgrounds (default false)
 *   className    — extra CSS classes forwarded to the outer wrapper
 */
const SkyJobsLogo = ({ size = 36, showWordmark = true, light = false, className = "" }) => {
  // Font size scales proportionally from the base size of 36px → 1.2rem
  const fontSize = `${((size / 36) * 1.2).toFixed(2)}rem`;

  // Gap between mark and wordmark scales with mark size
  const gap = Math.round(size * 0.25);

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap, lineHeight: 1 }}
    >
      {/* ── SVG Logo Mark ─────────────────────────────────────────── */}
      {/*
        The SVG viewBox is always 48×48 — the displayed size is controlled by
        the width/height attributes so the mark scales cleanly to any size.
        rx="13" on the <rect> is 13/48 ≈ 27% — matches the rounded-square
        "app icon" aesthetic used across the entire design system.
      */}
      <span style={{
        display: "inline-flex",
        borderRadius: Math.round(size * 0.27),
        /* Glow shadow matches the brand blue; uses rgba so it's subtle */
        boxShadow: `0 ${Math.round(size * 0.11)}px ${Math.round(size * 0.39)}px rgba(3,105,161,0.38)`,
        flexShrink: 0
      }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/*
              Static gradient ID — safe because this component always renders
              the same gradient and React deduplicates SVG defs in the DOM.
            */}
            <linearGradient id="sj-logo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#075985" /> {/* Deep sky-blue */}
              <stop offset="100%" stopColor="#0EA5E9" /> {/* Vibrant cyan  */}
            </linearGradient>
          </defs>

          {/* Rounded-square background — same proportion as app icons */}
          <rect width="48" height="48" rx="13" fill="url(#sj-logo-grad)" />

          {/* Top wing — fully opaque, catches the eye first */}
          <path d="M9,22 L40,10 L23,22 Z" fill="white" />

          {/* Bottom fuselage / second wing — 60% opacity creates visual depth */}
          <path d="M40,10 L23,22 L16,40 Z" fill="rgba(255,255,255,0.60)" />

          {/* Fold-crease shadow detail — 25% opacity, barely visible, adds realism */}
          <path d="M23,22 L16,40 L21,32 Z" fill="rgba(255,255,255,0.25)" />
        </svg>
      </span>

      {/* ── Wordmark ──────────────────────────────────────────────── */}
      {/*
        Two-tone split: "Sky" in brand blue, "Jobs" in brand green.
        This split creates a memorable visual anchor — clients see "Jobs",
        freelancers see the sky / opportunity framing.
        `light` prop switches the "Sky" portion to white for dark backgrounds
        (hero sections, footers with gradient backgrounds).
      */}
      {showWordmark && (
        <span style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          fontSize,
          color: light ? "rgba(255,255,255,0.95)" : "#0369A1",
          letterSpacing: "-0.01em",
          userSelect: "none"
        }}>
          Sky
          {/* Green accent = success, growth, getting hired */}
          <span style={{ color: "#22C55E" }}>Jobs</span>
        </span>
      )}
    </span>
  );
};

export default SkyJobsLogo;
