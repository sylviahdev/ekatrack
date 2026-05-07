"use client";

import { ReactNode, useEffect, useState } from "react";
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
  Menu,
  X,
  Search,
  Bell,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { seedIfEmpty } from "@/lib/db";

const LOGO_SRC = "/logo.png";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/work-plans", label: "Work", icon: ClipboardList },
] as const;

const MORE_NAV = [
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/workers", label: "Workers", icon: HardHat },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/expenses", label: "Expenses", icon: Wallet },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    seedIfEmpty().catch((e) => console.error("Seed failed:", e));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape and lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
      {/* ───────────── Desktop sidebar (fixed) ───────────── */}
      <aside
        aria-label="Primary"
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-eka-800 bg-eka-900 text-eka-50"
      >
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* ───────────── Mobile top bar ───────────── */}
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-eka-800 bg-eka-900 px-4 text-white">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-eka-100 transition-colors hover:bg-eka-800 active:bg-eka-700"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          <Mark className="h-7 w-auto" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            EkaTrack
          </span>
        </Link>

        <button
          type="button"
          aria-label="Notifications"
          className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-eka-100 transition-colors hover:bg-eka-800 active:bg-eka-700"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* ───────────── Mobile drawer ───────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Panel */}
      <aside
        id="mobile-sidebar"
        aria-label="Mobile navigation"
        aria-hidden={!open}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col border-r border-eka-800 bg-eka-900 text-eka-50 shadow-xl transition-transform duration-300 ease-out will-change-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-eka-800 px-5">
          <div className="flex items-center gap-2.5">
            <Mark className="h-7 w-auto" />
            <span className="text-[15px] font-semibold tracking-tight text-white">
              EkaTrack
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-eka-100 transition-colors hover:bg-eka-800 active:bg-eka-700"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarNav pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* ───────────── Main ───────────── */}
      <main className="lg:pl-64">
        <TopBar />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────── Subcomponents ─────────────────────── */

function Mark({ className = "" }: { className?: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt=""
      aria-hidden="true"
      className={`shrink-0 select-none ${className}`}
    />
  );
}

function SidebarBrand() {
  return (
    <Link
      href="/"
      className="flex h-16 items-center gap-3 border-b border-eka-800 px-6"
    >
      <Mark className="h-8 w-auto" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[15px] font-semibold tracking-tight text-white">
          EkaTrack
        </p>
        <p className="truncate text-[11px] text-eka-300">
          Ekafarm Agri-Solutions
        </p>
      </div>
    </Link>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  const moreActive = MORE_NAV.some((item) => isActive(pathname, item.href));
  const [moreOpen, setMoreOpen] = useState(moreActive);

  useEffect(() => {
    if (moreActive) setMoreOpen(true);
  }, [moreActive]);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-5">
      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-eka-400">
        Workspace
      </p>
      <ul className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <NavItem
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(pathname, href)}
            />
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-controls="sidebar-more"
            className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
              moreActive
                ? "text-white"
                : "text-eka-200 hover:bg-eka-800 hover:text-white"
            }`}
          >
            <MoreHorizontal
              size={17}
              className={
                moreActive
                  ? "text-white"
                  : "text-eka-300 group-hover:text-white"
              }
            />
            <span className="font-medium">More</span>
            <ChevronDown
              size={14}
              className={`ml-auto text-eka-300 transition-transform duration-200 ${
                moreOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            id="sidebar-more"
            className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${
              moreOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <ul className="min-h-0 space-y-1 pt-1">
              {MORE_NAV.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <NavItem
                    href={href}
                    label={label}
                    Icon={Icon}
                    active={isActive(pathname, href)}
                    indent
                  />
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  );
}

function NavItem({
  href,
  label,
  Icon,
  active,
  indent = false,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-md py-2 text-sm transition-colors duration-150 ${
        indent ? "pl-9 pr-3" : "px-3"
      } ${
        active
          ? "bg-eka-700 text-white"
          : "text-eka-200 hover:bg-eka-800 hover:text-white"
      }`}
    >
      <span
        className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-eka-300 transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon
        size={indent ? 15 : 17}
        className={
          active
            ? "text-white"
            : "text-eka-300 group-hover:text-white"
        }
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-eka-800 p-4">
      <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-eka-800">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-eka-600 text-[12px] font-semibold text-white">
          EF
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-white">Ekafarm</p>
          <p className="truncate text-xs text-eka-300">admin@ekafarm.co.ke</p>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-between border-b border-neutral-200 bg-white/80 px-8 backdrop-blur-md">
      <div className="relative w-full max-w-sm">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="search"
          placeholder="Search…"
          className="h-9 w-full rounded-md border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/5"
        />
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Bell size={17} />
      </button>
    </div>
  );
}
