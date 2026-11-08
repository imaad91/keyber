"use client";

import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
};

export function KpiCard({ label, value, unit, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "kpi-card flex min-w-[9.5rem] flex-col gap-1 rounded-lg border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold tracking-tight text-navy">
          {value}
        </span>
        {unit ? (
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
