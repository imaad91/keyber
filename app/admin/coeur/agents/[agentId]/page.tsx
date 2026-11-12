"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import {
  AGENT_ICON_OPTIONS,
  EXIGENCE_LABELS,
  type AgentExigence,
  type AgentProfile,
} from "@/lib/agents";
import { highlightJson } from "@/lib/adminCoeur";
import { useAdminStore } from "@/lib/adminStore";
import { SCENARIO_ID } from "@/data/scenarioNovacier";

function agentToEditableJson(a: AgentProfile) {
  return {
    agent: a.nom,
    role: a.role,
    icone: a.icone,
    competences: a.competences,
    mission: a.mission,
    niveauExigence: a.niveauExigence,
    sortieAttendue: a.sortieAttendue,
    actif: a.actif,
  };
}

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const {
    agents,
    scenarios,
    updateAgent,
    runAgentsOnScenario,
    agentReports,
  } = useAdminStore();
  const agent = agents.find((a) => a.id === agentId);
  const defaultScenario =
    scenarios.find((s) => s.id === SCENARIO_ID)?.id ?? scenarios[0]?.id ?? "";

  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (agent) {
      setDraft(JSON.stringify(agentToEditableJson(agent), null, 2));
      setError(null);
    }
  }, [agent]);

  const liveIcone = useMemo(() => {
    try {
      const parsed = JSON.parse(draft) as { icone?: string };
      return parsed.icone || agent?.icone || "target";
    } catch {
      return agent?.icone || "target";
    }
  }, [draft, agent?.icone]);

  const previewAgent = useMemo(
    () =>
      agent
        ? { ...agent, icone: liveIcone }
        : { id: agentId, icone: liveIcone },
    [agent, agentId, liveIcone]
  );

  const previewHtml = useMemo(() => highlightJson(draft), [draft]);

  const report = agentReports.find((r) => r.agentId === agentId);

  if (!agent) {
    return (
      <p className="text-sm text-slate-500">
        Agent introuvable.{" "}
        <Link href="/admin/coeur/agents" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  function save() {
    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>;
      const niveau = parsed.niveauExigence;
      if (
        niveau !== "tolerant" &&
        niveau !== "normal" &&
        niveau !== "strict"
      ) {
        setError("niveauExigence doit être tolerant | normal | strict");
        return;
      }
      const icone = String(parsed.icone ?? "target");
      updateAgent(agentId, {
        nom: String(parsed.agent ?? ""),
        role: String(parsed.role ?? ""),
        icone,
        competences: Array.isArray(parsed.competences)
          ? parsed.competences.map(String)
          : [],
        mission: String(parsed.mission ?? ""),
        sortieAttendue: String(parsed.sortieAttendue ?? ""),
        niveauExigence: niveau as AgentExigence,
        actif: Boolean(parsed.actif),
      });
      setError(null);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON invalide");
    }
  }

  function setIconeInDraft(icone: string) {
    try {
      const parsed = JSON.parse(draft) as Record<string, unknown>;
      parsed.icone = icone;
      setDraft(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError("JSON invalide — corrigez avant de changer l'icône");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-4">
        <AgentIconBadge agent={previewAgent} size="xl" />
        <div className="min-w-0 flex-1">
          <AdminBreadcrumb
            backHref="/admin/coeur/agents"
            crumbs={[
              { label: "Admin", href: "/admin" },
              { label: "Cœur", href: "/admin/coeur/langage" },
              { label: "Agents", href: "/admin/coeur/agents" },
              { label: agent.nom },
            ]}
            title={`Cœur — Agents — ${agent.nom}`}
          />
        </div>
      </div>

      <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        Vous modifiez le <strong>pilotage</strong> du Cœur, pas le Cœur
        lui-même. Niveau : {EXIGENCE_LABELS[agent.niveauExigence]}.
      </div>

      <div className="mb-4 max-w-xs">
        <Field label="Icône (Lucide)">
          <select
            className={selectClass}
            value={
              AGENT_ICON_OPTIONS.includes(
                liveIcone as (typeof AGENT_ICON_OPTIONS)[number]
              )
                ? liveIcone
                : "target"
            }
            onChange={(e) => setIconeInDraft(e.target.value)}
          >
            {AGENT_ICON_OPTIONS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <AdminButton
          variant="secondary"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Aperçu" : "Modifier le JSON"}
        </AdminButton>
        <AdminButton onClick={save}>Sauvegarder cet agent</AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() =>
            defaultScenario && runAgentsOnScenario(defaultScenario, agentId)
          }
        >
          Lancer cet agent
        </AdminButton>
        <AdminButton
          variant="secondary"
          onClick={() =>
            defaultScenario && runAgentsOnScenario(defaultScenario)
          }
        >
          Lancer tous les agents
        </AdminButton>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          className="min-h-[420px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[12px] leading-5 text-slate-100 outline-none focus:ring-2 focus:ring-slate-300"
        />
      ) : (
        <pre className="max-h-[560px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[12px] leading-5">
          <code
            className="coeur-json block font-mono text-slate-100"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </pre>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .coeur-json .json-key { color: #7dd3fc; }
        .coeur-json .json-string { color: #86efac; }
        .coeur-json .json-number { color: #fcd34d; }
        .coeur-json .json-lit { color: #f9a8d4; }
      `,
        }}
      />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <AgentIconBadge agent={previewAgent} size="sm" />
          Rapport de l&apos;agent
        </h2>
        {!report ? (
          <p className="mt-2 text-sm text-slate-500">
            Aucun rapport — lancez l&apos;agent sur un scénario.
          </p>
        ) : (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <AgentIconBadge agent={previewAgent} size="sm" />
              <p className="text-sm font-semibold text-slate-800">{agent.nom}</p>
              <p className="text-2xl font-bold tabular-nums">
                {report.score}
                <span className="text-sm font-normal text-slate-500">
                  /100
                </span>
              </p>
            </div>
            <ul className="mt-3 space-y-2">
              {report.issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                >
                  <AgentIconBadge agent={previewAgent} size="sm" />
                  <div>
                    <span className="font-semibold uppercase text-slate-500">
                      [{issue.priorite}]
                    </span>{" "}
                    <strong>{issue.titre}</strong> — {issue.detail}
                    <br />
                    <span className="text-emerald-700">→ {issue.solution}</span>
                  </div>
                </li>
              ))}
              {report.issues.length === 0 ? (
                <li className="text-xs text-emerald-700">Aucun problème</li>
              ) : null}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
