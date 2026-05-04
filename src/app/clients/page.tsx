"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Pencil, Trash2, MapPin, Phone } from "lucide-react";
import { Client, db } from "@/lib/db";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  EmptyState,
} from "@/components/UI";
import { Modal } from "@/components/Modal";

export default function ClientsPage() {
  const clients = useLiveQuery(() => db.clients.orderBy("name").toArray(), []);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const start = (c: Client | null) => {
    setEditing(c);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Farms managed by Ekafarm"
        action={
          <Button onClick={() => start(null)}>
            <Plus size={16} /> New Client
          </Button>
        }
      />

      {clients && clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Add a client farm to start planning work."
          action={
            <Button onClick={() => start(null)}>
              <Plus size={16} /> Add Client
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(clients || []).map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-eka-900 truncate">{c.name}</p>
                  {c.acreage != null && (
                    <p className="text-xs text-eka-700 mt-0.5">
                      {c.acreage} acre{c.acreage === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => start(c)}
                    className="p-1.5 text-gray-500 hover:text-eka-700"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${c.name}?`)) await db.clients.delete(c.id!);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {c.phone && (
                  <p className="flex items-center gap-2">
                    <Phone size={13} /> {c.phone}
                  </p>
                )}
                {c.location && (
                  <p className="flex items-center gap-2">
                    <MapPin size={13} /> {c.location}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && <ClientModal onClose={close} editing={editing} />}
    </>
  );
}

function ClientModal({
  onClose,
  editing,
}: {
  onClose: () => void;
  editing: Client | null;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [phone, setPhone] = useState(editing?.phone || "");
  const [location, setLocation] = useState(editing?.location || "");
  const [acreage, setAcreage] = useState<string>(
    editing?.acreage != null ? String(editing.acreage) : ""
  );

  const submit = async () => {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      acreage: acreage ? parseFloat(acreage) : undefined,
    };
    if (editing?.id) {
      await db.clients.update(editing.id, data);
    } else {
      await db.clients.add({ ...data, createdAt: new Date().toISOString() });
    }
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={editing ? "Edit Client" : "New Client"}>
      <div className="space-y-3">
        <Field label="Farm / Client name">
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
        </Field>
        <Field label="Location">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Town / area" />
        </Field>
        <Field label="Acreage">
          <Input
            type="number"
            step="0.1"
            value={acreage}
            onChange={(e) => setAcreage(e.target.value)}
            placeholder="e.g. 1.5"
          />
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
