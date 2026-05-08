"use client";

import { forwardRef, CSSProperties } from "react";
import { Client, WorkPlan, ActivityStatus } from "@/lib/db";
import { formatDateKE, formatDayName, formatKsh } from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";
import { EkafarmHeader, BrandFooter } from "./EkafarmHeader";

type Props = { plan: WorkPlan; client: Client | undefined };

/* ─────────────────────────── Design tokens ─────────────────────────── */

const C = {
  ink: "#0B1220",
  body: "#1F2937",
  muted: "#4B5563",
  label: "#6B7280",
  hairline: "#E5E7EB",
  surface: "#FFFFFF",
  zebra: "#F8FAFC",
  blue: "#1E40AF",
  blueDeep: "#1E3A8A",
  blueSoft: "#EFF6FF",
  blueLine: "#BFDBFE",
  green: "#059669",
  greenInk: "#065F46",
  greenSoft: "#D1FAE5",
  amber: "#B45309",
  amberDot: "#D97706",
  amberSoft: "#FEF3C7",
  red: "#B91C1C",
  redSoft: "#FEE2E2",
  graySoft: "#F3F4F6",
  grayInk: "#374151",
  grayDot: "#9CA3AF",
} as const;

const S = { 1: 4, 2: 6, 3: 8, 4: 12, 5: 16, 6: 24, 7: 32 } as const;

const T = {
  h0: 22,
  h1: 16,
  h2: 12,
  body: 11,
  small: 10.5,
  micro: 9.5,
  total: 22,
} as const;

const FONT_HEAD =
  'var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif';
const FONT_BODY =
  'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

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
          padding: "16mm 14mm 18mm",
          fontFamily: FONT_BODY,
          color: C.body,
          fontSize: T.body,
          lineHeight: 1.55,
        }}
      >
        <EkafarmHeader />
        <DocumentInfo plan={plan} client={client} />
        <ActivityTable plan={plan} totalActivities={totalActivities} />
        <ExpenseSummary totals={totals} />
        <BrandFooter />
      </div>
    );
  }
);

/* ─────────────────────────── Sections ─────────────────────────── */

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
    <section style={{ marginTop: S[6], marginBottom: S[6] }}>
      <div style={{ ...labelStyle, color: C.blue }}>Weekly Work Plan</div>
      <h1
        style={{
          fontFamily: FONT_HEAD,
          fontSize: T.h0,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: -0.3,
          margin: `${S[2]}px 0 ${S[5]}px`,
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
          padding: `${S[4]}px ${S[5]}px`,
          background: C.blueSoft,
          border: `1px solid ${C.blueLine}`,
          borderRadius: 8,
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
      <div style={{ ...labelStyle, color: C.blue }}>{label}</div>
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
          tableLayout: "fixed",
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
                  <DateCell date={day.date} zebra={zebra} />
                  <td
                    colSpan={3}
                    style={{
                      ...tdStyle,
                      color: C.label,
                      fontStyle: "italic",
                    }}
                  >
                    No scheduled activity
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <NoActivityBadge />
                  </td>
                </tr>
              );
            }
            return day.activities.map((act, idx) => {
              const last = idx === day.activities.length - 1;
              return (
                <tr key={day.date + act.id} style={rowStyle(zebra, last)}>
                  {idx === 0 && (
                    <DateCell
                      date={day.date}
                      zebra={zebra}
                      rowSpan={day.activities.length}
                    />
                  )}
                  <td
                    style={{
                      ...tdStyle,
                      color: C.ink,
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {act.title || "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: C.body,
                    }}
                  >
                    {act.requirements || "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      color: C.body,
                      wordBreak: "break-word",
                    }}
                  >
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
          border: `1px solid ${C.blueLine}`,
          borderRadius: 10,
          background: C.surface,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            padding: `${S[3]}px ${S[5]}px`,
            background: C.blueSoft,
          }}
        >
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: `${S[3]}px 0`,
                borderBottom:
                  i === rows.length - 1
                    ? "none"
                    : `1px solid ${C.blueLine}`,
              }}
            >
              <span style={{ color: C.body, fontSize: T.body }}>
                {r.label}
              </span>
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

        <div
          style={{
            background: C.blueDeep,
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
                color: C.blueLine,
                fontWeight: 700,
              }}
            >
              Total
            </div>
            <div
              style={{
                fontSize: T.micro,
                color: "rgba(255,255,255,0.75)",
                marginTop: 2,
              }}
            >
              All categories combined
            </div>
          </div>
          <div
            style={{
              fontFamily: FONT_HEAD,
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
        <div style={{ ...labelStyle, color: C.blue }}>{eyebrow}</div>
        <h2
          style={{
            fontFamily: FONT_HEAD,
            fontSize: T.h1,
            fontWeight: 700,
            color: C.ink,
            margin: `${S[1]}px 0 0`,
            letterSpacing: -0.2,
            lineHeight: 1.2,
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
        fontWeight: 700,
        color: "white",
        textTransform: "uppercase",
        letterSpacing: 1,
        background: C.blueDeep,
      }}
    >
      {children}
    </th>
  );
}

function DateCell({
  date,
  zebra,
  rowSpan,
}: {
  date: string;
  zebra: boolean;
  rowSpan?: number;
}) {
  return (
    <td
      rowSpan={rowSpan}
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
        {formatDayName(date)}
      </div>
      <div
        style={{
          fontSize: T.micro,
          color: C.muted,
          marginTop: 2,
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
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
    { label: string; bg: string; fg: string; dot: string }
  > = {
    completed: {
      label: "Completed",
      bg: C.greenSoft,
      fg: C.greenInk,
      dot: C.green,
    },
    pending: {
      label: "Pending",
      bg: C.amberSoft,
      fg: C.amber,
      dot: C.amberDot,
    },
    delayed: {
      label: "Delayed",
      bg: C.redSoft,
      fg: C.red,
      dot: C.red,
    },
  };
  const s = map[status];
  return <Badge label={s.label} bg={s.bg} fg={s.fg} dot={s.dot} />;
}

function NoActivityBadge() {
  return (
    <Badge
      label="No Activity"
      bg={C.graySoft}
      fg={C.grayInk}
      dot={C.grayDot}
    />
  );
}

function Badge({
  label,
  bg,
  fg,
  dot,
}: {
  label: string;
  bg: string;
  fg: string;
  dot: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        background: bg,
        color: fg,
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
          background: dot,
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

/* ─────────────────────────── Shared styles ─────────────────────────── */

const labelStyle: CSSProperties = {
  fontSize: T.micro,
  color: C.label,
  textTransform: "uppercase",
  letterSpacing: 1.1,
  fontWeight: 700,
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
