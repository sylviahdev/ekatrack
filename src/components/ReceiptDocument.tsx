"use client";

import { forwardRef, CSSProperties } from "react";
import { EkafarmHeader, BrandFooter } from "./EkafarmHeader";
import { Receipt, COMPANY } from "@/lib/db";
import { formatDateKE, formatKsh } from "@/lib/format";

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
} as const;

const FONT_HEAD =
  'var(--font-playfair), "Playfair Display", Georgia, "Times New Roman", serif';
const FONT_BODY =
  'var(--font-inter), "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const ReceiptDocument = forwardRef<HTMLDivElement, { receipt: Receipt }>(
  function ReceiptDocument({ receipt }, ref) {
    const num = String(receipt.receiptNumber).padStart(3, "0");
    return (
      <div
        ref={ref}
        className="a4-sheet"
        style={{
          padding: "16mm 14mm 18mm",
          fontFamily: FONT_BODY,
          color: C.body,
          fontSize: 11,
          lineHeight: 1.55,
        }}
      >
        <EkafarmHeader />

        {/* Receipt title bar */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingBottom: 14,
            borderBottom: `1px solid ${C.hairline}`,
          }}
        >
          <div>
            <p style={{ ...eyebrowStyle, color: C.blue }}>Official Receipt</p>
            <h1
              style={{
                fontFamily: FONT_HEAD,
                fontSize: 26,
                fontWeight: 700,
                color: C.ink,
                margin: "4px 0 0",
                letterSpacing: -0.3,
                lineHeight: 1.1,
              }}
            >
              No. {num}
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={eyebrowStyle}>Date issued</p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.ink,
                margin: "4px 0 0",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatDateKE(receipt.date)}
            </p>
          </div>
        </div>

        {/* Received from */}
        <div
          style={{
            marginTop: 18,
            padding: "12px 16px",
            background: C.blueSoft,
            border: `1px solid ${C.blueLine}`,
            borderRadius: 8,
          }}
        >
          <p style={{ ...eyebrowStyle, color: C.blue }}>Received from</p>
          <p
            style={{
              fontFamily: FONT_HEAD,
              fontSize: 18,
              fontWeight: 700,
              color: C.ink,
              margin: "4px 0 0",
              lineHeight: 1.2,
            }}
          >
            {receipt.receivedFrom}
          </p>
        </div>

        {/* Items */}
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            marginTop: 22,
            fontSize: 11,
            border: `1px solid ${C.hairline}`,
            borderRadius: 8,
            overflow: "hidden",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "48%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              <Th align="center">#</Th>
              <Th>Description</Th>
              <Th align="center">Qty</Th>
              <Th align="right">Unit Price</Th>
              <Th align="right">Amount</Th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, i) => {
              const zebra = i % 2 === 1;
              const last = i === receipt.items.length - 1;
              return (
                <tr
                  key={item.id}
                  style={{
                    background: zebra ? C.zebra : C.surface,
                  }}
                >
                  <td
                    style={{
                      ...tdBase(last),
                      textAlign: "center",
                      color: C.muted,
                      fontWeight: 500,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      ...tdBase(last),
                      color: C.ink,
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.description}
                  </td>
                  <td
                    style={{
                      ...tdBase(last),
                      textAlign: "center",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      ...tdBase(last),
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatKsh(item.unitPrice)}
                  </td>
                  <td
                    style={{
                      ...tdBase(last),
                      textAlign: "right",
                      fontWeight: 600,
                      color: C.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatKsh(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              );
            })}
            {receipt.items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...tdBase(true),
                    textAlign: "center",
                    color: C.label,
                    fontStyle: "italic",
                  }}
                >
                  No items
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={4}
                style={{
                  background: C.blueDeep,
                  color: "white",
                  padding: "12px 14px",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 700,
                  textAlign: "right",
                }}
              >
                Grand Total
              </td>
              <td
                style={{
                  background: C.blueDeep,
                  color: "white",
                  padding: "12px 14px",
                  fontFamily: FONT_HEAD,
                  fontSize: 16,
                  fontWeight: 700,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatKsh(receipt.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Payment details */}
        <div
          style={{
            marginTop: 22,
            padding: "14px 16px",
            background: C.surface,
            border: `1px solid ${C.blueLine}`,
            borderRadius: 8,
          }}
        >
          <p style={{ ...eyebrowStyle, color: C.blue }}>Payment details</p>
          <div
            style={{
              marginTop: 8,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              fontSize: 11,
            }}
          >
            <PayCell label="Bank" value={COMPANY.bankName} />
            <PayCell label="Account No." value={COMPANY.bankAccount} mono />
            <PayCell label="Account name" value={COMPANY.name} />
          </div>
        </div>

        {/* Signature */}
        <div
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 10.5,
          }}
        >
          <div>
            <div
              style={{
                borderTop: `1.5px solid ${C.ink}`,
                paddingTop: 4,
                width: 200,
                color: C.muted,
                fontSize: 10,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Authorized Signature
            </div>
          </div>
          <div
            style={{
              fontStyle: "italic",
              color: C.muted,
              fontSize: 11,
            }}
          >
            Thank you for your business.
          </div>
        </div>

        <BrandFooter />
      </div>
    );
  }
);

function PayCell({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          color: C.muted,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          color: C.ink,
          fontWeight: 500,
          fontVariantNumeric: mono ? "tabular-nums" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
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
        padding: "10px 12px",
        fontSize: 9.5,
        fontWeight: 700,
        color: "white",
        background: C.blueDeep,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {children}
    </th>
  );
}

const eyebrowStyle: CSSProperties = {
  fontSize: 9.5,
  color: C.label,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  margin: 0,
};

function tdBase(last: boolean): CSSProperties {
  return {
    padding: "9px 12px",
    verticalAlign: "top",
    fontSize: 11,
    color: C.body,
    borderBottom: last ? "none" : `1px solid ${C.hairline}`,
  };
}
