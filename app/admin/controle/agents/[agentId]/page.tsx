"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AgentIconBadge } from "@/components/admin/AgentIconBadge";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import {
  AGENT_ICON_OPTIONS,
  agentDisplayName,
  EXIGENCE_LABELS,
  resolveAgentId,
  type AgentExigence,
  type AgentProfile,
} from "@/lib/agents";
import { highlightJson } from "@/lib/adminCoeur";
import { useAdminStore } from "@/lib/adminStore";
import { useControleRapportsStore } from "@/lib/controleRapportsStore";

function agentToEditableJson(a: AgentProfile) {
  return {
    agent: a.nom_affiche,
    id: a.id,
    icone: a.icone,
    role: a.role,
    presentation: a.presentation,
    competences: a.competences,
    mission: a.mission,
    objectifs: a.objectifs,
    commentJeTravaille: a.commentJeTravaille,
    ceQueJeNeFaisJamais: a.ceQueJeNeFaisJamais,
    niveauExigence: a.niveauExigence,
    sortieAttendue: a.sortieAttendue,
    actif: a.actif,
  };
}

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { agents, updateAgent } = useAdminStore();
  const { rapportsForAgent } = useControleRapportsStore();
  const resolvedId = resolveAgentId(agentId);
  const agent = agents.find((a) => a.id === resolvedId);
  const history = rapportsForAgent(resolvedId);

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

  if (!agent) {
    return (
      <p className="text-sm text-slate-500">
        Agent introuvable.{" "}
        <Link href="/admin/controle/agents" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const display = agentDisplayName(agent);

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
      updateAgent(resolvedId, {
        nom: String(parsed.agent ?? display),
        nom_affiche: String(parsed.agent ?? display),
        role: String(parsed.role ?? ""),
        presentation: String(parsed.presentation ?? ""),
        icone,
        competences: Array.isArray(parsed.competences)
          ? parsed.competences.map(String)
          : [],
        mission: String(parsed.mission ?? ""),
        objectifs: String(parsed.objectifs ?? ""),
        commentJeTravaille: String(parsed.commentJeTravaille ?? ""),
        ceQueJeNeFaisJamais: String(parsed.ceQueJeNeFaisJamais ?? ""),
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
            backHref="/admin/controle/agents"
            crumbs={[
              { label: "Admin", href: "/admin" },
              { label: "Contrôle", href: "/admin/controle/agents" },
              { label: "Agents", href: "/admin/controle/agents" },
              { label: display },
            ]}
            title={`Contrôle — ${display}`}
          />
        </div>
      </div>

      <div className="mb-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <p className="leading-relaxed">{agent.presentation}</p>
        <p>
          <span className="font-semibold">Mission :</span> {agent.mission}
        </p>
        <p>
          <span className="font-semibold">Objectifs :</span> {agent.objectifs}
        </p>
        <p>
          <span className="font-semibold">Comment je travaille :</span>{" "}
          {agent.commentJeTravaille}
        </p>
        <p>
          <span className="font-semibold">Ce que je ne fais jamais :</span>{" "}
          {agent.ceQueJeNeFaisJamais}
        </p>
        <p>
          <span className="font-semibold">Ce que je rends :</span>{" "}
          {agent.sortieAttendue}
        </p>
        <p className="text-xs text-slate-500">
          Niveau : {EXIGENCE_LABELS[agent.niveauExigence]} · id technique{" "}
          <span className="font-mono">{agent.id}</span>
        </p>
      </div>

      {agent.id === "nettoyage" ? (
        <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
          CLEO propose seulement — ne supprime jamais, ne modifie jamais le
          Cœur. Réf. KEYBER_OS_RULES.md
        </div>
      ) : null}

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
        <AdminButton onClick={save}>Sauvegarder</AdminButton>
        <Link
          href={`/admin/controle/rapports/nouveau?agentId=${agent.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Ajouter un rapport
        </Link>
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
        <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[12px] leading-5">
          <code
            className="coeur-json block font-mono text-slate-100"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </pre>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Rapports de cet agent ({history.length})
          </h2>
          <Link
            href={`/admin/controle/rapports/nouveau?agentId=${agent.id}`}
            className="text-xs font-semibold underline"
          >
            + Ajouter un rapport
          </Link>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun rapport. Lance le Prompt Audit dans Cursor, puis colle le
            rapport ici.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/controle/rapports/${r.id}`}
                  className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm hover:border-slate-300"
                >
                  <span className="font-semibold text-slate-900">{r.titre}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {new Date(r.date).toLocaleString("fr-FR", {
                      timeZone: "Europe/Paris",
                    })}
                    {r.score != null ? ` · ${r.score}/100` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  );
}
