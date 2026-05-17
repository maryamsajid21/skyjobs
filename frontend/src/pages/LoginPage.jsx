/**
 * LoginPage — authentication entry point.
 *
 * Layout: vertically centered on the full viewport, using the body's
 * multi-radial gradient as the background (no page wrapper colour needed).
 *
 * Auth flow:
 *  1. User submits email + password.
 *  2. POST /auth/login → returns { user, token }.
 *  3. AuthContext.login() stores user & token (localStorage + state).
 *  4. User is redirected to their role-specific dashboard.
 *
 * Error handling: server message is shown inline in a glass alert banner;
 * the submit button is disabled while the request is in-flight.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import SkyJobsLogo from "../components/Logo";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────
  const [form,   setForm]   = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);   // toggle password visibility
  const [error,  setError]  = useState("");       // inline server error message
  const [loading,setLoading]= useState(false);   // disables button while fetching

  // Generic change handler — works for every input by reading e.target.name
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Submit handler ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");       // clear any previous error before retry
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.data.user, data.data.token);

      // Redirect to the correct dashboard based on the authenticated role
      const role = data.data.user.role;
      navigate(
        role === "admin"       ? "/admin" :
        role === "client"      ? "/dashboard/client" :
                                 "/dashboard/freelancer"
      );
    } catch (err) {
      // Show the server's error message, falling back to a generic one
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /*
      No background set here — the body's radial gradient (defined in index.css)
      provides the depth for the glass card to sit on.
    */
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* ── Brand header ─────────────────────────────────────────── */}
        {/* animate-fade-up: one-shot entry animation (0.5s, no repeat) */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 36 }}>
          {/* Logo links home — user can escape the auth flow */}
          <Link to="/" style={{ display: "inline-flex", marginBottom: 24, textDecoration: "none" }}>
            {/* size=52 is larger than the navbar (36px) to give the auth page visual weight */}
            <SkyJobsLogo size={52} />
          </Link>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "1.65rem", color: "#0C4A6E", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginTop: 7, lineHeight: 1.6 }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* ── Glass form card ───────────────────────────────────────── */}
        {/*
          glass-strong: rgba(255,255,255,0.86) + blur(22px) — heavier opacity than
          .glass because a form card needs strong legibility for its inputs.
          delay-100: staggers 100ms after the logo above, creating a visual cascade.
        */}
        <div className="glass-strong animate-fade-up delay-100" style={{ borderRadius: 24, padding: "38px" }}>

          {/* Inline error banner — only rendered when there is an error */}
          {error && (
            <div style={{
              marginBottom: 22, padding: "13px 16px",
              /* Red-tinted glass — consistent with the app's danger colour system */
              background:     "rgba(254,242,242,0.9)",
              backdropFilter: "blur(8px)",
              border:         "1.5px solid rgba(252,165,165,0.8)",
              borderRadius:   12,
              color: "#B91C1C", fontSize: "0.84rem", fontFamily: "Open Sans,sans-serif"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* ── Email field ─────────────────────────────────────── */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                {/* Icon overlaps the input — paddingLeft: 42 on the input makes room */}
                <Mail size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  type="email" name="email"
                  value={form.email} onChange={handleChange}
                  required placeholder="you@example.com"
                  className="input-base" style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* ── Password field ───────────────────────────────────── */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                {/* type toggles between "password" and "text" on the eye button press */}
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password} onChange={handleChange}
                  required placeholder="Enter your password"
                  className="input-base" style={{ paddingLeft: 42, paddingRight: 44 }}
                />
                {/* Show/hide password toggle — right side of the input */}
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#94A3B8", padding: 0, display: "flex", transition: "color 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#0369A1"}
                  onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* ── Submit button ────────────────────────────────────── */}
            {/*
              disabled while loading — prevents double-submit.
              btn-primary uses a gradient background + glow shadow (defined in index.css).
              justifyContent: center overrides the default flex-start.
            */}
            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ padding: "13px", fontSize: "0.95rem", marginTop: 4, justifyContent: "center" }}>
              {loading ? <Spinner size="sm" color="white" /> : null}
              {loading
                ? "Signing in…"
                : <><span>Sign In</span> <ArrowRight size={16} /></>
              }
            </button>
          </form>

          {/* ── Footer link ──────────────────────────────────────── */}
          <div style={{ marginTop: 24, textAlign: "center", paddingTop: 22, borderTop: "1px solid rgba(224,242,254,0.8)" }}>
            <p style={{ fontSize: "0.87rem", color: "#64748B", fontFamily: "Open Sans,sans-serif" }}>
              Don't have an account?{" "}
              <Link to="/register"
                style={{ color: "#0369A1", fontWeight: 700, textDecoration: "none", fontFamily: "Poppins,sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                Create one free
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
