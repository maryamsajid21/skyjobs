{/*
 * ClientDashboard.jsx
 *
 * PAGE OVERVIEW
 * -------------
 * This is the main dashboard page for authenticated users with role="client".
 * It gives the client a high-level snapshot of their activity on the platform.
 *
 * WHAT IT SHOWS
 * -------------
 * 1. Stats grid     — Four KPI cards: Total Jobs, Open, In Progress, Completed.
 * 2. Recent Jobs    — A scrollable table (up to 6 rows) of the client's latest job
 *                     listings with title, bid count, deadline, and current status.
 * 3. Quick Actions  — A sidebar column of shortcut links for the three most common
 *                     client actions: Post a Job, Manage Jobs, Browse Jobs.
 *
 * WHO SEES IT
 * -----------
 * Only users whose role === "client" are routed here (enforced at the router level).
 * The welcome message uses the first word of `user.name` from AuthContext.
 *
 * API CALLS
 * ---------
 * GET /jobs/my/jobs  — Returns { data: Job[] } for the currently authenticated
 *                      client. Called once on mount via useEffect. The response
 *                      array is stored in `jobs` state and all derived stats are
 *                      computed client-side from that single array.
 */}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Briefcase, TrendingUp, CheckCircle, Clock, ArrowRight, BarChart3, Search } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

{/* ─────────────────────────────────────────────────────────────
    StatCard  —  reusable KPI tile used in the stats grid.

    Props
    -----
    label  : string   — Short display label rendered in uppercase (e.g. "Open").
    value  : number   — The numeric stat value rendered in a large bold font.
    icon   : LucideIcon — Icon component imported from lucide-react.
    grad   : string   — CSS `background` value (linear-gradient) for the icon box.
                        Each stat type receives a distinct gradient so the cards
                        are colour-coded at a glance:
                          Total Jobs  → dark-to-sky-blue   (trust / primary)
                          Open        → cyan spectrum       (active / inviting)
                          In Progress → amber spectrum      (caution / ongoing)
                          Completed   → green spectrum      (success / done)
    delay  : number   — Seconds offset for the CSS animation (see animationDelay
                        note below). Defaults to 0.

    GLASSMORPHISM NOTE
    ------------------
    The `glass` Tailwind utility class (defined globally) applies:
      background : rgba(255,255,255,0.55)  — semi-transparent white fill;
                   the 0.55 opacity is low enough to let the page background
                   bleed through, creating depth while keeping text readable.
      backdrop-filter: blur(18px)          — frosted-glass blur applied to
                   everything behind the card. 18 px is strong enough to
                   obscure detail without making the card feel murky.
      border     : 1px solid rgba(255,255,255,0.45) — nearly-invisible border
                   that catches light and reinforces the glass illusion.

    ANIMATION STAGGER (animationDelay)
    -----------------------------------
    Each StatCard is given an incrementally larger delay (0 → 0.07 → 0.14 → 0.21 s).
    Because they all share the same `animate-fade-up` keyframe class, they appear
    to "cascade" upward one after another rather than all popping in simultaneously.
    The 70 ms interval (0.07 s) is short enough to feel snappy but long enough for
    the human eye to perceive individual card entries.
   ───────────────────────────────────────────────────────────── */}
