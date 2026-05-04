"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatDateKE, formatKsh } from "@/lib/format";
import { parseRequirements, sumPlanCosts } from "@/lib/parse";
import {
  Card,
  CardHeader,
  PageHeader,
  StatCard,
  Select,
  EmptyState,
  Badge,
} from "@/components/UI";

type LedgerEntry = {
  date: string;
  kind: "income" | "expense";
  category: string;
  description: string;
  amount: number;
};

export default function ExpensesPage() {
  const plans = useLiveQuery(() => db.workPlans.toArray(), []);
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const receipts = useLiveQuery(() => db.receipts.toArray(), []);

  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [range, setRange] = useState<"all" | "month" | "30d">("all");

  const entries = useMemo<LedgerEntry[]>(() => {
    const out: LedgerEntry[] = [];

    for (const r of receipts || []) {
      out.push({
        date: r.date,
        kind: "income",
        category: "Receipt",
        description: `#${String(r.receiptNumber).padStart(3, "0")} · ${r.receivedFrom}`,
        amount: r.total,
      });
    }

    for (const p of plans || []) {
      const client = (clients || []).find((c) => c.id === p.clientId);
      const parsed = p.days.flatMap((d) =>
        d.activities.map((a) => parseRequirements(a.requirements))
      );
      const t = sumPlanCosts(parsed, p.transportSupervision);
      const push = (cat: string, amt: number) => {
        if (amt > 0)
          out.push({
            date: p.startDate,
            kind: "expense",
            category: cat,
            description: `${client?.name || "Plan"} · Week ${p.weekNumber}`,
            amount: amt,
          });
      };
      push("Diesel", t.diesel);
      push("Casual Labor", t.casualLabor);
      push("Piece Work", t.pieceWork);
      push("Chemicals", t.chemicals);
      push("Transport", t.transport);
    }

    return out.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [plans, clients, receipts]);

  const filtered = useMemo(() => {
    let res = entries;
    if (filter !== "all") res = res.filter((e) => e.kind === filter);
    if (range === "month") {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      res = res.filter((e) => new Date(e.date) >= start);
    } else if (range === "30d") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      res = res.filter((e) => new Date(e.date) >= start);
    }
    return res;
  }, [entries, filter, range]);

  const income = filtered
    .filter((e) => e.kind === "income")
    .reduce((s, e) => s + e.amount, 0);
  const expense = filtered
    .filter((e) => e.kind === "expense")
    .reduce((s, e) => s + e.amount, 0);
  const net = income - expense;

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle="Combined ledger pulling from work plans and receipts"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Income"
          value={formatKsh(income)}
          icon={<TrendingUp size={18} />}
          tone="green"
        />
        <StatCard
          label="Expenses"
          value={formatKsh(expense)}
          icon={<TrendingDown size={18} />}
          tone="red"
        />
        <StatCard
          label="Net"
          value={formatKsh(net)}
          icon={<Wallet size={18} />}
          tone={net >= 0 ? "green" : "red"}
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Ledger"
          action={
            <div className="flex gap-2">
              <Select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "all" | "income" | "expense")
                }
              >
                <option value="all">All</option>
                <option value="income">Income only</option>
                <option value="expense">Expenses only</option>
              </Select>
              <Select
                value={range}
                onChange={(e) =>
                  setRange(e.target.value as "all" | "month" | "30d")
                }
              >
                <option value="all">All time</option>
                <option value="month">This month</option>
                <option value="30d">Last 30 days</option>
              </Select>
            </div>
          }
        />
        {filtered.length === 0 ? (
          <EmptyState
            title="No entries yet"
            description="Create work plans and receipts to populate this ledger."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-eka-50 text-left text-xs uppercase text-eka-700">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eka-100">
                {filtered.map((e, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateKE(e.date)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={e.kind === "income" ? "green" : "amber"}>
                        {e.kind === "income" ? "Income" : "Expense"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.category}</td>
                    <td className="px-4 py-3 text-gray-900">{e.description}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        e.kind === "income" ? "text-eka-700" : "text-amber-700"
                      }`}
                    >
                      {e.kind === "income" ? "+" : "−"}
                      {formatKsh(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
