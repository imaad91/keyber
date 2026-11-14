"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  SCENARIO_STATUT_LABELS,
  useAtelierStore,
} from "@/lib/atelierStore";
import { countDecisionPoints } from "@/lib/atelierWorkflow";

export default function AtelierWorkflowListPage() {
  const { scenarios, contextes, competences } = useAtelierStore();

  const rows = [...scenarios].sort((a, b) =>
    a.titre.localeCompare(b.titre, "fr")
  );

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/scenarios"
        backLabel="← Atelier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Workflow" },
        ]}
        title="Atelier — Workflow"
      />

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Traduction BPMN 2.0 de chaque scénario — logique métier uniquement :
        début, tâches, portes exclusives (décisions), flux avec impacts, fins.
        Généré automatiquement depuis les données du scénario.
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Scénario</th>
              <th className="px-4 py-3 font-semibold">Contexte lié</th>
              <th className="px-4 py-3 font-semibold">Compétences</th>
              <th className="px-4 py-3 font-semibold">Décisions</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const ctx = contextes.find((c) => c.id === s.contexteId);
              const comps = competences.filter((c) =>
                s.competenceIds.includes(c.id)
              );
              const portes = countDecisionPoints(s);
              return (
                <tr
                  key={s.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/atelier/workflow/${s.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      Workflow — {s.titre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ctx?.nom ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {comps.map((c) => c.nom).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {portes}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {SCENARIO_STATUT_LABELS[s.statut]}
                    </span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  Aucun scénario — créez-en un dans Atelier → Scénarios.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
