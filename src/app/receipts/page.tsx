"use client";

import { useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import {
  Receipt,
  ReceiptItem,
  db,
  nextReceiptNumber,
} from "@/lib/db";
import { formatDateKE, formatKsh, todayISO } from "@/lib/format";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  EmptyState,
} from "@/components/UI";
import { Modal } from "@/components/Modal";
import { ReceiptDocument } from "@/components/ReceiptDocument";
import { exportNodeToPdf } from "@/lib/pdf";

export default function ReceiptsPage() {
  const receipts = useLiveQuery(
    () => db.receipts.orderBy("receiptNumber").reverse().toArray(),
    []
  );
  const [open, setOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Receipt | null>(null);

  return (
    <>
      <PageHeader
        title="Receipts"
        subtitle="Customer payments, branded PDF export"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> New Receipt
          </Button>
        }
      />

      {receipts && receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Create receipt
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-eka-50 text-left text-xs uppercase text-eka-700">
                <tr>
                  <th className="px-4 py-3">RCPT#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Received from</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eka-100">
                {(receipts || []).map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-eka-900">
                      #{String(r.receiptNumber).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatDateKE(r.date)}</td>
                    <td className="px-4 py-3 text-gray-900">{r.receivedFrom}</td>
                    <td className="px-4 py-3 text-gray-600">{r.items.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-eka-700">
                      {formatKsh(r.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setPreviewing(r)}
                        className="p-1.5 text-gray-500 hover:text-eka-700"
                        aria-label="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete receipt #${r.receiptNumber}?`))
                            await db.receipts.delete(r.id!);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {open && <NewReceiptModal onClose={() => setOpen(false)} />}
      {previewing && (
        <ReceiptPreviewModal
          receipt={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
    </>
  );
}

function newItem(): ReceiptItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function NewReceiptModal({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [receivedFrom, setReceivedFrom] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([newItem()]);

  const total = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    [items]
  );

  const update = (id: string, patch: Partial<ReceiptItem>) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const submit = async () => {
    if (!receivedFrom.trim()) return;
    const cleanItems = items.filter((i) => i.description.trim() && i.quantity > 0);
    if (cleanItems.length === 0) return;
    const num = await nextReceiptNumber();
    await db.receipts.add({
      receiptNumber: num,
      date: new Date(date + "T00:00:00").toISOString(),
      receivedFrom: receivedFrom.trim(),
      items: cleanItems,
      total: cleanItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      createdAt: todayISO(),
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="New Receipt" size="lg">
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-eka-200 bg-white px-3 py-2 text-sm focus:border-eka-500 focus:outline-none focus:ring-2 focus:ring-eka-200"
            />
          </Field>
          <Field label="Received from">
            <Input
              value={receivedFrom}
              onChange={(e) => setReceivedFrom(e.target.value)}
              placeholder="Customer / client name"
            />
          </Field>
        </div>

        <div>
          <p className="text-sm font-medium text-eka-900 mb-2">Items</p>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={it.id} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-6"
                  value={it.description}
                  onChange={(e) => update(it.id, { description: e.target.value })}
                  placeholder={`Item ${idx + 1} description`}
                />
                <Input
                  className="col-span-2"
                  type="number"
                  value={it.quantity}
                  onChange={(e) =>
                    update(it.id, { quantity: parseFloat(e.target.value || "0") })
                  }
                  placeholder="Qty"
                />
                <Input
                  className="col-span-3"
                  type="number"
                  value={it.unitPrice}
                  onChange={(e) =>
                    update(it.id, { unitPrice: parseFloat(e.target.value || "0") })
                  }
                  placeholder="Unit price"
                />
                <button
                  onClick={() =>
                    setItems((arr) =>
                      arr.length > 1 ? arr.filter((x) => x.id !== it.id) : arr
                    )
                  }
                  className="col-span-1 text-gray-400 hover:text-red-600"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setItems((arr) => [...arr, newItem()])}
          >
            <Plus size={14} /> Add item
          </Button>
        </div>

        <div className="flex items-center justify-between bg-eka-50 rounded-lg p-3">
          <span className="text-sm text-eka-900 font-medium">Grand total</span>
          <span className="text-lg font-bold text-eka-700">{formatKsh(total)}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!receivedFrom.trim() || total <= 0}>
            Save Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ReceiptPreviewModal({
  receipt,
  onClose,
}: {
  receipt: Receipt;
  onClose: () => void;
}) {
  const docRef = useRef<HTMLDivElement>(null);

  const exportPdf = async () => {
    if (!docRef.current) return;
    const safeName = receipt.receivedFrom.replace(/\s+/g, "_") || "Customer";
    await exportNodeToPdf(
      docRef.current,
      `Receipt_${receipt.receiptNumber}_${safeName}.pdf`
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Receipt #${String(receipt.receiptNumber).padStart(3, "0")}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
          <div style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "210mm" }}>
            <ReceiptDocument ref={docRef} receipt={receipt} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={exportPdf}>
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
