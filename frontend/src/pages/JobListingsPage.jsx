/**
 * JobListingsPage.jsx
 *
 * Public-facing browse page that displays all open job postings on the SkyJobs
 * platform. Freelancers (and unauthenticated visitors) land here to discover
 * available work.
 *
 * KEY FEATURES
 * ------------
 * - Sidebar filters: sort order (4 options) and job category (6 options + "All")
 *   with animated active-state highlight via a coloured left border.
 * - Search bar: full-text keyword search committed on Enter or on blur,
 *   so the API is not called on every keystroke.
 * - URL-driven state: every filter value (search, category, sort, page) lives
 *   in the query string via React Router's useSearchParams.  Sharing or
 *   bookmarking a URL perfectly restores the current view.
 * - Server-side pagination: Prev / Next buttons advance through pages returned
 *   by the backend; buttons are disabled and visually faded at the boundaries.
 * - Staggered card entrance animations: each JobCard receives an
 *   animationDelay proportional to its list index so cards cascade in.
 * - Responsive layout: a CSS media query collapses the two-column grid to
 *   a single column on screens narrower than 768 px.
 *
 * API CALL
 * --------
 * GET /jobs
 *   Query params: status="open", page, search?, category?, sort?
 *   Expected response shape: { data: { jobs: [], total: number, pages: number } }
 *   Handled by the shared Axios instance at src/api/axios.js.
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Clock, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* ---------------------------------------------------------------------------
 * CATEGORY CONSTANTS
 *
 * CATEGORIES  — ordered list used to render the sidebar category buttons.
 *
 * CAT_COLORS  — maps each category name to a single "accent" hex colour.
 *               Used for: the active-state left-border on sidebar buttons
 *               (so each category has its own brand colour, not a generic blue)
 *               and can be reused anywhere a solid colour is needed.
 *
 * CAT_GRADS   — maps each category name to a two-stop 135-degree CSS gradient.
 *               Used exclusively on the category pill badge rendered inside
 *               each JobCard.  A diagonal gradient (135deg) gives the pill
 *               visual depth without relying on images or shadows.
 *               The start colour always matches CAT_COLORS so the pill and the
 *               left-border share the same hue family.
 * --------------------------------------------------------------------------- */
const CATEGORIES = ["Web Development","Design & Creative","Mobile Apps","Writing & Content","Marketing","Data & Analytics"];
const CAT_COLORS = {
  "Web Development":  "#0369A1",
  "Design & Creative":"#7C3AED",
  "Mobile Apps":      "#059669",
  "Writing & Content":"#D97706",
  "Marketing":        "#DC2626",
  "Data & Analytics": "#0891B2",
};
const CAT_GRADS = {
  /* Each value is a CSS linear-gradient string used as the `background` of the
   * category pill badge on a job card.  The gradient runs from a saturated
   * "dark" shade (start) to a lighter/brighter tint (end), giving the small
   * pill a professional, jewel-toned look that scales well at tiny font sizes. */
  "Web Development":  "linear-gradient(135deg,#0369A1,#0EA5E9)",
  "Design & Creative":"linear-gradient(135deg,#7C3AED,#A78BFA)",
  "Mobile Apps":      "linear-gradient(135deg,#059669,#34D399)",
  "Writing & Content":"linear-gradient(135deg,#D97706,#FCD34D)",
  "Marketing":        "linear-gradient(135deg,#DC2626,#F87171)",
  "Data & Analytics": "linear-gradient(135deg,#0891B2,#67E8F9)",
};

/* ---------------------------------------------------------------------------
 * JobCard SUB-COMPONENT
 *
 * A purely presentational card that wraps a single job object.  It is
 * intentionally extracted from the main component so the JSX stays readable
 * and so React can reconcile individual cards without re-rendering the whole
 * list.
 *
 * Glassmorphism on job cards
 * --------------------------
 * The `glass` CSS class (defined globally) applies:
 *   background: rgba(255,255,255,0.72)
 *   backdrop-filter: blur(16px) saturate(160%)
 *   border: 1px solid rgba(255,255,255,0.55)
 * This makes each card appear to "float" above the page background by letting
 * the background colour bleed through with a frosted-glass blur.  The opacity
 * and blur values are deliberately lighter than the sidebar's glass treatment
 * so the cards feel airier and the sidebar reads as a more "permanent" panel.
 *
 * Props
 * -----
 * job {object} — a single job record from the API response.
 * --------------------------------------------------------------------------- */
