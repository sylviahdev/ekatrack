"use client";

import Dexie, { Table } from "dexie";

// ---------- types ----------

export type Client = {
  id?: number;
  name: string;
  phone?: string;
  location?: string;
  acreage?: number;
  createdAt: string;
};

export type ActivityStatus = "completed" | "pending" | "delayed";

export type Activity = {
  id: string;
  title: string;
  requirements: string;
  remarks: string;
  status?: ActivityStatus;
};

export type WorkDay = {
  date: string; // ISO
  activities: Activity[];
};

export type WorkPlan = {
  id?: number;
  clientId: number;
  weekNumber: number;
  startDate: string; // ISO Mon
  endDate: string; // ISO Sun
  days: WorkDay[];
  transportSupervision: number;
  createdAt: string;
};

export type InventoryCategory =
  | "seedling"
  | "fertilizer"
  | "agrochemical"
  | "diesel"
  | "tool";

export type InventoryItem = {
  id?: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  unitCost?: number;
};

export type WorkerRole =
  | "casual"
  | "supervisor"
  | "machine_operator"
  | "spray_man";

export type Worker = {
  id?: number;
  name: string;
  role: WorkerRole;
  phone?: string;
  dailyRate: number;
};

export type ReceiptItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Receipt = {
  id?: number;
  receiptNumber: number;
  date: string;
  receivedFrom: string;
  items: ReceiptItem[];
  total: number;
  createdAt: string;
};

// ---------- constants ----------

export const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  seedling: "Seedlings",
  fertilizer: "Fertilizer",
  agrochemical: "Agrochemicals",
  diesel: "Diesel",
  tool: "Tools",
};

export const ROLE_LABEL: Record<WorkerRole, string> = {
  casual: "Casual",
  supervisor: "Supervisor",
  machine_operator: "Machine Operator",
  spray_man: "Spray Man",
};

export const COMPANY = {
  name: "EKAFARM AGRI-SOLUTIONS LIMITED",
  poBox: "P.O Box 01 - 90139, Ekalakala",
  email: "ekafarmlimited@gmail.com",
  website: "www.ekafarmlimited.co.ke",
  phone: "+254(0)720611715",
  bankName: "KCB Bank",
  bankAccount: "1343522730",
};

export const DEFAULT_TRANSPORT_SUPERVISION = 4000;
export const STARTING_RECEIPT_NUMBER = 50; // first new receipt is #050

// ---------- db ----------

class EkaDB extends Dexie {
  clients!: Table<Client, number>;
  workPlans!: Table<WorkPlan, number>;
  inventory!: Table<InventoryItem, number>;
  workers!: Table<Worker, number>;
  receipts!: Table<Receipt, number>;

  constructor() {
    super("ekatrack");
    this.version(1).stores({
      clients: "++id, name, createdAt",
      workPlans: "++id, clientId, weekNumber, startDate, createdAt",
      inventory: "++id, name, category",
      workers: "++id, name, role",
      receipts: "++id, receiptNumber, date, createdAt",
    });
  }
}

export const db = new EkaDB();

// ---------- seed ----------

const SEED_FLAG_KEY = "ekatrack:seeded:v1";

export async function seedIfEmpty(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG_KEY)) return;

  const counts = await Promise.all([
    db.clients.count(),
    db.workers.count(),
    db.inventory.count(),
    db.receipts.count(),
  ]);
  if (counts.some((c) => c > 0)) {
    window.localStorage.setItem(SEED_FLAG_KEY, "1");
    return;
  }

  const now = new Date().toISOString();

  await db.clients.add({
    name: "Elizabeth Kitonga",
    phone: "0722947768",
    location: "Ekalakala",
    acreage: 1,
    createdAt: now,
  });

  await db.workers.bulkAdd([
    { name: "John Mwangi", role: "casual", phone: "0712345678", dailyRate: 400 },
    { name: "Peter Kamau", role: "supervisor", phone: "0723456789", dailyRate: 1500 },
    { name: "Samuel Otieno", role: "machine_operator", phone: "0734567890", dailyRate: 2000 },
  ]);

  await db.inventory.bulkAdd([
    {
      name: "Diesel",
      category: "diesel",
      quantity: 50,
      unit: "litres",
      lowStockThreshold: 20,
      unitCost: 197,
    },
    {
      name: "DAP Fertilizer",
      category: "fertilizer",
      quantity: 5,
      unit: "bags",
      lowStockThreshold: 2,
      unitCost: 6500,
    },
    {
      name: "Roundup Herbicide",
      category: "agrochemical",
      quantity: 1,
      unit: "litres",
      lowStockThreshold: 2,
      unitCost: 1800,
    },
    {
      name: "ABE Chilli Seedlings",
      category: "seedling",
      quantity: 2000,
      unit: "pcs",
      lowStockThreshold: 500,
      unitCost: 5,
    },
  ]);

  await db.receipts.add({
    receiptNumber: 49,
    date: new Date(2025, 11, 30).toISOString(), // 30/12/2025
    receivedFrom: "Elizabeth Kitonga",
    items: [
      {
        id: crypto.randomUUID(),
        description: "ABE Chilli Seedlings",
        quantity: 5000,
        unitPrice: 5,
      },
      {
        id: crypto.randomUUID(),
        description: "AGRITOURISM",
        quantity: 1,
        unitPrice: 2500,
      },
    ],
    total: 27500,
    createdAt: now,
  });

  window.localStorage.setItem(SEED_FLAG_KEY, "1");
}

// ---------- helpers ----------

export async function nextReceiptNumber(): Promise<number> {
  const all = await db.receipts.toArray();
  if (all.length === 0) return STARTING_RECEIPT_NUMBER;
  const max = all.reduce((m, r) => Math.max(m, r.receiptNumber), 0);
  return Math.max(max + 1, STARTING_RECEIPT_NUMBER);
}

export async function nextWeekNumberForClient(clientId: number): Promise<number> {
  const plans = await db.workPlans.where("clientId").equals(clientId).toArray();
  if (plans.length === 0) return 1;
  return plans.reduce((m, p) => Math.max(m, p.weekNumber), 0) + 1;
}

export function emptyDays(startISO: string): WorkDay[] {
  const out: WorkDay[] = [];
  const start = new Date(startISO);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: d.toISOString(), activities: [] });
  }
  return out;
}

export function newActivity(): Activity {
  return {
    id: crypto.randomUUID(),
    title: "",
    requirements: "",
    remarks: "",
    status: "pending",
  };
}
