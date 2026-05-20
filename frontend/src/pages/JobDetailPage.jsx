{/*
 * JobDetailPage.jsx
 * =================
 * Full detail view for a single job posting, identified by :id in the URL.
 *
 * WHAT THIS PAGE SHOWS
 * --------------------
 * - Job header card  : title, category badge, status badge, budget/deadline/bid-count meta row
 * - Job body         : full description, required skills chip list
 * - Bid section      : role-dependent — see "WHO CAN BID" below
 * - Sidebar          : "About the Client" card + contextual CTAs
 *
 * WHO CAN BID
 * -----------
 * Only authenticated users whose role === "freelancer" may submit a bid.
 *   • If the freelancer has NOT yet bid on this job  → <BidForm> is rendered.
 *   • If the freelancer HAS already bid              → a confirmation banner is shown
 *     (hasBid check prevents duplicate submissions).
 *   • If no user is logged in                        → a guest prompt is shown linking to /register.
 *   • If the viewer is the job owner (client)        → the full proposals list is shown instead.
 *
 * REVIEW SUBMISSION FLOW
 * ----------------------
 * After a job reaches "completed" status the client or freelancer can leave a review.
 * (Review UI is handled on the profile/freelancer pages; this page only exposes the
 *  "Mark as Completed" button that transitions the job from in_progress → completed.)
 *
 * APIS CALLED
 * -----------
 * GET    /jobs/:id          — load full job object (includes bids + client + freelancer sub-objects)
 * POST   /bids              — freelancer submits a new bid  (BidForm)
 * PATCH  /bids/:id/accept   — client accepts a specific bid, triggering in_progress status
 * PATCH  /jobs/:id/complete — client marks the active job as completed
 */}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, DollarSign, Tag, Users, ArrowLeft, Star, Send, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* ─────────────────────────────────────────────────────────────────────────────
 * SUB-COMPONENT: BidForm
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a glassmorphism card containing a controlled form that lets a
 * freelancer submit a bid on the current job.
 *
 * Props
 * -----
 *   jobId  {string|number}  — the job's primary key, forwarded to POST /bids
 *   onDone {function}       — callback fired after a successful submission;
 *                             the parent passes `fetchJob` so the bid list
 *                             refreshes immediately without a hard reload.
 *
 * Local state
 * -----------
 *   form    — controlled object holding proposedPrice, coverLetter, estimatedDeliveryDays
 *   loading — true while the POST request is in-flight; disables the submit button
 *   error   — stores the server error message string, shown inline above the form
 * ─────────────────────────────────────────────────────────────────────────────
 */
