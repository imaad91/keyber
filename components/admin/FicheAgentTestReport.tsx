"use client";

import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import type { AgentProfile } from "@/lib/agents";
import type { FicheAgentReport } from "@/lib/adminWorkflow";
import { cn } from "@/lib/utils";

export function FicheAgentTestReport({
  reports,
  agents,
}: {
  reports: FicheAgentReport[];
  agents: AgentProfile[];
}) {
  if (!reports.length) {
    return (
      <p className="text-sm text-slate-500">
        Aucun rapport Agents pour l&apos;instant. Lancez les tests.
      </p>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {reports.map((r) => {
        const agent = agents.find((a) => a.id === r.agentId);
        const ok = r.statut === "valide";
        return (
          <div
            key={r.agentId}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm",
              ok ? "border-emerald-200" : "border-rose-200"
            )}
          >
            <div className="flex items-start gap-3">
              {agent ? <AgentIconBadge agent={agent} /> : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{r.nom}</p>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-semibold",
                      ok
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-rose-50 text-rose-800"
                    )}
                  >
                    {ok ? "Validé ✓" : "Bloqué ✗"} · {r.score}/100
                  </span>
                </div>
                {r.issues.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {r.issues.map((issue, i) => (
                      <li
                        key={`${r.agentId}-${i}`}
                        className="rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-700"
                      >
                        <span className="font-semibold">{issue.titre}</span>
                        <span className="text-slate-500">
                          {" "}
                          ({issue.priorite}) — {issue.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Aucun problème.</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
