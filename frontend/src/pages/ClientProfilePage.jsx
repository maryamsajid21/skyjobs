{/*
 * ClientProfilePage.jsx
 * =====================
 * Public profile page for a client user, accessible at /client/:id.
 *
 * WHAT THIS PAGE SHOWS
 * --------------------
 * - Client header card  : avatar, name, rating, member-since date, total jobs posted
 * - Jobs posted list    : every job this client has ever posted, with status badge,
 *                         budget range, deadline, bid count, and a link to the job detail page
 *
 * API CALLED
 * ----------
 * GET /users/:id/client-profile — returns client user object merged with their jobs array
 */}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Briefcase, DollarSign, Clock, Users, Calendar } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* Colour maps for category badges — mirrors the same maps in JobDetailPage */
const CAT_COLORS = { "Web Development":"#0369A1","Design & Creative":"#7C3AED","Mobile Apps":"#059669","Writing & Content":"#D97706","Marketing":"#DC2626","Data & Analytics":"#0891B2" };
const CAT_LIGHTS = { "Web Development":"#0EA5E9","Design & Creative":"#A78BFA","Mobile Apps":"#34D399","Writing & Content":"#FCD34D","Marketing":"#F87171","Data & Analytics":"#67E8F9" };

const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data } = await api.get(`/users/${id}/client-profile`);
        setClient(data.data);
      } catch {
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  /* ── Loading state ── */
  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Spinner size="lg" />
      </div>
    </div>
  );

  if (!client) return null;

  const totalJobs = client.jobs?.length ?? 0;
  const openJobs = client.jobs?.filter(j => j.status === "open").length ?? 0;
  const completedJobs = client.jobs?.filter(j => j.status === "completed").length ?? 0;
  const memberSince = new Date(client.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="page">
      <Navbar />

      {/* ── BREADCRUMB BAR ── */}
      <div style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.75)",
        padding: "13px 0"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: "0.84rem", fontFamily: "Open Sans,sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0369A1"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
            <ArrowLeft size={14} /> Back
          </button>
          <span style={{ color: "rgba(203,213,225,0.9)" }}>/</span>
          <span style={{ fontSize: "0.84rem", color: "#0C4A6E", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>
            {client.name}
          </span>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px", maxWidth: 820 }}>

        {/* ── CLIENT HEADER CARD ── */}
        <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: "30px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

            {/* Large avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg,#075985,#0EA5E9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontFamily: "Poppins,sans-serif", fontWeight: 800,
              fontSize: "1.8rem", flexShrink: 0,
              boxShadow: "0 8px 24px rgba(3,105,161,0.35)"
            }}>
              {client.name.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", fontSize: "1.4rem", marginBottom: 6 }}>
                {client.name}
              </h1>
              {/* Rating row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontFamily: "Open Sans,sans-serif", fontSize: "0.82rem", color: "#64748B" }}>
                  {client.averageRating > 0 ? Number(client.averageRating).toFixed(1) : "New client"}
                </span>
              </div>
              {/* Member since */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={12} color="#94A3B8" />
                <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontFamily: "Open Sans,sans-serif" }}>
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* ── STAT TILES ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginTop: 26 }}>
            {[
              { icon: Briefcase, label: "Total Jobs",     value: totalJobs,     grad: "linear-gradient(135deg,#075985,#0EA5E9)" },
              { icon: Users,     label: "Open Jobs",      value: openJobs,      grad: "linear-gradient(135deg,#6D28D9,#A78BFA)" },
              { icon: Star,      label: "Completed",      value: completedJobs, grad: "linear-gradient(135deg,#16A34A,#22C55E)" },
            ].map(({ icon: Icon, label, value, grad }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "rgba(3,105,161,0.06)", borderRadius: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  <Icon size={16} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: "0.68rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1.05rem" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── POSTED JOBS LIST ── */}
        <div className="glass animate-fade-up delay-100" style={{ borderRadius: 20, padding: "26px" }}>
          <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem", marginBottom: 20 }}>
            Posted Jobs ({totalJobs})
          </h2>

          {totalJobs === 0 ? (
            <p style={{ fontSize: "0.88rem", color: "#94A3B8", fontFamily: "Open Sans,sans-serif", textAlign: "center", padding: "32px 0" }}>
              No jobs posted yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {client.jobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    border: "1.5px solid rgba(224,242,254,0.8)",
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 14, padding: "18px",
                    transition: "all 0.22s", cursor: "pointer"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(224,242,254,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.5)"; e.currentTarget.style.transform = "translateY(0)"; }}>

                    {/* Top row: category badge + status */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      <span style={{
                        padding: "2px 10px",
                        background: `linear-gradient(135deg,${CAT_COLORS[job.category] || "#0369A1"},${CAT_LIGHTS[job.category] || "#0EA5E9"})`,
                        color: "white", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700, fontFamily: "Poppins,sans-serif"
                      }}>{job.category}</span>
                      <StatusBadge status={job.status} />
                    </div>

                    {/* Job title */}
                    <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.95rem", marginBottom: 12 }}>
                      {job.title}
                    </p>

                    {/* Meta row: budget, deadline, bids */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <DollarSign size={13} color="#22C55E" />
                        <span style={{ fontSize: "0.78rem", color: "#374151", fontFamily: "Open Sans,sans-serif" }}>
                          ${job.budgetMin} – ${job.budgetMax}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={13} color="#0369A1" />
                        <span style={{ fontSize: "0.78rem", color: "#374151", fontFamily: "Open Sans,sans-serif" }}>
                          {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Users size={13} color="#7C3AED" />
                        <span style={{ fontSize: "0.78rem", color: "#374151", fontFamily: "Open Sans,sans-serif" }}>
                          {job.bidCount ?? 0} bids
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
