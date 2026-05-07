"use client";

import { forwardRef, CSSProperties } from "react";
import { Client, COMPANY, WorkPlan, ActivityStatus } from "@/lib/db";
import {
  formatDateKE,
  formatDayName,
  formatKsh,
  todayISO,
} from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";

type Props = { plan: WorkPlan; client: Client | undefined };

/* ─────────────────────────── Design tokens ─────────────────────────── */

const C = {
  ink: "#0F1A14",
  body: "#384248",
  muted: "#6B7680",
  label: "#8A94A0",
  hairline: "#E6E8EB",
  surface: "#FFFFFF",
  zebra: "#FAFBFA",
  green: "#2C6A3E",
  greenDeep: "#143019",
  greenSoft: "#F1F8F1",
  greenLine: "#DCEEDD",
  amber: "#B45309",
  amberSoft: "#FEF3C7",
  red: "#B42318",
  redSoft: "#FEE4E2",
} as const;

const S = { 1: 4, 2: 6, 3: 8, 4: 12, 5: 16, 6: 24, 7: 32 } as const;

const T = {
  brand: 16,
  h1: 13,
  h2: 10.5,
  body: 10.5,
  small: 9.5,
  micro: 8.5,
  total: 18,
} as const;

/* ─────────────────────────── Component ─────────────────────────── */

export const WorkPlanDocument = forwardRef<HTMLDivElement, Props>(
  function WorkPlanDocument({ plan, client }, ref) {
    const allParsed = plan.days.flatMap((d) =>
      d.activities.map((a) => parseRequirements(a.requirements))
    );
    const totals = sumPlanCosts(allParsed, plan.transportSupervision);
    const totalActivities = plan.days.reduce(
      (n, d) => n + d.activities.length,
      0
    );

    return (
      <div
        ref={ref}
        className="a4-sheet"
        style={{
          padding: "16mm 14mm",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          color: C.body,
          fontSize: T.body,
          lineHeight: 1.5,
        }}
      >
        <Header />
        <DocumentInfo plan={plan} client={client} />
        <ActivityTable plan={plan} totalActivities={totalActivities} />
        <ExpenseSummary totals={totals} />
        <Footer />
      </div>
    );
  }
);

/* ─────────────────────────── Sections ─────────────────────────── */

