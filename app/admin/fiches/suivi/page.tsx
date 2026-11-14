"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { WorkflowStatusBadge } from "@/components/admin/WorkflowStatusBadge";
import type { AdminFiche } from "@/lib/adminFiches";
import { useAdminStore } from "@/lib/adminStore";
import {
  matchesWorkflowFilter,
  workflowProgressLabel,
  WORKFLOW_LIST_FILTERS,
  WORKFLOW_MAIN_STEPS,
  WORKFLOW_STATUT_META,
  type StatutWorkflow,
  type WorkflowListFilter,
} from "@/lib/adminWorkflow";
import { cn } from "@/lib/utils";

function FicheKanbanCard({
  fiche,
  highlight,
}: {
  fiche: AdminFiche;
  highlight?: boolean;
}) {
  const date = new Date(fiche.lastStepAt || fiche.updatedAt).toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Paris",
    }
  );
  return (
    <Link
      id={`suivi-card-${fiche.id}`}
      href={`/admin/fiches/${fiche.id}`}
      className={cn(
        "block rounded-xl border bg-white p-3 shadow-sm transition hover:border-slate-400",
        highlight
          ? "border-orange-400 ring-2 ring-orange-200"
          : "border-slate-200"
      )}
    >
      <p className="font-semibold text-slate-900">{fiche.titre}</p>
      <p className="mt-0.5 text-xs text-slate-500">
        {fiche.entrepriseNom || "—"} · {fiche.role || "—"}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <WorkflowStatusBadge status={fiche.statutWorkflow} />
        <span className="text-[11px] font-medium text-slate-500">
          {workflowProgressLabel(fiche.statutWorkflow)}
        </span>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">Dernière étape · {date}</p>
      {fiche.commentaireCorrection || fiche.raisonRejet ? (
        <p className="mt-2 rounded-md bg-rose-50 px-2 py-1.5 text-[11px] text-rose-800">
          {fiche.commentaireCorrection || fiche.raisonRejet}
        </p>
      ) : null}
    </Link>
  );
}

function SuiviValidationInner() {
  const { fiches } = useAdminStore();
  const search = useSearchParams();
  const focusId = search.get("focus");
  const [filter, setFilter] = useState<WorkflowListFilter>("tout");

  const filtered = useMemo(
    () => fiches.filter((f) => matchesWorkflowFilter(f.statutWorkflow, filter)),
    [fiches, filter]
  );

  const byColumn = useMemo(() => {
    const map: Record<string, AdminFiche[]> = {};
    for (const step of WORKFLOW_MAIN_STEPS) map[step.id] = [];
    for (const f of filtered) {
      const col = WORKFLOW_MAIN_STEPS.find((s) => s.id === f.statutWorkflow);
      if (col) map[col.id]!.push(f);
    }
    return map;
  }, [filtered]);

  const side = useMemo(
    () =>
      filtered.filter(
        (f) =>
          f.statutWorkflow === "corrections_demandees" ||
          f.statutWorkflow === "rejete"
      ),
    [filtered]
  );

  const summary = useMemo(() => {
    const count = (s: StatutWorkflow | StatutWorkflow[]) =>
      fiches.filter((f) =>
        Array.isArray(s) ? s.includes(f.statutWorkflow) : f.statutWorkflow === s
      ).length;
    return {
      total: fiches.length,
      brouillon: count(["brouillon", "corrections_demandees"]),
      enTest: count(["en_test", "provisoire_cree"]),
      retenu: count("retenu_publie"),
      rejete: count("rejete"),
    };
  }, [fiches]);

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`suivi-card-${focusId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, filtered]);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/fiches"
        backLabel="← Liste des Fiches"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fiches", href: "/admin/fiches" },
          { label: "Suivi Validation" },
        ]}
        title="Fiches — Suivi Validation"
      />

      <p className="mb-4 text-sm text-slate-600">
        Total : {summary.total} fiches | Brouillon : {summary.brouillon} | En
        Test : {summary.enTest} | Retenu : {summary.retenu} | Rejeté :{" "}
        {summary.rejete}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {WORKFLOW_LIST_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              filter === f.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs text-slate-500">
        Lecture seule — pour changer de statut, ouvrez la fiche et utilisez les
        boutons de validation. Le glisser-déposer est désactivé.
      </p>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {WORKFLOW_MAIN_STEPS.map((step) => {
          const cards = byColumn[step.id] ?? [];
          return (
            <div
              key={step.id}
              className={cn(
                "w-64 shrink-0 rounded-2xl border p-3",
                WORKFLOW_STATUT_META[step.id].column
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {step.label}
                </p>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold tabular-nums text-slate-700">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.map((f) => (
                  <FicheKanbanCard
                    key={f.id}
                    fiche={f}
                    highlight={focusId === f.id}
                  />
                ))}
                {cards.length === 0 ? (
                  <p className="px-1 py-6 text-center text-[11px] text-slate-400">
                    Aucune fiche
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
        <h2 className="mb-3 text-sm font-semibold text-rose-900">
          Corrections demandées / Rejeté
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {side.map((f) => (
            <FicheKanbanCard
              key={f.id}
              fiche={f}
              highlight={focusId === f.id}
            />
          ))}
          {side.length === 0 ? (
            <p className="text-sm text-rose-700/70">
              Aucune fiche en correction ou rejetée.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function AdminFichesSuiviPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-slate-500">
          Chargement du suivi…
        </div>
      }
    >
      <SuiviValidationInner />
    </Suspense>
  );
}