const JobCard = ({ job }) => {
  /* Resolve the accent colour and gradient for this job's category.
   * Falls back to the "Web Development" blue family if the category is
   * unrecognised or missing, ensuring no card ever renders without colour. */
  const catColor = CAT_COLORS[job.category] || "#0369A1";
  const catGrad  = CAT_GRADS[job.category]  || "linear-gradient(135deg,#0369A1,#0EA5E9)";
  return (
    /* The entire card is a React Router <Link> so the whole surface area is
     * clickable, navigating to the job detail page without needing a separate
     * "View" button.  display:"block" overrides the default inline rendering
     * of <a> so the card takes full column width. */
    <Link to={`/jobs/${job.id}`}
      className="card-hover glass animate-fade-up"
      style={{ display: "block", borderRadius: 18, padding: "24px", textDecoration: "none" }}>
      {/* --- Card header: category pill, status badge, title, description, budget --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          {/* Category pill uses catGrad (the diagonal gradient) so the colour
           * immediately signals which discipline the job belongs to. */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{
              padding: "3px 11px",
              background: catGrad,
              color: "white",
              borderRadius: 7, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Poppins,sans-serif"
            }}>{job.category}</span>
            {/* StatusBadge renders a coloured pill for open/in_progress/completed/cancelled */}
            <StatusBadge status={job.status} />
          </div>
          <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "1rem", lineHeight: 1.4, marginBottom: 8 }}>{job.title}</h3>
          {/* Description is clamped to 2 lines via webkit line-clamp so all cards
           * maintain a consistent height in the list layout. */}
          <p style={{ fontSize: "0.84rem", color: "#64748B", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {job.description}
          </p>
        </div>
        {/* Budget range sits in its own right-aligned column so it never wraps
         * into the title text on narrow cards. */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#22C55E", fontSize: "1.12rem" }}>${job.budgetMin}–${job.budgetMax}</p>
          <p style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 3 }}>Budget</p>
        </div>
      </div>

      {/* --- Required skills tag strip ---
       * Renders at most 4 skill pills; any overflow is summarised with a "+N"
       * pill to prevent the card from expanding unpredictably when a job has
       * many skills.  The optional-chaining on requiredSkills guards against
       * jobs that have no skills array in the API response. */}
      {job.requiredSkills?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {job.requiredSkills.slice(0, 4).map(s => (
            <span key={s} style={{
              padding: "3px 11px",
              background: "rgba(3,105,161,0.08)",
              color: "#0369A1",
              borderRadius: 7, fontSize: "0.7rem", fontWeight: 600,
              border: "1px solid rgba(14,165,233,0.2)"
            }}>{s}</span>
          ))}
          {/* Overflow indicator: shows count of hidden skills without listing them */}
          {job.requiredSkills.length > 4 && (
            <span style={{ padding: "3px 10px", background: "rgba(100,116,139,0.08)", color: "#94A3B8", borderRadius: 7, fontSize: "0.7rem" }}>
              +{job.requiredSkills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* --- Card footer: bid count, deadline, client name ---
       * A subtle top border (low-opacity sky-blue) visually separates the
       * metadata row from the content above without feeling heavy. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(224,242,254,0.8)" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {/* Nullish-coalesce on bidCount handles jobs that have no bids yet
           * (the field may be missing or zero from the API). */}
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.77rem", color: "#64748B" }}>
            <Briefcase size={12} color="#94A3B8" /> {job.bidCount ?? 0} bids
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.77rem", color: "#64748B" }}>
            <Clock size={12} color="#94A3B8" /> Due {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        {/* Client name is optional; only rendered when the API populates it via
         * the job.client association. */}
        {job.client && (
          <span style={{ fontSize: "0.73rem", color: "#94A3B8", fontFamily: "Open Sans,sans-serif" }}>by {job.client.name}</span>
        )}
      </div>
    </Link>
  );
};

/* ---------------------------------------------------------------------------
 * JobListingsPage — MAIN COMPONENT
 *
 * All filter state is stored exclusively in the URL query string via
 * useSearchParams so that:
 *   1. The browser Back button works correctly.
 *   2. Users can share or bookmark a filtered view.
 *   3. On a hard refresh the exact same results reappear without any
 *      additional localStorage / sessionStorage logic.
 *
 * Local component state is minimal — only the fetched jobs, pagination
 * metadata, loading flag, and the mobile filter-drawer toggle.
 * --------------------------------------------------------------------------- */
const JobListingsPage = () => {
  /* useSearchParams returns a URLSearchParams object (read) and a setter.
   * Reading from it on every render means the derived values below
   * (search, category, sort, page) always reflect the current URL. */
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  /* meta holds total job count (for the header subtitle) and total page count
   * (for pagination boundary checks).  Initialised to sane defaults so the
   * component renders without errors before the first API response. */
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  /* filtersOpen controls a mobile drawer — not wired to a toggle button in
   * this render path but available for responsive extension. */
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ---------------------------------------------------------------------------
   * URL PARAM SYNC — derive filter values from the query string
   *
   * These variables are re-derived on every render from the current
   * searchParams object.  Because useSearchParams triggers a re-render
   * whenever the URL changes, these always stay in sync with the address bar.
   *
   * On initial mount (e.g. user visits /jobs?category=Marketing&sort=newest)
   * URLSearchParams.get() reads the existing query string, so the sidebar
   * buttons and search input immediately reflect any pre-set filter values
   * rather than defaulting to blank/newest.
   * ------------------------------------------------------------------------- */
  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const sort     = searchParams.get("sort")     || "newest";
  /* page is stored as a string in the URL; parseInt converts it to a number
   * so arithmetic comparisons (page === 1, page === meta.pages) work
   * correctly without type-coercion surprises. */
  const page     = parseInt(searchParams.get("page") || "1");

  /* ---------------------------------------------------------------------------
   * DATA FETCHING
   *
   * fetchJobs is memoised with useCallback so it is only recreated when one
   * of its four dependencies changes.  This prevents useEffect from firing
   * on every render and limits API calls to genuine filter/page changes.
   *
   * Only jobs with status "open" are requested; the backend filters by status
   * so cancelled or in-progress jobs never appear in the public listing.
   * ------------------------------------------------------------------------- */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      /* Build params object incrementally so undefined/empty values are never
       * sent to the API (avoids backend treating an empty string as a filter). */
      const params = { status: "open", page };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (sort)     params.sort     = sort;
      const { data } = await api.get("/jobs", { params });
      setJobs(data.data.jobs);
      /* total  — absolute count of matching jobs (shown in the header subtitle
       *          and the "Showing X of Y" result count line).
       * pages  — total page count used to disable the Next button on the last
       *          page and to render the "N / M" page indicator. */
      setMeta({ total: data.data.total, pages: data.data.pages });
    } catch { } finally { setLoading(false); }
  }, [search, category, sort, page]);

  /* Re-fetch whenever the memoised fetchJobs reference changes (i.e. whenever
   * any filter or page value in the URL changes). */
  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  /* ---------------------------------------------------------------------------
   * setParam HELPER
   *
   * Centralised utility for writing a single query-string key/value pair.
   * It clones the current searchParams, sets or deletes the key, then always
   * resets "page" to 1 so the user is never stranded on a page that no longer
   * exists after a filter change (e.g. jumping from page 5 of "Marketing"
   * results back to page 1 when switching to "Design & Creative").
   *
   * Passing val="" or val=undefined deletes the key from the URL entirely,
   * keeping the query string clean (no ?search=&category= noise).
   * ------------------------------------------------------------------------- */
  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.set("page", "1"); setSearchParams(next);
  };

  return (
    <div className="page">
      <Navbar />

      {/* -----------------------------------------------------------------------
       * HEADER BANNER
       *
       * A full-width gradient stripe that establishes the page's visual
       * identity.  The gradient runs from deep navy (#0C4A6E) through ocean
       * blue (#0369A1) to sky blue (#0EA5E9) at 135 deg, consistent with the
       * rest of the SkyJobs brand palette.
       *
       * The absolutely-positioned radial gradient disc in the top-right corner
       * is a decorative "glow" element (pointer-events:none so it never blocks
       * interaction).  overflow:hidden on the parent clips it to the banner.
       *
       * meta.total is displayed here so visitors immediately see how many
       * opportunities are available before scrolling or filtering.
       * --------------------------------------------------------------------- */}
      <div style={{ background: "linear-gradient(135deg,#0C4A6E,#0369A1 60%,#0EA5E9)", padding: "44px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "white", marginBottom: 8, letterSpacing: "-0.02em" }}>Browse Jobs</h1>
          <p style={{ color: "rgba(255,255,255,0.68)", fontSize: "0.9rem" }}>
            Find your next project from <strong style={{ color: "white" }}>{meta.total}</strong> open opportunities
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>
        {/* Two-column grid: fixed 260px sidebar + fluid job list.
         * The .listings-grid class is targeted by the responsive media query
         * at the bottom of the component to collapse to one column on mobile. */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }} className="listings-grid">

          {/* ---------------------------------------------------------------------
           * SIDEBAR FILTERS
           *
           * Glassmorphism on the sidebar
           * -----------------------------
           * The `glass` CSS class applies:
           *   background: rgba(255,255,255,0.72)
           *   backdrop-filter: blur(16px) saturate(160%)
           *   border: 1px solid rgba(255,255,255,0.55)
           * The sidebar intentionally uses the same glass recipe as the cards but
           * with position:sticky so it stays in view while the user scrolls the
           * job list.  top:88 clears the fixed Navbar height (~80px + spacing).
           *
           * Active-state left border on filter buttons
           * -------------------------------------------
           * Every filter button always has a 3px left border, but its colour
           * switches between the brand blue (or the category-specific colour) and
           * "transparent" rather than between "present" and "absent".  Using a
           * transparent border instead of no border at all means the button's
           * total width never changes when the active state toggles, preventing
           * layout shift (the surrounding buttons do not reflow).
           * ------------------------------------------------------------------- */}
          <div className="glass" style={{ borderRadius: 20, padding: "24px", position: "sticky", top: 88 }}>
            {/* Sidebar heading with gradient icon */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#075985,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SlidersHorizontal size={14} color="white" />
              </div>
              <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.9rem" }}>Filters</span>
            </div>

            {/* --- Sort options ---
             * Iterates over a static array of [value, label] tuples so adding
             * a new sort mode only requires one array entry.
             * Active button: blue tinted background + bold weight + 3px solid left border.
             * Inactive button: transparent bg + muted colour + 3px transparent left border
             * (same 3px width to prevent layout shift, as described above).
             * onMouseEnter/Leave provide hover feedback only when the button is
             * NOT already active, preventing a style flicker on the selected item. */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#64748B", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Sort By</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {[["newest","Newest First"],["budget_high","Budget: High → Low"],["budget_low","Budget: Low → High"],["deadline","Deadline: Soonest"]].map(([val, lbl]) => (
                  <button key={val} onClick={() => setParam("sort", val)}
                    style={{
                      padding: "8px 12px", borderRadius: 9, border: "none",
                      background: sort === val ? "rgba(3,105,161,0.1)" : "transparent",
                      color: sort === val ? "#0369A1" : "#64748B",
                      fontSize: "0.84rem", cursor: "pointer", textAlign: "left",
                      fontFamily: "Open Sans,sans-serif", fontWeight: sort === val ? 600 : 400,
                      transition: "all 0.18s",
                      /* 3px solid brand-blue when active; 3px transparent when
                       * inactive — same physical width either way so no reflow. */
                      borderLeft: sort === val ? "3px solid #0369A1" : "3px solid transparent"
                    }}
                    onMouseEnter={e => { if (sort !== val) { e.currentTarget.style.background = "rgba(3,105,161,0.05)"; e.currentTarget.style.color = "#0369A1"; }}}
                    onMouseLeave={e => { if (sort !== val) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Category filter buttons ---
             * "All Categories" is a synthetic first option that clears the
             * category param (passes "" to setParam which calls next.delete()).
             * Each real category button uses CAT_COLORS[c] for its active left
             * border instead of the generic brand blue, so "Design & Creative"
             * shows a purple border, "Mobile Apps" shows green, etc.  This
             * reinforces the colour-coding that also appears on the card pills. */}
            <div>
              <label style={{ display: "block", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#64748B", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.07em" }}>Category</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* "All Categories" — active when no category param is set */}
                <button onClick={() => setParam("category", "")}
                  style={{
                    padding: "8px 12px", borderRadius: 9, border: "none",
                    background: !category ? "rgba(3,105,161,0.1)" : "transparent",
                    color: !category ? "#0369A1" : "#64748B",
                    fontSize: "0.84rem", cursor: "pointer", textAlign: "left",
                    fontFamily: "Open Sans,sans-serif", fontWeight: !category ? 600 : 400, transition: "all 0.18s",
                    borderLeft: !category ? "3px solid #0369A1" : "3px solid transparent"
                  }}
                  onMouseEnter={e => { if (category) { e.currentTarget.style.background = "rgba(3,105,161,0.05)"; e.currentTarget.style.color = "#0369A1"; }}}
                  onMouseLeave={e => { if (category) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}}>
                  All Categories
                </button>
                {/* Individual category buttons — left border colour comes from
                 * CAT_COLORS so each category has its own unique accent. */}
                {CATEGORIES.map(c => {
                  const active = category === c;
                  return (
                    <button key={c} onClick={() => setParam("category", c)}
                      style={{
                        padding: "8px 12px", borderRadius: 9, border: "none",
                        background: active ? "rgba(3,105,161,0.1)" : "transparent",
                        color: active ? "#0369A1" : "#64748B",
                        fontSize: "0.84rem", cursor: "pointer", textAlign: "left",
                        fontFamily: "Open Sans,sans-serif", fontWeight: active ? 600 : 400, transition: "all 0.18s",
                        /* CAT_COLORS[c] gives each category its own hue on the
                         * active border (e.g. purple for Design, green for Mobile). */
                        borderLeft: active ? `3px solid ${CAT_COLORS[c]}` : "3px solid transparent"
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(3,105,161,0.05)"; e.currentTarget.style.color = "#0369A1"; }}}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748B"; }}}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* "Clear Filters" button — only rendered when at least one non-default
             * filter is active, preventing needless UI noise when the page is in
             * its default state.  Clicking it resets to a blank URLSearchParams
             * object, removing all query params at once. */}
            {(search || category || sort !== "newest") && (
              <button onClick={() => setSearchParams(new URLSearchParams())}
                style={{
                  marginTop: 20, width: "100%", padding: "9px", borderRadius: 10,
                  border: "1.5px solid rgba(252,165,165,0.7)",
                  background: "rgba(254,242,242,0.8)", backdropFilter: "blur(8px)",
                  color: "#DC2626", fontSize: "0.82rem", cursor: "pointer",
                  fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(254,226,226,0.95)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(254,242,242,0.8)"; }}>
                Clear Filters
              </button>
            )}
          </div>

          {/* -------------------------------------------------------------------
           * MAIN CONTENT AREA
           * Contains: search bar, loading spinner / empty state / job grid,
           * and pagination controls.
           * ----------------------------------------------------------------- */}
          <div>
            {/* -----------------------------------------------------------------
             * SEARCH BAR
             *
             * Uses defaultValue (uncontrolled) rather than value (controlled)
             * so the input field does not re-render and lose focus on every
             * keystroke.  The `key={search}` prop forces a full re-mount
             * (resetting the displayed text) when the search param changes
             * externally — e.g. when the user clicks "Clear Filters".
             *
             * The API call is deferred until:
             *   a) The user presses Enter (onKeyDown), or
             *   b) The input loses focus (onBlur).
             * This avoids sending a request on every character typed.
             * --------------------------------------------------------------- */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  defaultValue={search} key={search}
                  onKeyDown={e => { if (e.key === "Enter") setParam("search", e.target.value); }}
                  onBlur={e => setParam("search", e.target.value)}
                  placeholder="Search jobs by title, skill, or keyword…"
                  className="input-base"
                  style={{ paddingLeft: 42, paddingRight: 14, fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* -----------------------------------------------------------------
             * CONDITIONAL RENDER: loading / empty state / job grid
             *
             * Three mutually exclusive branches:
             *   1. loading === true  → centred spinner (300px min height to
             *      prevent jarring layout collapse during fetch).
             *   2. jobs.length === 0 → empty-state panel with a CTA to clear filters.
             *   3. jobs.length > 0   → result count line + staggered card list
             *      + pagination (when more than one page exists).
             * --------------------------------------------------------------- */}
            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
                <Spinner size="lg" />
              </div>
            ) : jobs.length === 0 ? (
              /* ---------------------------------------------------------------
               * EMPTY STATE
               *
               * Shown when the API returns zero jobs for the current filter
               * combination.  The glass panel + gradient icon keeps the empty
               * state on-brand rather than showing a plain text message.
               * ------------------------------------------------------------- */
              <div className="glass" style={{ borderRadius: 20, padding: "64px 24px", textAlign: "center" }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 18,
                  background: "linear-gradient(135deg,#075985,#0EA5E9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", boxShadow: "0 6px 20px rgba(3,105,161,0.3)"
                }}>
                  <Search size={28} color="white" />
                </div>
                <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", marginBottom: 8 }}>No jobs found</h3>
                <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 22 }}>Try adjusting your search or filters</p>
                <button onClick={() => setSearchParams(new URLSearchParams())} className="btn-outline" style={{ padding: "9px 22px" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              /* -----------------------------------------------------------------
               * JOB GRID / LIST
               * --------------------------------------------------------------- */
              <>
                {/* Result count summary line */}
                <p style={{ fontSize: "0.84rem", color: "#64748B", marginBottom: 16, fontFamily: "Open Sans,sans-serif" }}>
                  Showing <strong style={{ color: "#0369A1" }}>{jobs.length}</strong> of <strong style={{ color: "#0369A1" }}>{meta.total}</strong> jobs
                </p>
                {/* Staggered card entrance animation
                 * Each card wrapper receives animationDelay: i * 0.05s so the
                 * first card fades/slides in at 0s, the second at 0.05s, the
                 * third at 0.10s, and so on.  The actual keyframe animation is
                 * defined in the global stylesheet under the class
                 * `animate-fade-up` applied inside <JobCard>.  The stagger
                 * creates a cascading "waterfall" entrance that feels polished
                 * without any third-party animation library. */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {jobs.map((job, i) => (
                    <div key={job.id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>

                {/* ---------------------------------------------------------------
                 * PAGINATION CONTROLS
                 *
                 * Only rendered when there is more than one page of results.
                 *
                 * Prev button disabling:
                 *   disabled={page === 1} — the HTML disabled attribute prevents
                 *   click events entirely.  Additionally, cursor is set to
                 *   "not-allowed" and opacity is reduced to 0.4 so users can
                 *   visually understand why the button is inert.
                 *
                 * Next button disabling:
                 *   disabled={page === meta.pages} — same pattern: when the
                 *   current page equals the last page (meta.pages), the Next
                 *   button becomes disabled, cursor changes to not-allowed, and
                 *   opacity drops to 0.4.
                 *
                 * Both buttons call setParam("page", page ± 1) which writes the
                 * new page number into the URL, triggering a re-fetch via the
                 * useEffect → fetchJobs chain.
                 * ------------------------------------------------------------- */}
                {meta.pages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 36 }}>
                    {/* Prev: disabled and faded when already on page 1 */}
                    <button disabled={page === 1} onClick={() => setParam("page", page - 1)}
                      className="glass"
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                        borderRadius: 12, color: "#0369A1", fontSize: "0.84rem",
                        cursor: page === 1 ? "not-allowed" : "pointer",
                        opacity: page === 1 ? 0.4 : 1,
                        fontFamily: "Poppins,sans-serif", fontWeight: 600,
                        transition: "all 0.22s", border: "1.5px solid rgba(255,255,255,0.8)"
                      }}>
                      <ChevronLeft size={15} /> Prev
                    </button>
                    {/* Current page indicator: "N / M" */}
                    <span style={{ fontSize: "0.84rem", color: "#64748B", fontFamily: "Poppins,sans-serif", padding: "9px 16px" }}>
                      {page} / {meta.pages}
                    </span>
                    {/* Next: disabled and faded when already on the last page */}
                    <button disabled={page === meta.pages} onClick={() => setParam("page", page + 1)}
                      className="glass"
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "9px 18px",
                        borderRadius: 12, color: "#0369A1", fontSize: "0.84rem",
                        cursor: page === meta.pages ? "not-allowed" : "pointer",
                        opacity: page === meta.pages ? 0.4 : 1,
                        fontFamily: "Poppins,sans-serif", fontWeight: 600,
                        transition: "all 0.22s", border: "1.5px solid rgba(255,255,255,0.8)"
                      }}>
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive override: collapse the two-column grid to a single column
       * on viewports narrower than 768px (typical mobile breakpoint). */}
      <style>{`
        @media(max-width:768px){.listings-grid{grid-template-columns:1fr!important;}}
      `}</style>
    </div>
  );
};

export default JobListingsPage;
