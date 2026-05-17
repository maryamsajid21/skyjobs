/**
 * StatusBadge — colour-coded pill label for job and bid statuses.
 *
 * Accepts a `status` string and looks up its visual config from a map.
 * Falls back to the "pending" config for any unknown status string.
 *
 * Each config entry specifies:
 *   bg     — background fill (rgba so the glass backdropFilter shows through)
 *   color  — text + icon colour
 *   dot    — colour of the animated dot indicator
 *   border — rgba border matching the status hue
 *   label  — human-readable display text
 *
 * Glassmorphism:
 *   backdropFilter: "blur(4px)" makes the badge itself slightly translucent,
 *   letting background gradients show through and blending the pill into the card.
 */

// ── Status colour map ───────────────────────────────────────────────────────
const configs = {
  // Job statuses
  open:        { bg: "rgba(239,246,255,0.9)", color: "#1D4ED8", dot: "#3B82F6", border: "rgba(59,130,246,0.2)",  label: "Open"        },
  in_progress: { bg: "rgba(255,251,235,0.9)", color: "#92400E", dot: "#F59E0B", border: "rgba(245,158,11,0.2)",  label: "In Progress"  },
  completed:   { bg: "rgba(240,253,244,0.9)", color: "#166534", dot: "#22C55E", border: "rgba(34,197,94,0.2)",   label: "Completed"    },
  cancelled:   { bg: "rgba(254,242,242,0.9)", color: "#991B1B", dot: "#EF4444", border: "rgba(239,68,68,0.2)",   label: "Cancelled"    },

  // Bid statuses
  pending:     { bg: "rgba(248,250,252,0.9)", color: "#475569", dot: "#94A3B8", border: "rgba(148,163,184,0.2)", label: "Pending"      },
  accepted:    { bg: "rgba(240,253,244,0.9)", color: "#166534", dot: "#22C55E", border: "rgba(34,197,94,0.2)",   label: "Accepted"     },
  rejected:    { bg: "rgba(254,242,242,0.9)", color: "#991B1B", dot: "#EF4444", border: "rgba(239,68,68,0.2)",   label: "Rejected"     },
  withdrawn:   { bg: "rgba(248,250,252,0.9)", color: "#64748B", dot: "#CBD5E1", border: "rgba(203,213,225,0.3)", label: "Withdrawn"    },
};

const StatusBadge = ({ status }) => {
  // Unknown status falls back to "pending" (grey/neutral) rather than crashing
  const c = configs[status] || configs.pending;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 11px", borderRadius: 20,   /* pill shape */
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontSize: "0.7rem", fontWeight: 700,
      fontFamily: "Poppins,sans-serif",
      whiteSpace: "nowrap", letterSpacing: "0.03em",
      /* Glass layer — low blur since badges are small; mostly for consistency */
      backdropFilter:       "blur(4px)",
      WebkitBackdropFilter: "blur(4px)"   /* Safari prefix required */
    }}>
      {/* Coloured dot — quick visual cue before text is read */}
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

export default StatusBadge;
