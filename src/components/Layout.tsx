"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  HardHat,
  Receipt,
  Wallet,
  Sprout,
} from "lucide-react";
import { seedIfEmpty } from "@/lib/db";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/work-plans", label: "Work Plans", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/workers", label: "Workers", icon: HardHat },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    seedIfEmpty().catch((e) => console.error("Seed failed:", e));
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-eka-900 text-eka-50 fixed inset-y-0 left-0 z-40">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-eka-800">
          <div className="rounded-lg bg-eka-600 p-2">
            <Sprout size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white leading-tight">EkaTrack</p>
            <p className="text-xs text-eka-300">Ekafarm Agri-Solutions</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-eka-700 text-white"
                    : "text-eka-200 hover:bg-eka-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-eka-800 text-xs text-eka-300">
          Local-first · Offline ready
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 bg-eka-900 text-white px-4 py-3 flex items-center gap-2">
        <div className="rounded-md bg-eka-600 p-1.5">
          <Sprout size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold leading-tight">EkaTrack</p>
          <p className="text-[10px] text-eka-300 leading-tight">Ekafarm Agri-Solutions</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 lg:ml-64 pt-14 pb-20 lg:pt-0 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-eka-100 grid grid-cols-7">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${
                active ? "text-eka-700" : "text-gray-500"
              }`}
            >
              <Icon size={18} />
              <span className="truncate max-w-full px-1">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
