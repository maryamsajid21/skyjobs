/**
 * FreelancerProfilePage — public profile for a freelancer user.
 *
 * Accessible to any user (guest, client, or another freelancer).
 * Clients use this page to evaluate a freelancer before accepting their bid.
 *
 * Layout (two-column on desktop, stacked on mobile):
 *   Left sidebar  — stats card (jobs completed, reviews, avg rating)
 *                 — portfolio links card (if present)
 *   Main column   — About bio
 *                 — Skills chip cloud
 *                 — Reviews list (from completed jobs)
 *
 * API calls (parallel via Promise.all):
 *   GET /users/:id          → profile data (name, bio, skills, hourlyRate, etc.)
 *   GET /users/:id/reviews  → array of review objects with rating + comment
 *
 * Loading / error handling:
 *   Loading state → full-page spinner.
 *   Profile not found → minimal message + "Back to Jobs" link.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, Briefcase, DollarSign, ExternalLink, ArrowLeft, Award, MessageSquare } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";

// ── Stars sub-component ─────────────────────────────────────────────────────
/**
 * Stars — renders a 5-star rating row.
 *
 * Uses fill prop on each Star icon: filled (amber) for stars at or below
 * the rounded integer rating, outlined (grey) for the rest.
 * The numeric score is shown alongside for precise context.
 *
 * @param {number} rating — float from 0 to 5
 */
