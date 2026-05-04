"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Eye,
  Save,
} from "lucide-react";
import {
  db,
  newActivity,
  WorkDay,
  Activity,
} from "@/lib/db";
import {
  formatDateKE,
  formatDayName,
  formatKsh,
} from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
  PageHeader,
} from "@/components/UI";
import { WorkPlanDocument } from "@/components/WorkPlanDocument";
import { exportNodeToPdf } from "@/lib/pdf";

export default function WorkPlanEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = use(params);
  const id = Number(idStr);
  const router = useRouter();

  const plan = useLiveQuery(() => db.workPlans.get(id), [id]);
  const client = useLiveQuery(
    () => (plan?.clientId ? db.clients.get(plan.clientId) : undefined),
    [plan?.clientId]
  );

  // Local draft state so the editor is responsive; flushed to Dexie on change.
  const [days, setDays] = useState<WorkDay[]>([]);
  const [transport, setTransport] = useState<number>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plan) return;
    setDays(plan.days);
    setTransport(plan.transportSupervision);
  }, [plan?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(() => {
    const parsed = days.flatMap((d) =>
      d.activities.map((a) => parseRequirements(a.requirements))
    );
    return sumPlanCosts(parsed, transport);
  }, [days, transport]);

  const persist = async (
    patch: Partial<{ days: WorkDay[]; transportSupervision: number }>
  ) => {
    if (!plan?.id) return;
    await db.workPlans.update(plan.id, patch);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const updateDays = (next: WorkDay[]) => {
    setDays(next);
    persist({ days: next });
  };

  const updateTransport = (n: number) => {
    setTransport(n);
    persist({ transportSupervision: n });
  };

  const addActivity = (dayIdx: number) => {
    const next = days.map((d, i) =>
      i === dayIdx ? { ...d, activities: [...d.activities, newActivity()] } : d
    );
    updateDays(next);
  };

  const updateActivity = (dayIdx: number, actId: string, patch: Partial<Activity>) => {
    const next = days.map((d, i) =>
      i === dayIdx
        ? {
            ...d,
            activities: d.activities.map((a) =>
              a.id === actId ? { ...a, ...patch } : a
            ),
          }
        : d
    );
    updateDays(next);
  };

  const removeActivity = (dayIdx: number, actId: string) => {
    const next = days.map((d, i) =>
      i === dayIdx
        ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
        : d
    );
    updateDays(next);
  };

  const exportPdf = async () => {
    if (!docRef.current || !plan || !client) return;
    const safeName = (client.name || "client").replace(/\s+/g, "_");
    await exportNodeToPdf(docRef.current, `${safeName}_Week${plan.weekNumber}.pdf`);
  };

  const deletePlan = async () => {
    if (!plan?.id) return;
    if (!confirm(`Delete Week ${plan.weekNumber} plan?`)) return;
    await db.workPlans.delete(plan.id);
    router.push("/work-plans");
  };

  if (!plan) {
    return (
      <div className="text-center py-16 text-gray-500">Loading work plan…</div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-2 text-sm">
        <Link href="/work-plans" className="text-eka-700 hover:text-eka-800 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> All work plans
        </Link>
      </div>

      <PageHeader
        title={`${client?.name || "Plan"} — Week ${plan.weekNumber}`}
        subtitle={`${formatDateKE(plan.startDate)} – ${formatDateKE(plan.endDate)}${
          savedAt ? ` · saved ${savedAt}` : ""
        }`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview((s) => !s)}>
              <Eye size={16} /> {showPreview ? "Hide" : "Preview"}
            </Button>
            <Button onClick={exportPdf} disabled={!client}>
              <Download size={16} /> Export PDF
            </Button>
          </div>
        }
      />

      <div className={`grid gap-6 ${showPreview ? "xl:grid-cols-[minmax(0,1fr)_auto]" : ""}`}>
        {/* Editor */}
        <div className="space-y-4 min-w-0">
          {days.map((day, dayIdx) => (
            <Card key={day.date}>
              <CardHeader
                title={`${formatDayName(day.date)} — ${formatDateKE(day.date)}`}
                action={
                  <Button variant="secondary" onClick={() => addActivity(dayIdx)}>
                    <Plus size={14} /> Add activity
                  </Button>
                }
              />
              <div className="p-5 space-y-4">
                {day.activities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No activities scheduled.</p>
                ) : (
                  day.activities.map((act) => (
                    <ActivityEditor
                      key={act.id}
                      activity={act}
                      onChange={(patch) => updateActivity(dayIdx, act.id, patch)}
                      onRemove={() => removeActivity(dayIdx, act.id)}
                    />
                  ))
                )}
              </div>
            </Card>
          ))}

          <Card>
            <CardHeader title="Transport &amp; Supervision" subtitle="Manual fixed cost" />
            <div className="p-5">
              <Field label="Amount (Ksh)">
                <Input
                  type="number"
                  value={transport}
                  onChange={(e) => updateTransport(Number(e.target.value || 0))}
                />
              </Field>
            </div>
          </Card>

          {/* Live cost summary */}
          <Card>
            <CardHeader title="Cost Summary" subtitle="Auto-calculated from requirements" />
            <div className="p-5">
              <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <CostStat label="Diesel" value={totals.diesel} />
                <CostStat label="Casual Labor" value={totals.casualLabor} />
                {totals.pieceWork > 0 && (
                  <CostStat label="Piece Work" value={totals.pieceWork} />
                )}
                <CostStat label="Chemical Spray" value={totals.chemicals} />
                <CostStat label="Transport" value={totals.transport} />
                <CostStat label="TOTAL" value={totals.total} highlight />
              </dl>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setSavedAt(new Date().toLocaleTimeString())}>
              <Save size={16} /> All changes auto-saved
            </Button>
            <Button variant="danger" onClick={deletePlan}>
              <Trash2 size={16} /> Delete plan
            </Button>
          </div>
        </div>

        {/* Live preview */}
        {showPreview && (
          <div className="hidden xl:block">
            <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto preview-scroll p-4 bg-gray-100 rounded-xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">A4 Preview</p>
              <div style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "210mm" }}>
                <WorkPlanDocument
                  ref={docRef}
                  plan={{ ...plan, days, transportSupervision: transport }}
                  client={client}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Off-screen render target for PDF export when preview is hidden */}
      {!showPreview && (
        <div style={{ position: "fixed", left: -10000, top: 0 }}>
          <WorkPlanDocument
            ref={docRef}
            plan={{ ...plan, days, transportSupervision: transport }}
            client={client}
          />
        </div>
      )}
    </>
  );
}

