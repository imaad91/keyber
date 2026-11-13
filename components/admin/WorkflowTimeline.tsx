"use client";

import {
  WORKFLOW_MAIN_STEPS,
  type StatutWorkflow,
  type WorkflowTransition,
} from "@/lib/adminWorkflow";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function currentMainIndex(status: StatutWorkflow): number {
  if (status === "corrections_demandees") return 0;
  if (status === "rejete") return 5;
  return WORKFLOW_MAIN_STEPS.findIndex((s) => s.id === status);
}

export function WorkflowTimeline({
  status,
  alertMessage,
}: {
  status: StatutWorkflow;
  alertMessage?: string;
}) {
  const current = currentMainIndex(status);
  const alert =
    status === "corrections_demandees" || status === "rejete";

  return (
    <div className="space-y-3">
      <ol className="grid gap-2 sm:grid-cols-6">
        {WORKFLOW_MAIN_STEPS.map((step, i) => {
          const done = !alert && i < current;
          const active =
            (!alert && i === current) ||
            (alert &&
              ((status === "corrections_demandees" && i === 0) ||
                (status === "rejete" && i === 5)));
          const upcoming = !done && !active;
          return (
            <li
              key={step.id}
              className={cn(
                "rounded-xl border px-2.5 py-3 text-center",
                done && "border-emerald-200 bg-emerald-50",
                active &&
                  !alert &&
                  "border-2 border-orange-400 bg-orange-50",
                active && alert && "border-2 border-rose-400 bg-rose-50",
                upcoming && "border-slate-100 bg-slate-50 opacity-60"
              )}
            >
              <div className="mx-auto mb-1.5 flex h-6 w-6 items-center justify-center">
                {done ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full ring-2",
                      active && !alert && "bg-orange-400 ring-orange-300",
                      active && alert && "bg-rose-500 ring-rose-300",
                      upcoming && "bg-transparent ring-slate-300"
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  "text-[11px] leading-tight",
                  active ? "font-bold text-slate-900" : "font-medium text-slate-600"
                )}
              >
                {step.label}
              </p>
              {active ? (
                <p
                  className={cn(
                    "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                    alert ? "text-rose-700" : "text-orange-700"
                  )}
                >
                  {alert
                    ? status === "rejete"
                      ? "Rejeté"
                      : "Corrections"
                    : "En cours"}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      {alert && alertMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {alertMessage}
        </div>
      ) : null}
    </div>
  );
}

export function WorkflowHistoryList({
  historique,
}: {
  historique: WorkflowTransition[];
}) {
  const rows = [...historique].reverse();
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">Aucune transition pour l&apos;instant.</p>
    );
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {rows.map((t) => {
        const date = new Date(t.at);
        const dateStr = date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Europe/Paris",
        });
        const timeStr = date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        });
        return (
          <li key={t.id} className="px-4 py-3 text-sm">
            <p className="font-medium text-slate-900">
              <span className="text-slate-500">{t.from}</span>
              {" → "}
              <span className="text-slate-900">{t.to}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {dateStr} · {timeStr} · {t.by}
              {t.commentaire ? ` — ${t.commentaire}` : ""}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
