"use client";

import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

// ---------- Button ----------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: { variant?: ButtonVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-eka-600 text-white hover:bg-eka-700",
    secondary: "bg-eka-100 text-eka-800 hover:bg-eka-200",
    ghost: "text-eka-700 hover:bg-eka-50",
    outline: "border border-eka-300 text-eka-700 hover:bg-eka-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

// ---------- Card ----------

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-eka-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5 border-b border-eka-100">
      <div>
        <h3 className="font-semibold text-eka-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- Field / Input / Textarea / Select ----------

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-eka-900 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-eka-200 bg-white px-3 py-2 text-sm focus:border-eka-500 focus:outline-none focus:ring-2 focus:ring-eka-200 disabled:bg-gray-50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${inputBase} ${className}`} {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`${inputBase} ${className}`} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select className={`${inputBase} ${className}`} {...rest} />;
}

// ---------- Badge ----------

type BadgeTone = "green" | "amber" | "red" | "gray" | "blue";

export function Badge({
  tone = "green",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  const tones: Record<BadgeTone, string> = {
    green: "bg-eka-100 text-eka-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

// ---------- Empty state ----------

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <p className="text-eka-900 font-semibold">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------- StatCard ----------

export function StatCard({
  label,
  value,
  icon,
  tone = "green",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    green: "bg-eka-50 text-eka-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-eka-900">{value}</p>
        </div>
        {icon && <div className={`rounded-lg p-2 ${tones[tone]}`}>{icon}</div>}
      </div>
    </Card>
  );
}

// ---------- Page header ----------

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-eka-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
