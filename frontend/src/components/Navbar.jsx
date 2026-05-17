/**
 * Navbar — sticky glass navigation bar.
 *
 * Behaviour:
 *  • Transparent glass on page load → slightly more opaque on scroll (scrolled state).
 *  • Desktop: logo | search | nav links | user dropdown.
 *  • Mobile: logo | hamburger → slide-down panel with same links + search.
 *  • User dropdown renders different items per role (client / freelancer / admin).
 *
 * Glass effect technique:
 *  backdrop-filter: blur(20px) saturate(180%) — blurs everything behind the nav,
 *  creating the frosted-glass look. The saturate boost makes background colours
 *  more vivid through the blur, a key part of the "Apple glass" aesthetic.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, ChevronDown, LogOut, LayoutDashboard, FileText, Star, Menu, X, Plus } from "lucide-react";
import SkyJobsLogo from "./Logo";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  // ── Local UI state ────────────────────────────────────────────────────
  const [menuOpen,  setMenuOpen]  = useState(false);   // mobile drawer open?
  const [dropOpen,  setDropOpen]  = useState(false);   // user dropdown open?
  const [searchVal, setSearchVal] = useState("");       // controlled search input
  const [scrolled,  setScrolled]  = useState(false);   // has user scrolled > 12px?

  // ── Scroll listener ───────────────────────────────────────────────────
  // { passive: true } tells the browser this handler never calls preventDefault,
  // allowing it to optimise scrolling performance (no jank).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll); // cleanup on unmount
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate("/"); setDropOpen(false); };

  const handleSearch = (e) => {
    e.preventDefault();
    // Only navigate if there is a non-empty query; avoids /jobs?search=
    if (searchVal.trim()) navigate(`/jobs?search=${encodeURIComponent(searchVal.trim())}`);
  };

  // Dashboard path differs per role — admin, client, and freelancer each have
  // their own dashboard page with tailored widgets.
  const dashPath = user?.role === "admin"
    ? "/admin"
    : user?.role === "client"
      ? "/dashboard/client"
      : "/dashboard/freelancer";

  // Highlights the active nav link with a tinted background pill
  const isActive = (path) => location.pathname === path;

  // ── Dynamic nav style on scroll ───────────────────────────────────────
  // Background opacity increases on scroll so the content behind remains
  // readable while the navbar itself stays legible over page content.
  const navBg     = scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.78)";
  const navShadow = scrolled
    ? "0 4px 32px rgba(3,105,161,0.12)"   // deeper shadow when scrolled
    : "0 1px 0 rgba(255,255,255,0.6)";    // hairline separator at top of page

  // ── Shared link hover handlers ────────────────────────────────────────
  // Defined once to avoid repeating identical callbacks inline throughout JSX.
  const linkHoverOn  = (e) => { e.currentTarget.style.background = "rgba(3,105,161,0.06)"; e.currentTarget.style.color = "#0369A1"; };
  const linkHoverOff = (e) => { e.currentTarget.style.background = "transparent";           e.currentTarget.style.color = "#475569"; };

  return (
    <nav style={{
      background:       navBg,
      /* Two-value blur saturate combo = glassmorphism core */
      backdropFilter:       "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",   // Safari prefix
      borderBottom: "1px solid rgba(255,255,255,0.75)",
      position: "sticky", top: 0, zIndex: 100,             // stays above all page content
      boxShadow: navShadow,
      transition: "background 0.25s ease, box-shadow 0.25s ease"
    }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", height: 68, gap: 24 }}>

          {/* ── Brand logo ─────────────────────────────────────────── */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            {/* size=36 = standard navbar icon size; no light prop = dark wordmark */}
            <SkyJobsLogo size={36} />
          </Link>

          {/* ── Search bar (desktop only) ───────────────────────────── */}
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420 }} className="hidden-mobile">
            <div style={{ position: "relative", width: "100%" }}>
              {/* Absolute-positioned icon so it overlaps the input padding */}
              <Search size={15} style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)",
                color: "#94A3B8", pointerEvents: "none"   // non-interactive decoration
              }} />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search jobs, skills, categories…"
                style={{
                  width: "100%", padding: "9px 14px 9px 37px",
                  border: "1.5px solid rgba(203,213,225,0.7)",
                  borderRadius: 12, fontSize: "0.84rem",
                  fontFamily: "Open Sans,sans-serif",
                  /* Subtle glass on the input itself */
                  background:           "rgba(255,255,255,0.65)",
                  backdropFilter:       "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: "#0C4A6E", outline: "none", transition: "all 0.22s"
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#0EA5E9";
                  e.target.style.background  = "rgba(255,255,255,0.95)";
                  /* Ring glow — 3px spread with brand blue at 13% opacity */
                  e.target.style.boxShadow   = "0 0 0 3px rgba(14,165,233,0.13)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(203,213,225,0.7)";
                  e.target.style.background  = "rgba(255,255,255,0.65)";
                  e.target.style.boxShadow   = "none";
                }}
              />
            </div>
          </form>

          {/* ── Desktop nav links ───────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }} className="hidden-mobile">

            {/* Browse Jobs — visible to everyone */}
            <Link to="/jobs"
              style={{
                padding: "7px 14px", borderRadius: 10,
                fontSize: "0.875rem", fontWeight: 600,
                textDecoration: "none",
                color:      isActive("/jobs") ? "#0369A1" : "#475569",
                background: isActive("/jobs") ? "rgba(3,105,161,0.08)" : "transparent",
                transition: "all 0.2s", fontFamily: "Poppins,sans-serif",
                backdropFilter: isActive("/jobs") ? "blur(8px)" : "none"
              }}
              onMouseEnter={e => { if (!isActive("/jobs")) linkHoverOn(e);  }}
              onMouseLeave={e => { if (!isActive("/jobs")) linkHoverOff(e); }}>
              Browse Jobs
            </Link>

            {/* ── Unauthenticated actions ──────────────────────────── */}
            {!user ? (
              <>
                <Link to="/login"
                  style={{ padding: "7px 14px", borderRadius: 10, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", color: "#475569", fontFamily: "Poppins,sans-serif", transition: "all 0.2s" }}
                  onMouseEnter={linkHoverOn}
                  onMouseLeave={linkHoverOff}>
                  Login
                </Link>
                {/* Primary CTA — gets attention with gradient background */}
                <Link to="/register" className="btn-cta" style={{ padding: "8px 18px", fontSize: "0.84rem" }}>
                  <Plus size={14} /> Get Started
                </Link>
              </>
            ) : (
              <>
                {/* Clients can post jobs directly from the navbar */}
                {user.role === "client" && (
                  <Link to="/post-job" className="btn-cta" style={{ padding: "8px 18px", fontSize: "0.84rem" }}>
                    <Plus size={14} /> Post a Job
                  </Link>
                )}

                {/* ── User avatar dropdown ─────────────────────────── */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 12px", borderRadius: 12,
                      border: "1.5px solid rgba(203,213,225,0.7)",
                      background:           "rgba(255,255,255,0.65)",
                      backdropFilter:       "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.background = "rgba(255,255,255,0.88)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(203,213,225,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.65)"; }}>

                    {/* Avatar circle — first letter of user name as initials */}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "linear-gradient(135deg,#075985,#0EA5E9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: "0.78rem", fontWeight: 700,
                      fontFamily: "Poppins,sans-serif", flexShrink: 0
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* First name only; capped to 80px to prevent overflow */}
                    <span style={{
                      fontSize: "0.84rem", fontWeight: 600, color: "#0C4A6E",
                      fontFamily: "Poppins,sans-serif",
                      maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {user.name.split(" ")[0]}
                    </span>

                    {/* Arrow rotates 180° when dropdown is open */}
                    <ChevronDown size={13} color="#64748B"
                      style={{ transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "none" }} />
                  </button>

                  {/* ── Dropdown panel ───────────────────────────────── */}
                  {dropOpen && (
                    <>
                      {/*
                        Invisible full-screen overlay sits behind the dropdown
                        but in front of everything else. Clicking it closes the
                        dropdown — standard "click outside to close" UX pattern.
                      */}
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />

                      <div style={{
                        position: "absolute", right: 0, top: "calc(100% + 10px)", width: 210,
                        /* Heavy glass on the dropdown for maximum contrast */
                        background:           "rgba(255,255,255,0.93)",
                        backdropFilter:       "blur(24px) saturate(200%)",
                        WebkitBackdropFilter: "blur(24px) saturate(200%)",
                        border: "1px solid rgba(255,255,255,0.92)",
                        borderRadius: 16,
                        /* Large ambient shadow + top inset highlight = floating glass card */
                        boxShadow: "0 12px 40px rgba(3,105,161,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
                        overflow: "hidden", zIndex: 50
                      }}>
                        {/* User identity header inside dropdown */}
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(224,242,254,0.8)" }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0369A1", fontFamily: "Poppins,sans-serif" }}>{user.name}</p>
                          <p style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "capitalize", marginTop: 2 }}>{user.role}</p>
                        </div>

                        {/*
                          Menu items built from an array so each role's extra links
                          are injected via spread — no conditional blocks in JSX.
                        */}
                        {[
                          { icon: LayoutDashboard, label: "Dashboard",  to: dashPath   },
                          ...(user.role === "client"     ? [{ icon: FileText, label: "My Jobs",  to: "/my-jobs"  }] : []),
                          ...(user.role === "freelancer" ? [{ icon: Star,     label: "My Bids",  to: "/my-bids"  }] : []),
                        ].map(({ icon: Icon, label, to }) => (
                          <Link key={to} to={to} onClick={() => setDropOpen(false)}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "10px 16px", textDecoration: "none",
                              color: "#374151", fontSize: "0.84rem",
                              fontFamily: "Open Sans,sans-serif", transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(3,105,161,0.07)"; e.currentTarget.style.color = "#0369A1"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent";           e.currentTarget.style.color = "#374151"; }}>
                            <Icon size={15} /> {label}
                          </Link>
                        ))}

                        {/* Logout — destructive action, always red */}
                        <div style={{ borderTop: "1px solid rgba(224,242,254,0.8)" }}>
                          <button onClick={handleLogout}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "10px 16px", width: "100%",
                              background: "none", border: "none",
                              color: "#EF4444", fontSize: "0.84rem",
                              cursor: "pointer", fontFamily: "Open Sans,sans-serif", transition: "all 0.15s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Mobile hamburger toggle ─────────────────────────────── */}
          {/* Hidden on desktop via .show-mobile (display:none default, flex on mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "none", padding: 8, border: "none",
              background: "rgba(255,255,255,0.65)", backdropFilter: "blur(8px)",
              borderRadius: 10, cursor: "pointer", marginLeft: "auto",
              color: "#0369A1", transition: "all 0.2s"
            }}
            className="show-mobile">
            {/* Icon swaps between hamburger and X depending on open state */}
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          background:           "rgba(255,255,255,0.94)",
          backdropFilter:       "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.75)",
          padding: "16px 24px 20px"
        }}>
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ marginBottom: 14 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search jobs…"
                className="input-base"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </form>

          {/* Mobile nav links — stacked vertically */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Link to="/jobs" onClick={() => setMenuOpen(false)}
              style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: "0.9rem", fontFamily: "Poppins,sans-serif", fontWeight: 600, transition: "all 0.15s" }}
              onMouseEnter={linkHoverOn} onMouseLeave={linkHoverOff}>
              Browse Jobs
            </Link>

            {user ? (
              <>
                <Link to={dashPath} onClick={() => setMenuOpen(false)}
                  style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: "0.9rem", fontFamily: "Poppins,sans-serif", fontWeight: 600 }}>
                  Dashboard
                </Link>
                {user.role === "client" && (
                  <Link to="/my-jobs" onClick={() => setMenuOpen(false)}
                    style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: "0.9rem", fontFamily: "Poppins,sans-serif" }}>
                    My Jobs
                  </Link>
                )}
                {user.role === "client" && (
                  <Link to="/post-job" onClick={() => setMenuOpen(false)} className="btn-cta" style={{ marginTop: 8 }}>
                    <Plus size={14} /> Post a Job
                  </Link>
                )}
                {user.role === "freelancer" && (
                  <Link to="/my-bids" onClick={() => setMenuOpen(false)}
                    style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: "0.9rem", fontFamily: "Poppins,sans-serif" }}>
                    My Bids
                  </Link>
                )}
                <button onClick={handleLogout}
                  style={{ padding: "10px 12px", borderRadius: 10, background: "none", border: "none", color: "#EF4444", fontSize: "0.9rem", cursor: "pointer", textAlign: "left", fontFamily: "Poppins,sans-serif", marginTop: 4 }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  style={{ padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "#374151", fontSize: "0.9rem", fontFamily: "Poppins,sans-serif" }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-cta" style={{ marginTop: 8 }}>
                  <Plus size={14} /> Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Responsive visibility helpers used by nav items above */}
      <style>{`
        @media(max-width:768px){
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
