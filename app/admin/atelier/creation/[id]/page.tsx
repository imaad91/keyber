"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { ModeBadge } from "@/components/admin/BookEntryCard";
import {
  CREATION_MILESTONES,
  creationPendingItems,
  creationProgress,
  creationVersionLabel,
  milestoneDone,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";
import { fieldsPreviewEntries } from "@/lib/atelierCreationExcel";
import { useAtelierCompetencesStore } from "@/lib/atelierCompetencesStore";
import {
  eventsFileLabel,
  useAtelierEventsStore,
} from "@/lib/atelierEventsStore";
import {
  countOrdinateurPackRows,
  downloadOrdinateurSheetTemplate,
  downloadOrdinateurTemplate,
  ORDINATEUR_SHEETS,
  parseOrdinateurExcelDryRun,
  type OrdinateurExcelPack,
  type OrdinateurSheetParseSummary,
} from "@/lib/atelierOrdinateurExcel";
import {
  countNarrationPackRows,
  downloadNarrationFilledPack,
  downloadNarrationSheetTemplate,
  downloadNarrationTemplate,
  NARRATION_SHEETS,
  parseNarrationExcelDryRun,
  type NarrationExcelPack,
  type NarrationSheetParseSummary,
} from "@/lib/atelierNarrationExcel";
import { buildLumiereNarrationPack } from "@/lib/lumiereCoDemoData";
import { useAtelierRolesStore } from "@/lib/atelierRolesStore";
import type { AtelierScenarioMode } from "@/lib/atelierScenarioMode";
import { cn } from "@/lib/utils";

function formatDateTimeFr(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AtelierCreationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getCreation,
    setRoleNames,
    setCompetenceNames,
    setOrdinateurPack,
    setNarrationPack,
    addScenario,
    removeScenario,
    markPrototypeTested,
    validateAndSendToBook,
    toast,
    clearToast,
  } = useAtelierCreationStore();
  const { getEventsForFamily } = useAtelierEventsStore();
  const { roles } = useAtelierRolesStore();
  const { competences } = useAtelierCompetencesStore();
  const creation = getCreation(id);
  const ordinateurFileRef = useRef<HTMLInputElement>(null);
  const narrationFileRef = useRef<HTMLInputElement>(null);

  const [scenarioNom, setScenarioNom] = useState("");
  const [scenarioMode, setScenarioMode] =
    useState<AtelierScenarioMode>("histoire");
  const [ordDryRun, setOrdDryRun] = useState<
    OrdinateurSheetParseSummary[] | null
  >(null);
  const [ordError, setOrdError] = useState<string | null>(null);
  const [ordBusy, setOrdBusy] = useState(false);
  const [pendingPack, setPendingPack] = useState<OrdinateurExcelPack | null>(
    null
  );
  const [narrDryRun, setNarrDryRun] = useState<
    NarrationSheetParseSummary[] | null
  >(null);
  const [narrError, setNarrError] = useState<string | null>(null);
  const [narrBusy, setNarrBusy] = useState(false);
  const [pendingNarrPack, setPendingNarrPack] =
    useState<NarrationExcelPack | null>(null);

  if (!creation) {
    return (
      <p className="text-sm text-slate-500">
        Création introuvable.{" "}
        <Link href="/admin/atelier/creation" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const { done, total } = creationProgress(creation);
  const pending = creationPendingItems(creation);
  const filled = fieldsPreviewEntries(creation.fields).filter((e) => e.filled);
  const locked = creation.dansBook;
  const entrepriseEvents = getEventsForFamily(creation.familyId);

  function toggleRole(nom: string) {
    if (locked) return;
    const set = new Set(creation!.roleNames);
    if (set.has(nom)) set.delete(nom);
    else set.add(nom);
    setRoleNames(creation!.id, Array.from(set));
  }

  function toggleCompetence(nom: string) {
    if (locked) return;
    const set = new Set(creation!.competenceNames);
    if (set.has(nom)) set.delete(nom);
    else set.add(nom);
    setCompetenceNames(creation!.id, Array.from(set));
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/creation"
        backLabel="← Retour à Création"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Création", href: "/admin/atelier/creation" },
          { label: creationVersionLabel(creation) },
        ]}
        title={creationVersionLabel(creation)}
      />

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-700">
        <p>
          <span className="font-medium text-slate-500">Secteur :</span>{" "}
          {creation.secteur || "—"}
        </p>
        <p>
          <span className="font-medium text-slate-500">Version :</span> V
          {creation.version}
        </p>
        <p>
          <span className="font-medium text-slate-500">Progression :</span>{" "}
          {done} / {total} jalons
        </p>
        <p className="text-xs text-slate-400">
          {locked
            ? "Dans le Book — lecture seule (pour modifier : Book → Retourner en Création)"
            : "Pas encore dans le Book"}
        </p>
      </div>

      {!locked ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => markPrototypeTested(creation.id)}
          >
            Marquer prototype testé
          </AdminButton>
          <AdminButton
            type="button"
            onClick={() => {
              const res = validateAndSendToBook(creation.id);
              if ("error" in res) {
                window.alert(res.error);
                return;
              }
              router.push("/admin/book/en-cours-de-test");
            }}
          >
            Valider et envoyer dans le Book
          </AdminButton>
        </div>
      ) : (
        <p className="mb-8 text-sm text-emerald-700">
          Version déjà dans le Book.{" "}
          <Link href="/admin/book/en-cours-de-test" className="underline">
            Ouvrir le Book
          </Link>
        </p>
      )}

      {/* Étape 32 — Templates Excel Ordinateur */}
      <section className="mb-8 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Ordinateur — templates Excel (Étape 32)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Stocks, commandes, mails, chat, docs, browser… Tu fournis le contenu ;
          l&apos;OS n&apos;invente rien. Remplis pour{" "}
          <strong>Lumière</strong> (pas Novacier) après download. Import =
          dry-run puis enregistrement staging.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Staging actuel :{" "}
          {countOrdinateurPackRows(creation.ordinateurPack ?? {})} ligne(s)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            onClick={() => downloadOrdinateurTemplate()}
          >
            <Download className="h-4 w-4" />
            Télécharger Template Ordinateur (tous onglets)
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            disabled={locked || ordBusy}
            onClick={() => ordinateurFileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Importer Excel (dry-run)
          </AdminButton>
          <input
            ref={ordinateurFileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              setOrdError(null);
              setOrdDryRun(null);
              setPendingPack(null);
              if (!file) return;
              setOrdBusy(true);
              try {
                const buf = await file.arrayBuffer();
                const res = parseOrdinateurExcelDryRun(buf);
                if (!res.ok) {
                  setOrdError(res.error);
                  return;
                }
                setOrdDryRun(res.sheets);
                setPendingPack(res.pack);
              } finally {
                setOrdBusy(false);
                if (ordinateurFileRef.current)
                  ordinateurFileRef.current.value = "";
              }
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ORDINATEUR_SHEETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-[10px] font-semibold text-indigo-900 hover:bg-indigo-50"
              onClick={() => downloadOrdinateurSheetTemplate(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {ordError ? (
          <p className="mt-3 text-sm text-rose-600">{ordError}</p>
        ) : null}
        {ordDryRun ? (
          <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
              Dry-run — {ordDryRun.reduce((n, s) => n + s.rowCount, 0)} ligne(s)
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
              {ordDryRun.map((s) => (
                <li key={s.sheetId}>
                  {s.label} : {s.rowCount} ligne(s) · colonnes{" "}
                  {s.recognizedColumns}/{s.expectedColumns}
                  {s.warnings.length
                    ? ` · ${s.warnings.join(" · ")}`
                    : ""}
                </li>
              ))}
            </ul>
            {!locked && pendingPack ? (
              <AdminButton
                type="button"
                className="mt-3"
                onClick={() => {
                  const res = setOrdinateurPack(creation.id, pendingPack);
                  if (res.error) {
                    setOrdError(res.error);
                    return;
                  }
                  setOrdDryRun(null);
                  setPendingPack(null);
                }}
              >
                Enregistrer le staging Ordinateur
              </AdminButton>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Étape 33 — Templates Excel narration & décisions */}
      <section className="mb-8 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Narration &amp; décisions — templates Excel (Étape 33)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          PNJ / Interviews, Objectifs, Kpis, Jours, Décisions, Options, Fins.
          Tu fournis le contenu ; l&apos;OS n&apos;invente rien. Import =
          dry-run puis staging (pas encore Live).
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Staging actuel :{" "}
          {countNarrationPackRows(creation.narrationPack ?? {})} ligne(s)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            onClick={() => downloadNarrationTemplate()}
          >
            <Download className="h-4 w-4" />
            Télécharger Template Narration (tous onglets)
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() =>
              downloadNarrationFilledPack(
                buildLumiereNarrationPack(),
                "KEYBER_Narration_Lumiere_Co.xlsx"
              )
            }
          >
            <Download className="h-4 w-4" />
            Exemple rempli Lumière
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            disabled={locked || narrBusy}
            onClick={() => narrationFileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Importer Excel (dry-run)
          </AdminButton>
          <input
            ref={narrationFileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0] ?? null;
              setNarrError(null);
              setNarrDryRun(null);
              setPendingNarrPack(null);
              if (!file) return;
              setNarrBusy(true);
              try {
                const buf = await file.arrayBuffer();
                const res = parseNarrationExcelDryRun(buf);
                if (!res.ok) {
                  setNarrError(res.error);
                  return;
                }
                setNarrDryRun(res.sheets);
                setPendingNarrPack(res.pack);
              } finally {
                setNarrBusy(false);
                if (narrationFileRef.current)
                  narrationFileRef.current.value = "";
              }
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {NARRATION_SHEETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className="rounded-md border border-violet-200 bg-white px-2 py-1 text-[10px] font-semibold text-violet-900 hover:bg-violet-50"
              onClick={() => downloadNarrationSheetTemplate(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {narrError ? (
          <p className="mt-3 text-sm text-rose-600">{narrError}</p>
        ) : null}
        {narrDryRun ? (
          <div className="mt-3 rounded-xl border border-violet-100 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
              Dry-run —{" "}
              {narrDryRun.reduce((n, s) => n + s.rowCount, 0)} ligne(s)
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-slate-600">
              {narrDryRun.map((s) => (
                <li key={s.sheetId}>
                  {s.label} : {s.rowCount} ligne(s) · colonnes{" "}
                  {s.recognizedColumns}/{s.expectedColumns}
                  {s.warnings.length
                    ? ` · ${s.warnings.join(" · ")}`
                    : ""}
                </li>
              ))}
            </ul>
            {!locked && pendingNarrPack ? (
              <AdminButton
                type="button"
                className="mt-3"
                onClick={() => {
                  const res = setNarrationPack(creation.id, pendingNarrPack);
                  if (res.error) {
                    setNarrError(res.error);
                    return;
                  }
                  setNarrDryRun(null);
                  setPendingNarrPack(null);
                }}
              >
                Enregistrer le staging Narration
              </AdminButton>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Événements — auto-liés, source de vérité = Atelier → Événements */}
      <section className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Événements de {creation.nom}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Pas de coches ni d&apos;import ici. Les événements sont importés dans{" "}
          <Link
            href="/admin/atelier/evenements"
            className="font-medium underline"
          >
            Atelier → Événements
          </Link>{" "}
          et liés automatiquement à cette entreprise ({entrepriseEvents.length}{" "}
          événement{entrepriseEvents.length === 1 ? "" : "s"}).
        </p>
        <p className="mt-3 text-sm">
          <Link
            href={
              entrepriseEvents.length > 0
                ? `/admin/atelier/evenements/${creation.familyId}`
                : "/admin/atelier/evenements"
            }
            className="underline"
          >
            {entrepriseEvents.length > 0
              ? `Voir le ${eventsFileLabel(creation.nom)}`
              : "Ouvrir Atelier → Événements"}
          </Link>
        </p>
      </section>

      {/* Assemblage / génération dans le Book */}
      <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Assemblage Atelier → Book (Étape 34)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Les packs Excel staging (Ordinateur + Narration) + événements se
          fusionnent dans le{" "}
          <Link href="/admin/book/generer" className="font-medium underline">
            Book → Générer → Assembler Atelier → Book
          </Link>
          . Vue Code peuplée uniquement de ce qui est importé. Pas
          d&apos;assemblage inventé ici.
        </p>
      </section>

      {/* Sélections (bibliothèques globales) */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Rôles sélectionnés
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Depuis la bibliothèque Rôles (aucune invention).
          </p>
          {roles.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Aucun rôle en bibliothèque. Importez-en dans Atelier → Rôles.
            </p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
              {roles.map((r) => {
                const checked = creation.roleNames.includes(r.nom);
                return (
                  <li key={r.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={locked}
                        checked={checked}
                        onChange={() => toggleRole(r.nom)}
                      />
                      {r.nom}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Compétences sélectionnées
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Depuis la bibliothèque Compétences (aucune invention).
          </p>
          {competences.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Aucune compétence en bibliothèque. Importez-en dans Atelier →
              Compétences.
            </p>
          ) : (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
              {competences.map((c) => {
                const checked = creation.competenceNames.includes(c.nom);
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        disabled={locked}
                        checked={checked}
                        onChange={() => toggleCompetence(c.nom)}
                      />
                      {c.nom}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Scénarios */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Scénarios validés
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Un scénario = un seul Mode (Compétence XOR Histoire). Titre saisi par
          vous — aucun contenu inventé.
        </p>
        <ul className="mt-3 space-y-2">
          {creation.scenarios.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span className="flex items-center gap-2">
                {s.nom} <ModeBadge mode={s.mode} />
              </span>
              {!locked ? (
                <button
                  type="button"
                  className="text-xs text-rose-600 underline"
                  onClick={() => removeScenario(creation.id, s.id)}
                >
                  Retirer
                </button>
              ) : null}
            </li>
          ))}
          {creation.scenarios.length === 0 ? (
            <li className="text-sm text-slate-500">
              Aucun scénario pour l&apos;instant.
            </li>
          ) : null}
        </ul>
        {!locked ? (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs text-slate-500">
                Titre du scénario
              </span>
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={scenarioNom}
                onChange={(e) => setScenarioNom(e.target.value)}
                placeholder="Ex. Semaine de crise"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-slate-500">Mode</span>
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={scenarioMode}
                onChange={(e) =>
                  setScenarioMode(e.target.value as AtelierScenarioMode)
                }
              >
                <option value="histoire">Histoire</option>
                <option value="competence">Compétence</option>
              </select>
            </label>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                const res = addScenario(
                  creation.id,
                  scenarioNom,
                  scenarioMode
                );
                if (res.error) {
                  window.alert(res.error);
                  return;
                }
                setScenarioNom("");
              }}
            >
              Ajouter le scénario
            </AdminButton>
          </div>
        ) : null}
      </section>

      {/* Fil chronologique */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Fil chronologique
        </h2>
        <ol className="relative ml-3 space-y-0 border-l-2 border-slate-200 pl-6">
          {CREATION_MILESTONES.map((m) => {
            const evt = creation.timeline.find(
              (e) => e.milestoneId === m.id
            );
            const doneM = Boolean(evt);
            return (
              <li key={m.id} className="relative pb-6 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[1.9rem] top-1 h-3 w-3 rounded-full ring-2 ring-white",
                    doneM ? "bg-emerald-500" : "bg-slate-300"
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    doneM ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {m.label}
                </p>
                {evt ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDateTimeFr(evt.at)}
                    <span className="ml-1 text-slate-400">(Europe/Paris)</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">En attente</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
        <h2 className="text-sm font-semibold text-amber-950">
          Ce qui est en attente
        </h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-amber-900">Rien en attente.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc text-sm text-amber-950">
            {pending.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {!milestoneDone(creation, "roles_selectionnes") &&
        !milestoneDone(creation, "competences_selectionnees") ? (
          <p className="mt-3 text-sm font-medium text-amber-950">
            Sélectionner les rôles et les compétences
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Données importées ({filled.length} champs)
        </h2>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {filled.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun champ rempli.</p>
          ) : (
            filled.map((e) => (
              <div
                key={e.label}
                className="border-b border-slate-50 pb-2 last:border-0"
              >
                <p className="text-xs font-medium text-slate-500">{e.label}</p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">
                  {e.value}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
