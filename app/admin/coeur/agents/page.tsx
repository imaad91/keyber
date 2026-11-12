"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import {
  AdminButton,
  PageHeader,
} from "@/components/admin/AdminPrimitives";
import { EXIGENCE_LABELS } from "@/lib/agents";
import { useAdminStore } from "@/lib/adminStore";
import { useRouter } from "next/navigation";

export default function AgentsListPage() {
  const router = useRouter();
  const { agents, createAgent } = useAdminStore();

  return (
    <div>
      <PageHeader
        title="Cœur — Agents"
        subtitle="Définitions (code source) des agents. Pour lancer et lire les rapports → Cœur / Rapport."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/coeur/rapport"
              className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              Ouvrir Rapport →
            </Link>
            <AdminButton
              onClick={() => {
                if (
                  window.confirm(
                    "Vous modifiez le pilotage du Cœur, pas le Cœur lui-même. Continuer ?"
                  )
                ) {
                  const id = createAgent();
                  router.push(`/admin/coeur/agents/${id}`);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Ajouter un agent
            </AdminButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <Link
            key={a.id}
            href={`/admin/coeur/agents/${a.id}`}
            className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <AgentIconBadge agent={a} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">{a.nom}</h2>
                  <p className="text-sm text-slate-500">{a.role}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                  {EXIGENCE_LABELS[a.niveauExigence]}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 font-semibold ${
                    a.actif
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {a.actif ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
