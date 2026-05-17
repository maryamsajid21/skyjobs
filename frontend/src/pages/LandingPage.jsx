{/*
 * LandingPage.jsx
 *
 * The public-facing marketing page for SkyJobs. It is the first thing
 * unauthenticated visitors see and is responsible for communicating the
 * platform's value proposition, guiding users to register, and providing
 * quick navigation to job search.
 *
 * Sections (top → bottom):
 *   1. Hero          – Full-width gradient banner with search bar and popular-tag pills.
 *   2. Stats         – Four key platform metrics displayed on a mid-tone gradient strip.
 *   3. Categories    – Card grid of job categories linking to filtered job listings.
 *   4. How It Works  – Four-step process cards on a dark gradient background.
 *   5. Testimonials  – Three review cards from clients and freelancers.
 *   6. Trust Signals – Pill badges (Secure Payments, Verified Profiles, etc.).
 *   7. CTA           – Call-to-action band with "Hire" and "Find Work" buttons.
 *   8. Footer        – Site links, copyright, and the SkyJobs logo.
 *
 * Glassmorphism technique used throughout:
 *   The `.glass` and `.glass-hero` CSS classes (defined globally in index.css /
 *   App.css) apply a frosted-glass effect to elements sitting on top of
 *   coloured gradient backgrounds:
 *     • background: rgba(255,255,255,0.10–0.15)  — semi-transparent white fill
 *       lets the gradient behind bleed through.
 *     • backdropFilter: blur(18px) saturate(160%) — blurs and color-boosts
 *       whatever is rendered underneath the element, creating the frosted look.
 *     • border: 1.5px solid rgba(255,255,255,0.22–0.25) — a faint white edge
 *       mimics the light refraction seen on real frosted glass.
 *     • boxShadow with inset highlight — the "inset 0 1px 0 rgba(255,255,255,0.18)"
 *       adds a subtle top-edge gleam, reinforcing the glass illusion.
 */}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Code2, Palette, Smartphone, PenLine, TrendingUp, BarChart3, Shield, Star, ArrowRight, Users, Briefcase, CheckCircle2, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import SkyJobsLogo from "../components/Logo";

/* ── Static data arrays ───────────────────────────────────────────────────── */