const Stars = ({ rating }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star
        key={n}
        size={14}
        fill={n <= Math.round(rating) ? "#FBBF24" : "none"}
        color={n <= Math.round(rating) ? "#FBBF24" : "#CBD5E1"}
      />
    ))}
    {/* toFixed(1) — always shows one decimal (e.g. "4.0" not "4") */}
    <span style={{ marginLeft: 4, fontSize: "0.82rem", color: "#64748B", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>
      {Number(rating).toFixed(1)}
    </span>
  </div>
);

// ── Main page component ─────────────────────────────────────────────────────
const FreelancerProfilePage = () => {
  const { id } = useParams();   // freelancer's user ID from the URL

  const [profile, setProfile] = useState(null);   // user object
  const [reviews, setReviews] = useState([]);     // reviews left by clients
  const [loading, setLoading] = useState(true);

  // ── Parallel fetch ────────────────────────────────────────────────────
  // Promise.all fires both requests simultaneously — faster than sequential.
  // If either fails, catch() sets profile to null → not-found state renders.
  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/reviews`)
    ])
      .then(([p, r]) => { setProfile(p.data.data); setReviews(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading guard ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="page"><Navbar />
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Spinner size="lg" />
      </div>
    </div>
  );

  // ── Not-found guard ───────────────────────────────────────────────────
  if (!profile) return (
    <div className="page"><Navbar />
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <p style={{ color: "#64748B", fontSize: "1rem" }}>Freelancer not found.</p>
        <Link to="/jobs" className="btn-outline" style={{ marginTop: 16, display: "inline-flex", padding: "10px 24px" }}>
          Back to Jobs
        </Link>
      </div>
    </div>
  );

  // ── Avatar initials ───────────────────────────────────────────────────
  // Split on spaces → first char of each word → uppercase → first 2 chars.
  // "Jane Doe Smith" → ["J","D","S"] → "JD"
  const initials = profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Two decorative radial glow spots for header depth */}
        <div style={{ position: "absolute", top: "-40%", right: "-5%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60%", left: "10%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative" }}>
          {/* Back link to job listings */}
          <Link to="/jobs"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.84rem", marginBottom: 20, fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
            <ArrowLeft size={14} /> Back to Jobs
          </Link>

          {/* ── Avatar + name row ───────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/*
              Avatar uses glass-hero style (dark context):
              rgba(255,255,255,0.15) background, blur(16px), white border.
              inset box-shadow adds a top highlight — "glass edge" effect.
            */}
            <div style={{
              width: 84, height: 84, borderRadius: 22,
              background:           "rgba(255,255,255,0.15)",
              backdropFilter:       "blur(16px) saturate(160%)",
              WebkitBackdropFilter: "blur(16px) saturate(160%)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)"
            }}>
              <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "white", fontSize: "1.8rem" }}>
                {initials}
              </span>
            </div>

            <div>
              <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.7rem", letterSpacing: "-0.02em" }}>
                {profile.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                {/* Only show rating if the freelancer has at least one review */}
                {profile.averageRating > 0 && <Stars rating={profile.averageRating} />}
                {/* Only show hourly rate if one has been set */}
                {profile.hourlyRate > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "4px 12px", borderRadius: 999,
                    /* Glass pill on dark background = glass-hero variant */
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "white", fontSize: "0.86rem", fontFamily: "Poppins,sans-serif", fontWeight: 700
                  }}>
                    <DollarSign size={13} /> ${profile.hourlyRate}/hr
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="container" style={{ padding: "32px 24px" }}>
        {/*
          Two-column layout: 280px fixed sidebar + 1fr fluid main.
          profile-grid class collapses to 1fr on mobile (see <style> below).
        */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }} className="profile-grid">

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Stats card */}
            <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: "24px" }}>
              {/* Section header with gradient icon box */}
              <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={13} color="white" />
                </span>
                Stats
              </h3>
              {/* Rows with hairline bottom borders — hidden on the last row */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(224,242,254,0.7)" }}>
                  <span style={{ fontSize: "0.82rem", color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                    <Briefcase size={13} color="#94A3B8" /> Jobs Completed
                  </span>
                  <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E" }}>{profile.totalJobsCompleted}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(224,242,254,0.7)" }}>
                  <span style={{ fontSize: "0.82rem", color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={13} color="#94A3B8" /> Reviews
                  </span>
                  <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E" }}>{reviews.length}</span>
                </div>
                {/* Rating row — only rendered if there's at least one review */}
                {profile.averageRating > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 11 }}>
                    <span style={{ fontSize: "0.82rem", color: "#64748B" }}>Avg Rating</span>
                    <Stars rating={profile.averageRating} />
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio links card — only rendered if portfolio array is non-empty */}
            {profile.portfolioLinks?.length > 0 && (
              <div className="glass animate-fade-up delay-100" style={{ borderRadius: 20, padding: "24px" }}>
                <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <ExternalLink size={13} color="white" />
                  </span>
                  Portfolio
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.portfolioLinks.map((link, i) => (
                    /*
                      Opens in a new tab (target="_blank") with rel="noopener noreferrer"
                      to prevent the opened tab from accessing window.opener (security).
                      Link text is truncated to 30 chars to fit the narrow sidebar.
                    */
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: "0.82rem", color: "#0369A1", textDecoration: "none",
                        padding: "8px 12px",
                        background: "rgba(3,105,161,0.07)", backdropFilter: "blur(6px)",
                        border: "1px solid rgba(14,165,233,0.2)",
                        borderRadius: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(3,105,161,0.14)"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(3,105,161,0.07)"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.2)"; }}>
                      <ExternalLink size={12} />
                      {/* Strip protocol prefix for cleaner display; add "…" if long */}
                      {link.replace(/^https?:\/\//, "").slice(0, 30)}{link.length > 36 ? "…" : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Main content column ─────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* About / bio — only shown if bio is set */}
            {profile.bio && (
              <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: "28px" }}>
                <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem", marginBottom: 14 }}>About</h2>
                {/* lineHeight: 1.78 — generous leading for long-form bio text */}
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.78 }}>{profile.bio}</p>
              </div>
            )}

            {/* Skills chip cloud — only shown if skills array is non-empty */}
            {profile.skills?.length > 0 && (
              <div className="glass animate-fade-up delay-100" style={{ borderRadius: 20, padding: "28px" }}>
                <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem", marginBottom: 16 }}>Skills</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {profile.skills.map(s => (
                    /*
                      Skill chip: glass tint (8% brand-blue) + cyan border (25% opacity).
                      Matches the same chip style used in JobDetailPage required skills section
                      for visual consistency across the app.
                    */
                    <span key={s} style={{
                      padding: "6px 14px",
                      background:     "rgba(3,105,161,0.08)",
                      backdropFilter: "blur(8px)",
                      color: "#0369A1", borderRadius: 10,
                      fontSize: "0.82rem", fontFamily: "Poppins,sans-serif", fontWeight: 600,
                      border: "1px solid rgba(14,165,233,0.25)"
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Reviews section ──────────────────────────────────── */}
            <div className="glass animate-fade-up delay-200" style={{ borderRadius: 20, padding: "28px" }}>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem", marginBottom: reviews.length > 0 ? 22 : 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquare size={13} color="white" />
                </span>
                Reviews
                {/* Count in muted text — secondary info, not the headline */}
                <span style={{ fontFamily: "Open Sans,sans-serif", fontWeight: 400, color: "#94A3B8", fontSize: "0.85rem" }}>
                  ({reviews.length})
                </span>
              </h2>

              {reviews.length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "#94A3B8", paddingTop: 12 }}>No reviews yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {reviews.map((r, i) => (
                    <div key={r.id} style={{
                      padding: "18px 0",
                      /* Hairline separator between reviews; last review has no border */
                      borderBottom: i < reviews.length - 1 ? "1px solid rgba(224,242,254,0.7)" : "none"
                    }}>
                      {/* Rating row + date */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <Stars rating={r.rating} />
                        <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      {/* Job title that generated this review — helps context */}
                      {r.job && (
                        <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: 6 }}>
                          For: <span style={{ color: "#0369A1", fontWeight: 600 }}>{r.job.title}</span>
                        </p>
                      )}
                      {/* Review comment body — may be null if client only left a rating */}
                      {r.comment && (
                        <p style={{ fontSize: "0.875rem", color: "#475569", lineHeight: 1.68 }}>{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Responsive: collapse two-column grid to single column on mobile */}
      <style>{`@media(max-width:768px){ .profile-grid{grid-template-columns:1fr!important;} }`}</style>
    </div>
  );
};

export default FreelancerProfilePage;
