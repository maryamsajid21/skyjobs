/**
 * FreelancerDashboard.jsx
 *
 * PAGE OVERVIEW
 * -------------
 * This is the main dashboard page shown exclusively to authenticated users
 * whose role is "freelancer". It gives them a personalised activity summary
 * the moment they log in, without having to navigate anywhere else.
 *
 * WHAT THE PAGE SHOWS
 * -------------------
 *  - A greeting header banner with the freelancer's first name.
 *  - Four stat cards:
 *      1. Total Bids      – every bid ever submitted by this freelancer.
 *      2. Pending Bids    – bids that are still awaiting a client decision.
 *      3. Active Jobs     – bids the client has accepted (freelancer is working).
 *      4. Profile Completion – a progress bar showing how complete their profile is.
 *  - A "Recent Bids" table showing the last 6 proposals, each with job title,
 *    proposed price, estimated delivery, and a colour-coded StatusBadge.
 *  - A "Quick Actions" sidebar with shortcut links to Find Jobs, My Bids,
 *    and My Profile.
 *
 * WHO SEES IT
 * -----------
 * Only users with role = "freelancer". Route-level guards (set up in the router)
 * prevent clients and admins from reaching this page.
 *
 * API CALLS
 * ---------
 *  GET /bids/my/bids
 *    - Protected route — requires a valid JWT (attached automatically by the
 *      axios instance in src/api/axios.js).
 *    - Returns { success: true, data: Bid[] } where each Bid includes the
 *      nested Job object (bid.job.id, bid.job.title) along with bid fields:
 *      id, status, proposedPrice, estimatedDeliveryDays.
 *    - Called once on component mount via useEffect.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Send, User, CheckCircle, ArrowRight, Clock, TrendingUp } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* ==========================================================================
   StatCard — reusable metric tile used across the stats grid
   ==========================================================================
   Props:
     label  {string}          – short uppercase caption shown above the number
                                (e.g. "Total Bids", "Pending").
     value  {number|string}   – the computed metric value displayed large.
     icon   {LucideIcon}      – an icon component from lucide-react; rendered
                                white inside the coloured icon box.
     grad   {string}          – a CSS linear-gradient string applied as the
                                background of the icon box, giving each card a
                                distinct colour identity.
     delay  {number}          – animation-delay in seconds for the stagger
                                pattern (see "Animation stagger" note below).

   Glassmorphism CSS parameters (applied via the "glass" utility class):
     The "glass" className is defined globally and typically includes:
       background: rgba(255,255,255,0.6–0.8)   — semi-transparent white fill
       backdrop-filter: blur(12–20px)           — frosted-glass blur on whatever
                                                  is rendered behind the card
       border: 1px solid rgba(255,255,255,0.3) — subtle white edge highlight
       box-shadow: ...                          — soft elevation shadow
     Together these make the card appear to float in front of the gradient
     background while letting the colour beneath bleed through slightly.

   Animation stagger pattern:
     Each StatCard receives a slightly larger `delay` value (0s, 0.07s, 0.14s,
     0.21s). The "animate-fade-up" class triggers a CSS keyframe animation that
     translates the card upward while fading it in. By staggering the delays,
     the four cards cascade into view left-to-right instead of all appearing
     simultaneously, creating a polished entrance effect.
   ========================================================================== */
