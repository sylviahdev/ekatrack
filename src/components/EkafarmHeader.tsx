"use client";

import { COMPANY } from "@/lib/db";
import { formatDateTimeKE } from "@/lib/format";

const BRAND = {
  blueDeep: "#1E3A8A",
  blue: "#1E40AF",
  ink: "#0B1220",
  muted: "#4B5563",
  hairline: "#E5E7EB",
  divider: "#9CA3AF",
} as const;

const FONT_HEAD =
  'var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif';
const FONT_BODY =
  'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function EkafarmHeader() {
  return (
    <header>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Logo />
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <h1
            style={{
              fontFamily: FONT_HEAD,
              fontSize: 24,
              fontWeight: 700,
              color: BRAND.blueDeep,
              letterSpacing: 0.4,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {COMPANY.name}
          </h1>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 11,
              color: BRAND.blue,
              margin: "4px 0 0",
              fontStyle: "italic",
              letterSpacing: 0.2,
              fontWeight: 500,
            }}
          >
            Professional Farm Management Solutions.
          </p>
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: 9.5,
              color: BRAND.muted,
              margin: "8px 0 0",
              letterSpacing: 0.15,
              lineHeight: 1.6,
            }}
          >
            {COMPANY.poBox}
            <Sep /> {COMPANY.phone}
            <Sep /> {COMPANY.email}
            <Sep /> {COMPANY.website}
          </p>
        </div>
        <div style={{ width: 64, flex: "0 0 auto" }} aria-hidden />
      </div>

      <div
        style={{
          marginTop: 14,
          height: 2,
          background: BRAND.blueDeep,
          borderRadius: 1,
        }}
      />
      <div
        style={{
          marginTop: 2,
          height: 0.5,
          background: BRAND.blueDeep,
          opacity: 0.3,
        }}
      />
    </header>
  );
}

export function BrandFooter() {
  return (
    <footer style={{ marginTop: 32 }}>
      <div style={{ height: 1, background: BRAND.hairline }} />
      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONT_BODY,
          fontSize: 9.5,
          color: BRAND.muted,
          letterSpacing: 0.2,
        }}
      >
        <span>
          Prepared by{" "}
          <strong style={{ color: BRAND.blueDeep, fontWeight: 700 }}>
            {COMPANY.name}
          </strong>
        </span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          Generated {formatDateTimeKE()}
        </span>
      </div>
    </footer>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      style={{ color: BRAND.divider, margin: "0 6px", fontWeight: 400 }}
    >
      ·
    </span>
  );
}

function Logo() {
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 14,
        background: BRAND.blueDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        flex: "0 0 auto",
        boxShadow: "0 2px 6px rgba(30, 58, 138, 0.2)",
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M7 20h10" />
        <path d="M10 20c5.5-2.5.8-6.4 3-10" />
        <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
        <path d="M14.1 6c-.3 2.7-.6 4.5-2.4 6.1" />
      </svg>
    </div>
  );
}
