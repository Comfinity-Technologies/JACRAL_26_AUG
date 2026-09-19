import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, change, changeType = "neutral", subtitle }: StatCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 border border-[#E5DCDB] shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#685B55] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-[#2C221E]">{value}</h3>
        {change && (
          <p className={`text-xs font-bold mt-1 ${changeType === "positive" ? "text-emerald-600" : changeType === "negative" ? "text-red-600" : "text-gray-500"}`}>
            {change}
          </p>
        )}
        {subtitle && <p className="text-xs text-[#685B55] mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="h-12 w-12 rounded-2xl bg-[#FAF6EE] text-[#E88D36] flex items-center justify-center shrink-0">
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
