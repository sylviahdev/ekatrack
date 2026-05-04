"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Pencil, Trash2, Phone } from "lucide-react";
import { ROLE_LABEL, Worker, WorkerRole, db } from "@/lib/db";
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

export default function WorkersPage() {
  const workers = useLiveQuery(() => db.workers.orderBy("name").toArray(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);

  const start = (w: Worker | null) => {
    setEditing(w);
    setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Workers"
        subtitle="Casuals, supervisors, machine operators &amp; spray men"
        action={
          <Button onClick={() => start(null)}>
            <Plus size={16} /> New Worker
          </Button>
        }
      />

      {workers && workers.length === 0 ? (
        <EmptyState
          title="No workers yet"
          action={
            <Button onClick={() => start(null)}>
              <Plus size={16} /> Add Worker
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(workers || []).map((w) => (
            <Card key={w.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-eka-900 truncate">{w.name}</p>
                  <Badge tone="green">{ROLE_LABEL[w.role]}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => start(w)}
                    className="p-1.5 text-gray-500 hover:text-eka-700"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${w.name}?`)) await db.workers.delete(w.id!);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                {w.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={13} /> {w.phone}
                  </p>
                )}
                <p>
                  Daily rate: <span className="font-semibold text-eka-700">{formatKsh(w.dailyRate)}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <WorkerModal
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

function WorkerModal({
  editing,
  onClose,
}: {
  editing: Worker | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [role, setRole] = useState<WorkerRole>(editing?.role || "casual");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [rate, setRate] = useState<string>(
    editing?.dailyRate != null ? String(editing.dailyRate) : "400"
  );

  const submit = async () => {
    if (!name.trim()) return;
    const data: Omit<Worker, "id"> = {
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
      dailyRate: parseFloat(rate || "0"),
    };
    if (editing?.id) await db.workers.update(editing.id, data);
    else await db.workers.add(data);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={editing ? "Edit Worker" : "New Worker"}>
      <div className="space-y-3">
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as WorkerRole)}>
            {(Object.keys(ROLE_LABEL) as WorkerRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
        </Field>
        <Field label="Daily rate (Ksh)">
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
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
