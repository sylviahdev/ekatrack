"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Users,
  ClipboardList,
  Wallet,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatKsh, formatDateKE } from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";
import { Card, CardHeader, PageHeader, StatCard, EmptyState, Badge } from "@/components/UI";

export default function Dashboard() {
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const plans = useLiveQuery(() => db.workPlans.orderBy("createdAt").reverse().toArray(), []);
  const inventory = useLiveQuery(() => db.inventory.toArray(), []);
  const receipts = useLiveQuery(() => db.receipts.toArray(), []);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthlyRevenue = (receipts || [])
    .filter((r) => new Date(r.date) >= monthStart)
    .reduce((s, r) => s + r.total, 0);

  const lowStock = (inventory || []).filter((i) => i.quantity <= i.lowStockThreshold);
  const recentPlans = (plans || []).slice(0, 5);

  const planCost = (planId: number | undefined) => {
    const plan = (plans || []).find((p) => p.id === planId);
    if (!plan) return 0;
    const parsed = plan.days.flatMap((d) =>
      d.activities.map((a) => parseRequirements(a.requirements))
    );
    return sumPlanCosts(parsed, plan.transportSupervision).total;
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your farm operations"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clients"
          value={clients?.length ?? 0}
          icon={<Users size={18} />}
          tone="green"
        />
        <StatCard
          label="Work Plans"
          value={plans?.length ?? 0}
          icon={<ClipboardList size={18} />}
          tone="blue"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatKsh(monthlyRevenue)}
          icon={<Wallet size={18} />}
          tone="green"
        />
        <StatCard
          label="Low Stock"
          value={lowStock.length}
          icon={<AlertTriangle size={18} />}
          tone={lowStock.length > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader
            title="Recent Work Plans"
            action={
              <Link
                href="/work-plans"
                className="text-sm text-eka-700 hover:text-eka-800 inline-flex items-center gap-1"
              >
                View all <ArrowRight size={14} />
              </Link>
            }
          />
          {recentPlans.length === 0 ? (
            <EmptyState
              title="No work plans yet"
              description="Create your first weekly work plan to get started."
            />
          ) : (
            <ul className="divide-y divide-eka-100">
              {recentPlans.map((p) => {
                const client = (clients || []).find((c) => c.id === p.clientId);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/work-plans/${p.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-eka-50"
                    >
                      <div>
                        <p className="font-medium text-eka-900">
                          {client?.name || "Unknown"} · Week {p.weekNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateKE(p.startDate)} – {formatDateKE(p.endDate)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-eka-700">
                        {formatKsh(planCost(p.id))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Low-stock Alerts"
            action={
              <Link
                href="/inventory"
                className="text-sm text-eka-700 hover:text-eka-800 inline-flex items-center gap-1"
              >
                Manage <ArrowRight size={14} />
              </Link>
            }
          />
          {lowStock.length === 0 ? (
            <EmptyState title="All stock levels healthy" />
          ) : (
            <ul className="divide-y divide-eka-100">
              {lowStock.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="font-medium text-eka-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      Threshold: {item.lowStockThreshold} {item.unit}
                    </p>
                  </div>
                  <Badge tone="red">
                    {item.quantity} {item.unit} left
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
