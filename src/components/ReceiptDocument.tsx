"use client";

import { forwardRef } from "react";
import { EkafarmHeader } from "./EkafarmHeader";
import { Receipt, COMPANY } from "@/lib/db";
import { formatDateKE, formatKsh } from "@/lib/format";

export const ReceiptDocument = forwardRef<HTMLDivElement, { receipt: Receipt }>(
  function ReceiptDocument({ receipt }, ref) {
    const num = String(receipt.receiptNumber).padStart(3, "0");
    return (
      <div
        ref={ref}
        className="a4-sheet"
        style={{ padding: "15mm 14mm", fontSize: 11 }}
      >
        <EkafarmHeader />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#143019" }}>RECEIPT</p>
            <p style={{ marginTop: 6, fontSize: 11 }}>
              <strong>RCPT#:</strong> {num}
            </p>
            <p style={{ fontSize: 11 }}>
              <strong>Date:</strong> {formatDateKE(receipt.date)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11 }}>
              <strong>Received from:</strong>
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#143019" }}>
              {receipt.receivedFrom}
            </p>
          </div>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 18,
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ background: "#2c6a3e", color: "white" }}>
              <th style={th(8)}>#</th>
              <th style={th(48)}>DESCRIPTION</th>
              <th style={th(14)}>QTY</th>
              <th style={th(15)}>UNIT PRICE</th>
              <th style={th(15)}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={td}>{i + 1}</td>
                <td style={td}>{item.description}</td>
                <td style={td}>{item.quantity}</td>
                <td style={td}>{formatKsh(item.unitPrice)}</td>
                <td style={td}>{formatKsh(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
            {receipt.items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: "center", color: "#888" }}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f1f8f1" }}>
              <td colSpan={4} style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                GRAND TOTAL
              </td>
              <td style={{ ...td, fontWeight: 700, fontSize: 13, color: "#143019" }}>
                {formatKsh(receipt.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div
          style={{
            marginTop: 24,
            border: "1px solid #2c6a3e",
            background: "#f1f8f1",
            padding: "10px 12px",
            fontSize: 11,
          }}
        >
          <p style={{ fontWeight: 700, color: "#143019", marginBottom: 4 }}>
            Payment details
          </p>
          <p>
            <strong>Bank:</strong> {COMPANY.bankName}
          </p>
          <p>
            <strong>Account No:</strong> {COMPANY.bankAccount}
          </p>
          <p>
            <strong>Account name:</strong> Ekafarm Agri-Solutions Limited
          </p>
        </div>

        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
          }}
        >
          <div>
            <p style={{ borderTop: "1px solid #333", paddingTop: 4, width: 180 }}>
              Authorized Signature
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontStyle: "italic", color: "#666" }}>Thank you for your business</p>
          </div>
        </div>
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
