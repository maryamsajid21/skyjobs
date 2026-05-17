/**
 * MyJobsPage — client's personal job management dashboard.
 *
 * Shows a table of all jobs posted by the currently authenticated client.
 * Each row has:
 *   • Title (links to the public job detail page)
 *   • Category, budget range, bid count, deadline, status
 *   • Actions: view (always) | delete (only if open AND 0 bids)
 *
 * Delete guard: a job with existing bids cannot be deleted here — the server
 * also enforces this, but the button is hidden in the UI to avoid confusing
 * the user with an error after clicking.
 *
 * API: GET /jobs/my/jobs — returns only jobs belonging to req.user
 *      DELETE /jobs/:id  — protected; server checks ownership
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Briefcase, Eye, Trash2 } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

const MyJobsPage = () => {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();   // available for programmatic navigation if needed

  // ── Fetch on mount ────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/jobs/my/jobs")
      .then(({ data }) => setJobs(data.data))
      .catch(() => {})            // silently fail — empty state handles it
      .finally(() => setLoading(false));
  }, []);

  // ── Delete handler ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      // Optimistic UI update — remove locally without a refetch
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete");
    }
  };

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Ambient glow spot — purely decorative depth behind the glass content */}
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative" }}>
          <div>
            <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>My Jobs</h1>
            {/* Dynamic pluralisation: "1 job" vs "3 jobs" */}
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 6 }}>
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
            </p>
          </div>
          {/* Primary CTA to post another job */}
          <Link to="/post-job" className="btn-cta" style={{ padding: "11px 24px" }}>
            <Plus size={15} /> Post New Job
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── Loading state ────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Spinner size="lg" />
          </div>

        ) : jobs.length === 0 ? (
          /* ── Empty state ────────────────────────────────────────── */
          /*
            animate-scale-in: pops in with a slight scale (0.95 → 1) transition
            for a satisfying "nothing here yet" reveal.
          */
          <div className="glass animate-scale-in" style={{ borderRadius: 20, padding: "68px 24px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 6px 20px rgba(3,105,161,0.3)" }}>
              <Briefcase size={30} color="white" />
            </div>
            <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 8, fontSize: "1.1rem" }}>No jobs posted yet</h3>
            <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 26 }}>Post your first job and start receiving bids from skilled freelancers.</p>
            <Link to="/post-job" className="btn-cta" style={{ padding: "11px 28px" }}>
              <Plus size={15} /> Post a Job
            </Link>
          </div>

        ) : (
          /* ── Jobs table ─────────────────────────────────────────── */
          /*
            Wrapped in a glass card with overflow:hidden so the table's border-
            collapse doesn't bleed outside the rounded container.
            overflowX:auto on the inner div allows horizontal scrolling on narrow
            screens without breaking the outer card shape.
          */
          <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "rgba(3,105,161,0.06)", borderBottom: "1px solid rgba(224,242,254,0.8)" }}>
                    {["Job Title", "Category", "Budget", "Bids", "Deadline", "Status", "Actions"].map(h => (
                      <th key={h} style={{
                        padding: "14px 20px", textAlign: "left",
                        fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#64748B",
                        fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap"
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <tr key={job.id}
                      /* Hairline separator between rows, hidden on the last row */
                      style={{ borderBottom: i < jobs.length - 1 ? "1px solid rgba(240,249,255,0.9)" : "none", transition: "background 0.18s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(3,105,161,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                      {/* Title — links to public detail page */}
                      <td style={{ padding: "15px 20px" }}>
                        <Link to={`/jobs/${job.id}`}
                          style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.88rem" }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                          {job.title}
                        </Link>
                      </td>

                      <td style={{ padding: "15px 20px", color: "#64748B", whiteSpace: "nowrap", fontSize: "0.84rem" }}>{job.category}</td>

                      {/* Budget displayed as a green range — green = money / success */}
                      <td style={{ padding: "15px 20px", fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#22C55E", whiteSpace: "nowrap" }}>
                        ${job.budgetMin}–${job.budgetMax}
                      </td>

                      {/* Bid count pill */}
                      <td style={{ padding: "15px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px",
                          background: "rgba(3,105,161,0.08)", border: "1px solid rgba(14,165,233,0.2)",
                          color: "#0369A1", borderRadius: 7,
                          fontSize: "0.72rem", fontWeight: 700, fontFamily: "Poppins,sans-serif"
                        }}>
                          {/* Nullish coalesce: bidCount may not be on older records */}
                          {job.bidCount ?? 0} bids
                        </span>
                      </td>

                      <td style={{ padding: "15px 20px", color: "#64748B", whiteSpace: "nowrap", fontSize: "0.84rem" }}>
                        {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      {/* StatusBadge handles all known statuses with colour-coded pills */}
                      <td style={{ padding: "15px 20px" }}>
                        <StatusBadge status={job.status} />
                      </td>

                      {/* ── Action buttons ──────────────────────────────── */}
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {/* View — always shown */}
                          <Link to={`/jobs/${job.id}`} title="View"
                            style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(3,105,161,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369A1", textDecoration: "none", transition: "all 0.2s", border: "1px solid rgba(14,165,233,0.18)" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#075985,#0EA5E9)"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(3,105,161,0.3)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(3,105,161,0.08)"; e.currentTarget.style.color = "#0369A1"; e.currentTarget.style.boxShadow = "none"; }}>
                            <Eye size={13} />
                          </Link>

                          {/*
                            Delete — only shown for open jobs with no bids.
                            Once bids exist, deleting would orphan them in the DB.
                          */}
                          {job.status === "open" && (job.bidCount === 0) && (
                            <button onClick={() => handleDelete(job.id)} title="Delete"
                              style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(254,242,242,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", transition: "all 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(254,242,242,0.9)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.boxShadow = "none"; }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobsPage;