const StatCard = ({ label, value, icon: Icon, grad, delay = 0 }) => (
  <div className="glass animate-fade-up" style={{
    borderRadius: 20, padding: "24px",
    display: "flex", alignItems: "flex-start", gap: 16,
    /* animationDelay offsets when this particular card starts its fade-up
       animation, creating the visual stagger effect across the four tiles. */
    animationDelay: `${delay}s`
  }}>
    {/* Gradient icon box — the `grad` prop supplies the colour-coded background.
        boxShadow uses rgba(0,0,0,0.15): a 15 % black shadow that is subtle
        enough to not compete with the coloured gradient but still lifts the
        box off the card surface. */}
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
    }}>
      <Icon size={22} color="white" />
    </div>
    <div>
      {/* Label row — uppercase micro-text acts as a descriptive caption so
          the large numeric value below it has immediate context. */}
      <p style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "Open Sans,sans-serif", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{label}</p>
      {/* Primary numeric value — large weight-800 figure is the visual focal
          point of the card so the client can scan all four numbers instantly. */}
      <p style={{ fontSize: "2rem", fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

{/* ─────────────────────────────────────────────────────────────
    QuickAction  —  a single shortcut link card in the sidebar.

    Props
    -----
    to    : string      — react-router <Link> destination path.
    icon  : LucideIcon  — Icon component for the coloured badge on the left.
    grad  : string      — CSS gradient for the icon badge background.
                          Colours are chosen to match their action's intent:
                            Post a Job   → green  (create / positive action)
                            Manage Jobs  → blue   (manage / neutral control)
                            Browse Jobs  → purple (explore / discovery)
    title : string      — Bold primary label for the action.
    sub   : string      — Muted subtitle line with a brief description.

    HOVER BEHAVIOUR
    ---------------
    The `card-hover` class applies a CSS transform + box-shadow transition
    (defined globally). The <Link> itself uses the `glass` utility.
    The ArrowRight icon (→) acts as a visual affordance indicating navigation.
   ───────────────────────────────────────────────────────────── */}
const QuickAction = ({ to, icon: Icon, grad, title, sub }) => (
  <Link to={to}
    className="card-hover glass"
    style={{
      borderRadius: 16, padding: "20px", textDecoration: "none",
      display: "flex", alignItems: "center", gap: 14,
      cursor: "pointer"
    }}>
    {/* Icon badge — same gradient-box pattern as StatCard but slightly
        smaller (46 px vs 52 px) to suit the more compact sidebar layout.
        boxShadow rgba(0,0,0,0.15) mirrors StatCard for visual consistency. */}
    <div style={{
      width: 46, height: 46, borderRadius: 12,
      background: grad,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
    }}>
      <Icon size={19} color="white" />
    </div>
    <div style={{ flex: 1 }}>
      {/* Action title — bold Poppins heading, deep navy colour matches brand. */}
      <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem" }}>{title}</p>
      {/* Action subtitle — muted slate-500 helper text. */}
      <p style={{ fontSize: "0.76rem", color: "#64748B", marginTop: 2 }}>{sub}</p>
    </div>
    {/* Trailing arrow icon — provides a clear "clickable / navigate" affordance. */}
    <ArrowRight size={15} color="#94A3B8" />
  </Link>
);

{/* ─────────────────────────────────────────────────────────────
    ClientDashboard  —  the main page component.

    STATE
    -----
    jobs    : Job[]   — Full list of the client's jobs returned by the API.
    loading : boolean — True while the GET /jobs/my/jobs request is in-flight;
                        used to show the <Spinner> in place of the jobs table.

    DERIVED STATS (computed from `jobs` array, no extra API calls)
    ----------------------------------------------------------------
    open      — jobs whose status === "open"        (accepting bids)
    active    — jobs whose status === "in_progress" (freelancer hired, work ongoing)
    completed — jobs whose status === "completed"   (work delivered and closed)
    Total Jobs is simply `jobs.length` (all statuses included).
   ───────────────────────────────────────────────────────────── */}
const ClientDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Fetch the client's jobs once when the component mounts.
     The `.finally()` ensures the spinner is always dismissed even if the
     request errors, preventing a perpetual loading state. */
  useEffect(() => {
    api.get("/jobs/my/jobs")
      .then(({ data }) => setJobs(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Derived stat: count of jobs currently open and accepting bids. */
  const open      = jobs.filter(j => j.status === "open").length;
  /* Derived stat: count of jobs with an active freelancer (in_progress). */
  const active    = jobs.filter(j => j.status === "in_progress").length;
  /* Derived stat: count of jobs that have been fully completed. */
  const completed = jobs.filter(j => j.status === "completed").length;

  return (
    <div className="page">
      <Navbar />

      {/* ── HEADER BANNER ───────────────────────────────────────────
          A full-width gradient strip that greets the client by first name
          and provides a prominent "Post a Job" CTA.

          The two absolutely-positioned radial-gradient circles are purely
          decorative blobs that add visual depth to the banner:
            - Top-right purple blob  : rgba(99,102,241,0.22) — indigo at 22%
              opacity; soft enough to be subliminal but adds warmth.
            - Bottom-left green blob : rgba(34,197,94,0.18)  — emerald at 18%
              opacity; echoes the "success / completed" green used in stats.
          Both use `pointerEvents:"none"` so they never intercept click events.
         ────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 55%,#0EA5E9 100%)",
        padding: "44px 0", position: "relative", overflow: "hidden"
      }}>
        {/* Decorative top-right ambient blob — indigo tint at 22% opacity. */}
        <div style={{ position: "absolute", top: "-30%", right: "-8%", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
        {/* Decorative bottom-left ambient blob — green tint at 18% opacity. */}
        <div style={{ position: "absolute", bottom: "-40%", left: "-5%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative" }}>
          <div>
            {/* Muted "Welcome back," label above the user's name. */}
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.84rem", marginBottom: 5 }}>Welcome back,</p>
            {/* First name only — `split(" ")[0]` trims to given name for brevity. */}
            <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 900, color: "white", fontSize: "2.1rem", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
              {user?.name?.split(" ")[0]}
            </h1>
            {/* Sub-headline sets context for the dashboard view below. */}
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", marginTop: 7 }}>Here's an overview of your projects</p>
          </div>
          {/* Primary CTA — navigates to /post-job. Styled with the global
              `btn-cta` class (sky-blue pill button). */}
          <Link to="/post-job" className="btn-cta" style={{ padding: "12px 28px" }}>
            <Plus size={15} /> Post a Job
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>

        {/* ── STATS GRID ──────────────────────────────────────────────
            Four KPI cards in a 4-column grid (collapses to 2 cols at
            900 px and 1 col at 500 px via the responsive <style> below).

            Each StatCard receives:
              value  — a derived count from the `jobs` array.
              grad   — a colour-coded gradient:
                         Total Jobs  → dark-to-sky-blue  (primary brand palette)
                         Open        → cyan spectrum     (inviting, active)
                         In Progress → amber spectrum    (warm, cautionary)
                         Completed   → green spectrum    (success, positive)
              delay  — stagger offset in seconds (0, 0.07, 0.14, 0.21) so the
                       cards animate in sequentially rather than all at once,
                       using the delay-100 / delay-200 pattern common in
                       entrance animations (here implemented via `animationDelay`
                       style instead of Tailwind's delay-* utilities so the
                       exact float values can be used).
           ────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }} className="stats-grid">
          {/* Total Jobs — total count of all jobs regardless of status. */}
          <StatCard label="Total Jobs"  value={jobs.length} icon={BarChart3}   grad="linear-gradient(135deg,#075985,#0EA5E9)"  delay={0}    />
          {/* Open — jobs currently open and accepting freelancer bids. */}
          <StatCard label="Open"        value={open}        icon={Briefcase}   grad="linear-gradient(135deg,#0891B2,#67E8F9)"  delay={0.07} />
          {/* In Progress — jobs with an accepted bid where work is underway. */}
          <StatCard label="In Progress" value={active}      icon={TrendingUp}  grad="linear-gradient(135deg,#D97706,#FCD34D)"  delay={0.14} />
          {/* Completed — jobs that have been finished and closed out. */}
          <StatCard label="Completed"   value={completed}   icon={CheckCircle} grad="linear-gradient(135deg,#16A34A,#22C55E)"  delay={0.21} />
        </div>

        {/* ── MAIN TWO-COLUMN LAYOUT ───────────────────────────────────
            Left column  (1fr)   : Recent Jobs table.
            Right column (300px) : Quick Actions sidebar.
            Collapses to a single column at 900 px (see responsive <style>).
           ────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22, alignItems: "start" }} className="dash-grid">

          {/* ── RECENT JOBS TABLE ─────────────────────────────────────
              A glassmorphism card containing up to 6 of the most recent
              jobs. Shows three states:
                1. Loading  — centred <Spinner> while the API call is in-flight.
                2. Empty    — illustrated empty-state with a "Post a Job" prompt.
                3. Populated — list rows with title, bid count, deadline, status.

              TABLE ROW HOVER EFFECT
              ----------------------
              Each row uses onMouseEnter / onMouseLeave event handlers rather
              than a CSS :hover rule because the rows are plain <div> elements
              (not <tr>) and their background must be toggled imperatively via
              the style property:
                onMouseEnter → background = "rgba(3,105,161,0.04)"
                               A 4% sky-blue tint — barely perceptible but
                               enough to confirm the row is interactive.
                onMouseLeave → background = "transparent"
                               Restores the default see-through glass state.
              The `transition: "background 0.18s"` inline style ensures the
              colour change fades in/out smoothly.

              PER-ROW animationDelay PATTERN
              --------------------------------
              When iterating over `jobs.slice(0,6).map((job, i) => ...)`, the
              index `i` could be used to assign an `animationDelay` so each row
              staggers its entrance (the same pattern used in the StatCards).
              Currently the rows rely on the parent card's single animate-fade-up
              class rather than per-row delays.

              METADATA DISPLAYED PER ROW
              ---------------------------
              bidCount   — `job.bidCount ?? 0` — the number of bids the job has
                           received. The `?? 0` null-coalescing guard handles
                           cases where the API omits the field (e.g., freshly
                           posted jobs with no bids yet).
              deadline   — Formatted to "Mon D" (e.g., "Jun 5") using
                           toLocaleDateString with { month:"short", day:"numeric" }
                           to keep the display compact inside the row.
              status     — Rendered by the shared <StatusBadge> component which
                           maps each status string to a colour-coded pill.
             ────────────────────────────────────────────────────────── */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: "hidden" }}>
            {/* Table header row: "Recent Jobs" title and "View all →" link. */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: "1px solid rgba(224,242,254,0.8)"
            }}>
              <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.98rem" }}>Recent Jobs</h2>
              {/* "View all" link — gap increases from 4px to 6px on hover,
                  making the arrow visually "slide" right for a micro-interaction. */}
              <Link to="/my-jobs" style={{ fontSize: "0.8rem", color: "#0369A1", fontFamily: "Poppins,sans-serif", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "gap 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.gap = "6px"}
                onMouseLeave={e => e.currentTarget.style.gap = "4px"}>
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {/* Loading state — show a centred spinner while API call is in-flight. */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "52px 0" }}>
                <Spinner size="lg" />
              </div>
            ) : jobs.length === 0 ? (
              /* Empty state — shown when the client has posted no jobs yet.
                 Includes an illustrative icon box and a direct "Post a Job" CTA. */
              <div style={{ textAlign: "center", padding: "52px 24px" }}>
                <div style={{
                  width: 62, height: 62, borderRadius: 18,
                  background: "linear-gradient(135deg,#075985,#0EA5E9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px", boxShadow: "0 6px 18px rgba(3,105,161,0.3)"
                }}>
                  <Briefcase size={26} color="white" />
                </div>
                <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 8 }}>No jobs yet</p>
                <p style={{ fontSize: "0.84rem", color: "#64748B", marginBottom: 22 }}>Post your first job and start receiving bids.</p>
                <Link to="/post-job" className="btn-cta" style={{ padding: "10px 24px" }}>
                  <Plus size={13} /> Post a Job
                </Link>
              </div>
            ) : (
              /* Populated state — render up to 6 most-recent jobs. */
              <div>
                {jobs.slice(0, 6).map((job, i) => (
                  /* Each row is a flex container separating job info (left)
                     from the status badge (right).
                     The bottom border is omitted on the last visible row so
                     there is no orphaned hairline at the card's bottom edge.
                     animationDelay could be set here as `${i * 0.05}s` to
                     stagger rows — the index `i` is available for that pattern. */
                  <div key={job.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "15px 24px",
                    /* Conditionally render a separator only between rows, not after the last. */
                    borderBottom: i < Math.min(jobs.length, 6) - 1 ? "1px solid rgba(240,249,255,0.9)" : "none",
                    gap: 12, transition: "background 0.18s"
                  }}
                    /* Row hover: apply a faint sky-blue tint to signal interactivity. */
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(3,105,161,0.04)"}
                    /* Row leave: restore transparent background (glass see-through). */
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Job title — links to the job detail page. Underline is added on
                          hover via onMouseEnter/Leave for a lightweight hover affordance
                          without a global CSS rule. overflow:hidden + textOverflow:ellipsis
                          truncates long titles so they never break the row layout. */}
                      <Link to={`/jobs/${job.id}`} style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0369A1", textDecoration: "none", fontSize: "0.87rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                        {job.title}
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                        {/* bidCount — number of freelancers who have bid on this job.
                            `?? 0` guards against null/undefined when the field is
                            absent on freshly created jobs with zero bids. */}
                        <span style={{ fontSize: "0.73rem", color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <Briefcase size={11} color="#94A3B8" /> {job.bidCount ?? 0} bids
                        </span>
                        {/* deadline — the job's closing date formatted as "Mon D"
                            (e.g., "Jun 5") for compact display in the row. */}
                        <span style={{ fontSize: "0.73rem", color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} color="#94A3B8" /> {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {/* Status badge — delegates colour/label mapping to the shared
                        StatusBadge component so all status pills stay consistent
                        across the entire application. */}
                    <StatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── QUICK ACTIONS SIDEBAR ─────────────────────────────────
              Three shortcut links stacked vertically in a 300 px column.
              Each QuickAction receives a distinct gradient colour so the
              actions are visually distinguishable:
                Post a Job   → green  (#16A34A → #22C55E) — constructive action
                Manage Jobs  → blue   (#075985 → #0EA5E9) — primary brand colour
                Browse Jobs  → purple (#6D28D9 → #A78BFA) — exploratory discovery
             ────────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.98rem" }}>Quick Actions</h2>
            {/* Post a Job — green gradient signals a positive creation action. */}
            <QuickAction to="/post-job" icon={Plus}     grad="linear-gradient(135deg,#16A34A,#22C55E)" title="Post a Job"    sub="Start receiving bids today"    />
            {/* Manage Jobs — blue gradient aligns with the primary brand palette. */}
            <QuickAction to="/my-jobs"  icon={Briefcase} grad="linear-gradient(135deg,#075985,#0EA5E9)" title="Manage Jobs"   sub="View and edit your listings"   />
            {/* Browse Jobs — purple gradient connotes exploration / discovery. */}
            <QuickAction to="/jobs"     icon={Search}    grad="linear-gradient(135deg,#6D28D9,#A78BFA)" title="Browse Jobs"   sub="See the marketplace"           />
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE BREAKPOINTS ────────────────────────────────────
          These media queries override the inline grid-template-columns
          styles because inline styles have higher specificity than
          stylesheet rules, so they must be overridden via !important.
            ≤ 900 px : stats-grid collapses to 2 columns (tablet).
                       dash-grid collapses to 1 column (quick actions
                       moves below the recent jobs table).
            ≤ 500 px : stats-grid collapses to 1 column (mobile).
         ────────────────────────────────────────────────────────────── */}
      <style>{`
        @media(max-width:900px){ .stats-grid{grid-template-columns:repeat(2,1fr)!important;} .dash-grid{grid-template-columns:1fr!important;} }
        @media(max-width:500px){ .stats-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