const CATEGORIES = [
  { label: "Web Development",  icon: Code2,      color: "#0369A1", grad: "linear-gradient(135deg,#0369A1,#0EA5E9)", count: "1.2k jobs" },
  { label: "Design & Creative", icon: Palette,    color: "#7C3AED", grad: "linear-gradient(135deg,#7C3AED,#A78BFA)", count: "856 jobs" },
  { label: "Mobile Apps",       icon: Smartphone, color: "#059669", grad: "linear-gradient(135deg,#059669,#34D399)", count: "634 jobs" },
  { label: "Writing & Content", icon: PenLine,    color: "#D97706", grad: "linear-gradient(135deg,#D97706,#FCD34D)", count: "421 jobs" },
  { label: "Marketing",         icon: TrendingUp, color: "#DC2626", grad: "linear-gradient(135deg,#DC2626,#F87171)", count: "389 jobs" },
  { label: "Data & Analytics",  icon: BarChart3,  color: "#0891B2", grad: "linear-gradient(135deg,#0891B2,#67E8F9)", count: "298 jobs" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Post Your Job",     desc: "Describe your project, set a budget and deadline. Takes under 2 minutes.", color: "#0369A1" },
  { step: "02", title: "Receive Bids",      desc: "Skilled freelancers submit competitive proposals with cover letters.",       color: "#0EA5E9" },
  { step: "03", title: "Hire the Best",     desc: "Review profiles and ratings, then accept the bid that fits best.",           color: "#22C55E" },
  { step: "04", title: "Get It Done",       desc: "Track progress, mark completion and leave a review.",                        color: "#7C3AED" },
];

const STATS = [
  { icon: Users,        value: "12,400+", label: "Freelancers"  },
  { icon: Briefcase,    value: "8,200+",  label: "Jobs Posted"  },
  { icon: CheckCircle2, value: "6,900+",  label: "Completed"    },
  { icon: Star,         value: "4.9 / 5", label: "Avg Rating"   },
];

const TESTIMONIALS = [
  { name: "Sarah M.",   role: "Client · E-commerce",   text: "Found an amazing developer within hours. The bidding process is transparent and fair.", rating: 5, avatar: "S" },
  { name: "Ali Hassan", role: "Freelancer · Full Stack", text: "SkyJobs consistently brings quality clients. I doubled my income in 3 months.",         rating: 5, avatar: "A" },
  { name: "Mia Chen",   role: "Client · SaaS Startup",  text: "The platform is intuitive and the talent pool is genuinely impressive.",                  rating: 5, avatar: "M" },
];

const LandingPage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
  };

  return (
    <div className="page">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {/*
       * Multi-stop diagonal gradient goes from deep navy → sky blue → indigo,
       * creating a rich, vibrant backdrop that makes white text pop.
       * overflow:hidden is required so the absolutely-positioned glow blobs
       * don't extend the page width and cause a horizontal scrollbar.
       */}
      <section style={{
        background: "linear-gradient(135deg, #0C4A6E 0%, #0369A1 45%, #0EA5E9 80%, #6366F1 100%)",
        padding: "100px 0 120px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle grid texture — very low-opacity lines (0.03) add depth without
            competing with the content. backgroundSize 56px gives a fine grid. */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "56px 56px", pointerEvents: "none"
        }} />

        {/* Radial glow spots — soft colour halos that break up the flat gradient.
            Top-right: indigo halo (rgba 99,102,241 at 28% opacity) — the 70%
            transparent stop ensures a smooth falloff with no hard edge.
            Bottom-left: green halo (rgba 34,197,94 at 20%) — lower opacity so it
            stays subtle and doesn't clash with the primary blue palette.
            pointerEvents:none prevents these decorative divs from blocking clicks. */}
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-25%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ textAlign: "center", position: "relative" }}>

          {/* Badge — uses the glass-hero class for the frosted-glass pill effect.
              animate-fade-up triggers the CSS keyframe that slides the element in
              from below with an opacity transition on page load. */}
          <div className="animate-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div className="glass-hero" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 40 }}>
              <Zap size={13} color="#FCD34D" fill="#FCD34D" />
              <span style={{ color: "rgba(255,255,255,0.92)", fontSize: "0.78rem", fontFamily: "Poppins,sans-serif", fontWeight: 500, letterSpacing: "0.03em" }}>
                Pakistan's fastest-growing freelance platform
              </span>
            </div>
          </div>

          {/* Heading — delay-100 staggers the animation 100 ms after the badge so
              elements cascade in sequentially rather than all appearing at once.
              gradient-text-hero applies a background-clip:text gradient defined
              globally, giving the second line its coloured shimmer. */}
          <h1 className="animate-fade-up delay-100" style={{
            fontSize: "clamp(2.2rem,5.5vw,3.8rem)", fontWeight: 900, lineHeight: 1.1,
            marginBottom: 22, letterSpacing: "-0.025em"
          }}>
            <span style={{ color: "white" }}>Find Great Work.</span><br />
            <span className="gradient-text-hero">Hire Great Talent.</span>
          </h1>

          {/* Subtitle — delay-200 continues the cascade. Constrained to 560 px so
              line lengths stay comfortable for readability. */}
          <p className="animate-fade-up delay-200" style={{
            fontSize: "1.1rem", color: "rgba(255,255,255,0.78)",
            maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.75
          }}>
            SkyJobs connects clients with skilled freelancers. Post a job, receive competitive bids, and get things done — simply and transparently.
          </p>

          {/* Search bar — glassmorphism applied directly via inline style here
              because the bar needs slightly higher opacity (0.13) than the global
              .glass class provides for it to read clearly against the gradient.
              blur(18px) saturate(160%): 18px gives a pronounced frosted effect;
              saturate(160%) boosts the colour of the gradient showing through,
              preventing the glass from looking grey/washed-out.
              The inset box-shadow top highlight adds the glass-edge gleam.
              delay-300 keeps the staggered entrance animation going. */}
          <form onSubmit={handleSearch} className="animate-fade-up delay-300" style={{ maxWidth: 640, margin: "0 auto 28px" }}>
            <div style={{
              display: "flex",
              background: "rgba(255,255,255,0.13)",
              backdropFilter: "blur(18px) saturate(160%)",
              WebkitBackdropFilter: "blur(18px) saturate(160%)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.18)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", flex: 1 }}>
                <Search size={17} color="rgba(255,255,255,0.65)" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search for React developers, logo designers…"
                  className="placeholder-white"
                  style={{
                    border: "none", outline: "none", flex: 1,
                    fontSize: "0.95rem", fontFamily: "Open Sans,sans-serif",
                    color: "white", padding: "18px 0", background: "transparent"
                  }}
                />
              </div>
              <button type="submit" style={{
                padding: "0 26px", margin: "7px",
                background: "linear-gradient(135deg,#16A34A,#22C55E)",
                color: "white", border: "none", cursor: "pointer",
                fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.93rem",
                borderRadius: 10, transition: "all 0.22s",
                boxShadow: "0 4px 14px rgba(34,197,94,0.38)", flexShrink: 0
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#14532D,#16A34A)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg,#16A34A,#22C55E)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(34,197,94,0.38)"; }}>
                Search
              </button>
            </div>
          </form>

          {/* Popular tags — glass-hero pill buttons that pre-fill the search query.
              delay-400 is the last step of the entrance cascade. The onMouseEnter/
              Leave handlers manually toggle background and border opacity because
              CSS :hover cannot target inline styles. */}
          <div className="animate-fade-up delay-400" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", fontFamily: "Poppins,sans-serif", alignSelf: "center" }}>Popular:</span>
            {["React Developer", "UI Designer", "Content Writer", "Mobile App"].map(t => (
              <button key={t} onClick={() => navigate(`/jobs?search=${encodeURIComponent(t)}`)}
                className="glass-hero"
                style={{
                  padding: "6px 16px", borderRadius: 20,
                  color: "rgba(255,255,255,0.9)", fontSize: "0.8rem",
                  cursor: "pointer", fontFamily: "Open Sans,sans-serif",
                  transition: "all 0.22s", border: "1px solid rgba(255,255,255,0.2)"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      {/*
       * A slightly lighter gradient than the Hero (starts at #075985 instead of
       * #0C4A6E) so the strip reads as a distinct band without a harsh break.
       * The bottom border (rgba white 0.1) creates a hairline separator between
       * this strip and the white-background Categories section below.
       * Each stat icon is wrapped in a glass-hero pill; dividers between cells use
       * rgba white borders so they're visible but not jarring.
       * animationDelay is offset by 80 ms per item (i * 0.08s) for a gentle
       * left-to-right stagger.
       */}
      <section style={{ background: "linear-gradient(135deg,#075985,#0369A1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="container" style={{ padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }} className="stats-row">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <div key={label} className="animate-fade-up" style={{
                padding: "32px 24px", textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.12)" : "none",
                animationDelay: `${i * 0.08}s`
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  {/* Icon container uses glass-hero for the frosted tile look */}
                  <div className="glass-hero" style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="white" />
                  </div>
                </div>
                <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, fontSize: "1.55rem", color: "white", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", marginTop: 4, fontFamily: "Open Sans,sans-serif" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      {/*
       * Light-background section (default page bg) for visual contrast after the
       * dark gradient Stats strip. Cards use the global .glass class (white bg,
       * subtle blur, soft border) combined with .card-hover (lift + shadow on
       * hover). Icon tiles use per-category gradient backgrounds (the `grad` prop)
       * with a coloured box-shadow derived from the same hue at 25% opacity
       * (`${color}40` — hex 40 = 25% alpha) for a soft colour glow.
       * animationDelay staggers cards by 60 ms each for a wave entrance.
       */}
      <section className="section">
        <div className="container">
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "#0EA5E9", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Explore</p>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 800, color: "#0C4A6E", letterSpacing: "-0.02em" }}>Browse by Category</h2>
            <p style={{ color: "#64748B", marginTop: 12, fontSize: "1rem", maxWidth: 460, margin: "12px auto 0", lineHeight: 1.7 }}>
              Find work that matches your skills or hire for your next project.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
            {CATEGORIES.map(({ label, icon: Icon, color, grad, count }, i) => (
              <Link key={label} to={`/jobs?category=${encodeURIComponent(label)}`}
                className="card-hover glass animate-fade-up"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                  padding: "30px 20px", borderRadius: 18, textDecoration: "none",
                  animationDelay: `${i * 0.06}s`
                }}>
                {/* Icon tile: per-category gradient bg + colour-matched shadow glow.
                    `${color}40` appends hex 40 (= decimal 64, ~25% opacity) to the
                    category accent colour, so the shadow always matches the icon. */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: grad,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 6px 18px ${color}40`
                }}>
                  <Icon size={24} color="white" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.88rem", marginBottom: 5 }}>{label}</p>
                  <p style={{ fontSize: "0.74rem", color: "#64748B" }}>{count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      {/*
       * Returns to the dark gradient palette (navy → sky → light blue) so the
       * page alternates light/dark sections, which creates natural visual rhythm.
       * The top-right radial glow (indigo, 22% opacity) mirrors the Hero's glow
       * to give the page a cohesive decorative language.
       * Each step card uses glass-hero for the frosted effect on the dark bg.
       * The large watermark step number ("01", "02"…) uses colour white at only
       * 6% opacity — visible enough to add texture but never competing with the
       * card's readable content.
       * The coloured accent bar (40×4 px) above each card title uses the step's
       * individual colour to subtly distinguish the stages.
       * Cards stagger by 100 ms each (i * 0.1s) — slightly slower than categories
       * because there are fewer items and the section benefits from a calmer pace.
       */}
      <section className="section" style={{ background: "linear-gradient(135deg,#0C4A6E 0%,#0369A1 60%,#0EA5E9 100%)", position: "relative", overflow: "hidden" }}>
        {/* Top-right indigo radial glow — decorative depth accent */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Simple Process</p>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>How SkyJobs Works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map(({ step, title, desc, color }, i) => (
              <div key={step} className="glass-hero animate-fade-up" style={{
                padding: "32px 24px", borderRadius: 20,
                position: "relative", overflow: "hidden",
                animationDelay: `${i * 0.1}s`
              }}>
                {/* Ghost step number — oversized watermark at 6% white opacity.
                    userSelect:none prevents accidental text selection on the label. */}
                <div style={{
                  position: "absolute", top: -8, left: 16,
                  fontSize: "4.5rem", fontFamily: "Poppins,sans-serif", fontWeight: 900,
                  color: "rgba(255,255,255,0.06)", lineHeight: 1, userSelect: "none", pointerEvents: "none"
                }}>{step}</div>
                {/* Coloured accent bar — 4 px tall, uses per-step colour to
                    visually anchor the card and differentiate the stages. */}
                <div style={{ width: 40, height: 4, borderRadius: 2, background: color, marginBottom: 18 }} />
                <h3 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "white", marginBottom: 10, fontSize: "1.05rem" }}>{title}</h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", lineHeight: 1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      {/*
       * Back to the light background for readability of longer text blocks.
       * Cards use .glass + .card-hover: the glassmorphism here gives a frosted
       * white card appearance over the page background — a subtler effect than on
       * dark gradients. Stars use fill="#F59E0B" (Tailwind amber-400) to appear
       * solid rather than outline-only. Avatar circles use the primary brand
       * gradient (navy → sky) with a coloured drop-shadow.
       */}
      <section className="section">
        <div className="container">
          <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ color: "#0EA5E9", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Testimonials</p>
            <h2 style={{ fontSize: "clamp(1.7rem,3vw,2.3rem)", fontWeight: 800, color: "#0C4A6E", letterSpacing: "-0.02em" }}>Trusted by Thousands</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {TESTIMONIALS.map(({ name, role, text, rating, avatar }, i) => (
              <div key={name} className="card-hover glass animate-fade-up" style={{
                borderRadius: 20, padding: "28px",
                animationDelay: `${i * 0.1}s`
              }}>
                {/* Star rating row — Array.from creates `rating` elements so we
                    render exactly as many filled stars as the score value. */}
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: rating }).map((_, j) => <Star key={j} size={15} color="#F59E0B" fill="#F59E0B" />)}
                </div>
                <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.78, marginBottom: 22, fontStyle: "italic" }}>"{text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar circle — brand gradient background with a coloured
                      box-shadow to lift it off the card surface. */}
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "linear-gradient(135deg,#0369A1,#0EA5E9)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontFamily: "Poppins,sans-serif", fontWeight: 700, fontSize: "1rem",
                    flexShrink: 0, boxShadow: "0 4px 12px rgba(3,105,161,0.3)"
                  }}>
                    {avatar}
                  </div>
                  <div>
                    <p style={{ fontFamily: "Poppins,sans-serif", fontWeight: 700, color: "#0C4A6E", fontSize: "0.9rem" }}>{name}</p>
                    <p style={{ fontSize: "0.74rem", color: "#64748B", marginTop: 2 }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Signals ─────────────────────────────────────────────────── */}
      {/*
       * A compact horizontal strip on a mid-tone gradient (#075985 → #0369A1).
       * Each trust badge is a glass-hero pill (pill shape via borderRadius:40).
       * Icons use #86EFAC (Tailwind green-300) — a lighter, cooler green that
       * reads well on the dark blue background without clashing.
       * section-sm uses reduced vertical padding so this strip stays slim.
       */}
      <section className="section-sm" style={{ background: "linear-gradient(135deg,#075985,#0369A1)" }}>
        <div className="container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", alignItems: "center" }}>
            {[
              { icon: Shield,      text: "Secure Payments"   },
              { icon: CheckCircle2,text: "Verified Profiles" },
              { icon: Star,        text: "Quality Guaranteed"},
              { icon: Zap,         text: "Fast Hiring"       },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="glass-hero" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 20px", borderRadius: 40
              }}>
                {/* Green-300 icon colour stands out against dark blue background */}
                <Icon size={16} color="#86EFAC" />
                <span style={{ fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: "0.88rem", color: "rgba(255,255,255,0.92)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      {/*
       * The page's primary conversion section. Uses a richer gradient
       * (navy → bright blue → indigo) to feel energetic and final.
       * Two radial glows (green top-right, indigo bottom-left) add visual warmth
       * and frame the centred text + buttons without visual symmetry — which keeps
       * it feeling organic rather than mechanical.
       * btn-cta and btn-outline-hero are globally defined button styles.
       */}
      <section className="section" style={{ background: "linear-gradient(135deg,#0C4A6E 0%,#1d4ed8 50%,#6366F1 100%)", position: "relative", overflow: "hidden" }}>
        {/* Top-right green glow — warmth accent that softens the cool blue/indigo */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,197,94,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
        {/* Bottom-left indigo glow — mirrors the Hero's glow for brand consistency */}
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.22) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <h2 className="animate-fade-up" style={{
            fontSize: "clamp(1.9rem,4vw,3rem)", fontWeight: 900, color: "white", marginBottom: 16, letterSpacing: "-0.025em"
          }}>
            Ready to get started?
          </h2>
          <p className="animate-fade-up delay-100" style={{
            color: "rgba(255,255,255,0.72)", fontSize: "1.05rem", marginBottom: 44,
            maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.7
          }}>
            Join SkyJobs today — it's free to sign up, no hidden fees.
          </p>
          <div className="animate-fade-up delay-200" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn-cta" style={{ padding: "14px 32px", fontSize: "1rem" }}>
              Hire a Freelancer <ArrowRight size={17} />
            </Link>
            <Link to="/register" className="btn-outline-hero" style={{ padding: "14px 32px", fontSize: "1rem" }}>
              Find Work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {/*
       * Dark solid background (#0C4A6E — the same deep navy as the Hero's first
       * gradient stop) anchors the page and provides visual closure.
       * The SkyJobsLogo component is rendered with light=true so it uses its
       * white/light colour variant, which is legible on this dark background.
       * size=38 matches the visual weight of the original 30px container + icon.
       * Footer link hover is handled via inline onMouseEnter/Leave because CSS
       * :hover cannot override inline color styles set directly on the element.
       */}
      <footer style={{ background: "#0C4A6E", padding: "32px 0" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          {/* SkyJobsLogo with light prop — renders the white/light variant of the
              logo, appropriate for dark gradient/solid backgrounds. */}
          <SkyJobsLogo size={38} light />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", fontFamily: "Open Sans,sans-serif" }}>© 2026 SkyJobs · Group 02 · Web Engineering</p>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Browse Jobs","/jobs"],["Post a Job","/post-job"],["Login","/login"]].map(([l,to]) => (
              <Link key={l} to={to} style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", textDecoration: "none", fontFamily: "Open Sans,sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "white"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Responsive override — collapses the 4-column stats grid to 2 columns
          on mobile viewports (≤640 px) so numbers remain large and readable. */}
      <style>{`
        @media(max-width:640px){
          .stats-row{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
