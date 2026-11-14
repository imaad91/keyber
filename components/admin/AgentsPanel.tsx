"use client";

import { useState } from "react";
import {
  EXIGENCE_LABELS,
  type AgentExigence,
  type AgentProfile,
} from "@/lib/agents";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export function AgentsPanel({ scenarioId: _scenarioId }: { scenarioId: string }) {
  void _scenarioId;
  const {
    agents,
    agentReports,
    updateAgent,
    duplicateAgent,
    createAgent,
    setAgentActive,
  } = useAdminStore();

  const [editId, setEditId] = useState<string | null>(null);
  const editing = agents.find((a) => a.id === editId);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        Les Agents sont les <strong>outils de pilotage</strong> du Cœur — pas le
        Cœur lui-même. Profils globaux (`/lib/agents.ts`) : une modification
        s&apos;applique à tous les scénarios.
      </div>

      <div className="flex flex-wrap gap-2">
        <AdminButton onClick={() => createAgent()}>Ajouter un agent</AdminButton>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {agents.map((a) => (
          <article
            key={a.id}
            className={`rounded-xl border bg-white p-4 shadow-sm ${
              a.actif ? "border-slate-200" : "border-slate-100 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{a.nom}</h3>
                <p className="text-xs text-slate-500">{a.role}</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                {EXIGENCE_LABELS[a.niveauExigence]}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {a.competences.map((c) => (
                <span
                  key={c}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-slate-600">{a.mission}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <AdminButton
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  if (
                    window.confirm(
                      "Vous modifiez le pilotage du Cœur, pas le Cœur lui-même. Continuer ?"
                    )
                  ) {
                    setEditId(a.id);
                  }
                }}
              >
                Modifier
              </AdminButton>
              <AdminButton
                variant="ghost"
                className="text-xs"
                onClick={() => duplicateAgent(a.id)}
              >
                Dupliquer
              </AdminButton>
              <AdminButton
                variant="ghost"
                className="text-xs"
                onClick={() => setAgentActive(a.id, !a.actif)}
              >
                {a.actif ? "Désactiver" : "Activer"}
              </AdminButton>
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <AgentEditor
          agent={editing}
          onClose={() => setEditId(null)}
          onSave={(data) => {
            updateAgent(editing.id, data);
            setEditId(null);
          }}
        />
      ) : null}

      {agentReports.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Rapport multi-agents
          </h2>
          <div className="mt-3 space-y-3">
            {agentReports.map((r) => {
              const agent = agents.find((a) => a.id === r.agentId);
              return (
                <div
                  key={r.agentId + r.ranAt}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {agent?.nom ?? r.agentId}
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {r.score}
                      <span className="text-xs font-normal text-slate-500">
                        /100
                      </span>
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {r.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-slate-700">
                        <span className="font-semibold uppercase text-slate-500">
                          [{issue.priorite}]
                        </span>{" "}
                        <strong>{issue.titre}</strong> — {issue.detail}
                        <br />
                        <span className="text-emerald-700">
                          → {issue.solution}
                        </span>
                      </li>
                    ))}
                    {r.issues.length === 0 ? (
                      <li className="text-xs text-emerald-700">Aucun problème</li>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function AgentEditor({
  agent,
  onClose,
  onSave,
}: {
  agent: AgentProfile;
  onClose: () => void;
  onSave: (data: Partial<AgentProfile>) => void;
}) {
  const [form, setForm] = useState({ ...agent });

  return (
    <div className="rounded-2xl border border-slate-900 bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Modifier — {agent.nom}</h3>
        <AdminButton variant="ghost" onClick={onClose}>
          Fermer
        </AdminButton>
      </div>
      <p className="mb-3 text-xs text-amber-700">
        Avertissement : vous modifiez le pilotage du Cœur, pas le Cœur
        lui-même.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Nom">
          <input
            className={inputClass}
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </Field>
        <Field label="Rôle">
          <input
            className={inputClass}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </Field>
        <Field label="Compétences (virgules)">
          <input
            className={inputClass}
            value={form.competences.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                competences: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
        <Field label="Niveau d'exigence">
          <select
            className={selectClass}
            value={form.niveauExigence}
            onChange={(e) =>
              setForm({
                ...form,
                niveauExigence: e.target.value as AgentExigence,
              })
            }
          >
            {Object.entries(EXIGENCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mission" className="md:col-span-2">
          <textarea
            className={textareaClass}
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
          />
        </Field>
        <Field label="Sortie attendue" className="md:col-span-2">
          <textarea
            className={textareaClass}
            value={form.sortieAttendue}
            onChange={(e) =>
              setForm({ ...form, sortieAttendue: e.target.value })
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.actif}
            onChange={(e) => setForm({ ...form, actif: e.target.checked })}
          />
          Actif
        </label>
      </div>
      <div className="mt-4">
        <AdminButton onClick={() => onSave(form)}>Enregistrer l&apos;agent</AdminButton>
      </div>
    </div>
  );
}
