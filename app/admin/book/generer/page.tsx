"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useAtelierCompetencesStore } from "@/lib/atelierCompetencesStore";
import {
  creationVersionLabel,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";
import {
  eventsFileLabel,
  useAtelierEventsStore,
} from "@/lib/atelierEventsStore";
import { useAtelierRolesStore } from "@/lib/atelierRolesStore";
import {
  buildBookGenerationPrompt,
  buildParamFileName,
  buildSkeletonParamFile,
  coursTitlesForCompetences,
  evaluateBookGeneration,
  filledContexteRecord,
} from "@/lib/bookGenerationPrompt";
import { useBookStore } from "@/lib/bookStore";
import {
  buildScenarioParamBlocksGraph,
  formatScenarioParamBlocksSummary,
  type ScenarioParamFileExtended,
} from "@/lib/scenarioParamSchema";
import { cn } from "@/lib/utils";

function RecapDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        ok ? "text-emerald-700" : "text-rose-700"
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs text-white",
          ok ? "bg-emerald-600" : "bg-rose-600"
        )}
      >
        {ok ? "✓" : "✕"}
      </span>
      {label}
    </li>
  );
}

export default function BookGenererPage() {
  const { creations } = useAtelierCreationStore();
  const { roles } = useAtelierRolesStore();
  const { competences, cours, getCoursForCompetence } =
    useAtelierCompetencesStore();
  const {
    events: allEvents,
    getEventsForFamily,
    listEntrepriseFiles,
  } = useAtelierEventsStore();
  const { createProvisionalFromGeneration, toast, clearToast } = useBookStore();

  const entreprises = useMemo(() => {
    const map = new Map<
      string,
      { familyId: string; creationId: string; nom: string; label: string }
    >();
    // Prefer latest version per family
    const sorted = creations
      .slice()
      .sort((a, b) => b.version - a.version || b.updatedAt.localeCompare(a.updatedAt));
    for (const c of sorted) {
      if (!map.has(c.familyId)) {
        map.set(c.familyId, {
          familyId: c.familyId,
          creationId: c.id,
          nom: c.nom,
          label: creationVersionLabel(c),
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.nom.localeCompare(b.nom)
    );
  }, [creations]);

  const [familyId, setFamilyId] = useState("");
  const [roleChecks, setRoleChecks] = useState<string[]>([]);
  const [compChecks, setCompChecks] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [shellNote, setShellNote] = useState<string | null>(null);

  const creation =
    creations.find(
      (c) =>
        c.familyId === familyId &&
        c.id === entreprises.find((e) => e.familyId === familyId)?.creationId
    ) ||
    creations.find((c) => c.familyId === familyId) ||
    null;

  /** familyId d'abord ; sinon même nom d'entreprise (versions divergées). */
  const events = useMemo(() => {
    if (!creation) return [];
    const byFamily = getEventsForFamily(creation.familyId);
    if (byFamily.length) return byFamily;
    const nom = creation.nom.trim().toLowerCase();
    if (!nom) return [];
    return allEvents.filter(
      (e) => e.entrepriseNom.trim().toLowerCase() === nom
    );
  }, [creation, allEvents, getEventsForFamily]);

  const eventsFile =
    listEntrepriseFiles().find((f) => f.familyId === familyId) ||
    listEntrepriseFiles().find(
      (f) =>
        creation &&
        f.entrepriseNom.trim().toLowerCase() ===
          creation.nom.trim().toLowerCase()
    );

  const coursByCompetence = useMemo(
    () => coursTitlesForCompetences(competences, cours, compChecks),
    [competences, cours, compChecks]
  );

  const recap = evaluateBookGeneration({
    creation,
    eventsCount: events.length,
    rolesLibCount: roles.length,
    competencesLibCount: competences.length,
    selectedRoleNames: roleChecks,
    selectedCompetenceNames: compChecks,
  });

  function toggleRole(nom: string) {
    setRoleChecks((prev) =>
      prev.includes(nom) ? prev.filter((x) => x !== nom) : [...prev, nom]
    );
    setPrompt(null);
  }

  function toggleComp(nom: string) {
    setCompChecks((prev) =>
      prev.includes(nom) ? prev.filter((x) => x !== nom) : [...prev, nom]
    );
    setPrompt(null);
  }

  function generate() {
    if (!recap.allOk || !creation) return;
    const eventsFileName =
      eventsFile?.label || eventsFileLabel(creation.nom);
    const text = buildBookGenerationPrompt({
      creation,
      events,
      eventsFileName,
      selectedRoleNames: roleChecks,
      selectedCompetenceNames: compChecks,
      coursByCompetence,
    });
    setPrompt(text);

    const contexte = filledContexteRecord(
      creation.fields as unknown as Record<string, string>
    );
    const compsPayload = compChecks.map((nom) => ({
      nom,
      cours: coursByCompetence[nom] ?? [],
    }));
    const rolePrincipal = roleChecks[0]!;

    const items = [
      ...compChecks.map((compNom) => {
        const fichier = buildParamFileName({
          entrepriseNom: creation.nom,
          mode: "competence",
          roleOrCompetence: compNom,
          version: 1,
        });
        const nom = `Entraînement — ${compNom}`;
        const paramFile = buildSkeletonParamFile({
          nom,
          version: 1,
          mode: "competence",
          roleName: "",
          competenceName: compNom,
          secteur: creation.secteur,
          entrepriseNom: creation.nom,
          contexte,
          events,
          roleNames: roleChecks,
          competences: compsPayload,
          fichier,
        });
        return {
          mode: "competence" as const,
          nom,
          competenceName: compNom,
          roleName: "",
          itemKey: `comp:${compNom.toLowerCase()}`,
          textContent: [
            `# ${nom}`,
            ``,
            `Mode : Compétence`,
            `Entreprise : ${creation.nom}`,
            `Compétence : ${compNom}`,
            `Cours : ${(coursByCompetence[compNom] ?? []).join(", ") || "(aucun)"}`,
            `Événements : ${events.map((e) => e.nom).join(", ") || "(aucun)"}`,
            ``,
            `Structure complète (Étape 23) — blocs schéma présents ; contenu métier uniquement depuis Atelier (pas d'invention Studio).`,
            ``,
            formatScenarioParamBlocksSummary(
              paramFile as ScenarioParamFileExtended
            ),
          ].join("\n"),
          graph: buildScenarioParamBlocksGraph(
            paramFile as ScenarioParamFileExtended
          ),
          paramFile,
          paramFileName: fichier,
        };
      }),
      (() => {
        const fichierHist = buildParamFileName({
          entrepriseNom: creation.nom,
          mode: "histoire",
          roleOrCompetence: rolePrincipal,
          version: 1,
        });
        const paramFile = buildSkeletonParamFile({
          nom: `Histoire — ${rolePrincipal}`,
          version: 1,
          mode: "histoire",
          roleName: rolePrincipal,
          competenceName: "",
          secteur: creation.secteur,
          entrepriseNom: creation.nom,
          contexte,
          events,
          roleNames: roleChecks,
          competences: compsPayload,
          fichier: fichierHist,
        });
        return {
          mode: "histoire" as const,
          nom: `Histoire — ${rolePrincipal}`,
          competenceName: "",
          roleName: rolePrincipal,
          itemKey: `hist:${rolePrincipal.toLowerCase()}`,
          textContent: [
            `# Histoire — ${rolePrincipal}`,
            ``,
            `Mode : Histoire`,
            `Entreprise : ${creation.nom}`,
            `Rôle : ${rolePrincipal}`,
            `Événements : ${events.map((e) => e.nom).join(", ")}`,
            ``,
            `Structure complète (Étape 23) — blocs schéma présents ; contenu métier uniquement depuis Atelier (pas d'invention Studio).`,
            ``,
            formatScenarioParamBlocksSummary(
              paramFile as ScenarioParamFileExtended
            ),
          ].join("\n"),
          graph: buildScenarioParamBlocksGraph(
            paramFile as ScenarioParamFileExtended
          ),
          paramFile,
          paramFileName: fichierHist,
        };
      })(),
    ];

    const res = createProvisionalFromGeneration({
      creationFamilyId: creation.familyId,
      sourceCreationId: creation.id,
      entrepriseNom: creation.nom,
      secteur: creation.secteur,
      fields: creation.fields,
      roleNames: roleChecks,
      competenceNames: compChecks,
      items,
    });
    if ("error" in res) {
      setShellNote(res.error);
    } else {
      setShellNote(
        `${res.entries.length} coquille(s) V1 — structure param complète (Ordinateur, Jours, Interviews…) dans le Book (En cours de test).`
      );
    }
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/book/en-cours-de-test"
        backLabel="← Retour au Book"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Book", href: "/admin/book/en-cours-de-test" },
          { label: "Générer des scénarios" },
        ]}
        title="Générer des scénarios"
      />

      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Formulaire Book : contexte → rôles → compétences → événements auto.
        Générer crée la <strong>structure complète</strong> du fichier de
        paramétrage (blocs vides OK). Le Prompt se copie dans Cursor. Aucun
        contenu métier inventé ici.
      </p>

      {/* Récap permanent */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Récap
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          <RecapDot ok={recap.contexteOk} label="Contexte" />
          <RecapDot
            ok={recap.evenementsOk}
            label={`Événements${
              recap.evenementsOk ? ` (${recap.evenementsCount})` : ""
            }`}
          />
          <RecapDot
            ok={recap.rolesLibOk && recap.rolesOk}
            label={`Rôles${
              recap.rolesChecked ? ` (${recap.rolesChecked} coché(s))` : ""
            }`}
          />
          <RecapDot
            ok={recap.competencesLibOk && recap.competencesOk}
            label={`Compétences${
              recap.competencesChecked
                ? ` (${recap.competencesChecked} cochée(s))`
                : ""
            }`}
          />
        </ul>
      </div>

      {/* Étape 1 */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Étape 1 — Contexte (entreprise)
        </h2>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-xs text-slate-500">
            Entreprise importée en Création
          </span>
          <select
            className="min-w-[260px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={familyId}
            onChange={(e) => {
              setFamilyId(e.target.value);
              setPrompt(null);
              setShellNote(null);
            }}
          >
            <option value="">— Choisir —</option>
            {entreprises.map((e) => (
              <option key={e.familyId} value={e.familyId}>
                {e.nom}
              </option>
            ))}
          </select>
        </label>
        {entreprises.length === 0 ? (
          <p className="mt-2 text-sm text-amber-800">
            Aucun contexte.{" "}
            <Link href="/admin/atelier/creation" className="underline">
              Aller dans Création
            </Link>
          </p>
        ) : null}
      </section>

      {/* Étape 2 */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Étape 2 — Rôles (bibliothèque)
        </h2>
        {roles.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Bibliothèque vide.{" "}
            <Link href="/admin/atelier/roles" className="underline">
              Importer des rôles
            </Link>
          </p>
        ) : (
          <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
            {roles.map((r) => (
              <li key={r.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={roleChecks.includes(r.nom)}
                    onChange={() => toggleRole(r.nom)}
                  />
                  {r.nom}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Étape 3 */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Étape 3 — Compétences + Cours
        </h2>
        {competences.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Bibliothèque vide.{" "}
            <Link href="/admin/atelier/competences" className="underline">
              Importer des compétences
            </Link>
          </p>
        ) : (
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto">
            {competences.map((c) => {
              const linked = getCoursForCompetence(c.id);
              return (
                <li key={c.id} className="text-sm">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={compChecks.includes(c.nom)}
                      onChange={() => toggleComp(c.nom)}
                    />
                    <span>
                      <span className="font-medium">{c.nom}</span>
                      {linked.length ? (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Cours : {linked.map((x) => x.titre).join(", ")}
                        </span>
                      ) : (
                        <span className="mt-0.5 block text-xs text-slate-400">
                          Aucun cours lié
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Étape 4 */}
      <section className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Étape 4 — Événements (auto, aucune coche)
        </h2>
        {!familyId ? (
          <p className="mt-2 text-sm text-slate-500">
            Choisis d&apos;abord une entreprise.
          </p>
        ) : events.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            Aucun événement pour cette entreprise.{" "}
            <Link href="/admin/atelier/evenements" className="underline">
              Importer dans Atelier → Événements
            </Link>
          </p>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-slate-700">
              {eventsFileLabel(creation?.nom || "Entreprise")} — {events.length}{" "}
              événement{events.length > 1 ? "s" : ""} (liés automatiquement)
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              {events.map((e) => (
                <li key={e.id}>{e.nom}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {recap.blocker ? (
        <p className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {recap.blocker.message}
        </p>
      ) : null}
      {recap.readyMessage ? (
        <p className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {recap.readyMessage}
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
      {shellNote ? (
        <p className="mb-3 text-sm text-slate-600">{shellNote}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <AdminButton
          type="button"
          disabled={!recap.allOk}
          className={
            recap.allOk
              ? "!bg-emerald-600 hover:!bg-emerald-700"
              : undefined
          }
          onClick={generate}
        >
          Générer le Prompt à copier dans Cursor
        </AdminButton>
        {prompt ? (
          <AdminButton
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                window.alert("Prompt copié");
              } catch {
                window.alert("Impossible de copier — sélectionne le texte");
              }
            }}
          >
            Copier le Prompt
          </AdminButton>
        ) : null}
        <Link href="/admin/book/en-cours-de-test">
          <AdminButton type="button" variant="ghost">
            Voir le Book
          </AdminButton>
        </Link>
      </div>

      {prompt ? (
        <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-800 shadow-sm">
          {prompt}
        </pre>
      ) : null}
    </div>
  );
}