function ActivityEditor({
  activity,
  onChange,
  onRemove,
}: {
  activity: Activity;
  onChange: (patch: Partial<Activity>) => void;
  onRemove: () => void;
}) {
  const parsed = parseRequirements(activity.requirements);
  const lineTotal =
    parsed.diesel + parsed.casualLabor + parsed.pieceWork + parsed.chemicals;

  return (
    <div className="rounded-lg border border-eka-100 bg-eka-50/40 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <Field label="Activity" className="flex-1">
          <Input
            value={activity.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Land preparation, Spraying, Harvest"
          />
        </Field>
        <button
          onClick={onRemove}
          className="mt-7 p-2 text-gray-400 hover:text-red-600"
          aria-label="Remove activity"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        <Field
          label="Requirements"
          hint="Lines like 'Diesel - 5 litres @197/=' or '4 casuals @400/-' are auto-totalled."
        >
          <Textarea
            rows={5}
            value={activity.requirements}
            onChange={(e) => onChange({ requirements: e.target.value })}
            placeholder={`Diesel - 5 litres @197/=\nLabor – 4 casuals @400/-\nAgrichemicals @ 2000/-`}
          />
        </Field>
        <Field label="Remarks">
          <Textarea
            rows={5}
            value={activity.remarks}
            onChange={(e) => onChange({ remarks: e.target.value })}
            placeholder="Notes, weather considerations, follow-ups…"
          />
        </Field>
      </div>
      {lineTotal > 0 && (
        <p className="mt-2 text-xs text-eka-700">
          Detected: {formatKsh(lineTotal)}
          {parsed.diesel > 0 && ` · Diesel ${formatKsh(parsed.diesel)}`}
          {parsed.casualLabor > 0 && ` · Casual ${formatKsh(parsed.casualLabor)}`}
          {parsed.pieceWork > 0 && ` · Piece ${formatKsh(parsed.pieceWork)}`}
          {parsed.chemicals > 0 && ` · Chems ${formatKsh(parsed.chemicals)}`}
        </p>
      )}
    </div>
  );
}

function CostStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 ${
        highlight ? "bg-eka-700 text-white" : "bg-eka-50 text-eka-900"
      }`}
    >
      <dt className="text-[10px] uppercase tracking-wide opacity-80">{label}</dt>
      <dd className="text-lg font-bold mt-0.5">{formatKsh(value)}</dd>
    </div>
  );
}
