"use client";

import type { ReactNode } from "react";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { cn } from "@/lib/utils";

/** Bandeau runtime commun à chaque composante Keyber OS Admin. */
export function KeyberOsRuntimePanel({
  title,
  description,
  children,
  onReset,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onReset?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mb-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            Module runtime OS
          </p>
          <h2 className="text-sm font-semibold text-emerald-950">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-emerald-900/80">
            {description}
          </p>
        </div>
        {onReset ? (
          <AdminButton type="button" variant="secondary" onClick={onReset}>
            Reset défauts module
          </AdminButton>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
      <p className="mt-3 text-xs text-emerald-800">
        Les changements s&apos;appliquent immédiatement au Front-End (localStorage
        keyber-os-runtime-v1). Aucun contenu métier ici.
      </p>
    </section>
  );
}

export function OsToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-950">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-emerald-400"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function OsNumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs text-emerald-800">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className="w-28 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
