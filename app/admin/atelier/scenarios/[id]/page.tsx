"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import {
  SCENARIO_STATUT_LABELS,
  useAtelierStore,
  type ScenarioStatut,
} from "@/lib/atelierStore";

export default function AtelierScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getScenario,
    contextes,
    competencesForContexte,
    updateScenario,
    toast,
    clearToast,
  } = useAtelierStore();
  const scenario = getScenario(id);

  const [titre, setTitre] = useState("");
  const [contexteId, setContexteId] = useState("");
  const [competenceIds, setCompetenceIds] = useState<string[]>([]);
  const [situation, setSituation] = useState("");
  const [decisions, setDecisions] = useState("");
  const [reglesFin, setReglesFin] = useState("");
  const [statut, setStatut] = useState<ScenarioStatut>("brouillon");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenario) return;
    setTitre(scenario.titre);
    setContexteId(scenario.contexteId);
    setCompetenceIds(scenario.competenceIds);
    setSituation(scenario.situation);
    setDecisions(scenario.decisions);
    setReglesFin(scenario.reglesFin);
    setStatut(scenario.statut);
  }, [scenario]);

  const comps = competencesForContexte(contexteId);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/atelier/scenarios" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/scenarios"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Scénarios", href: "/admin/atelier/scenarios" },
          { label: scenario.titre },
        ]}
        title={scenario.titre}
      />

      {error ? (
        <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4">
        <AdminButton
          onClick={() => {
            const res = updateScenario(id, {
              titre,
              contexteId,
              competenceIds,
              situation,
              decisions,
              reglesFin,
              statut,
            });
            setError(res.error ?? null);
          }}
        >
          Enregistrer
        </AdminButton>
      </div>

      <div className="space-y-4">
        <Field label="Titre">
          <input
            className={inputClass}
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        </Field>
        <Field label="Contexte lié (obligatoire)">
          <select
            className={selectClass}
            value={contexteId}
            onChange={(e) => {
              setContexteId(e.target.value);
              setCompetenceIds([]);
            }}
          >
            {contextes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Compétences travaillées (du contexte uniquement)">
          <div className="space-y-1 rounded-lg border border-slate-200 p-3">
            {comps.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={competenceIds.includes(c.id)}
                  onChange={(e) => {
                    setCompetenceIds((prev) =>
                      e.target.checked
                        ? [...prev, c.id]
                        : prev.filter((x) => x !== c.id)
                    );
                  }}
                />
                <span className="font-mono text-xs text-slate-400">{c.id}</span>
                {c.nom}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Situation">
          <textarea
            className={textareaClass}
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
        </Field>
        <Field label="Décisions">
          <textarea
            className={textareaClass}
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
          />
        </Field>
        <Field label="Règles de fin">
          <textarea
            className={textareaClass}
            value={reglesFin}
            onChange={(e) => setReglesFin(e.target.value)}
          />
        </Field>
        <Field label="Statut">
          <select
            className={selectClass}
            value={statut}
            onChange={(e) => setStatut(e.target.value as ScenarioStatut)}
          >
            {(Object.keys(SCENARIO_STATUT_LABELS) as ScenarioStatut[]).map(
              (k) => (
                <option key={k} value={k}>
                  {SCENARIO_STATUT_LABELS[k]}
                </option>
              )
            )}
          </select>
        </Field>
      </div>
    </div>
  );
}
