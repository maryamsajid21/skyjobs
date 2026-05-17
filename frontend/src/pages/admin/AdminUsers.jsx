/**
 * AdminUsers — paginated user management table.
 *
 * Features:
 *   • Live search by name or email (debounced by the API via query param)
 *   • Role filter dropdown (all / client / freelancer)
 *   • Suspend / Activate toggle per user
 *   • Permanent delete with a confirmation dialog
 *   • Server-side pagination (prev / next buttons)
 *
 * API:
 *   GET /admin/users?page=N&search=X&role=Y → { users[], total, pages }
 *   PATCH /admin/users/:id/suspend           → marks isActive=false
 *   PATCH /admin/users/:id/activate          → marks isActive=true
 *   DELETE /admin/users/:id                  → permanent deletion
 *
 * Re-fetch strategy:
 *   `fetchUsers` is memoised with useCallback — its identity only changes when
 *   search/role/page change, so the useEffect dependency array stays accurate.
 *   Any mutation (suspend, activate, delete) calls fetchUsers() directly to
 *   re-sync the table without an optimistic UI approach.
 */

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Users, ShieldOff, ShieldCheck, Trash2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";

// ── Role badge colour map ────────────────────────────────────────────────────
// Each role gets its own tint; the rgba backgrounds work transparently over the
// glass card so the page gradient subtly shows through.
const ROLE_CFG = {
  client:     { bg: "rgba(3,105,161,0.08)",   color: "#0369A1", border: "rgba(14,165,233,0.2)",   label: "Client"     },
  freelancer: { bg: "rgba(124,58,237,0.08)",  color: "#7C3AED", border: "rgba(167,139,250,0.25)", label: "Freelancer" },
  admin:      { bg: "rgba(21,128,61,0.08)",   color: "#15803D", border: "rgba(34,197,94,0.2)",    label: "Admin"      },
};

