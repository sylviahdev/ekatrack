"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import {
  CATEGORY_LABEL,
  InventoryCategory,
  InventoryItem,
  db,
} from "@/lib/db";
import { formatKsh } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  EmptyState,
} from "@/components/UI";
import { Modal } from "@/components/Modal";

export default function InventoryPage() {
  const items = useLiveQuery(() => db.inventory.orderBy("name").toArray(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const start = (i: InventoryItem | null) => {
    setEditing(i);
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Stock levels and low-stock alerts"
        action={
          <Button onClick={() => start(null)}>
            <Plus size={16} /> New Item
          </Button>
        }
      />

      {items && items.length === 0 ? (
        <EmptyState
          title="No inventory yet"
          action={
            <Button onClick={() => start(null)}>
              <Plus size={16} /> Add Item
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-eka-50 text-left text-xs uppercase text-eka-700">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Unit cost</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eka-100">
                {(items || []).map((it) => {
                  const low = it.quantity <= it.lowStockThreshold;
                  return (
                    <tr key={it.id}>
                      <td className="px-4 py-3 font-medium text-eka-900">{it.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {CATEGORY_LABEL[it.category]}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {it.unitCost != null ? formatKsh(it.unitCost) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {low ? (
                          <Badge tone="red">
                            <AlertTriangle size={11} className="mr-1" />
                            Low
                          </Badge>
                        ) : (
                          <Badge tone="green">OK</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => start(it)}
                          className="p-1.5 text-gray-500 hover:text-eka-700"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete ${it.name}?`)) await db.inventory.delete(it.id!);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {open && (
        <ItemModal
          editing={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

function ItemModal({
  editing,
  onClose,
}: {
  editing: InventoryItem | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [category, setCategory] = useState<InventoryCategory>(
    editing?.category || "agrochemical"
  );
  const [quantity, setQuantity] = useState<string>(
    editing?.quantity != null ? String(editing.quantity) : "0"
  );
  const [unit, setUnit] = useState(editing?.unit || "pcs");
  const [threshold, setThreshold] = useState<string>(
    editing?.lowStockThreshold != null ? String(editing.lowStockThreshold) : "0"
  );
  const [cost, setCost] = useState<string>(
    editing?.unitCost != null ? String(editing.unitCost) : ""
  );

  const submit = async () => {
    if (!name.trim()) return;
    const data: Omit<InventoryItem, "id"> = {
      name: name.trim(),
      category,
      quantity: parseFloat(quantity || "0"),
      unit: unit.trim() || "pcs",
      lowStockThreshold: parseFloat(threshold || "0"),
      unitCost: cost ? parseFloat(cost) : undefined,
    };
    if (editing?.id) await db.inventory.update(editing.id, data);
    else await db.inventory.add(data);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={editing ? "Edit Item" : "New Item"}>
      <div className="space-y-3">
        <Field label="Item name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Category">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as InventoryCategory)}
          >
            {(Object.keys(CATEGORY_LABEL) as InventoryCategory[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Unit">
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="litres, bags, pcs"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Low-stock threshold">
            <Input
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </Field>
          <Field label="Unit cost (Ksh)">
            <Input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="optional"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
