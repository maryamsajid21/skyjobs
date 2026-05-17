/**
 * Spinner — animated loading indicator.
 *
 * Built as an inline SVG so it inherits colour from the parent context
 * without needing a CSS class. The `color` prop controls both the
 * track (20% opacity) and the arc (full opacity), keeping them in sync.
 *
 * Props:
 *   size  — "sm" (16px) | "md" (24px, default) | "lg" (40px)
 *   color — any CSS colour string (default: brand blue #0369A1)
 *
 * Animation:
 *   A keyframe `spin` is injected inline alongside the SVG so this
 *   component has zero external CSS dependencies. The rotate is applied
 *   to the whole SVG element (not a child group) so it spins around its
 *   centre — achievable because SVG elements respect CSS transforms.
 */

const Spinner = ({ size = "md", color = "#0369A1" }) => {
  // Map size prop to pixel dimension
  const px = size === "sm" ? 16 : size === "lg" ? 40 : 24;

  return (
    <svg
      width={px} height={px}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      {/* Inject the spin keyframe so this component is self-contained */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>

      {/* Track circle — same colour but very transparent, forms the "groove" */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />

      {/* Arc — quarter-circle cap that appears to chase itself around the track */}
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export default Spinner;
