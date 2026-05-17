/**
 * RegisterPage — new user sign-up.
 *
 * Two-step UX within a single form:
 *  1. Role picker (freelancer / client) — visual card selection, not a <select>.
 *  2. Standard fields: name, email, password.
 *
 * Auth flow:
 *  POST /auth/register → returns { user, token } → same login() call as LoginPage
 *  → redirect to role-appropriate dashboard.
 *
 * Role picker design rationale:
 *  Cards are clearer than a dropdown for this bifurcated choice — users must
 *  consciously pick their identity before registering, reducing later confusion.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import SkyJobsLogo from "../components/Logo";
import { Mail, Lock, User, Eye, EyeOff, Hammer, Building2, ArrowRight } from "lucide-react";

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────
  // role defaults to "freelancer" — the most common user type on a marketplace
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "freelancer" });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.data.user, data.data.token);
      // Skip the admin dashboard path — admins are created manually, never via register
      navigate(data.data.user.role === "client" ? "/dashboard/client" : "/dashboard/freelancer");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Role card definitions ─────────────────────────────────────────────
  // Defined as data so the JSX below is a clean .map() rather than repeated blocks
  const ROLES = [
    { value: "freelancer", icon: Hammer,   title: "Find Work",   sub: "I'm a Freelancer" },
    { value: "client",     icon: Building2, title: "Hire Talent", sub: "I'm a Client"     },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* ── Brand header ─────────────────────────────────────────── */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ display: "inline-flex", marginBottom: 24, textDecoration: "none" }}>
            <SkyJobsLogo size={52} />
          </Link>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "1.65rem", color: "#0C4A6E", letterSpacing: "-0.02em" }}>
            Create your account
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: 7, lineHeight: 1.6 }}>
            Join thousands of clients and freelancers
          </p>
        </div>

        {/* ── Glass card ───────────────────────────────────────────── */}
        <div className="glass-strong animate-fade-up delay-100" style={{ borderRadius: 24, padding: "38px" }}>

          {/* Inline server error */}
          {error && (
            <div style={{
              marginBottom: 22, padding: "13px 16px",
              background: "rgba(254,242,242,0.9)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(252,165,165,0.8)", borderRadius: 12,
              color: "#B91C1C", fontSize: "0.84rem"
            }}>
              {error}
            </div>
          )}

          {/* ── Role picker ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 26 }}>
            <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 12 }}>
              I want to
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ROLES.map(({ value, icon: Icon, title, sub }) => {
                const active = form.role === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    style={{
                      padding: "18px 14px", borderRadius: 14,
                      /* Active card shows brand-blue border + tinted glass background */
                      border:     `2px solid ${active ? "#0369A1" : "rgba(203,213,225,0.7)"}`,
                      background: active ? "rgba(3,105,161,0.08)" : "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(8px)",
                      cursor: "pointer", transition: "all 0.22s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      /* Glow only on the selected card */
                      boxShadow: active ? "0 4px 16px rgba(3,105,161,0.18)" : "none"
                    }}>
                    {/* Icon box — gradient on selected, light grey on inactive */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: active ? "linear-gradient(135deg,#075985,#0EA5E9)" : "rgba(241,245,249,0.8)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.22s",
                      boxShadow: active ? "0 4px 12px rgba(3,105,161,0.3)" : "none"
                    }}>
                      <Icon size={18} color={active ? "white" : "#64748B"} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: active ? "#0369A1" : "#374151", fontSize: "0.88rem" }}>
                        {title}
                      </p>
                      <p style={{ fontSize: "0.74rem", color: "#64748B", marginTop: 3 }}>{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Form fields ──────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Full name */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  required placeholder="Saba Maryam Maaz"
                  className="input-base" style={{ paddingLeft: 42 }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="input-base" style={{ paddingLeft: 42 }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  type={showPw ? "text" : "password"}
                  name="password" value={form.password} onChange={handleChange}
                  required minLength={6}        /* enforced server-side too */
                  placeholder="Min. 6 characters"
                  className="input-base" style={{ paddingLeft: 42, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: 0, display: "flex", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#0369A1"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary"
              style={{ padding: "13px", fontSize: "0.95rem", marginTop: 4 }}>
              {loading ? <Spinner size="sm" color="white" /> : null}
              {loading ? "Creating account…" : <><span>Create Account</span> <ArrowRight size={16} /></>}
            </button>
          </form>

          {/* ── Footer link ──────────────────────────────────────────── */}
          <div style={{ marginTop: 24, textAlign: "center", paddingTop: 22, borderTop: "1px solid rgba(224,242,254,0.8)" }}>
            <p style={{ fontSize: "0.87rem", color: "#64748B" }}>
              Already have an account?{" "}
              <Link to="/login"
                style={{ color: "#0369A1", fontWeight: 700, textDecoration: "none", fontFamily: "Poppins,sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
