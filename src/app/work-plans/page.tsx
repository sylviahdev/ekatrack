"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Plus, Trash2, FileText } from "lucide-react";
import {
  db,
  emptyDays,
  nextWeekNumberForClient,
  DEFAULT_TRANSPORT_SUPERVISION,
  Client,
} from "@/lib/db";
import {
  formatDateKE,
  startOfWeekMonday,
  addDaysISO,
} from "@/lib/format";
import { formatKsh } from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";
import {
  Button,
  Card,
  Field,
  Select,
  PageHeader,
  EmptyState,
} from "@/components/UI";
import { Modal } from "@/components/Modal";

export default function WorkPlansPage() {
  const plans = useLiveQuery(
    () => db.workPlans.orderBy("createdAt").reverse().toArray(),
    []
  );
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Work Plans"
        subtitle="Weekly farm activity schedules"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> New Plan
          </Button>
        }
      />

      {plans && plans.length === 0 ? (
        <EmptyState
          title="No work plans yet"
          description="Create a weekly plan to schedule farm activities and export branded PDFs."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Create Plan
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(plans || []).map((p) => {
            const client = (clients || []).find((c) => c.id === p.clientId);
            const parsed = p.days.flatMap((d) =>
              d.activities.map((a) => parseRequirements(a.requirements))
            );
            const total = sumPlanCosts(parsed, p.transportSupervision).total;
            const activityCount = p.days.reduce((n, d) => n + d.activities.length, 0);
            return (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-eka-700">
                      Week {p.weekNumber}
                    </p>
                    <p className="font-semibold text-eka-900 truncate">
                      {client?.name || "Unknown client"}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete Week ${p.weekNumber} plan?`))
                        await db.workPlans.delete(p.id!);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {formatDateKE(p.startDate)} – {formatDateKE(p.endDate)}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{activityCount} activities</span>
                  <span className="font-semibold text-eka-700">{formatKsh(total)}</span>
                </div>
                <Link
                  href={`/work-plans/${p.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-eka-700 hover:text-eka-800"
                >
                  <FileText size={14} /> Open editor
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {open && (
        <NewPlanModal
          onClose={() => setOpen(false)}
          clients={clients || []}
        />
      )}
    </>
  );
}

function NewPlanModal({
  onClose,
  clients,
}: {
  onClose: () => void;
  clients: Client[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState<number | "">(
    clients[0]?.id || ""
  );
  const [startDate, setStartDate] = useState<string>(
    startOfWeekMonday().toISOString().slice(0, 10)
  );

  const create = async () => {
    if (!clientId) return;
    const id = Number(clientId);
    const startISO = new Date(startDate + "T00:00:00").toISOString();
    const endISO = addDaysISO(startISO, 6);
    const weekNumber = await nextWeekNumberForClient(id);

    const planId = await db.workPlans.add({
      clientId: id,
      weekNumber,
      startDate: startISO,
      endDate: endISO,
      days: emptyDays(startISO),
      transportSupervision: DEFAULT_TRANSPORT_SUPERVISION,
      createdAt: new Date().toISOString(),
    });
    router.push(`/work-plans/${planId}`);
  };

  return (
    <Modal open onClose={onClose} title="New Work Plan">
      {clients.length === 0 ? (
        <EmptyState
          title="Add a client first"
          description="Work plans are tied to a specific client farm."
          action={
            <Link href="/clients">
              <Button>Add a client</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <Field label="Client">
            <Select
              value={clientId}
              onChange={(e) =>
                setClientId(e.target.value ? Number(e.target.value) : "")
              }
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.acreage != null ? ` (${c.acreage} acre${c.acreage === 1 ? "" : "s"})` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Week starts (Monday)">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-eka-200 bg-white px-3 py-2 text-sm focus:border-eka-500 focus:outline-none focus:ring-2 focus:ring-eka-200"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!clientId}>
              Create &amp; open
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
