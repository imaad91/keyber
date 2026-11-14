"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/AdminPrimitives";
import { relativeTimeFr } from "@/lib/coeurHistory";
import { useAdminStore } from "@/lib/adminStore";

export default function WorkflowScenariosListPage() {
  const { scenarios, coeurs, coeurMeta, getScenarioCoeur } = useAdminStore();
  const list = [...scenarios].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Workflow — Scénarios"
        subtitle="Lecture seule. Choisissez un scénario pour ouvrir son schéma BPMN en plein écran."
      />

      <div className="mb-4 rounded-xl border border-slate-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 <strong>LECTURE SEULE</strong> — Aucune modification possible ici. Pour
        modifier, passe par Fiches, Compétences ou Agents.
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Jours</th>
              <th className="px-4 py-3">Décisions</th>
              <th className="px-4 py-3">Messages</th>
              <th className="px-4 py-3">Dernière modification</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const coeur = coeurs[s.id] ?? getScenarioCoeur(s.id);
              const meta = coeurMeta[s.id];
              const messages = coeur.evenements.filter(
                (e) => e.type === "Email" || e.type === "Chat"
              ).length;
              const last = meta?.versions[0];
              return (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/workflow/scenarios/${s.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {s.titre}
                    </Link>
                    <div className="mt-1">
                      <StatusBadge status={s.statut} />
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {s.dureeJours}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {coeur.decisions.length}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {messages}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {last
                      ? `${relativeTimeFr(last.createdAt)} · ${last.originLabel}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/workflow/scenarios/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
                    >
                      Ouvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Aucun scénario.</p>
        ) : null}
      </div>
    </div>
  );
}
