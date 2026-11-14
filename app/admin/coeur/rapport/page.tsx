"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import {
  Field,
  PageHeader,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import { SCENARIO_ID } from "@/data/scenarioNovacier";

export default function CoeurRapportPage() {
  const { agents, scenarios, agentReports } = useAdminStore();

  const defaultScenarioId =
    scenarios.find((s) => s.id === SCENARIO_ID)?.id ?? scenarios[0]?.id ?? "";
  const [scenarioId, setScenarioId] = useState(defaultScenarioId);
  const [filterAgentId, setFilterAgentId] = useState<string>("all");

  useEffect(() => {
    if (!scenarioId && defaultScenarioId) {
      setScenarioId(defaultScenarioId);
    }
  }, [scenarioId, defaultScenarioId]);

  const visibleReports = useMemo(() => {
    if (filterAgentId === "all") return agentReports;
    return agentReports.filter((r) => r.agentId === filterAgentId);
  }, [agentReports, filterAgentId]);

  const scenario =
    scenarios.find((s) => s.id === scenarioId) ?? scenarios[0] ?? null;

  return (
    <div>
      <PageHeader
        title="Cœur — Rapport"
        subtitle="Lancez les agents sur un scénario et consultez leurs rapports. La définition (code) des agents reste dans l’onglet Agents."
        actions={
          <Link
            href="/admin/coeur/agents"
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            Voir les définitions Agents →
          </Link>
        }
      />

      <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        Les Agents pilotent le Cœur ; ici vous ne faites que{" "}
        <strong>lancer</strong> et <strong>lire</strong> leurs rapports. Pour
        éditer le code d&apos;un agent, allez dans{" "}
        <Link href="/admin/coeur/agents" className="font-semibold underline">
          Agents
        </Link>
        .
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Scénario cible">
          <select
            className={selectClass}
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Filtrer les rapports">
          <select
            className={selectClass}
            value={filterAgentId}
            onChange={(e) => setFilterAgentId(e.target.value)}
          >
            <option value="all">Tous les agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-1">
          <a
            href="/admin/controle/prompt"
            className="inline-flex items-center rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Prompt Audit →
          </a>
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Plus de bouton Lancer. Copie le Prompt Audit dans Cursor, puis stocke
        chaque rapport dans{" "}
        <a href="/admin/controle/rapports" className="font-semibold underline">
          Contrôle → Rapports
        </a>
        .
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Rapports multi-agents
            {scenario ? (
              <span className="ml-2 font-normal text-slate-500">
                — {scenario.titre}
              </span>
            ) : null}
          </h2>
          <p className="text-xs text-slate-500">
            {visibleReports.length} rapport
            {visibleReports.length === 1 ? "" : "s"}
          </p>
        </div>

        {visibleReports.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun rapport pour l&apos;instant. Choisissez un scénario et lancez
            un ou plusieurs agents.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleReports.map((r) => {
              const agent = agents.find((a) => a.id === r.agentId);
              if (!agent) return null;
              return (
                <article
                  key={r.agentId + r.ranAt}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AgentIconBadge agent={agent} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {agent.nom}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {agent.role} ·{" "}
                            {new Date(r.ranAt).toLocaleString("fr-FR", {
                              timeZone: "Europe/Paris",
                            })}
                          </p>
                        </div>
                        <p className="text-2xl font-bold tabular-nums text-slate-900">
                          {r.score}
                          <span className="text-sm font-normal text-slate-500">
                            /100
                          </span>
                        </p>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {r.issues.map((issue, i) => (
                          <li
                            key={i}
                            className="flex gap-2 rounded-lg border border-white bg-white px-3 py-2 text-xs text-slate-700"
                          >
                            <AgentIconBadge agent={agent} size="sm" />
                            <div>
                              <span className="font-semibold uppercase text-slate-500">
                                [{issue.priorite}]
                              </span>{" "}
                              <strong>{issue.titre}</strong> — {issue.detail}
                              <br />
                              <span className="text-emerald-700">
                                → {issue.solution}
                              </span>
                            </div>
                          </li>
                        ))}
                        {r.issues.length === 0 ? (
                          <li className="text-xs text-emerald-700">
                            Aucun problème
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
