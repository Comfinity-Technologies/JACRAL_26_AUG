import React from "react";

interface StatusBadgeProps {
  status: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export default function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const styles = {
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    danger: "bg-rose-100 text-rose-800 border-rose-200",
    info: "bg-sky-100 text-sky-800 border-sky-200",
    default: "bg-stone-100 text-stone-800 border-stone-200",
  }[variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles}`}>
      {status}
    </span>
  );
}
