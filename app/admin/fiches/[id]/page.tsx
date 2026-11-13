"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  AdminButton,
  Field,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { FicheAgentTestReport } from "@/components/admin/FicheAgentTestReport";
import { WorkflowStatusBadge } from "@/components/admin/WorkflowStatusBadge";
import {
  WorkflowHistoryList,
  WorkflowTimeline,
} from "@/components/admin/WorkflowTimeline";
import {
  FICHE_SECTION_HINT,
  FICHE_SECTION_META,
  ficheFillPercent,
  ficheMissingSections,
  type AdminFicheSections,
} from "@/lib/adminFiches";
import { useAdminStore } from "@/lib/adminStore";
import {
  allAgentsValidated,
  isFicheContentEditable,
  workflowProgressLabel,
} from "@/lib/adminWorkflow";
import { allCompetenceImpactsPrecise } from "@/lib/competenceLocks";
import { ALL_COMPETENCES, getCompetenceDef } from "@/lib/competences";
import { cn } from "@/lib/utils";

export default function AdminFicheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useAdminStore();
  const {
    fiches,
    scenarios,
    entreprises,
    agents,
    updateFiche,
    soumettreFiche,
    validerFiche,
    demanderCorrectionsFiche,
    repasserFicheEnBrouillon,
    genererScenarioProvisoire,
    lancerTestsAgents,
    retenirScenario,
    rejeterScenario,
    archiverFicheWorkflow,
    dupliquerFichePourRecommencer,
  } = store;
  const fiche = fiches.find((f) => f.id === id);
  const [busy, setBusy] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const [showCorrection, setShowCorrection] = useState(false);
  const [rejectText, setRejectText] = useState("");
  const [showReject, setShowReject] = useState(false);

  const pct = fiche ? ficheFillPercent(fiche) : 0;
  const missing = fiche ? ficheMissingSections(fiche) : [];
  const editable = fiche ? isFicheContentEditable(fiche.statutWorkflow) : false;
  const agentsOk = fiche
    ? allAgentsValidated(fiche.agentTestReports ?? [])
    : false;
  const competencesOk = fiche
    ? allCompetenceImpactsPrecise(fiche.competencePrecision ?? [])
    : false;
  const canRetain = agentsOk && competencesOk;

  const scenarioOptions = useMemo(
    () => [...scenarios].sort((a, b) => a.order - b.order),
    [scenarios]
  );

  if (!fiche) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Fiche introuvable.{" "}
        <Link href="/admin/fiches" className="underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  function patchSections(partial: Partial<AdminFicheSections>) {
    updateFiche(fiche!.id, {
      sections: { ...fiche!.sections, ...partial },
    });
  }

  function run(action: () => boolean | null | string | void, delay = 0) {
    setBusy(true);
    window.setTimeout(() => {
      const result = action();
      setBusy(false);
      if (typeof result === "string") router.push(`/admin/fiches/${result}`);
    }, delay);
  }

  const alertMessage =
    fiche.statutWorkflow === "corrections_demandees"
      ? fiche.commentaireCorrection
      : fiche.statutWorkflow === "rejete"
        ? fiche.raisonRejet
        : undefined;

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/fiches"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Fiches", href: "/admin/fiches" },
          { label: fiche.titre.replace(/^Fiche\s+/i, "") || fiche.titre },
        ]}
        title={`Fiche — ${fiche.titre.replace(/^Fiche\s+/i, "") || fiche.titre}`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <WorkflowStatusBadge status={fiche.statutWorkflow} showStep />
        {fiche.provisoire ? (
          <span className="rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Provisoire
          </span>
        ) : null}
        <span className="text-xs text-slate-500">
          {workflowProgressLabel(fiche.statutWorkflow)}
        </span>
        <Link
          href={`/admin/fiches/suivi?focus=${fiche.id}`}
          className="ml-auto text-xs font-semibold text-slate-700 underline"
        >
          Voir dans Suivi Validation
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <WorkflowTimeline
          status={fiche.statutWorkflow}
          alertMessage={alertMessage}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {editable ? (
          <AdminButton
            onClick={() =>
              updateFiche(fiche.id, {
                titre: fiche.titre,
                scenarioId: fiche.scenarioId,
                entrepriseNom: fiche.entrepriseNom,
                role: fiche.role,
                sections: fiche.sections,
              })
            }
          >
            Enregistrer la Fiche
          </AdminButton>
        ) : null}

        {fiche.statutWorkflow === "brouillon" ? (
          <AdminButton onClick={() => run(() => soumettreFiche(fiche.id))}>
            Soumettre la Fiche
          </AdminButton>
        ) : null}

        {fiche.statutWorkflow === "soumise" ? (
          <>
            <AdminButton onClick={() => run(() => validerFiche(fiche.id))}>
              Valider la Fiche
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => setShowCorrection((v) => !v)}
            >
              Demander des corrections
            </AdminButton>
          </>
        ) : null}

        {fiche.statutWorkflow === "corrections_demandees" ? (
          <AdminButton
            onClick={() => run(() => repasserFicheEnBrouillon(fiche.id))}
          >
            Repasser en Brouillon pour corriger
          </AdminButton>
        ) : null}

        {fiche.statutWorkflow === "fiche_validee" ? (
          <AdminButton
            onClick={() =>
              run(() => genererScenarioProvisoire(fiche.id), 500)
            }
            disabled={busy}
          >
            {busy
              ? "Génération du Cœur en cours…"
              : "Générer le Scénario Provisoire"}
          </AdminButton>
        ) : null}

        {fiche.statutWorkflow === "provisoire_cree" ? (
          <AdminButton onClick={() => run(() => lancerTestsAgents(fiche.id))}>
            Lancer les tests Agents
          </AdminButton>
        ) : null}

        {fiche.statutWorkflow === "en_test" ? (
          <>
            <AdminButton
              onClick={() => run(() => retenirScenario(fiche.id))}
              disabled={!canRetain}
            >
              {canRetain
                ? "Retenir le Scénario"
                : !agentsOk
                  ? "En attente de validation des Agents"
                  : "En attente — compétences imprécises"}
            </AdminButton>
            {!canRetain ? (
              <>
                <AdminButton
                  variant="secondary"
                  onClick={() => {
                    document
                      .getElementById("rapport-agents")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Voir les problèmes
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  onClick={() => run(() => lancerTestsAgents(fiche.id))}
                >
                  Corriger et relancer les tests
                </AdminButton>
              </>
            ) : null}
            <AdminButton
              variant="secondary"
              onClick={() => setShowReject((v) => !v)}
            >
              Rejeter le Scénario
            </AdminButton>
          </>
        ) : null}

        {fiche.statutWorkflow === "retenu_publie" ? (
          <>
            {fiche.scenarioId ? (
              <Link
                href={`/admin/scenarios/${fiche.scenarioId}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white"
              >
                Voir le Scénario Publié
              </Link>
            ) : null}
            <AdminButton
              variant="secondary"
              onClick={() => run(() => archiverFicheWorkflow(fiche.id))}
            >
              Archiver
            </AdminButton>
          </>
        ) : null}

        {fiche.statutWorkflow === "rejete" ? (
          <AdminButton
            onClick={() =>
              run(() => dupliquerFichePourRecommencer(fiche.id))
            }
          >
            Dupliquer la Fiche pour recommencer
          </AdminButton>
        ) : null}

        {fiche.coeurGenere && fiche.scenarioId ? (
          <>
            <Link
              href={`/admin/logique/${fiche.scenarioId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Voir dans Logique
            </Link>
            <Link
              href={`/admin/coeur/langage/${fiche.scenarioId}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Voir dans Langage Cœur
            </Link>
          </>
        ) : null}
      </div>

      {showCorrection ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <Field label="Commentaire de correction (obligatoire)">
            <textarea
              className={textareaClass}
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Précisez les corrections demandées…"
            />
          </Field>
          <div className="mt-3 flex gap-2">
            <AdminButton
              onClick={() => {
                run(() => {
                  const ok = demanderCorrectionsFiche(
                    fiche.id,
                    correctionText
                  );
                  if (ok) {
                    setShowCorrection(false);
                    setCorrectionText("");
                  }
                  return ok;
                });
              }}
            >
              Envoyer les corrections
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => setShowCorrection(false)}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      {showReject ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <Field label="Raison du rejet (obligatoire)">
            <textarea
              className={textareaClass}
              value={rejectText}
              onChange={(e) => setRejectText(e.target.value)}
              placeholder="Pourquoi rejeter ce scénario ?"
            />
          </Field>
          <div className="mt-3 flex gap-2">
            <AdminButton
              onClick={() => {
                run(() => {
                  const ok = rejeterScenario(fiche.id, rejectText);
                  if (ok) {
                    setShowReject(false);
                    setRejectText("");
                  }
                  return ok;
                });
              }}
            >
              Confirmer le rejet
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => setShowReject(false)}
            >
              Annuler
            </AdminButton>
          </div>
        </div>
      ) : null}

      {fiche.statutWorkflow === "en_test" ? (
        <div id="rapport-agents" className="mb-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Rapport de test Agents
            </h2>
            <FicheAgentTestReport
              reports={fiche.agentTestReports ?? []}
              agents={agents}
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Précision des compétences
            </h2>
            {(fiche.competencePrecision ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucun impact compétence dans le Cœur — ou lancez les tests.
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Compétence</th>
                      <th className="px-3 py-2">Indicateur</th>
                      <th className="px-3 py-2">Feedback</th>
                      <th className="px-3 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fiche.competencePrecision ?? []).map((row) => (
                      <tr
                        key={`${row.decisionId}-${row.choixId}-${row.competenceId}`}
                        className="border-b border-slate-50"
                      >
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-900">
                            {row.competenceNom}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {row.decisionTitre} · {row.choixLabel}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {row.indicateurTeste}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          <p>✓ {row.feedbackSiReussi}</p>
                          <p className="mt-0.5">✗ {row.feedbackSiEchoue}</p>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-semibold",
                              row.statut === "precis"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-50 text-rose-800"
                            )}
                          >
                            {row.statut === "precis"
                              ? "Précis ✓"
                              : row.statut === "incoherent"
                                ? "Incohérent ✗"
                                : "Imprécis ✗"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Historique des étapes
        </h2>
        <WorkflowHistoryList historique={fiche.historique ?? []} />
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900">
            Fiche remplie à {pct}%
            {missing.length > 0
              ? ` — Il manque : ${missing.join(", ")}`
              : " — Toutes les sections sont renseignées"}
          </p>
          <span className="text-xs tabular-nums text-slate-500">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Field label="Titre">
          <input
            className={inputClass}
            value={fiche.titre}
            disabled={!editable}
            onChange={(e) => updateFiche(fiche.id, { titre: e.target.value })}
          />
        </Field>
        <Field label="Scénario lié">
          <select
            className={selectClass}
            value={fiche.scenarioId}
            disabled={!editable}
            onChange={(e) => {
              const scn = scenarios.find((s) => s.id === e.target.value);
              const ent = entreprises.find((x) => x.id === scn?.entrepriseId);
              updateFiche(fiche.id, {
                scenarioId: e.target.value,
                entrepriseNom: ent?.nom ?? fiche.entrepriseNom,
                role: scn?.competence || fiche.role,
              });
            }}
          >
            <option value="">— Choisir —</option>
            {scenarioOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Entreprise">
          <input
            className={inputClass}
            value={fiche.entrepriseNom}
            disabled={!editable}
            onChange={(e) =>
              updateFiche(fiche.id, { entrepriseNom: e.target.value })
            }
          />
        </Field>
        <Field label="Rôle">
          <input
            className={inputClass}
            value={fiche.role}
            disabled={!editable}
            onChange={(e) => updateFiche(fiche.id, { role: e.target.value })}
          />
        </Field>
        <Field
          label="Compétences liées aux décisions (id catalogue)"
          hint="Liste déroulante uniquement — interdiction de texte libre / d'inventer."
        >
          <select
            className={selectClass}
            disabled={!editable}
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const current = fiche.competenceIds ?? [];
              if (current.includes(id)) return;
              updateFiche(fiche.id, {
                competenceIds: [...current, id],
              });
            }}
          >
            <option value="">— Ajouter une compétence —</option>
            {ALL_COMPETENCES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.type === "ciblee" ? "Ciblée" : "Générale"} — {c.nom} ({c.id})
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            {(fiche.competenceIds ?? []).map((cid) => {
              const def = getCompetenceDef(cid);
              return (
                <button
                  key={cid}
                  type="button"
                  disabled={!editable}
                  onClick={() =>
                    updateFiche(fiche.id, {
                      competenceIds: (fiche.competenceIds ?? []).filter(
                        (x) => x !== cid
                      ),
                    })
                  }
                  className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-800 disabled:opacity-50"
                  title="Retirer"
                >
                  {def?.nom ?? cid}{" "}
                  <span className="font-mono text-[10px] text-slate-400">
                    {cid}
                  </span>{" "}
                  ×
                </button>
              );
            })}
            {(fiche.competenceIds ?? []).length === 0 ? (
              <span className="text-xs text-slate-400">Aucune sélectionnée</span>
            ) : null}
          </div>
        </Field>
      </div>

      <div className="space-y-8">
        {FICHE_SECTION_META.map((sec, i) => (
          <section
            key={sec.key}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Section {i + 1}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {sec.titre}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              {FICHE_SECTION_HINT}
            </p>
            <textarea
              className={`${textareaClass} mt-4 min-h-[160px]`}
              value={fiche.sections[sec.key]}
              disabled={!editable}
              onChange={(e) => patchSections({ [sec.key]: e.target.value })}
              placeholder="Anecdotes, chiffres, exemples vrais…"
            />
          </section>
        ))}
      </div>

      {busy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl bg-white px-6 py-5 text-sm font-semibold text-slate-900 shadow-lg">
            Traitement en cours…
          </div>
        </div>
      ) : null}
    </div>
  );
}