function Header() {
  return (
    <header style={{ marginBottom: S[6] }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: S[5],
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: S[4] }}>
          <Logo />
          <div>
            <p
              style={{
                fontSize: T.brand,
                fontWeight: 700,
                color: C.greenDeep,
                letterSpacing: -0.2,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              EkaTrack
            </p>
            <p
              style={{
                fontSize: T.micro,
                color: C.muted,
                marginTop: 2,
                letterSpacing: 0.3,
                textTransform: "uppercase",
              }}
            >
              {COMPANY.name}
            </p>
          </div>
        </div>

        {/* Contact column */}
        <div
          style={{
            textAlign: "right",
            fontSize: T.micro,
            color: C.muted,
            lineHeight: 1.7,
          }}
        >
          <div>{COMPANY.poBox}</div>
          <div>{COMPANY.phone}</div>
          <div>{COMPANY.email}</div>
          <div>{COMPANY.website}</div>
        </div>
      </div>

      {/* Accent divider */}
      <div
        style={{
          marginTop: S[4],
          height: 2,
          background: C.green,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          marginTop: 1,
          height: 1,
          background: C.greenLine,
        }}
      />
    </header>
  );
}

function Logo() {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: C.greenDeep,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 2px rgba(20, 48, 25, 0.15)",
        flex: "0 0 auto",
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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

function DocumentInfo({
  plan,
  client,
}: {
  plan: WorkPlan;
  client: Client | undefined;
}) {
  const acreageStr = client?.acreage
    ? `${client.acreage} acre${client.acreage === 1 ? "" : "s"}`
    : "—";

  return (
    <section style={{ marginBottom: S[6] }}>
      <p style={labelStyle}>Weekly Work Plan</p>
      <h1
        style={{
          fontSize: T.h1 + 5,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: -0.3,
          margin: `${S[1]}px 0 ${S[5]}px`,
          lineHeight: 1.2,
        }}
      >
        Week {plan.weekNumber} · {formatDateKE(plan.startDate)} —{" "}
        {formatDateKE(plan.endDate)}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: S[5],
          paddingTop: S[4],
          borderTop: `1px solid ${C.hairline}`,
        }}
      >
        <InfoCell label="Client" value={client?.name || "—"} />
        <InfoCell label="Farm" value={client?.location || "—"} />
        <InfoCell label="Acreage" value={acreageStr} />
        <InfoCell
          label="Week"
          value={`Week ${String(plan.weekNumber).padStart(2, "0")}`}
        />
      </div>
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          marginTop: S[1],
          fontSize: T.h2,
          fontWeight: 600,
          color: C.ink,
          lineHeight: 1.3,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityTable({
  plan,
  totalActivities,
}: {
  plan: WorkPlan;
  totalActivities: number;
}) {
  return (
    <section style={{ marginBottom: S[6] }}>
      <SectionHeading
        eyebrow="Schedule"
        title="Activities"
        meta={`${totalActivities} ${totalActivities === 1 ? "task" : "tasks"} · 7 days`}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: T.small,
          marginTop: S[4],
          border: `1px solid ${C.hairline}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <colgroup>
          <col style={{ width: "14%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "32%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Activity</Th>
            <Th>Requirements</Th>
            <Th>Remarks</Th>
            <Th align="center">Status</Th>
          </tr>
        </thead>
        <tbody>
          {plan.days.map((day, dayIdx) => {
            const zebra = dayIdx % 2 === 1;
            if (day.activities.length === 0) {
              return (
                <tr key={day.date} style={rowStyle(zebra, true)}>
                  <DateCell date={day.date} />
                  <td colSpan={4} style={{ ...tdStyle, color: C.label, fontStyle: "italic" }}>
                    No scheduled activity
                  </td>
                </tr>
              );
            }
            return day.activities.map((act, idx) => {
              const last = idx === day.activities.length - 1;
              return (
                <tr key={day.date + act.id} style={rowStyle(zebra, last)}>
                  {idx === 0 && (
                    <td
                      rowSpan={day.activities.length}
                      style={{
                        ...tdStyle,
                        verticalAlign: "top",
                        fontWeight: 600,
                        color: C.ink,
                        background: zebra ? C.zebra : C.surface,
                        borderRight: `1px solid ${C.hairline}`,
                      }}
                    >
                      <div style={{ fontSize: T.small, fontWeight: 600 }}>
                        {formatDayName(day.date)}
                      </div>
                      <div
                        style={{
                          fontSize: T.micro,
                          color: C.muted,
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        {formatDateKE(day.date)}
                      </div>
                    </td>
                  )}
                  <td style={{ ...tdStyle, color: C.ink, fontWeight: 500 }}>
                    {act.title || "—"}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "pre-wrap", color: C.body }}>
                    {act.requirements || "—"}
                  </td>
                  <td style={{ ...tdStyle, color: C.body }}>
                    {act.remarks || "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <StatusBadge status={act.status ?? "pending"} />
                  </td>
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </section>
  );
}

function ExpenseSummary({
  totals,
}: {
  totals: ReturnType<typeof sumPlanCosts>;
}) {
  const rows: { label: string; value: number }[] = [
    { label: "Diesel", value: totals.diesel },
    { label: "Casual labor", value: totals.casualLabor },
    { label: "Piece work", value: totals.pieceWork },
    { label: "Chemical spray", value: totals.chemicals },
    { label: "Transport & supervision", value: totals.transport },
  ].filter((r) => r.value > 0 || r.label !== "Piece work");

  return (
    <section style={{ marginBottom: S[6] }}>
      <SectionHeading eyebrow="Costs" title="Weekly expense summary" />

      <div
        style={{
          marginTop: S[4],
          border: `1px solid ${C.hairline}`,
          borderRadius: 10,
          background: C.surface,
          overflow: "hidden",
        }}
      >
        {/* Line items */}
        <div style={{ padding: `${S[3]}px ${S[5]}px` }}>
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: `${S[3]}px 0`,
                borderBottom:
                  i === rows.length - 1 ? "none" : `1px solid ${C.hairline}`,
              }}
            >
              <span style={{ color: C.body, fontSize: T.body }}>{r.label}</span>
              <span
                style={{
                  color: C.ink,
                  fontSize: T.body,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatKsh(r.value)}
              </span>
            </div>
          ))}
        </div>

        {/* Total band */}
        <div
          style={{
            background: C.greenDeep,
            color: "white",
            padding: `${S[4]}px ${S[5]}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: T.micro,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: C.greenLine,
                fontWeight: 600,
              }}
            >
              Total
            </div>
            <div
              style={{
                fontSize: T.micro,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              All categories combined
            </div>
          </div>
          <div
            style={{
              fontSize: T.total,
              fontWeight: 700,
              letterSpacing: -0.4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatKsh(totals.total)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: S[6] }}>
      <div style={{ height: 1, background: C.hairline }} />
      <div
        style={{
          marginTop: S[3],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: T.micro,
          color: C.muted,
        }}
      >
        <span>
          Prepared by <strong style={{ color: C.ink }}>EkaTrack</strong> ·{" "}
          {COMPANY.name}
        </span>
        <span>Generated {formatDateKE(todayISO())}</span>
      </div>
    </footer>
  );
}

/* ─────────────────────────── Subcomponents ─────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: S[4],
      }}
    >
      <div>
        <div style={labelStyle}>{eyebrow}</div>
        <h2
          style={{
            fontSize: T.h1,
            fontWeight: 700,
            color: C.ink,
            margin: `${S[1]}px 0 0`,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </h2>
      </div>
      {meta && (
        <span style={{ fontSize: T.micro, color: C.muted }}>{meta}</span>
      )}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align,
        padding: `${S[3]}px ${S[4]}px`,
        fontSize: T.micro,
        fontWeight: 600,
        color: C.muted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        background: C.greenSoft,
        borderBottom: `1px solid ${C.greenLine}`,
      }}
    >
      {children}
    </th>
  );
}

function DateCell({ date }: { date: string }) {
  return (
    <td
      style={{
        ...tdStyle,
        verticalAlign: "top",
        fontWeight: 600,
        color: C.ink,
        background: C.zebra,
        borderRight: `1px solid ${C.hairline}`,
      }}
    >
      <div style={{ fontSize: T.small, fontWeight: 600 }}>
        {formatDayName(date)}
      </div>
      <div
        style={{
          fontSize: T.micro,
          color: C.muted,
          marginTop: 2,
          fontWeight: 500,
        }}
      >
        {formatDateKE(date)}
      </div>
    </td>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const map: Record<
    ActivityStatus,
    { label: string; icon: string; bg: string; fg: string; dot: string }
  > = {
    completed: {
      label: "Completed",
      icon: "✅",
      bg: C.greenSoft,
      fg: C.greenDeep,
      dot: C.green,
    },
    pending: {
      label: "Pending",
      icon: "⏳",
      bg: C.amberSoft,
      fg: C.amber,
      dot: C.amber,
    },
    delayed: {
      label: "Delayed",
      icon: "⚠️",
      bg: C.redSoft,
      fg: C.red,
      dot: C.red,
    },
  };
  const s = map[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 999,
        background: s.bg,
        color: s.fg,
        fontSize: T.micro,
        fontWeight: 600,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: s.dot,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

/* ─────────────────────────── Shared styles ─────────────────────────── */

const labelStyle: CSSProperties = {
  fontSize: T.micro,
  color: C.label,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  fontWeight: 600,
};

const tdStyle: CSSProperties = {
  padding: `${S[3]}px ${S[4]}px`,
  verticalAlign: "top",
  fontSize: T.small,
  lineHeight: 1.5,
};

function rowStyle(zebra: boolean, last: boolean): CSSProperties {
  return {
    background: zebra ? C.zebra : C.surface,
    borderBottom: last ? "none" : `1px solid ${C.hairline}`,
  };
}