const BidForm = ({ jobId, onDone }) => {
  const [form, setForm] = useState({ proposedPrice: "", coverLetter: "", estimatedDeliveryDays: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* handleSubmit — POST /bids with the merged form payload.
   * On success: calls onDone() to re-fetch the parent job so the
   * "Bid Submitted" confirmation banner replaces this form instantly.
   * On failure: surfaces the server's human-readable message in the error banner. */
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await api.post("/bids", { ...form, jobId });
      onDone();
    } catch (err) { setError(err.response?.data?.message || "Failed to submit bid"); }
    finally { setLoading(false); }
  };

  return (
    /* Glassmorphism card: the `.glass` utility class applies
     * backdrop-filter + semi-transparent background defined in index.css.
     * `animate-scale-in` plays a subtle scale entrance animation. */
    <div className="glass animate-scale-in" style={{ borderRadius: 20, padding: "26px" }}>

      {/* Form header: icon badge + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(3,105,161,0.3)" }}>
          <Send size={16} color="white" />
        </div>
        <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem" }}>Submit Your Bid</h3>
      </div>

      {/* Inline error banner — only rendered when the API returns an error message */}
      {error && (
        <div style={{ marginBottom: 16, padding: "11px 14px", background: "rgba(254,242,242,0.9)", border: "1px solid rgba(252,165,165,0.8)", borderRadius: 10, color: "#B91C1C", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}

      {/* Bid form: two-column top row (price + delivery days), full-width cover letter, submit */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* Proposed price — numeric, minimum $1 */}
          <div>
            <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#0C4A6E", marginBottom: 8 }}>Your Price ($)</label>
            <input type="number" required min="1" value={form.proposedPrice} onChange={e => setForm({ ...form, proposedPrice: e.target.value })} placeholder="e.g. 500" className="input-base" />
          </div>
          {/* Estimated delivery days — numeric, minimum 1 */}
          <div>
            <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#0C4A6E", marginBottom: 8 }}>Delivery (days)</label>
            <input type="number" required min="1" value={form.estimatedDeliveryDays} onChange={e => setForm({ ...form, estimatedDeliveryDays: e.target.value })} placeholder="e.g. 7" className="input-base" />
          </div>
        </div>
        {/* Cover letter — free-text textarea; vertically resizable, min 100px height */}
        <div>
          <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#0C4A6E", marginBottom: 8 }}>Cover Letter</label>
          <textarea required rows={4} value={form.coverLetter} onChange={e => setForm({ ...form, coverLetter: e.target.value })} placeholder="Why are you the best fit? Mention relevant experience…" className="input-base" style={{ resize: "vertical", minHeight: 100 }} />
        </div>
        {/* Submit button: shows Spinner while loading and disables itself to prevent double-submission */}
        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "12px" }}>
          {loading ? <Spinner size="sm" color="white" /> : <Send size={15} />}
          {loading ? "Submitting…" : "Submit Bid"}
        </button>
      </form>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN COMPONENT: JobDetailPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches and displays the full detail view for a single job.
 *
 * URL param  : :id  (job primary key)
 * Auth context: user object used to derive isOwner, isFreelancer, userBid
 *
 * State
 * -----
 *   job        — full job object returned by GET /jobs/:id (null while loading)
 *   loading    — true during initial fetch; shows full-page Spinner
 *   accepting  — stores the bidId currently being accepted (prevents double-click)
 *   completing — true while PATCH /jobs/:id/complete is in-flight
 * ─────────────────────────────────────────────────────────────────────────────
 */
const JobDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  /* accepting stores the id of the bid currently being accepted so each
   * "Accept Bid" button can show its own spinner independently */
  const [accepting, setAccepting] = useState(null);

  /* completing is a simple boolean flag for the "Mark as Completed" action */
  const [completing, setCompleting] = useState(false);

  /* fetchJob — GET /jobs/:id
   * Called on mount (via useEffect) and also passed as the `onDone` callback
   * to <BidForm> so the page auto-refreshes after a bid is submitted.
   * On 404 / error: redirects to /jobs rather than showing a blank page. */
  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.data);
    } catch { navigate("/jobs"); }
    finally { setLoading(false); }
  };

  /* Re-fetch whenever the :id param changes (e.g. navigating between job detail pages) */
  useEffect(() => { fetchJob(); }, [id]);

  /* handleAccept — PATCH /bids/:bidId/accept
   * Client-only action: accepts one pending bid which also transitions the job
   * to "in_progress" on the backend. Sets `accepting` to the target bidId so
   * only that row's button shows a spinner; clears it in the finally block. */
  const handleAccept = async (bidId) => {
    setAccepting(bidId);
    try { await api.patch(`/bids/${bidId}/accept`); fetchJob(); }
    catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setAccepting(null); }
  };

  /* handleComplete — PATCH /jobs/:id/complete
   * Client-only action: transitions the job from "in_progress" to "completed".
   * Button is rendered only when isOwner && job.status === "in_progress". */
  const handleComplete = async () => {
    setCompleting(true);
    try { await api.patch(`/jobs/${id}/complete`); fetchJob(); }
    catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setCompleting(false); }
  };

  /* ── Loading state: full-page centred spinner ── */
  if (loading) return (
    <div className="page">
      <Navbar />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Spinner size="lg" />
      </div>
    </div>
  );

  /* ── Guard: job failed to load (navigate already fired) ── */
  if (!job) return null;

  /* ── Derived booleans used throughout the render ──
   *
   * isOwner      true when the logged-in user is the client who posted this job.
   *              Used to show: proposals list, "Mark as Completed" button.
   *
   * isFreelancer true when user.role === "freelancer".
   *              Used to show: BidForm or the "Bid Submitted" banner.
   *
   * userBid      the bid object submitted by this freelancer on this job, or
   *              undefined if they haven't bid yet.
   *              This is the hasBid check: if userBid is truthy the BidForm is
   *              hidden and the confirmation banner is shown instead, preventing
   *              a freelancer from submitting duplicate bids on the same job. */
  const isOwner     = user?.id === job.clientId;
  const isFreelancer = user?.role === "freelancer";
  const userBid      = job.bids?.find(b => b.freelancerId === user?.id);

  return (
    <div className="page">
      <Navbar />

      {/* ── BREADCRUMB BAR ──────────────────────────────────────────────────────
       * A slim glass pill fixed below the Navbar that gives the user context
       * and a one-click escape back to the browse-jobs listing.
       *
       * Glassmorphism parameters:
       *   background       : rgba(255,255,255,0.75) — 75 % opaque white base
       *   backdropFilter   : blur(14px) saturate(160%) — frosted-glass blur +
       *                      boosted colour saturation for vibrancy
       *   WebkitBackdropFilter: same value for Safari / older Chromium
       *   borderBottom     : 1px solid rgba(255,255,255,0.75) — subtle white
       *                      edge that separates the bar from content below
       *
       * The "Browse Jobs" link transitions its colour on hover via onMouseEnter/
       * onMouseLeave inline handlers (no CSS class needed). The current job
       * title is truncated with text-overflow:ellipsis at max-width 300px. */}
      <div style={{
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(14px) saturate(160%)",
        WebkitBackdropFilter: "blur(14px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.75)",
        padding: "13px 0"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Back link: ArrowLeft icon + "Browse Jobs" label */}
          <Link to="/jobs" style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", textDecoration: "none", fontSize: "0.84rem", fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#0369A1"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748B"}>
            <ArrowLeft size={14} /> Browse Jobs
          </Link>
          {/* Separator slash */}
          <span style={{ color: "rgba(203,213,225,0.9)" }}>/</span>
          {/* Current job title — clamped to 300px and ellipsed */}
          <span style={{ fontSize: "0.84rem", color: "#0C4A6E", fontFamily: "Poppins,sans-serif", fontWeight: 600, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.title}
          </span>
        </div>
      </div>

      {/* ── PAGE BODY: two-column grid (main | sidebar) ─────────────────────── */}
      <div className="container" style={{ padding: "32px 24px" }}>
        {/* `detail-grid` has a responsive media query at the bottom of this
         * component that collapses to a single column below 900 px. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }} className="detail-grid">

          {/* ── LEFT COLUMN: main content ──────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── JOB HEADER CARD ────────────────────────────────────────────
             * Glassmorphism card (`.glass`) with fade-up entrance animation.
             * Contains: category + status badges, job title, meta row,
             * description, required skills, and the "Mark as Completed" button. */}
            <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: "30px" }}>

              {/* Category badge + StatusBadge row
               * The category badge background is a linear-gradient derived from
               * CAT_COLORS_LOCAL (start colour) and CAT_LIGHTS_LOCAL (end colour)
               * keyed by job.category string. Falls back to SkyJobs blue if the
               * category is not listed in those maps. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                <span style={{
                  padding: "3px 12px",
                  /* CAT_COLORS_LOCAL provides the darker gradient stop for each
                   * known category; CAT_LIGHTS_LOCAL provides the lighter stop.
                   * Together they create a unique coloured pill per category. */
                  background: `linear-gradient(135deg,${CAT_COLORS_LOCAL[job.category] || "#0369A1"},${CAT_LIGHTS_LOCAL[job.category] || "#0EA5E9"})`,
                  color: "white", borderRadius: 7, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Poppins,sans-serif"
                }}>{job.category}</span>
                {/* StatusBadge renders a colour-coded pill (open/in_progress/completed/cancelled) */}
                <StatusBadge status={job.status} />
              </div>

              {/* Job title — primary h1 for the page */}
              <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", fontSize: "1.55rem", lineHeight: 1.25, marginBottom: 22, letterSpacing: "-0.02em" }}>
                {job.title}
              </h1>

              {/* ── META ROW ─────────────────────────────────────────────────
               * Three stat tiles rendered from a config array, each with a
               * coloured icon badge and two lines of label + value text.
               * gridTemplateColumns: repeat(auto-fit,minmax(130px,1fr)) keeps
               * the tiles responsive — they wrap naturally on narrow screens. */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, padding: "20px", background: "rgba(3,105,161,0.06)", borderRadius: 14, marginBottom: 26 }}>
                {[
                  /* Budget range — sourced directly from job.budgetMin / job.budgetMax */
                  { icon: DollarSign, label: "Budget",   value: `$${job.budgetMin} – $${job.budgetMax}`,                                                                     color: "#22C55E", grad: "linear-gradient(135deg,#16A34A,#22C55E)" },
                  /* Deadline — formatted to "Mon DD, YYYY" via toLocaleDateString */
                  { icon: Clock,      label: "Deadline",  value: new Date(job.deadline).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),              color: "#0369A1", grad: "linear-gradient(135deg,#075985,#0EA5E9)" },
                  /* Total bids received — length of the bids array (0 if undefined) */
                  { icon: Users,      label: "Bids",      value: `${job.bids?.length ?? 0} received`,                                                                          color: "#7C3AED", grad: "linear-gradient(135deg,#6D28D9,#A78BFA)" },
                ].map(({ icon: Icon, label, value, grad }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Coloured icon badge — gradient and shadow match the stat's theme colour */}
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: grad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                      <Icon size={16} color="white" />
                    </div>
                    <div>
                      {/* Uppercase micro-label */}
                      <p style={{ fontSize: "0.68rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                      {/* Bold value */}
                      <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.87rem" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── JOB DESCRIPTION ─────────────────────────────────────────
               * pre-wrap preserves newlines the client typed in the textarea
               * so multi-paragraph descriptions render correctly. */}
              <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 12, fontSize: "0.95rem" }}>Description</h3>
              <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.82, whiteSpace: "pre-wrap", marginBottom: 22 }}>{job.description}</p>

              {/* ── REQUIRED SKILLS ─────────────────────────────────────────
               * Rendered only when requiredSkills is a non-empty array.
               * Each skill renders as a light-blue chip (8% opacity sky-blue
               * background with a subtle sky-blue border). */}
              {job.requiredSkills?.length > 0 && (
                <>
                  <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 12, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <Tag size={14} color="#0369A1" /> Required Skills
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {job.requiredSkills.map(s => (
                      <span key={s} style={{ padding: "6px 14px", background: "rgba(3,105,161,0.08)", color: "#0369A1", borderRadius: 9, fontSize: "0.82rem", fontWeight: 600, border: "1px solid rgba(14,165,233,0.2)", fontFamily: "Open Sans,sans-serif" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* ── MARK AS COMPLETED BUTTON ─────────────────────────────────
               * Role-based + status-based guard:
               *   isOwner              — only the client who posted the job sees this
               *   job.status === "in_progress" — only relevant once a bid is accepted
               * Clicking fires handleComplete → PATCH /jobs/:id/complete.
               * The button disables and shows a spinner while the request is in-flight. */}
              {isOwner && job.status === "in_progress" && (
                <button onClick={handleComplete} disabled={completing} className="btn-cta" style={{ marginTop: 24, padding: "11px 24px" }}>
                  {completing ? <Spinner size="sm" color="white" /> : <CheckCircle2 size={16} />}
                  Mark as Completed
                </button>
              )}
            </div>

            {/* ── PROPOSALS LIST (client / job-owner only) ────────────────────
             * Shown only when:
             *   isOwner          — the viewer is the client who posted this job
             *   job.bids exists  — there is at least one bid to display
             *
             * Each bid card is a mini glassmorphism tile with hover state that
             * lifts the border opacity and brightens the background.
             * Cards contain: freelancer avatar + name + rating link, price + days,
             * cover letter text, status badge, and optionally an "Accept Bid" button. */}
            {isOwner && job.bids && job.bids.length > 0 && (
              <div className="glass animate-fade-up delay-100" style={{ borderRadius: 20, padding: "26px" }}>
                <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 20, fontSize: "1rem" }}>
                  Proposals ({job.bids.length})
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* ── INDIVIDUAL BID CARD ──────────────────────────────────
                   * Glassmorphism parameters on each bid card:
                   *   background     : rgba(255,255,255,0.5)  — 50 % opaque white
                   *   backdropFilter : blur(8px) — lighter blur than the outer card
                   *   border         : 1.5px solid rgba(224,242,254,0.8) — pale sky border
                   *   Hover overrides: border opacity increases to 0.4 sky-blue,
                   *                   background brightens to 0.78 opacity
                   * The transition: "all 0.22s" animates the hover state smoothly. */}
                  {job.bids.map(bid => (
                    <div key={bid.id} style={{
                      border: "1.5px solid rgba(224,242,254,0.8)",
                      background: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 14, padding: "18px", transition: "all 0.22s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"; e.currentTarget.style.background = "rgba(255,255,255,0.78)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(224,242,254,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.5)"; }}>

                      {/* Top row: avatar + name/rating on the left; price + days on the right */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {/* Circular avatar — gradient background with the freelancer's initial */}
                          <div style={{
                            width: 42, height: 42, borderRadius: "50%",
                            background: "linear-gradient(135deg,#075985,#0EA5E9)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.9rem",
                            flexShrink: 0, boxShadow: "0 4px 12px rgba(3,105,161,0.3)"
                          }}>
                            {bid.freelancer?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {/* Freelancer name — links to their public profile page */}
                            <Link to={`/freelancer/${bid.freelancerId}`} style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.9rem" }}
                              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                              {bid.freelancer?.name}
                            </Link>
                            {/* Star rating + completed jobs count sub-line */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                              <Star size={11} color="#F59E0B" fill="#F59E0B" />
                              {/* Shows numeric rating to 1 decimal place, or "New" for unrated freelancers */}
                              <span style={{ fontSize: "0.73rem", color: "#64748B" }}>
                                {bid.freelancer?.averageRating > 0 ? Number(bid.freelancer.averageRating).toFixed(1) : "New"}
                              </span>
                              <span style={{ color: "#E2E8F0", fontSize: "0.68rem" }}>·</span>
                              <span style={{ fontSize: "0.73rem", color: "#64748B" }}>{bid.freelancer?.totalJobsCompleted || 0} jobs</span>
                            </div>
                          </div>
                        </div>
                        {/* Price + delivery days — right-aligned */}
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#22C55E", fontSize: "1.12rem" }}>${bid.proposedPrice}</p>
                          <p style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{bid.estimatedDeliveryDays} days</p>
                        </div>
                      </div>

                      {/* Cover letter body text */}
                      <p style={{ fontSize: "0.84rem", color: "#374151", lineHeight: 1.72, marginBottom: 14 }}>{bid.coverLetter}</p>

                      {/* Bottom row: status badge (left) + optional Accept button (right) */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <StatusBadge status={bid.status} />
                        {/* ACCEPT BID BUTTON — conditional rendering logic:
                         *   job.status === "open"     — can only accept while no bid is active yet
                         *   bid.status === "pending"  — can only accept a bid not already acted on
                         * Clicking fires handleAccept(bid.id) → PATCH /bids/:id/accept.
                         * `accepting === bid.id` shows a per-row spinner so the client knows
                         * exactly which row is processing, while other rows remain interactive. */}
                        {job.status === "open" && bid.status === "pending" && (
                          <button onClick={() => handleAccept(bid.id)} disabled={accepting === bid.id} className="btn-cta" style={{ padding: "7px 18px", fontSize: "0.82rem" }}>
                            {accepting === bid.id ? <Spinner size="sm" color="white" /> : <CheckCircle2 size={14} />}
                            Accept Bid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FREELANCER BID SECTION ───────────────────────────────────────
             * Three mutually exclusive states, evaluated in order:
             *
             * 1. Bid form — shown when ALL of these are true:
             *      isFreelancer       : viewer is a logged-in freelancer
             *      job.status==="open": job is still accepting bids
             *      !userBid           : this freelancer has NOT yet submitted a bid
             *                          (the hasBid check — prevents duplicate bids)
             *
             * 2. "Bid Submitted" confirmation banner — shown when:
             *      isFreelancer && userBid is defined
             *    Displays the freelancer's own proposedPrice and current bid status.
             *
             * 3. Guest prompt — shown when no user is logged in and job is open.
             *    Encourages sign-up via a link to /register. */}

            {/* State 1: BidForm — freelancer has not yet bid */}
            {isFreelancer && job.status === "open" && !userBid && <BidForm jobId={job.id} onDone={fetchJob} />}

            {/* State 2: confirmation banner — freelancer already has a bid (hasBid is truthy) */}
            {isFreelancer && userBid && (
              <div className="glass animate-scale-in" style={{ borderRadius: 20, padding: "20px", display: "flex", alignItems: "center", gap: 14 }}>
                {/* Green check icon badge signals a successfully submitted bid */}
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#16A34A,#22C55E)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>
                  <CheckCircle2 size={20} color="white" />
                </div>
                <div>
                  <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.9rem" }}>Bid Submitted</p>
                  {/* Shows the freelancer's own bid amount and its current status (pending/accepted/rejected) */}
                  <p style={{ fontSize: "0.82rem", color: "#64748B", marginTop: 2 }}>Your bid of <strong>${userBid.proposedPrice}</strong> is <strong>{userBid.status}</strong></p>
                </div>
              </div>
            )}

            {/* State 3: guest prompt — unauthenticated visitor viewing an open job */}
            {!user && job.status === "open" && (
              <div className="glass animate-scale-in" style={{ borderRadius: 20, padding: "20px", display: "flex", alignItems: "center", gap: 14, border: "1.5px solid rgba(186,230,253,0.8)" }}>
                <AlertCircle size={22} color="#0369A1" />
                <p style={{ fontSize: "0.87rem", color: "#0C4A6E", fontFamily: "Open Sans,sans-serif" }}>
                  <Link to="/register" style={{ color: "#0369A1", fontWeight: 700, textDecoration: "none" }}>Create a free account</Link> to submit a bid on this job.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: SIDEBAR ────────────────────────────────────────
           * Always visible alongside the main content (collapses below main on
           * mobile via the detail-grid media query).
           * Contains: "About the Client" card + contextual action buttons. */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ── ABOUT THE CLIENT CARD ────────────────────────────────────
             * Glassmorphism card with fade-up entrance (delay-200 = 200 ms stagger).
             * Shows client avatar initial, name, and average star rating.
             * Falls back to an em-dash if job.client is null/undefined. */}
            <div className="glass animate-fade-up delay-200" style={{ borderRadius: 20, padding: "22px" }}>
              <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.9rem", marginBottom: 18 }}>About the Client</h3>
              {job.client ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Client avatar: circular gradient badge showing first letter of name */}
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0, boxShadow: "0 4px 14px rgba(3,105,161,0.3)" }}>
                    {job.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    {/* Client name — links to their public profile page */}
                    <Link to={`/client/${job.client.id}`} style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.9rem" }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                      {job.client.name}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" />
                      {/* Shows numeric rating to 1 d.p., or "New" for unrated clients */}
                      <span style={{ fontSize: "0.73rem", color: "#64748B" }}>
                        {job.client.averageRating > 0 ? Number(job.client.averageRating).toFixed(1) : "New"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : <p style={{ fontSize: "0.84rem", color: "#94A3B8" }}>—</p>}
            </div>

            {/* ── SIDEBAR CTAs ─────────────────────────────────────────────
             * Role-based conditional rendering for sidebar action buttons:
             *
             * • !user              → "Get Started Free" button → /register
             *                        (encourages guest sign-up)
             *
             * • user.role==="client" && !isOwner
             *                      → "Post Similar Job" button → /post-job
             *                        (shown to clients browsing others' jobs;
             *                         hidden from the job's own owner since
             *                         they already manage this posting) */}

            {/* Guest CTA */}
            {!user && (
              <Link to="/register" className="btn-cta" style={{ textAlign: "center", padding: "13px" }}>Get Started Free</Link>
            )}
            {/* Client (non-owner) CTA */}
            {user?.role === "client" && !isOwner && (
              <Link to="/post-job" className="btn-primary" style={{ textAlign: "center", padding: "13px" }}>Post Similar Job</Link>
            )}
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE OVERRIDE ──────────────────────────────────────────────
       * Below 900 px the two-column detail-grid collapses to a single column
       * so the sidebar stacks below the main job content on mobile/tablet. */}
      <style>{`@media(max-width:900px){.detail-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
 * CAT_COLORS_LOCAL — darker gradient stop for each job category pill/badge.
 * Used as the first colour in the `linear-gradient(135deg, start, end)` on
 * the category badge inside the job header card.
 *
 * Keys match the category strings stored in job.category (backend enum).
 * If job.category is not found in this map the badge falls back to "#0369A1"
 * (SkyJobs primary sky-blue).
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CAT_COLORS_LOCAL = { "Web Development":"#0369A1","Design & Creative":"#7C3AED","Mobile Apps":"#059669","Writing & Content":"#D97706","Marketing":"#DC2626","Data & Analytics":"#0891B2" };

/* ─────────────────────────────────────────────────────────────────────────────
 * CAT_LIGHTS_LOCAL — lighter gradient stop for each job category pill/badge.
 * Used as the second colour in the same linear-gradient, providing the
 * bright "shine" end of each category's unique gradient.
 *
 * Parallels CAT_COLORS_LOCAL exactly — both maps must have the same keys.
 * Falls back to "#0EA5E9" (light sky-blue) when the category is unknown.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CAT_LIGHTS_LOCAL = { "Web Development":"#0EA5E9","Design & Creative":"#A78BFA","Mobile Apps":"#34D399","Writing & Content":"#FCD34D","Marketing":"#F87171","Data & Analytics":"#67E8F9" };

export default JobDetailPage;
