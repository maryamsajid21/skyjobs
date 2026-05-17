/**
 * NotFoundPage — 404 error screen.
 *
 * Shown whenever React Router cannot match a URL to a registered route.
 * Layout: a centred glass card on the body's ambient gradient background.
 *
 * Visual trick — the large "404" text:
 *   Uses a gradient clip-path fill (WebkitBackgroundClip: "text") to colour
 *   only the text pixels, creating a vivid gradient numeral without any images.
 *   `filter: drop-shadow` adds depth underneath the clipped gradient text —
 *   regular `box-shadow` does not work on clipped text elements.
 *
 * The search icon box is absolutely positioned over the "404" digits,
 * centred via `inset:0 + flex`. This overlaps the text intentionally —
 * it reads as a "searching for something that isn't there" metaphor.
 */

import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Navbar from "../components/Navbar";

const NotFoundPage = () => (
  <div className="page">
    <Navbar />

    {/* ── Centred content area ──────────────────────────────────────── */}
    {/* minHeight: 70vh pushes the card into the visual centre of the viewport
        even when Navbar takes up the top ~68px */}
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px", textAlign: "center", minHeight: "70vh"
    }}>

      {/* ── 404 graphic ────────────────────────────────────────────── */}
      {/* animate-scale-in: the graphic scales from 0.95 → 1 on mount for a
          satisfying "page has landed" feel (0.4s ease-out, defined in index.css) */}
      <div className="animate-scale-in" style={{ position: "relative", marginBottom: 36 }}>

        {/* Large gradient numeral */}
        <span style={{
          fontFamily: "Poppins,sans-serif", fontWeight: 900, fontSize: "9rem",
          /* Gradient fill on text — start (deep sky) → mid (brand blue) → end (cyan) */
          background: "linear-gradient(135deg,#0C4A6E,#0369A1,#0EA5E9)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1, display: "block", userSelect: "none",
          /* drop-shadow works on gradient-clipped text; box-shadow does not */
          filter: "drop-shadow(0 4px 24px rgba(3,105,161,0.18))"
        }}>404</span>

        {/* Search icon centred over the digits — uses absolute positioning
            with inset:0 so it always stays centred regardless of font size */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: "linear-gradient(135deg,#075985,#0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            /* Glow shadow reinforces the icon as a focal point */
            boxShadow: "0 8px 32px rgba(3,105,161,0.35)"
          }}>
            <Search size={36} color="white" />
          </div>
        </div>
      </div>

      {/* ── Message card ─────────────────────────────────────────── */}
      {/*
        glass utility: rgba(255,255,255,0.72) + blur(18px) + white border.
        animate-fade-up staggers 0ms (default) so it appears immediately after
        the graphic which uses animate-scale-in at the same timing.
        maxWidth: 460 keeps the card comfortably readable on large screens.
      */}
      <div className="glass animate-fade-up" style={{ borderRadius: 24, padding: "40px 48px", maxWidth: 460, width: "100%" }}>
        <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: 800, color: "#0C4A6E", fontSize: "1.7rem", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#64748B", fontSize: "0.93rem", lineHeight: 1.72, marginBottom: 32 }}>
          Looks like this page doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* CTA pair — primary home action + secondary browse action */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {/* btn-cta: green gradient + white text — highest visual priority */}
          <Link to="/" className="btn-cta" style={{ padding: "12px 28px" }}>
            <Home size={15} /> Go Home
          </Link>
          {/* btn-outline: glass + blue text — secondary action */}
          <Link to="/jobs" className="btn-outline" style={{ padding: "12px 28px" }}>
            <Search size={15} /> Browse Jobs
          </Link>
        </div>
      </div>

    </div>
  </div>
);

export default NotFoundPage;
