/**
 * AdminDashboard — platform-wide analytics and navigation hub.
 *
 * Only accessible to users with role="admin" (enforced at the router level
 * via ProtectedRoute + requireRole middleware on the backend).
 *
 * Displays:
 *   • 6 stat cards (total users, jobs, bids; open/in-progress/completed jobs)
 *   • 2 navigation cards linking to the user and job management tables
 *
 * API: GET /admin/stats → { totalUsers, totalJobs, totalBids, openJobs, activeJobs, completedJobs }
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, Send, TrendingUp, CheckCircle, BarChart3, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import Spinner from "../../components/Spinner";

// ── StatCard sub-component ──────────────────────────────────────────────────
/**
 * StatCard — glass metric tile with a gradient icon box.
 *
 * Props:
 *   label — upper-case label text (e.g. "Total Users")
 *   value — numeric value from the stats API; shows "–" while loading
 *   icon  — Lucide icon component rendered inside the gradient box
 *   grad  — CSS gradient string for the icon box background
 *   delay — optional CSS class name suffix for stagger (e.g. "100" → delay-100)
 */
const StatCard = ({ label, value, icon: Icon, grad, delay }) => (
  /*
    glass: rgba(255,255,255,0.72) + blur(18px) + white border.
    animate-fade-up + optional delay-N for cascading entrance.
  */
  <div className={`glass animate-fade-up${delay ? ` delay-${delay}` : ""}`}
    style={{ borderRadius: 20, padding: "24px", display: "flex", alignItems: "flex-start", gap: 16 }}>

    {/* Gradient icon box — colour encodes stat category at a glance */}
    <div style={{
      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      /* Brand blue glow — consistent 22% opacity shadow across all icon boxes */
      boxShadow: "0 6px 18px rgba(3,105,161,0.22)"
    }}>
      <Icon size={22} color="white" />
    </div>

    <div>
      {/* Upper-case tiny label — readable but does not compete with the number */}
      <p style={{ fontSize: "0.74rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>
        {label}
      </p>
      {/* Large bold metric — 2rem / 800 weight makes it immediately scannable */}
      <p style={{ fontSize: "2rem", fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", lineHeight: 1 }}>
        {value ?? "–"}   {/* nullish fallback for pre-load state */}
      </p>
    </div>
  </div>
);

// ── NavCard sub-component ───────────────────────────────────────────────────
/**
 * NavCard — glass link tile for the management section.
 *
 * card-hover class adds `transform: translateY(-3px)` on hover (index.css).
 * The ArrowRight icon on the far right signals it is navigable (chevron affordance).
 */
const NavCard = ({ to, icon: Icon, grad, title, sub, delay }) => (
  <Link to={to}
    className={`card-hover glass animate-fade-up${delay ? ` delay-${delay}` : ""}`}
    style={{ borderRadius: 20, padding: "28px", textDecoration: "none", display: "flex", alignItems: "center", gap: 20 }}>

    {/* Slightly larger icon box (60px) than StatCard to fill the bigger card */}
    <div style={{
      width: 60, height: 60, borderRadius: 17, flexShrink: 0,
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 6px 18px rgba(3,105,161,0.22)"
    }}>
      <Icon size={26} color="white" />
    </div>

    {/* Text block takes available space between icon and arrow */}
    <div style={{ flex: 1 }}>
      <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem" }}>{title}</h3>
      <p style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 4 }}>{sub}</p>
    </div>

    {/* Muted arrow — navigation affordance without competing with the title */}
    <ArrowRight size={18} color="#CBD5E1" />
  </Link>
);

// ── Main component ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);    // null = not yet loaded
  const [loading, setLoading] = useState(true);

  // Single API call on mount — no polling; admin refreshes manually
  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data.data))
      .catch(() => {})          // silently fail — stat tiles show "–" on error
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />

      {/* ── Gradient page header ─────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "40px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Two decorative radial glows for layered depth — indigo + cyan */}
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-50%", left: "5%", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          {/* Glass icon box for the shield — same glass-hero style (dark bg context) */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background:           "rgba(255,255,255,0.15)",
            backdropFilter:       "blur(16px)",
            border: "1px solid rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)"   /* top highlight = glass edge */
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>Admin Dashboard</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 4 }}>Platform-wide overview and controls</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── Loading state ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* ── Stats grid ────────────────────────────────────────── */}
            {/*
              3-column grid on desktop; responsive classes collapse to 2 and 1
              column on tablets and phones respectively (see <style> below).

              Gradient colour coding:
                Blue   — user/platform metrics (neutral, informational)
                Purple — job volume (jobs are the product)
                Cyan   — bid activity (transactional, high-frequency)
                Amber  — in-progress / active (temporal, requires attention)
                Green  — completed (positive outcome)
            */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }} className="admin-stats">
              <StatCard label="Total Users"  value={stats?.totalUsers}    icon={Users}       grad="linear-gradient(135deg,#0369A1,#0EA5E9)" />
              <StatCard label="Total Jobs"   value={stats?.totalJobs}     icon={Briefcase}   grad="linear-gradient(135deg,#7C3AED,#A78BFA)" delay="100" />
              <StatCard label="Total Bids"   value={stats?.totalBids}     icon={Send}        grad="linear-gradient(135deg,#0891B2,#22D3EE)" delay="200" />
              <StatCard label="Open Jobs"    value={stats?.openJobs}      icon={BarChart3}   grad="linear-gradient(135deg,#075985,#0EA5E9)" delay="100" />
              <StatCard label="In Progress"  value={stats?.activeJobs}    icon={TrendingUp}  grad="linear-gradient(135deg,#D97706,#FCD34D)" delay="200" />
              <StatCard label="Completed"    value={stats?.completedJobs} icon={CheckCircle} grad="linear-gradient(135deg,#15803D,#22C55E)" delay="300" />
            </div>

            {/* ── Management section ────────────────────────────────── */}
            {/* Upper-case section label — acts as a visual separator */}
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.95rem", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Management
            </h2>
            {/* 2-column NavCards on desktop; collapses to 1 on tablets (see <style>) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }} className="admin-nav">
              <NavCard to="/admin/users" icon={Users}    grad="linear-gradient(135deg,#0369A1,#0EA5E9)" title="Manage Users" sub="View, suspend, or delete user accounts" />
              <NavCard to="/admin/jobs"  icon={Briefcase} grad="linear-gradient(135deg,#7C3AED,#A78BFA)" title="Manage Jobs"  sub="View and remove job listings" delay="100" />
            </div>
          </>
        )}
      </div>

      {/* Responsive breakpoints for the two grid sections defined above */}
      <style>{`
        @media(max-width:900px){ .admin-stats{grid-template-columns:repeat(2,1fr)!important;} .admin-nav{grid-template-columns:1fr!important;} }
        @media(max-width:500px){ .admin-stats{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
