"use client";

import { forwardRef } from "react";
import { EkafarmHeader } from "./EkafarmHeader";
import { Client, WorkPlan } from "@/lib/db";
import { formatDateKE, formatDayName } from "@/lib/format";
import { formatKsh } from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";

type Props = { plan: WorkPlan; client: Client | undefined };

export const WorkPlanDocument = forwardRef<HTMLDivElement, Props>(
  function WorkPlanDocument({ plan, client }, ref) {
    const allParsed = plan.days.flatMap((d) =>
      d.activities.map((a) => parseRequirements(a.requirements))
    );
    const totals = sumPlanCosts(allParsed, plan.transportSupervision);

    const acreageStr = client?.acreage
      ? `${client.acreage} ACRE${client.acreage === 1 ? "" : "S"}`
      : "";

    return (
      <div
        ref={ref}
        className="a4-sheet"
        style={{ padding: "15mm 14mm", fontSize: 11 }}
      >
        <EkafarmHeader />

        {/* Title block */}
        <div style={{ marginTop: 12, fontSize: 12 }}>
          <p style={{ fontWeight: 700, color: "#143019" }}>
            FARM: {(client?.name || "—").toUpperCase()}
            {acreageStr ? ` (${acreageStr})` : ""}
          </p>
          <p style={{ fontWeight: 700, color: "#143019", marginTop: 2 }}>
            WEEK {plan.weekNumber}: FROM {formatDateKE(plan.startDate)} TO{" "}
            {formatDateKE(plan.endDate)}
          </p>
        </div>

        {/* Activity table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 10,
            fontSize: 10.5,
          }}
        >
          <thead>
            <tr style={{ background: "#2c6a3e", color: "white" }}>
              <th style={th(18)}>DATE</th>
              <th style={th(22)}>ACTIVITY</th>
              <th style={th(40)}>REQUIREMENTS</th>
              <th style={th(20)}>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {plan.days.map((day) => {
              const activities = day.activities.length
                ? day.activities
                : [{ id: "empty-" + day.date, title: "", requirements: "", remarks: "" }];
              return activities.map((act, idx) => (
                <tr key={day.date + act.id} style={{ borderBottom: "1px solid #ccc" }}>
                  {idx === 0 && (
                    <td
                      rowSpan={activities.length}
                      style={{
                        ...td,
                        verticalAlign: "top",
                        fontWeight: 600,
                        background: "#f1f8f1",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDayName(day.date)}
                      <br />
                      {formatDateKE(day.date)}
                    </td>
                  )}
                  <td style={td}>{act.title}</td>
                  <td style={{ ...td, whiteSpace: "pre-wrap" }}>{act.requirements}</td>
                  <td style={td}>{act.remarks}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>

        {/* Summary box */}
        <div
          style={{
            marginTop: 12,
            border: "2px solid #2c6a3e",
            padding: "10px 12px",
            background: "#f1f8f1",
          }}
        >
          <p
            style={{
              fontWeight: 700,
              color: "#143019",
              borderBottom: "1px solid #2c6a3e",
              paddingBottom: 4,
              marginBottom: 6,
            }}
          >
            WEEKLY EXPENSE SUMMARY
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.6 }}>
            <li>
              Diesel — <strong>{formatKsh(totals.diesel)}</strong>
            </li>
            <li>
              Casual Labor — <strong>{formatKsh(totals.casualLabor)}</strong>
            </li>
            {totals.pieceWork > 0 && (
              <li>
                Piece Work — <strong>{formatKsh(totals.pieceWork)}</strong>
              </li>
            )}
            <li>
              Chemical Spray — <strong>{formatKsh(totals.chemicals)}</strong>
            </li>
            <li>
              Transport &amp; Supervision — <strong>{formatKsh(totals.transport)}</strong>
            </li>
          </ol>
          <p
            style={{
              marginTop: 8,
              paddingTop: 6,
              borderTop: "1px solid #2c6a3e",
              fontWeight: 700,
              color: "#143019",
              fontSize: 13,
            }}
          >
            TOTAL: {formatKsh(totals.total)}
          </p>
        </div>

        <p
          style={{
            marginTop: 24,
            fontSize: 10,
            color: "#666",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          Prepared by Ekafarm Agri-Solutions Limited
        </p>
      </div>
    );
  }
);

const th = (widthPct: number): React.CSSProperties => ({
  width: `${widthPct}%`,
  textAlign: "left",
  padding: "6px 8px",
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: 0.5,
});

const td: React.CSSProperties = {
  padding: "6px 8px",
  verticalAlign: "top",
};