const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [meta,    setMeta]    = useState({ total: 0, pages: 1 }); // pagination metadata
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");     // live search input
  const [role,    setRole]    = useState("");     // "" = show all roles
  const [page,    setPage]    = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────
  // useCallback: re-creates only when dependencies change, so the
  // useEffect below doesn't loop on every render.
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Build params incrementally — omit empty values to keep the URL clean
      const params = { page };
      if (search) params.search = search;
      if (role)   params.role   = role;
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.data.users);
      setMeta({ total: data.data.total, pages: data.data.pages });
    } catch {} finally { setLoading(false); }
  }, [search, role, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Suspend / Activate ────────────────────────────────────────────────
  // isActive is the current state — true → suspend, false → activate
  const handleSuspend = async (id, isActive) => {
    try {
      await api.patch(`/admin/users/${id}/${isActive ? "suspend" : "activate"}`);
      fetchUsers();   // refetch to reflect the new isActive value
    } catch (err) { alert(err.response?.data?.message || "Action failed"); }
  };

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          {/* Back link — returns to admin dashboard */}
          <Link to="/admin"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.84rem", marginBottom: 18, fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
            <ArrowLeft size={14} /> Admin Dashboard
          </Link>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>Manage Users</h1>
          {/* meta.total shows all users, not just the current page slice */}
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 6 }}>{meta.total} registered users</p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        {/*
          Search resets page to 1 on change — prevents "page 4 of 1" situations
          when a search yields fewer results than the current page offset.
          Same for the role dropdown.
        */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
            {/* Decorative search icon — pointerEvents:none so it doesn't block click */}
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            <input type="text" placeholder="Search by name or email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-base" style={{ paddingLeft: 40, fontSize: "0.88rem" }} />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
            className="input-base" style={{ width: 160, fontSize: "0.88rem" }}>
            <option value="">All Roles</option>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        {/* ── Loading state ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}><Spinner size="lg" /></div>
        ) : (
          <>
            {/* ── Glass table container ──────────────────────────── */}
            {/*
              overflow:hidden on the outer card clips the table's borders to the
              card's rounded corners without needing extra border-radius on the table.
              overflowX:auto on the inner div allows horizontal scroll on mobile.
            */}
            <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                  <thead>
                    {/* Tinted header row — 6% brand-blue tint distinguishes it from data rows */}
                    <tr style={{ background: "rgba(3,105,161,0.06)", borderBottom: "1px solid rgba(224,242,254,0.8)" }}>
                      {["User", "Email", "Role", "Joined", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#64748B", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      /* Empty state — centred icon + message inside the table */
                      <tr><td colSpan={6} style={{ padding: "56px", textAlign: "center", color: "#94A3B8" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Users size={24} color="white" />
                          </div>
                          <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, color: "#64748B" }}>No users found</p>
                        </div>
                      </td></tr>
                    ) : users.map((u, i) => {
                      // Role config falls back to client styling for any unknown role string
                      const rc = ROLE_CFG[u.role] || ROLE_CFG.client;
                      return (
                        <tr key={u.id}
                          /* Hairline separator between rows — hidden on the last row */
                          style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(240,249,255,0.9)" : "none", transition: "background 0.18s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(3,105,161,0.03)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                          {/* Name cell — gradient circle avatar + name */}
                          <td style={{ padding: "15px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {/* Avatar circle with gradient background and first initial */}
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "white", fontSize: "0.82rem" }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem" }}>{u.name}</span>
                            </div>
                          </td>

                          <td style={{ padding: "15px 20px", color: "#64748B", fontSize: "0.82rem" }}>{u.email}</td>

                          {/* Role pill — colour from ROLE_CFG above */}
                          <td style={{ padding: "15px 20px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 7, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, fontSize: "0.72rem", fontFamily: "Poppins,sans-serif", fontWeight: 700 }}>
                              {rc.label}
                            </span>
                          </td>

                          <td style={{ padding: "15px 20px", color: "#64748B", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>

                          {/* Active / Suspended status pill */}
                          <td style={{ padding: "15px 20px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 7,
                              /* Green for active, red for suspended — universal convention */
                              background: u.isActive ? "rgba(21,128,61,0.08)" : "rgba(220,38,38,0.08)",
                              color:      u.isActive ? "#15803D"               : "#DC2626",
                              border:     `1px solid ${u.isActive ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                              fontSize: "0.72rem", fontFamily: "Poppins,sans-serif", fontWeight: 700
                            }}>
                              {u.isActive ? "Active" : "Suspended"}
                            </span>
                          </td>

                          {/* ── Action buttons ───────────────────────── */}
                          <td style={{ padding: "15px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {/* Suspend/Activate — icon and colours flip based on current isActive */}
                              <button onClick={() => handleSuspend(u.id, u.isActive)}
                                title={u.isActive ? "Suspend" : "Activate"}
                                style={{
                                  width: 32, height: 32, borderRadius: 9, border: "none", cursor: "pointer", transition: "all 0.2s",
                                  /* Amber for suspend (caution), green for activate (positive) */
                                  background: u.isActive ? "rgba(217,119,6,0.1)" : "rgba(21,128,61,0.1)",
                                  color:      u.isActive ? "#D97706"              : "#15803D",
                                  display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = u.isActive ? "#D97706" : "#15803D"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = u.isActive ? "0 4px 12px rgba(217,119,6,0.3)" : "0 4px 12px rgba(21,128,61,0.3)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = u.isActive ? "rgba(217,119,6,0.1)" : "rgba(21,128,61,0.1)"; e.currentTarget.style.color = u.isActive ? "#D97706" : "#15803D"; e.currentTarget.style.boxShadow = "none"; }}>
                                {u.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              </button>

                              {/* Delete — permanently removes the user */}
                              <button onClick={() => handleDelete(u.id)} title="Delete"
                                style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "white"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.3)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.boxShadow = "none"; }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            {/* Only shown when there is more than one page of results */}
            {meta.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
                {/* Prev — disabled on first page; cursor changes to not-allowed */}
                <button disabled={page === 1} onClick={() => setPage(page - 1)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10,
                    background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.8)", color: "#0369A1",
                    fontSize: "0.85rem", cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.4 : 1,   /* faded = disabled */
                    fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.2s"
                  }}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <span style={{ fontSize: "0.85rem", color: "#64748B", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>
                  Page {page} of {meta.pages}
                </span>
                {/* Next — disabled on the last page */}
                <button disabled={page === meta.pages} onClick={() => setPage(page + 1)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 10,
                    background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.8)", color: "#0369A1",
                    fontSize: "0.85rem", cursor: page === meta.pages ? "not-allowed" : "pointer",
                    opacity: page === meta.pages ? 0.4 : 1,
                    fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.2s"
                  }}>
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

export default AdminUsers;
