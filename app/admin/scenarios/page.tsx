"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Search } from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  StatusBadge,
  inputClass,
} from "@/components/admin/AdminPrimitives";
import { WorkflowStatusBadge } from "@/components/admin/WorkflowStatusBadge";
import { useAdminStore } from "@/lib/adminStore";
import { workflowProgressLabel } from "@/lib/adminWorkflow";

export default function AdminScenariosPage() {
  const router = useRouter();
  const { scenarios, entreprises, fiches, createScenario } = useAdminStore();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return [...scenarios]
      .filter((s) =>
        q ? s.titre.toLowerCase().includes(q.toLowerCase()) : true
      )
      .sort((a, b) => a.order - b.order);
  }, [scenarios, q]);

  return (
    <div>
      <PageHeader
        title="Scénarios"
        subtitle="Liste des scénarios — cliquez pour ouvrir la fiche en plein écran."
        actions={
          <AdminButton
            onClick={() => {
              const id = createScenario();
              router.push(`/admin/scenarios/${id}`);
            }}
          >
            <Plus className="h-4 w-4" />
            Créer un scénario
          </AdminButton>
        }
      />

      <div className="mb-4 max-w-md">
        <Field label="Recherche">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Nom du scénario…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Field>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Jours</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Workflow</th>
              <th className="px-4 py-3">Fiche liée</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const ent = entreprises.find((e) => e.id === s.entrepriseId);
              const fiche = fiches.find((f) => f.scenarioId === s.id);
              const wf = fiche?.statutWorkflow ?? s.statutWorkflow ?? "brouillon";
              return (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/scenarios/${s.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {s.titre}
                      {s.provisoire || fiche?.provisoire ? (
                        <span className="ml-2 rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          Provisoire
                        </span>
                      ) : null}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ent?.nom ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.competence || "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {s.dureeJours}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <WorkflowStatusBadge status={wf} />
                      <span className="text-[10px] font-medium text-slate-500">
                        {workflowProgressLabel(wf)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {fiche ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          Oui
                        </span>
                        <Link
                          href={`/admin/fiches/${fiche.id}`}
                          className="text-xs font-semibold text-slate-700 underline"
                        >
                          Voir la Fiche
                        </Link>
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        Non
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/scenarios/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
                    >
                      Ouvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  Aucun scénario.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
