/**
 * PostJobPage — client form to create a new job listing.
 *
 * Form fields:
 *   title, description, category (dropdown), requiredSkills (comma-separated),
 *   budgetMin / budgetMax (USD integers), deadline (date picker).
 *
 * Validation:
 *   • Browser-native `required` on each field.
 *   • Custom JS check: budgetMin must not exceed budgetMax.
 *   • Server also validates via express-validator.
 *
 * On success: navigates to /my-jobs so the client sees their new listing.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Tag, DollarSign, Calendar, AlignLeft, Layers, ArrowLeft, Sparkles } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";

// ── Available job categories ────────────────────────────────────────────────
// Mirror the enum accepted by the backend to avoid mismatches
const CATEGORIES = [
  "Web Development", "Design & Creative", "Mobile Apps",
  "Writing & Content", "Marketing", "Data & Analytics"
];

// ── Field wrapper component ─────────────────────────────────────────────────
/**
 * Field — labelled form group with an optional gradient icon box and hint text.
 * Keeping this as a local sub-component avoids repeating the label layout
 * across every field in the form.
 *
 * The 22×22 gradient icon box uses the same size and border-radius as all
 * other icon boxes in the design system (proportional to the text it accompanies).
 */
const Field = ({ label, icon: Icon, children, hint }) => (
  <div>
    <label style={{
      display: "flex", alignItems: "center", gap: 7,
      fontFamily: "Poppins,sans-serif", fontWeight: 600,
      fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9
    }}>
      {/* Gradient icon box — same motif used in dashboards and admin pages */}
      {Icon && (
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: "linear-gradient(135deg,#075985,#0EA5E9)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <Icon size={12} color="white" />
        </span>
      )}
      {label}
    </label>
    {/* Input/select/textarea is passed as children — Field is layout-only */}
    {children}
    {/* Optional helper text below the field */}
    {hint && <p style={{ fontSize: "0.74rem", color: "#94A3B8", marginTop: 6 }}>{hint}</p>}
  </div>
);

// ── Main page component ─────────────────────────────────────────────────────
const PostJobPage = () => {
  const navigate = useNavigate();

  // Controlled form state — all values start empty/blank
  const [form, setForm] = useState({
    title: "", description: "", category: "",
    budgetMin: "", budgetMax: "", deadline: "", requiredSkills: ""
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Generic handler — any named input updates the matching key in state
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side guard: prevents sending an invalid range to the server
    if (Number(form.budgetMin) > Number(form.budgetMax)) {
      return setError("Min budget cannot exceed max budget");
    }

    setLoading(true);
    try {
      await api.post("/jobs", {
        ...form,
        budgetMin: Number(form.budgetMin),   // API expects integers, not strings
        budgetMax: Number(form.budgetMax),
        // Skills come in as a comma-separated string → split + trim + drop empties
        requiredSkills: form.requiredSkills.split(",").map(s => s.trim()).filter(Boolean)
      });
      navigate("/my-jobs");   // redirect to the client's job list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
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
        {/* Decorative radial glow — adds depth behind the glass header content */}
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          {/* Back-link to My Jobs */}
          <Link to="/my-jobs"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.84rem", marginBottom: 18, fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
            <ArrowLeft size={14} /> My Jobs
          </Link>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "1.9rem", letterSpacing: "-0.02em" }}>Post a New Job</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 8 }}>Fill in the details and start receiving bids from skilled freelancers</p>
        </div>
      </div>

      {/* ── Form area ────────────────────────────────────────────────── */}
      {/* maxWidth: 800 keeps wide-screen forms readable — anything wider hurts UX */}
      <div className="container" style={{ padding: "40px 24px", maxWidth: 800 }}>

        {/*
          glass-strong: heavy glass (rgba 0.86) for form legibility.
          animate-fade-up: one-shot entry animation defined in index.css.
        */}
        <div className="glass-strong animate-fade-up" style={{ borderRadius: 24, padding: "40px" }}>

          {/* Inline error banner — hidden until a server or validation error occurs */}
          {error && (
            <div style={{
              marginBottom: 26, padding: "14px 16px",
              background: "rgba(254,242,242,0.9)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(252,165,165,0.8)", borderRadius: 12,
              color: "#B91C1C", fontSize: "0.84rem",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <AlertIcon /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>

            {/* Job title */}
            <Field label="Job Title" icon={Briefcase}>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                required placeholder="e.g. Build a React dashboard for our SaaS product"
                className="input-base" />
            </Field>

            {/* Description — textarea with vertical resize only, min-height for comfort */}
            <Field label="Description" icon={AlignLeft}
              hint="Be specific — detailed descriptions attract better bids">
              <textarea name="description" value={form.description} onChange={handleChange}
                required rows={6}
                placeholder="Describe your project requirements, goals, deliverables, and any technical specifications…"
                className="input-base" style={{ resize: "vertical", minHeight: 140 }} />
            </Field>

            {/* Category dropdown */}
            <Field label="Category" icon={Layers}>
              <select name="category" value={form.category} onChange={handleChange}
                required className="input-base">
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>

            {/* Skills — comma-separated raw input; split in handleSubmit */}
            <Field label="Required Skills" icon={Tag}
              hint="Comma-separated, e.g. React, Node.js, PostgreSQL">
              <input type="text" name="requiredSkills" value={form.requiredSkills}
                onChange={handleChange}
                placeholder="React, Tailwind CSS, REST API…"
                className="input-base" />
            </Field>

            {/* ── Budget range — two side-by-side number inputs ───── */}
            <div>
              {/* Manual label row (not using Field) because it spans two inputs */}
              <label style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.84rem", color: "#0C4A6E", marginBottom: 9 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarSign size={12} color="white" />
                </span>
                Budget Range (USD)
              </label>
              {/* CSS grid for two equal columns side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <input type="number" name="budgetMin" value={form.budgetMin}
                    onChange={handleChange} required min="1" placeholder="Min e.g. 200"
                    className="input-base" />
                  <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 5 }}>Minimum</p>
                </div>
                <div>
                  <input type="number" name="budgetMax" value={form.budgetMax}
                    onChange={handleChange} required min="1" placeholder="Max e.g. 1000"
                    className="input-base" />
                  <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: 5 }}>Maximum</p>
                </div>
              </div>
            </div>

            {/* Deadline — min set to today so past dates are not selectable */}
            <Field label="Project Deadline" icon={Calendar}>
              <input type="date" name="deadline" value={form.deadline}
                onChange={handleChange} required
                min={new Date().toISOString().split("T")[0]}   /* today's date as YYYY-MM-DD */
                className="input-base" />
            </Field>

            {/* ── Action row ────────────────────────────────────────── */}
            <div style={{
              paddingTop: 10, borderTop: "1px solid rgba(224,242,254,0.8)",
              display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap"
            }}>
              <Link to="/my-jobs" className="btn-outline" style={{ padding: "12px 24px" }}>Cancel</Link>
              {/* Disabled while loading to prevent double-submit */}
              <button type="submit" disabled={loading} className="btn-cta" style={{ padding: "12px 32px" }}>
                {loading ? <Spinner size="sm" color="white" /> : <Sparkles size={15} />}
                {loading ? "Posting…" : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Alert icon (inline SVG) ─────────────────────────────────────────────────
// Kept as a local component rather than importing from lucide to keep the
// error banner self-contained and avoid an extra dependency for one icon.
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default PostJobPage;