const StatCard = ({ label, value, icon: Icon, grad, delay = 0 }) => (
  <div className="glass animate-fade-up" style={{
    borderRadius: 20, padding: "24px",
    display: "flex", alignItems: "flex-start", gap: 16,
    /* animationDelay staggers this card's entrance relative to its siblings */
    animationDelay: `${delay}s`
  }}>
    {/* Icon box — coloured with the gradient passed via the `grad` prop */}
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      /* grad is a full linear-gradient(...) string, e.g.
         "linear-gradient(135deg,#075985,#0EA5E9)" for the blue Total Bids card */
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
    }}>
      <Icon size={22} color="white" />
    </div>

    {/* Text block: caption label + large numeric value */}
    <div>
      {/* Small all-caps label — muted slate colour for visual hierarchy */}
      <p style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</p>
      {/* Large bold number — dark sky-blue for contrast against the glass bg */}
      <p style={{ fontSize: "2rem", fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

/* ==========================================================================
   QuickAction — navigation shortcut tile rendered in the right sidebar
   ==========================================================================
   Props:
     to    {string}      – react-router-dom path to navigate to on click.
     icon  {LucideIcon}  – icon displayed inside the coloured circle.
     grad  {string}      – linear-gradient for the icon background circle.
     title {string}      – primary label, e.g. "Find Jobs".
     sub   {string}      – supporting description text in muted grey.

   The component is wrapped in a <Link> so the entire tile is clickable.
   "card-hover" adds a subtle lift/shadow transition on pointer hover.
   "glass" applies the same glassmorphism treatment as StatCard (see above).
   ArrowRight acts as a visual affordance indicating the tile is navigable.
   ========================================================================== */
const QuickAction = ({ to, icon: Icon, grad, title, sub }) => (
  <Link to={to}
    className="card-hover glass"
    style={{
      borderRadius: 16, padding: "20px", textDecoration: "none",
      display: "flex", alignItems: "center", gap: 14, cursor: "pointer"
    }}>
    {/* Coloured icon circle — same gradient pattern as StatCard icon boxes */}
    <div style={{
      width: 46, height: 46, borderRadius: 12,
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
    }}>
      <Icon size={19} color="white" />
    </div>

    {/* Title + subtitle text block; flex:1 pushes the arrow to the far right */}
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem" }}>{title}</p>
      <p style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 2 }}>{sub}</p>
    </div>

    {/* Chevron arrow — muted colour so it does not compete with the title */}
    <ArrowRight size={15} color="#94A3B8" />
  </Link>
);

/* ==========================================================================
   FreelancerDashboard — main page component
   ==========================================================================
   State:
     bids    {Bid[]}    – array of bid objects returned from GET /bids/my/bids.
                          Each object includes bid metadata and a nested job.
     loading {boolean}  – true while the API request is in-flight; drives the
                          Spinner and prevents premature "no bids" rendering.

   Derived values (computed from `bids` after the API response arrives):
     pending   – count of bids where status === "pending"
                 (submitted, awaiting client review — no action yet taken).
     accepted  – count of bids where status === "accepted"
                 (client hired this freelancer — treated as "Active Jobs").
     total     – total number of bids the freelancer has ever submitted.

   Profile completion logic:
     Four profile fields are considered "complete":
       1. user.name      – display name set during sign-up.
       2. user.bio       – a textual self-description.
       3. user.skills    – at least one skill tag added (truthy when length > 0).
       4. user.hourlyRate – an hourly rate set on the profile.
     `profileComplete` is the count of those four fields that are currently
     truthy (populated). Dividing by 4 and multiplying by 100 yields a
     percentage score from 0 to 100, rounded to the nearest integer.
     Example: name + bio filled in but no skills/rate → (2/4)*100 = 50%.
   ========================================================================== */
