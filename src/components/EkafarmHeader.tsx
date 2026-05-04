"use client";

import { Sprout } from "lucide-react";
import { COMPANY } from "@/lib/db";

export function EkafarmHeader() {
  return (
    <div
      className="flex items-center justify-between gap-4 pb-3"
      style={{ borderBottom: "3px double #2c6a3e" }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: "#2c6a3e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flex: "0 0 auto",
        }}
      >
        <Sprout size={36} />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#143019",
            letterSpacing: 1,
            margin: 0,
          }}
        >
          {COMPANY.name}
        </h1>
        <p style={{ fontSize: 11, color: "#2c6a3e", marginTop: 2, fontStyle: "italic" }}>
          Growing prosperity, one farm at a time.
        </p>
        <p style={{ fontSize: 10, color: "#333", marginTop: 4 }}>
          {COMPANY.poBox} · {COMPANY.email} · {COMPANY.website} · {COMPANY.phone}
        </p>
      </div>
      <div style={{ width: 70 }} />
    </div>
  );
}
