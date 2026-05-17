/**
 * MyBidsPage — freelancer's bid history and management.
 *
 * Shows all bids submitted by the currently authenticated freelancer.
 * Features:
 *   • Filter pills (All / Pending / Accepted / Rejected) — client-side filtering
 *     of the already-fetched bids array (no re-fetch per filter change).
 *   • Bid cards showing job title, client name, cover letter preview,
 *     proposed price, estimated delivery, and submission date.
 *   • Withdraw button — only on pending bids; triggers DELETE /bids/:id.
 *
 * API:
 *   GET /bids/my/bids  — returns all bids for req.user
 *   DELETE /bids/:id   — protected; server checks ownership
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, Briefcase, Clock, DollarSign, Calendar, FileText, X } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

const MyBidsPage = () => {
  const [bids,    setBids]    = useState([]);
  const [loading, setLoading] = useState(true);
  // Filter key — "all" means no filtering, otherwise matched against bid.status
  const [filter,  setFilter]  = useState("all");

  // ── Fetch helper ──────────────────────────────────────────────────────
  // Extracted to a named function so it can be called after a withdraw action
  const fetchBids = () => {
    setLoading(true);
    api.get("/bids/my/bids")
      .then(({ data }) => setBids(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBids(); }, []);

  // ── Withdraw handler ──────────────────────────────────────────────────
  const handleWithdraw = async (id) => {
    if (!window.confirm("Withdraw this bid?")) return;
    try {
      await api.delete(`/bids/${id}`);
      fetchBids();   // refetch to get updated statuses (backend may set "withdrawn")
    } catch (err) {
      alert(err.response?.data?.message || "Cannot withdraw bid");
    }
  };

  // ── Filter pill definitions ───────────────────────────────────────────
  // The count shown in each pill is derived from the full bids array —
  // clicking a filter never triggers a network request.
  const FILTERS = [
    { key: "all",      label: "All Bids" },
    { key: "pending",  label: "Pending"  },
    { key: "accepted", label: "Accepted" },
    { key: "rejected", label: "Rejected" },
  ];

  // Derive filtered list — simple array filter, O(n), fine for typical bid counts
  const filtered = filter === "all" ? bids : bids.filter(b => b.status === filter);

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative glow — indigo hue adds visual interest without clashing with the blue gradient */}
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>My Bids</h1>
          {/* Total proposal count — uses bids (unfiltered) so the number stays stable as filters change */}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 6 }}>
            {bids.length} proposal{bids.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── Filter pills ─────────────────────────────────────────── */}
        {/*
          Each pill shows a count badge for its own status group.
          Active pill: gradient background + white text + drop shadow.
          Inactive pill: glass tile (rgba(255,255,255,0.7)) + blur so the
          page gradient shows through slightly — ties it to the design system.
        */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {FILTERS.map(f => {
            const count  = f.key === "all" ? bids.length : bids.filter(b => b.status === f.key).length;
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  padding: "8px 18px", borderRadius: 999,   /* pill shape */
                  background: active
                    ? "linear-gradient(135deg,#075985,#0EA5E9)"
                    : "rgba(255,255,255,0.7)",
                  backdropFilter:       "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border:  active ? "none" : "1px solid rgba(255,255,255,0.8)",
                  color:   active ? "white" : "#64748B",
                  fontSize: "0.82rem", fontFamily: "Poppins,sans-serif", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.22s",
                  boxShadow: active
                    ? "0 4px 14px rgba(3,105,161,0.3)"
                    : "0 2px 8px rgba(3,105,161,0.06)"
                }}>
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ── Loading state ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Spinner size="lg" />
          </div>

        ) : filtered.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────── */
          <div className="glass animate-scale-in" style={{ borderRadius: 20, padding: "68px 24px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 6px 20px rgba(3,105,161,0.3)" }}>
              <Send size={30} color="white" />
            </div>
            <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 8, fontSize: "1.1rem" }}>
              {/* Message adapts to whether no bids exist at all or filter has 0 results */}
              {filter === "all" ? "No bids yet" : `No ${filter} bids`}
            </h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 26 }}>Browse open jobs and submit your first proposal.</p>
            <Link to="/jobs" className="btn-cta" style={{ padding: "11px 28px" }}>
              <Briefcase size={15} /> Browse Jobs
            </Link>
          </div>

        ) : (
          /* ── Bid cards ───────────────────────────────────────────── */
          /*
            Cards are stacked vertically (flex column).
            Each card gets an `animationDelay` proportional to its index (i * 50ms)
            to create a cascading stagger effect on page load — subtle but satisfying.
          */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((bid, i) => (
              <div key={bid.id}
                className="card-hover glass animate-fade-up"
                /* animationDelay staggers each card by 50ms — perceived as a smooth cascade */
                style={{ borderRadius: 20, padding: "24px", animationDelay: `${i * 0.05}s` }}>

                {/* ── Card header row ───────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Job title — links to the original job page */}
                    <Link to={`/jobs/${bid.job?.id}`}
                      style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", textDecoration: "none", fontSize: "0.98rem" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#0369A1"}
                      onMouseLeave={e => e.currentTarget.style.color = "#0C4A6E"}>
                      {bid.job?.title}
                    </Link>
                    {/* Client name — secondary metadata */}
                    <p style={{ fontSize: "0.77rem", color: "#94A3B8", marginTop: 4 }}>
                      Client: <span style={{ color: "#64748B", fontWeight: 600 }}>{bid.job?.client?.name}</span>
                    </p>
                  </div>
                  {/* Status badge — top-right of each card for immediate scanability */}
                  <StatusBadge status={bid.status} />
                </div>

                {/* ── Cover letter preview ─────────────────────────── */}
                {/*
                  Rendered only when a cover letter was submitted.
                  -webkit-line-clamp: 2 truncates to two lines without JavaScript —
                  uses the legacy flex-based webkit clamp (widely supported in 2024).
                  The 5% opacity blue background and 15% border create a tinted glass
                  inset that visually distinguishes quoted text from card metadata.
                */}
                {bid.coverLetter && (
                  <div style={{
                    background: "rgba(3,105,161,0.05)", backdropFilter: "blur(6px)",
                    border: "1px solid rgba(14,165,233,0.15)",
                    borderRadius: 12, padding: "12px 16px", marginBottom: 16
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <FileText size={12} color="#0369A1" />
                      <span style={{ fontSize: "0.68rem", color: "#0369A1", fontFamily: "Poppins,sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Cover Letter
                      </span>
                    </div>
                    <p style={{
                      fontSize: "0.84rem", color: "#475569", lineHeight: 1.65,
                      /* Two-line truncation — no JS needed, pure CSS */
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {bid.coverLetter}
                    </p>
                  </div>
                )}

                {/* ── Card footer row ───────────────────────────────── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  {/* Meta pills: price, delivery, date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    {/* Proposed price — green = money */}
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <DollarSign size={13} color="#22C55E" />
                      <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#22C55E", fontSize: "1rem" }}>${bid.proposedPrice}</span>
                    </span>
                    {/* Delivery estimate */}
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "#64748B" }}>
                      <Clock size={12} color="#94A3B8" /> {bid.estimatedDeliveryDays} days delivery
                    </span>
                    {/* Submission date — formatted for readability */}
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.76rem", color: "#94A3B8" }}>
                      <Calendar size={12} color="#CBD5E1" />
                      {new Date(bid.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  {/* ── Withdraw button ───────────────────────────── */}
                  {/*
                    Only shown on pending bids — accepted/rejected bids cannot be
                    withdrawn because the client has already acted on them.
                    The glass-red style (semi-transparent red on hover → solid red)
                    signals danger without being alarmist at rest.
                  */}
                  {bid.status === "pending" && (
                    <button onClick={() => handleWithdraw(bid.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 10,
                        border: "1.5px solid rgba(252,165,165,0.7)",
                        background: "rgba(254,242,242,0.85)", backdropFilter: "blur(8px)",
                        color: "#EF4444", fontSize: "0.78rem",
                        fontFamily: "Poppins,sans-serif", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.22s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(254,242,242,0.85)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.boxShadow = "none"; }}>
                      <X size={13} /> Withdraw
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBidsPage;
