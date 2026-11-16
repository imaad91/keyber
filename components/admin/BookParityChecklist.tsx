"use client";

import {
  evaluateBookParityChecklist,
  type BookParityReport,
} from "@/lib/bookParityChecklist";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { cn } from "@/lib/utils";

export function BookParityChecklist({
  param,
  compact = false,
  className,
}: {
  param: ScenarioParamFile | null | undefined;
  /** Version courte (score + pastilles). */
  compact?: boolean;
  className?: string;
}) {
  const report: BookParityReport = evaluateBookParityChecklist(param);

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-xs",
          report.allOk
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : report.scorePct >= 50
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-rose-200 bg-rose-50 text-rose-950",
          className
        )}
        title="Checklist parité feeling (Étape 22)"
      >
        <span className="font-semibold">
          Parité {report.okCount}/{report.total}
        </span>
        <span className="opacity-70">({report.scorePct}%)</span>
        <span className="flex flex-wrap gap-1">
          {report.items.map((item) => (
            <span
              key={item.id}
              title={`${item.label} — ${item.detail}`}
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                item.ok ? "bg-emerald-500" : "bg-rose-400"
              )}
            />
          ))}
        </span>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Checklist parité feeling
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Vert = contenu présent dans le param · Rouge = manque pour le
            feeling POC (Étape 22)
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-semibold",
            report.allOk
              ? "bg-emerald-100 text-emerald-800"
              : report.scorePct >= 50
                ? "bg-amber-100 text-amber-900"
                : "bg-rose-100 text-rose-900"
          )}
        >
          {report.okCount}/{report.total} · {report.scorePct}%
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {report.items.map((item) => (
          <li
            key={item.id}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs",
              item.ok
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                : "border-rose-200 bg-rose-50/80 text-rose-950"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  item.ok ? "bg-emerald-500" : "bg-rose-500"
                )}
              >
                {item.ok ? "✓" : "!"}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{item.label}</p>
                <p className="mt-0.5 opacity-80">{item.detail}</p>
                {!item.ok ? (
                  <p className="mt-1 text-[10px] opacity-60">{item.hint}</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
