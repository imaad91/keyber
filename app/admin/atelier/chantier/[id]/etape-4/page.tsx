"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { uid } from "@/lib/adminTypes";
import {
  useAtelierChantierStore,
  type ChantierDecisionChoix,
  type ChantierDecisionModeCompetence,
  type ChantierScenarioModeCompetence,
} from "@/lib/atelierChantierStore";
import { cn } from "@/lib/utils";

type ScenarioForm = {
  titre: string;
  competenceId: string;
  description: string;
};

const emptyScenario = (): ScenarioForm => ({
  titre: "",
  competenceId: "",
  description: "",
});

function emptyChoix(correct: boolean): ChantierDecisionChoix {
  return { id: uid("choix"), texte: "", correct, feedback: "" };
}

function emptyDecision(): ChantierDecisionModeCompetence {
  return {
    id: uid("dec"),
    texte: "",
    choix: [emptyChoix(true), emptyChoix(false)],
    lieeACompetence: true,
  };
}

export default function ChantierEtape4Page() {
  const { id } = useParams<{ id: string }>();
  const {
    getChantier,
    competencesForChantier,
    scenariosModeCompetenceForChantier,
    createScenarioModeCompetence,
    updateScenarioModeCompetence,
    deleteScenarioModeCompetence,
    toast,
    clearToast,
  } = useAtelierChantierStore();

  const chantier = getChantier(id);
  const competences = competencesForChantier(id);
  const scenarios = scenariosModeCompetenceForChantier(id);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ScenarioForm>(emptyScenario);
  const [formError, setFormError] = useState<string | null>(null);

  const selected =
    scenarios.find((s) => s.id === selectedId) ?? scenarios[0] ?? null;

  const competence = useMemo(
    () =>
      selected
        ? competences.find((c) => c.id === selected.competenceId)
        : undefined,
    [selected, competences]
  );

  if (!chantier) {
    return (
      <p className="text-sm text-slate-500">
        Chantier introuvable.{" "}
        <Link href="/admin/atelier/chantier" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const readOnly = chantier.publie;

  function openCreate() {
    setFormError(null);
    setForm({
      ...emptyScenario(),
      competenceId: competences[0]?.id ?? "",
    });
    setCreateOpen(true);
  }

  function submitCreate() {
    setFormError(null);
    const res = createScenarioModeCompetence({
      chantierId: id,
      titre: form.titre,
      competenceId: form.competenceId,
      description: form.description,
    });
    if ("error" in res) {
      setFormError(res.error);
      return;
    }
    setCreateOpen(false);
    setSelectedId(res.id);
  }

  function saveScenario(patch: Partial<ChantierScenarioModeCompetence>) {
    if (!selected) return;
    const res = updateScenarioModeCompetence(selected.id, {
      titre: patch.titre ?? selected.titre,
      competenceId: patch.competenceId ?? selected.competenceId,
      description: patch.description ?? selected.description,
      decisions: patch.decisions ?? selected.decisions,
    });
    if (res.error) window.alert(res.error);
  }

  function updateDecision(
    decisionId: string,
    patch: Partial<ChantierDecisionModeCompetence>
  ) {
    if (!selected) return;
    const decisions = selected.decisions.map((d) =>
      d.id === decisionId ? { ...d, ...patch } : d
    );
    saveScenario({ decisions });
  }

  function updateChoix(
    decisionId: string,
    choixId: string,
    patch: Partial<ChantierDecisionChoix>
  ) {
    if (!selected) return;
    const decisions = selected.decisions.map((d) => {
      if (d.id !== decisionId) return d;
      return {
        ...d,
        choix: d.choix.map((c) =>
          c.id === choixId ? { ...c, ...patch } : c
        ),
      };
    });
    saveScenario({ decisions });
  }

  function setBonneReponse(decisionId: string, choixId: string) {
    if (!selected) return;
    const decisions = selected.decisions.map((d) => {
      if (d.id !== decisionId) return d;
      return {
        ...d,
        choix: d.choix.map((c) => ({
          ...c,
          correct: c.id === choixId,
        })),
      };
    });
    saveScenario({ decisions });
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref={`/admin/atelier/chantier/${id}`}
        backLabel="← Retour au Chantier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Chantier", href: `/admin/atelier/chantier/${id}` },
          { label: "Étape 4" },
        ]}
        title={`Étape 4 — Mode Compétence · ${chantier.nom}`}
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Entraînement intensif : le joueur choisit une{" "}
        <strong>compétence</strong>, pas un rôle. Workflow linéaire : Décision
        1 → 2 → 3 → Fin. Brouillon Chantier uniquement.
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">
          Scénarios Mode Compétence
        </h2>
        {!readOnly ? (
          <AdminButton
            type="button"
            onClick={openCreate}
            disabled={competences.length === 0}
          >
            <Plus className="h-4 w-4" />
            Ajouter un scénario
          </AdminButton>
        ) : null}
      </div>

      {competences.length === 0 ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Aucune compétence à l&apos;Étape 3.{" "}
          <Link
            href={`/admin/atelier/chantier/${id}/etape-3`}
            className="underline"
          >
            Créer des compétences d&apos;abord
          </Link>
          .
        </p>
      ) : null}

      {scenarios.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucun scénario Mode Compétence pour l&apos;instant.
        </p>
      ) : (
        <div className="mb-6 flex flex-wrap gap-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium ring-1",
                (selected?.id ?? scenarios[0]?.id) === s.id
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {s.titre || "Sans titre"}
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div className="space-y-6">
          {/* Meta — PAS de champ Rôle */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Fiche scénario
              </h3>
              {!readOnly ? (
                <AdminButton
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Supprimer le scénario « ${selected.titre} » ?`
                      )
                    )
                      return;
                    const res = deleteScenarioModeCompetence(selected.id);
                    if (res.error) window.alert(res.error);
                    else setSelectedId(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  Supprimer
                </AdminButton>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Titre *">
                <input
                  className={inputClass}
                  value={selected.titre}
                  disabled={readOnly}
                  onChange={(e) => saveScenario({ titre: e.target.value })}
                  placeholder="Ex. Camion en panne"
                />
              </Field>
              <Field
                label="Compétence à travailler *"
                hint="Une seule compétence précise (Étape 3)"
              >
                <select
                  className={selectClass}
                  value={selected.competenceId}
                  disabled={readOnly}
                  onChange={(e) =>
                    saveScenario({ competenceId: e.target.value })
                  }
                >
                  {competences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Description" className="mt-4">
              <textarea
                className={textareaClass}
                value={selected.description}
                disabled={readOnly}
                onChange={(e) =>
                  saveScenario({ description: e.target.value })
                }
              />
            </Field>
            <p className="mt-3 text-xs text-slate-400">
              Mode Compétence — aucun rôle à choisir.
            </p>
          </section>

          {/* Cours liés auto */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Cours liés (compétence)
            </h3>
            {!competence ? (
              <p className="mt-2 text-sm text-slate-500">
                Choisissez une compétence.
              </p>
            ) : competence.cours.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Aucun cours sur « {competence.nom} ». Ajoutez-en à l&apos;
                <Link
                  href={`/admin/atelier/chantier/${id}/etape-3`}
                  className="underline"
                >
                  Étape 3
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {competence.cours.map((cours) => (
                  <li
                    key={cours.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-slate-900">{cours.titre}</p>
                    {cours.formule ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Formule : {cours.formule}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Workflow linéaire */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Workflow (linéaire)
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {selected.decisions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Ajoutez des décisions pour voir le parcours.
                </p>
              ) : (
                <>
                  {selected.decisions.map((d, i) => (
                    <span key={d.id} className="inline-flex items-center gap-2">
                      <span className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 ring-1 ring-sky-200">
                        Décision {i + 1}
                      </span>
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </span>
                  ))}
                  <span className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200">
                    Fin
                  </span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Intensif, sans événements aléatoires.
            </p>
          </section>

          {/* Décisions */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Décisions
              </h3>
              {!readOnly ? (
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    saveScenario({
                      decisions: [...selected.decisions, emptyDecision()],
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une décision
                </AdminButton>
              ) : null}
            </div>

            {selected.decisions.map((dec, index) => (
              <div
                key={dec.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    Décision {index + 1}
                  </p>
                  {!readOnly ? (
                    <AdminButton
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        saveScenario({
                          decisions: selected.decisions.filter(
                            (d) => d.id !== dec.id
                          ),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                      Supprimer
                    </AdminButton>
                  ) : null}
                </div>

                <Field label="Texte de la décision" className="mt-3">
                  <textarea
                    className={textareaClass}
                    value={dec.texte}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateDecision(dec.id, { texte: e.target.value })
                    }
                  />
                </Field>

                <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={dec.lieeACompetence}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateDecision(dec.id, {
                        lieeACompetence: e.target.checked,
                      })
                    }
                  />
                  <span>
                    Cette décision travaille la compétence «{" "}
                    {competence?.nom ?? "…"} »
                  </span>
                </label>
                {!dec.lieeACompetence ? (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Avertissement : cette décision ne travaille pas la
                    compétence choisie. En Mode Compétence, chaque décision
                    doit tester uniquement cette compétence.
                  </p>
                ) : null}

                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    Choix possibles
                  </p>
                  {dec.choix.map((choix) => (
                    <div
                      key={choix.id}
                      className={cn(
                        "rounded-xl border p-3",
                        choix.correct
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-slate-100 bg-slate-50"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <input
                            type="radio"
                            name={`bonne-${dec.id}`}
                            checked={choix.correct}
                            disabled={readOnly}
                            onChange={() =>
                              setBonneReponse(dec.id, choix.id)
                            }
                          />
                          {choix.correct
                            ? "Bonne réponse"
                            : "Mauvaise réponse"}
                        </label>
                        {!readOnly && dec.choix.length > 2 ? (
                          <button
                            type="button"
                            className="ml-auto text-xs text-rose-600 underline"
                            onClick={() =>
                              updateDecision(dec.id, {
                                choix: dec.choix.filter(
                                  (c) => c.id !== choix.id
                                ),
                              })
                            }
                          >
                            Retirer
                          </button>
                        ) : null}
                      </div>
                      <input
                        className={cn(inputClass, "mt-2")}
                        value={choix.texte}
                        disabled={readOnly}
                        placeholder="Texte du choix"
                        onChange={(e) =>
                          updateChoix(dec.id, choix.id, {
                            texte: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className={cn(textareaClass, "mt-2 min-h-[64px]")}
                        value={choix.feedback}
                        disabled={readOnly}
                        placeholder="Feedback pour cette réponse"
                        onChange={(e) =>
                          updateChoix(dec.id, choix.id, {
                            feedback: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                  {!readOnly ? (
                    <AdminButton
                      variant="secondary"
                      type="button"
                      onClick={() =>
                        updateDecision(dec.id, {
                          choix: [...dec.choix, emptyChoix(false)],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un choix
                    </AdminButton>
                  ) : null}
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Nouveau scénario Mode Compétence
            </h3>
            <div className="mt-4 space-y-4">
              <Field label="Titre *">
                <input
                  className={inputClass}
                  value={form.titre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titre: e.target.value }))
                  }
                  placeholder="Ex. Camion en panne"
                />
              </Field>
              <Field label="Compétence à travailler *">
                <select
                  className={selectClass}
                  value={form.competenceId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      competenceId: e.target.value,
                    }))
                  }
                >
                  <option value="">Choisir…</option>
                  {competences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  className={textareaClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </Field>
              <p className="text-xs text-slate-400">
                Pas de champ Rôle — Mode Compétence uniquement.
              </p>
              {formError ? (
                <p className="text-sm text-rose-600">{formError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <AdminButton
                variant="secondary"
                type="button"
                onClick={() => setCreateOpen(false)}
              >
                Annuler
              </AdminButton>
              <AdminButton type="button" onClick={submitCreate}>
                Créer
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
