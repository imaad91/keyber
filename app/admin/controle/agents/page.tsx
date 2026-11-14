"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { EXIGENCE_LABELS } from "@/lib/agents";
import { useAdminStore } from "@/lib/adminStore";

const ALLOWED = [
  "nettoyage",
  "agent-testeur",
  "agent-metier",
  "agent-pedagogue",
  "agent-coherence-erp",
  "agent-orchestra",
  "agent-ergonomie",
];

export default function ControleAgentsPage() {
  const { agents, agentReports } = useAdminStore();
  const list = ALLOWED.map((id) => agents.find((a) => a.id === id)).filter(
    Boolean
  );

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Contrôle", href: "/admin/controle/agents" },
          { label: "Agents" },
        ]}
        title="Contrôle — Agents"
      />
      <p className="mb-4 text-sm text-slate-600">
        7 agents relisent — ils ne modifient pas le code ni le Cœur. Nettoyage
        propose un plan ; Cursor construit.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => {
          if (!a) return null;
          const nReports = (agentReports ?? []).filter(
            (r) => r.agentId === a.id
          ).length;
          return (
            <Link
              key={a.id}
              href={`/admin/controle/agents/${a.id}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
            >
              <AgentIconBadge agent={a} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {a.id === "nettoyage" ? "Nettoyage" : a.nom}
                    </h2>
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
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 font-semibold text-sky-800">
                    {nReports} rapport(s)
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