const FreelancerDashboard = () => {
  /* Pull the authenticated user object from global auth context.
     user contains: id, name, role, bio, skills[], hourlyRate, etc. */
  const { user } = useAuth();

  /* bids: populated after the GET /bids/my/bids response resolves */
  const [bids, setBids] = useState([]);

  /* loading: shown as a Spinner inside the Recent Bids panel while fetching */
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------
     Data fetch — runs once on mount (empty dependency array []).
     Uses the shared axios instance so the Authorization header is
     automatically attached from the stored JWT token.
     Errors are silently swallowed because the UI degrades gracefully
     (empty-state illustration is shown if bids remains []).
     `finally` ensures the spinner always disappears regardless of
     whether the request succeeded or failed.
     ------------------------------------------------------------------ */
  useEffect(() => {
    api.get("/bids/my/bids")
      .then(({ data }) => setBids(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* --- Derived stat values ------------------------------------------ */

  /* totalBids: raw count of every proposal this freelancer has submitted */
  const pending  = bids.filter(b => b.status === "pending").length;

  /* acceptedBids: bids where the client clicked "Accept"; shown as "Active Jobs"
     because an accepted bid means the freelancer is actively working on it */
  const accepted = bids.filter(b => b.status === "accepted").length;

  /* total: all bids regardless of status — displayed on the "Total Bids" card */
  const total    = bids.length;

  /* --- Profile completion percentage --------------------------------- */
  /* Count how many of the four key profile fields are currently filled.
     filter(Boolean) removes falsy values (undefined, null, "", 0, []).
     Note: user?.skills?.length is used (not user?.skills) so that an empty
     array [] is treated as falsy (length 0 → 0 → falsy after filter). */
  const profileComplete = [user?.name, user?.bio, user?.skills?.length, user?.hourlyRate].filter(Boolean).length;

  /* Convert to 0–100 integer percentage: (filledFields / 4) * 100 */
  const profilePct = Math.round((profileComplete / 4) * 100);

  /* ====================================================================
     RENDER
     ==================================================================== */
  return (
    <div className="page">
      {/* Global navigation bar — shared across all authenticated pages */}
      <Navbar />

      {/* ----------------------------------------------------------------
          HEADER BANNER
          A full-width gradient strip that greets the freelancer by their
          first name (user.name is split on spaces and the first token is
          taken so "Jane Doe" renders as "Jane" rather than the full name).

          The two absolutely-positioned radial gradient blobs (purple and
          green) are purely decorative — they add depth to the flat banner
          without any interactive behaviour (pointerEvents: "none" ensures
          they never interfere with clicks on the real content).
          ---------------------------------------------------------------- */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "44px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative radial blob — top-right, purple tint */}
        <div style={{ position: "absolute", top: "-30%", right: "-8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Decorative radial blob — bottom-left, green tint */}
        <div style={{ position: "absolute", bottom: "-40%", left: "-5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />

        {/* Header content: greeting text on the left, CTA button on the right */}
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative" }}>
          <div>
            {/* Subdued "Welcome back," prefix — less prominent than the name */}
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.84rem", marginBottom: 5 }}>Welcome back,</p>

            {/* First name only — extracted by splitting on whitespace */}
            <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "2.1rem", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
              {user?.name?.split(" ")[0]}
            </h1>

            {/* Tagline — orients the freelancer on the page's purpose */}
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 7 }}>Your freelancing activity at a glance</p>
          </div>

          {/* Primary CTA — takes the freelancer straight to the job listings */}
          <Link to="/jobs" className="btn-cta" style={{ padding: "12px 28px" }}>
            <Search size={15} /> Browse Jobs
          </Link>
        </div>
      </div>

      {/* Main page body — constrained to the global container width */}
      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ----------------------------------------------------------------
            STATS GRID
            Four equal columns on desktop, collapses to 2-col on tablet and
            1-col on mobile via the .stats-grid responsive media queries at
            the bottom of this file.

            Cards 1–3 use the reusable <StatCard> component.
            Card 4 (Profile Completion) is rendered inline because it needs
            a custom progress bar that StatCard does not support.

            Animation stagger: each card's delay increases by 0.07 s so they
            cascade left-to-right:
              Total Bids  → delay 0s    (appears first)
              Pending     → delay 0.07s
              Active Jobs → delay 0.14s
              Profile     → delay 0.21s (appears last)
            ---------------------------------------------------------------- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }} className="stats-grid">

          {/* Stat 1 — totalBids: shows the freelancer how active they have been overall */}
          <StatCard label="Total Bids"  value={total}    icon={Send}        grad="linear-gradient(135deg,#075985,#0EA5E9)"  delay={0}    />

          {/* Stat 2 — pending: bids awaiting a client decision; useful to gauge pipeline size */}
          <StatCard label="Pending"     value={pending}  icon={Clock}       grad="linear-gradient(135deg,#D97706,#FCD34D)"  delay={0.07} />

          {/* Stat 3 — accepted (Active Jobs): how many engagements are currently in progress */}
          <StatCard label="Active Jobs" value={accepted} icon={CheckCircle} grad="linear-gradient(135deg,#16A34A,#22C55E)"  delay={0.14} />

          {/* ----------------------------------------------------------------
              PROFILE COMPLETION CARD (inline — not using StatCard)
              Shows a horizontal progress bar that fills proportionally to
              `profilePct` (0–100).

              Progress bar implementation:
                Outer track: fixed height (7px), light blue semi-transparent
                background (rgba(224,242,254,0.8)), overflow:hidden clips the
                inner bar to the track's rounded corners.

                Inner fill: same fixed height, width set to `${profilePct}%`
                so it grows from 0 % to 100 % as fields are completed.

                Why linear-gradient instead of a solid colour:
                  background: "linear-gradient(90deg,#0369A1,#22C55E)" creates
                  a left-to-right transition from dark blue to green. This gives
                  the bar a sense of motion/progress — the colour itself shifts
                  as the bar fills, reinforcing the "moving toward completion"
                  metaphor without needing JavaScript-driven colour changes.

                The `transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)"` makes
                the bar animate smoothly from its previous width to the new one
                whenever profilePct changes (e.g. after the user updates their
                profile and returns to the dashboard).

                boxShadow on the fill adds a soft green glow underneath it,
                making the filled portion visually pop off the light track.

              The "Complete profile →" link only renders when profilePct < 100,
              i.e. at least one of the four profile fields is still missing.
              ---------------------------------------------------------------- */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: "24px", animationDelay: "0.21s" }}>
            {/* Card header: purple icon + "PROFILE" label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6D28D9,#A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}>
                <User size={17} color="white" />
              </div>
              <p style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>Profile</p>
            </div>

            {/* "Completion" label on the left, numeric percentage on the right */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "0.77rem", color: "#64748B" }}>Completion</span>
              <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", fontSize: "1rem" }}>{profilePct}%</span>
            </div>

            {/* Progress bar outer track */}
            <div style={{ height: 7, background: "rgba(224,242,254,0.8)", borderRadius: 999, overflow: "hidden" }}>
              {/* Progress bar inner fill — width driven by profilePct percentage */}
              <div style={{
                height: 7,
                /* Horizontal gradient from blue → green visually represents advancement */
                background: "linear-gradient(90deg,#0369A1,#22C55E)",
                borderRadius: 999, width: `${profilePct}%`,
                /* Smooth width animation when the percentage value changes */
                transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                /* Soft glow under the fill reinforces the "active progress" feel */
                boxShadow: "0 2px 8px rgba(34,197,94,0.4)"
              }} />
            </div>

            {/* Conditional CTA link — only shown when the profile is not yet 100% */}
            {profilePct < 100 && (
              <Link to={`/freelancer/${user?.id}`} style={{ fontSize: "0.72rem", color: "#0369A1", textDecoration: "none", display: "block", marginTop: 10, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                Complete profile →
              </Link>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------------
            MAIN LAYOUT — two-column grid
            Left column  (flex: 1)    : Recent Bids table
            Right column (300px fixed): Quick Actions sidebar

            Collapses to a single column on tablet/mobile via .dash-grid.
            ---------------------------------------------------------------- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22, alignItems: "start" }} className="dash-grid">

          {/* ----------------------------------------------------------------
              RECENT BIDS TABLE
              Shows the most recent 6 bids (bids.slice(0,6)) to keep the list
              scannable without needing pagination on the dashboard.

              Three render states:
                1. loading === true  → centred <Spinner size="lg" />
                2. bids.length === 0 → empty-state illustration with a CTA
                3. bids exist        → scrollable list of bid rows

              Each bid row contains:
                - Job title (linked to /jobs/:id, truncated with ellipsis if long)
                - Proposed price in USD (green, bold)
                - Estimated delivery in days (muted)
                - <StatusBadge status={bid.status} />
                    StatusBadge is a shared component that maps status strings
                    to coloured pill badges using the global status colour tokens:
                      pending  → grey
                      accepted → green
                      rejected → red
                    This keeps status presentation consistent across the entire
                    application (same component is reused in the My Bids page).

              Row hover: background transitions to a faint blue tint
              (rgba(3,105,161,0.04)) using inline onMouseEnter/Leave handlers
              so each row has interactive feedback without a CSS class.

              Border logic: `i < Math.min(bids.length, 6) - 1` adds a bottom
              border to every row except the last visible one, preventing a
              double-border artefact at the bottom of the card.
              ---------------------------------------------------------------- */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: "hidden" }}>

            {/* Table header bar: section title + "View all" link */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid rgba(224,242,254,0.8)"
            }}>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.98rem" }}>Recent Bids</h2>

              {/* "View all" navigates to /my-bids for the full paginated history.
                  The gap between text and arrow increases slightly on hover for
                  a subtle animated affordance. */}
              <Link to="/my-bids" style={{ fontSize: "0.8rem", color: "#0369A1", fontFamily: "Poppins,sans-serif", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "gap 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.gap = "6px"}
                onMouseLeave={e => e.currentTarget.style.gap = "4px"}>
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {/* Conditional rendering: Spinner → Empty state → Bid rows */}
            {loading ? (
              /* Loading state: API call in-flight — show centered spinner */
              <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
                <Spinner size="lg" />
              </div>
            ) : bids.length === 0 ? (
              /* Empty state: freelancer has not submitted any bids yet */
              <div style={{ textAlign: "center", padding: "52px 24px" }}>
                <div style={{
                  width: 62, height: 62, borderRadius: 18,
                  background: "linear-gradient(135deg,#075985,#0EA5E9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px", boxShadow: "0 6px 18px rgba(3,105,161,0.3)"
                }}>
                  <Send size={26} color="white" />
                </div>
                <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 8 }}>No bids yet</p>
                <p style={{ fontSize: "0.84rem", color: "#64748B", marginBottom: 22 }}>Browse open jobs and start bidding.</p>
                <Link to="/jobs" className="btn-cta" style={{ padding: "10px 24px" }}>
                  <Search size={13} /> Browse Jobs
                </Link>
              </div>
            ) : (
              /* Populated state: render up to 6 most recent bids */
              <div>
                {bids.slice(0, 6).map((bid, i) => (
                  <div key={bid.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "15px 24px",
                    /* Show divider below every row except the last visible one */
                    borderBottom: i < Math.min(bids.length, 6) - 1 ? "1px solid rgba(240,249,255,0.9)" : "none",
                    gap: 12, transition: "background 0.18s"
                  }}
                    /* Subtle row highlight on hover — uses inline handlers because
                       these rows are dynamically generated and a global CSS class
                       would apply to ALL rows simultaneously */
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(3,105,161,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                    {/* Left section: job title link + price / delivery metadata */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Job title — links to the job detail page; truncated with
                          ellipsis if it overflows the available column width */}
                      <Link to={`/jobs/${bid.job?.id}`} style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.87rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                        {bid.job?.title}
                      </Link>

                      {/* Secondary metadata row: proposed price + delivery days */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                        {/* proposedPrice: the dollar amount the freelancer bid
                            for this job — shown in green to signal a financial figure */}
                        <span style={{ fontSize: "0.73rem", color: "#22C55E", fontFamily: "Poppins,sans-serif", fontWeight: 700 }}>
                          ${bid.proposedPrice}
                        </span>

                        {/* estimatedDeliveryDays: the turnaround commitment made
                            in the bid, expressed in calendar days */}
                        <span style={{ fontSize: "0.73rem", color: "#64748B" }}>
                          {bid.estimatedDeliveryDays}d delivery
                        </span>
                      </div>
                    </div>

                    {/* StatusBadge: renders a colour-coded pill for bid.status.
                        Possible values: "pending" | "accepted" | "rejected" | "withdrawn".
                        The StatusBadge component centralises all status-to-colour
                        mappings so they remain consistent site-wide. */}
                    <StatusBadge status={bid.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------
              QUICK ACTIONS SIDEBAR
              Three shortcut tiles stacked vertically in a 300px fixed column.
              Each QuickAction links to a key destination the freelancer visits
              frequently, reducing the number of clicks needed after login.

              Gradient colours mirror the corresponding StatCard gradients so
              the sidebar feels visually connected to the stats grid above:
                Find Jobs  → blue  (same as Total Bids card)
                My Bids    → amber (same as Pending card)
                My Profile → purple (same as Profile Completion card)
              ---------------------------------------------------------------- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.98rem" }}>Quick Actions</h2>

            {/* Find Jobs — primary discovery action; blue gradient */}
            <QuickAction to="/jobs"                    icon={Search}    grad="linear-gradient(135deg,#075985,#0EA5E9)" title="Find Jobs"    sub="Browse open opportunities" />

            {/* My Bids — view/track all submitted proposals; amber gradient */}
            <QuickAction to="/my-bids"                 icon={Send}      grad="linear-gradient(135deg,#D97706,#FCD34D)" title="My Bids"      sub="Track your proposals"      />

            {/* My Profile — view public-facing freelancer profile; purple gradient */}
            <QuickAction to={`/freelancer/${user?.id}`} icon={User}     grad="linear-gradient(135deg,#6D28D9,#A78BFA)" title="My Profile"   sub="View your public profile"  />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          RESPONSIVE BREAKPOINTS
          Injected as a <style> block so these media queries can target the
          custom className identifiers (.stats-grid, .dash-grid) that were
          added to the layout divs.

          900px breakpoint (tablet):
            .stats-grid → 2 columns (Total Bids + Pending on row 1,
                          Active Jobs + Profile on row 2)
            .dash-grid  → 1 column (Recent Bids stacked above Quick Actions)

          500px breakpoint (mobile):
            .stats-grid → 1 column (each stat card full-width, stacked)
          ---------------------------------------------------------------- */}
      <style>{`
        @media(max-width:900px){ .stats-grid{grid-template-columns:repeat(2,1fr)!important;} .dash-grid{grid-template-columns:1fr!important;} }
        @media(max-width:500px){ .stats-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
};

export default FreelancerDashboard;
