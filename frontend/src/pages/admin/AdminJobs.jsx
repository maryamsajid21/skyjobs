/**
 * AdminJobs — paginated job listing management table.
 *
 * Similar structure to AdminUsers but for job listings.
 * Features:
 *   • Live search by title or client name
 *   • Status filter (all / open / in_progress / completed / cancelled)
 *   • View link to the public job detail page
 *   • Permanent delete with confirmation dialog
 *   • Server-side pagination
 *
 * API:
 *   GET /admin/jobs?page=N&search=X&status=Y → { jobs[], total, pages }
 *   DELETE /admin/jobs/:id                    → permanent removal
 *
 * Delete note: the backend cascades the deletion to bids and reviews
 * associated with the job, so the admin does not need to clean those up manually.
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Briefcase, Eye, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import StatusBadge from "../../components/StatusBadge";
import Spinner from "../../components/Spinner";

const AdminJobs = () => {
  const [jobs,    setJobs]    = useState([]);
  const [meta,    setMeta]    = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");   // free-text search against title/client
  const [status,  setStatus]  = useState("");   // "" = all statuses
  const [page,    setPage]    = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────
  // Memoised so the useEffect dependency array stays stable between renders
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get("/admin/jobs", { params });
      setJobs(data.data.jobs);
      setMeta({ total: data.data.total, pages: data.data.pages });
    } catch {} finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this job listing?")) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchJobs();   // refetch to update the table
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      {/*
        Purple radial glow (vs. indigo on AdminUsers) differentiates the two
        admin sections while keeping the same structural pattern.
      */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <Link to="/admin"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.84rem", marginBottom: 18, fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
            <ArrowLeft size={14} /> Admin Dashboard
          </Link>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>Manage Jobs</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 6 }}>{meta.total} total job listings</p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        {/* Page resets to 1 on filter change to avoid empty pages */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input type="text" placeholder="Search by title or client…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-base" style={{ paddingLeft: 40, fontSize: "0.88rem" }} />
          </div>
          {/* Status filter matches the job status values used by StatusBadge */}
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-base" style={{ width: 180, fontSize: "0.88rem" }}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* ── Loading state ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Spinner size="lg" /></div>
        ) : (
          <>
            {/* ── Glass table ──────────────────────────────────────── */}
            <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(3,105,161,0.06)", borderBottom: "1px solid rgba(224,242,254,0.8)" }}>
                      {["Job Title", "Client", "Category", "Budget", "Bids", "Status", "Posted", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.length === 0 ? (
                      /* Empty state — same pattern as AdminUsers */
                      <tr><td colSpan={8} style={{ padding: "56px", textAlign: "center", color: "#94A3B8" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          {/* Purple gradient matches the Manage Jobs NavCard in AdminDashboard */}
                          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7C3AED,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Briefcase size={24} color="white" />
                          </div>
                          <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, color: "#64748B" }}>No jobs found</p>
                        </div>
                      </td></tr>
                    ) : jobs.map((job, i) => (
                      <tr key={job.id}
                        style={{ borderBottom: i < jobs.length - 1 ? "1px solid rgba(240,249,255,0.9)" : "none", transition: "background 0.18s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(3,105,161,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                        {/* Title — links to the public job detail page so admin can inspect it */}
                        <td style={{ padding: "15px 20px" }}>
                          <Link to={`/jobs/${job.id}`}
                            style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.88rem", display: "block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                            {job.title}
                          </Link>
                        </td>

                        {/* Client name — shows who posted the job */}
                        <td style={{ padding: "15px 20px", color: "#64748B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{job.client?.name}</td>
                        <td style={{ padding: "15px 20px", color: "#64748B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>{job.category}</td>

                        {/* Budget in green — consistent with all other budget displays in the app */}
                        <td style={{ padding: "15px 20px", fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#22C55E", whiteSpace: "nowrap" }}>
                          ${job.budgetMin}–${job.budgetMax}
                        </td>

                        {/* Bid count pill */}
                        <td style={{ padding: "15px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", background: "rgba(3,105,161,0.08)", color: "#0369A1", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 7, fontSize: "0.72rem", fontFamily: "Poppins,sans-serif", fontWeight: 700 }}>
                            {job.bidCount ?? 0}
                          </span>
                        </td>

                        {/* StatusBadge handles open/in_progress/completed/cancelled */}
                        <td style={{ padding: "15px 20px" }}><StatusBadge status={job.status} /></td>

                        <td style={{ padding: "15px 20px", color: "#64748B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                          {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>

                        {/* ── Actions ──────────────────────────────────── */}
                        <td style={{ padding: "15px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {/* View — takes admin to the public job page */}
                            <Link to={`/jobs/${job.id}`} title="View"
                              style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(3,105,161,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369A1", textDecoration: "none", transition: "all 0.2s", border: "1px solid rgba(14,165,233,0.18)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#075985,#0EA5E9)"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(3,105,161,0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(3,105,161,0.08)"; e.currentTarget.style.color = "#0369A1"; e.currentTarget.style.boxShadow = "none"; }}>
                              <Eye size={14} />
                            </Link>
                            {/* Remove — permanently deletes the listing (with backend cascade) */}
                            <button onClick={() => handleDelete(job.id)} title="Remove"
                              style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.boxShadow = "none"; }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {meta.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.8)", color: "#0369A1", fontSize: "0.85rem", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.2s" }}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontSize: "0.85rem", color: "#64748B", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>
                  Page {page} of {meta.pages}
                </span>
                <button disabled={page === meta.pages} onClick={() => setPage(page + 1)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.8)", color: "#0369A1", fontSize: "0.85rem", cursor: page === meta.pages ? "not-allowed" : "pointer", opacity: page === meta.pages ? 0.4 : 1, fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.2s" }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
