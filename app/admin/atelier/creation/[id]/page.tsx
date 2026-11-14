"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
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
import { buildScenarioGenerationPrompt } from "@/lib/atelierCreationPrompt";
import { fieldsPreviewEntries } from "@/lib/atelierCreationExcel";
import { useAtelierCompetencesStore } from "@/lib/atelierCompetencesStore";
import {
  downloadEventsTemplateForEntreprise,
  eventPreviewEntries,
  parseEventsExcel,
  type EventExcelFields,
} from "@/lib/atelierEventsExcel";
import {
  eventsPromptRule,
  useAtelierEventsStore,
} from "@/lib/atelierEventsStore";
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
    addScenario,
    removeScenario,
    markPrototypeTested,
    validateAndSendToBook,
    toast,
    clearToast,
  } = useAtelierCreationStore();
  const {
    getEventsForFamily,
    validateEventsSubmission,
    deleteEvent,
    toast: eventsToast,
    clearToast: clearEventsToast,
  } = useAtelierEventsStore();
  const { roles } = useAtelierRolesStore();
  const { competences } = useAtelierCompetencesStore();
  const creation = getCreation(id);
  const eventsFileRef = useRef<HTMLInputElement>(null);

  const [scenarioNom, setScenarioNom] = useState("");
  const [scenarioMode, setScenarioMode] =
    useState<AtelierScenarioMode>("histoire");
  const [eventsPreview, setEventsPreview] = useState<EventExcelFields[] | null>(
    null
  );
  const [eventsParseError, setEventsParseError] = useState<string | null>(null);
  const [eventsBusy, setEventsBusy] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

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
  const iaPrompt = buildScenarioGenerationPrompt(creation, entrepriseEvents);

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

  async function onEventsFileChange(file: File | null) {
    setEventsParseError(null);
    setEventsPreview(null);
    if (!file) return;
    setEventsBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const res = parseEventsExcel(buf);
      if (!res.ok) {
        setEventsParseError(res.error);
        return;
      }
      setEventsPreview(res.rows);
    } finally {
      setEventsBusy(false);
      if (eventsFileRef.current) eventsFileRef.current.value = "";
    }
  }

  function confirmEventsSubmit() {
    if (!eventsPreview?.length || !creation) return;
    const res = validateEventsSubmission(
      creation.familyId,
      creation.nom,
      eventsPreview
    );
    if (res.error && res.added === 0) {
      setEventsParseError(res.error);
      return;
    }
    setEventsPreview(null);
    setEventsParseError(null);
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
      {eventsToast ? (
        <p className="mb-3 text-sm">
          {eventsToast}{" "}
          <button
            type="button"
            className="underline"
            onClick={clearEventsToast}
          >
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

      {/* Événements — liés uniquement à cette entreprise */}
      <section className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Événements de {creation.nom}
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Chaque entreprise a ses propres événements. Ils ne sont pas partagés
          avec d&apos;autres créations (ex. Novacier). Import Excel uniquement —
          aucun événement inventé.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => downloadEventsTemplateForEntreprise(creation.nom)}
          >
            <Download className="h-4 w-4" />
            Télécharger le Template Événements pour {creation.nom}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            disabled={eventsBusy || locked}
            onClick={() => eventsFileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {entrepriseEvents.length > 0
              ? `Réimporter un nouvel Excel Événements pour ${creation.nom}`
              : `Importer mon Excel Événements pour ${creation.nom}`}
          </AdminButton>
          <input
            ref={eventsFileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) =>
              onEventsFileChange(e.target.files?.[0] ?? null)
            }
          />
        </div>

        {eventsParseError ? (
          <p className="mt-3 text-sm text-rose-600">{eventsParseError}</p>
        ) : null}

        {eventsPreview ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Aperçu de l&apos;import Événements
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              {eventsPreview.length} événement
              {eventsPreview.length > 1 ? "s" : ""} pour {creation.nom} (les
              noms déjà présents seront ignorés).
            </p>
            <div className="mt-3 max-h-[320px] space-y-3 overflow-y-auto">
              {eventsPreview.map((fields, i) => {
                const entries = eventPreviewEntries(fields).filter(
                  (e) => e.filled
                );
                return (
                  <div
                    key={`${fields["Nom de l'événement"]}-${i}`}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {fields["Nom de l'événement"]}
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                      {entries.slice(0, 5).map((e) => (
                        <li key={e.label}>
                          <span className="font-medium text-slate-500">
                            {e.label} :
                          </span>{" "}
                          {e.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton type="button" onClick={confirmEventsSubmit}>
                Valider la soumission
              </AdminButton>
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => setEventsPreview(null)}
              >
                Annuler
              </AdminButton>
            </div>
          </div>
        ) : null}

        <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Liste ({entrepriseEvents.length})
        </h3>
        {entrepriseEvents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Aucun événement pour {creation.nom}. Importez un Excel Événements.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            {entrepriseEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{ev.nom}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {ev.type || "Type —"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {ev.description || "Description non renseignée"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/atelier/creation/${creation.id}/evenements/${ev.id}`}
                  >
                    <AdminButton variant="secondary" type="button">
                      Voir
                    </AdminButton>
                  </Link>
                  {!locked ? (
                    <AdminButton
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        if (
                          !window.confirm(
                            `Supprimer l'événement « ${ev.nom} » de ${creation.nom} ?`
                          )
                        )
                          return;
                        const res = deleteEvent(ev.id, creation.familyId);
                        if (res.error) window.alert(res.error);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                      Supprimer
                    </AdminButton>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Prompt IA */}
      <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Générer des scénarios avec l&apos;IA
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Copie le Prompt ci-dessous dans Cursor / Claude Sonnet. L&apos;IA
          n&apos;invente aucun événement.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminButton
            type="button"
            onClick={() => setShowPrompt(true)}
          >
            Générer des scénarios avec l&apos;IA
          </AdminButton>
          {showPrompt ? (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(iaPrompt);
                  window.alert("Prompt copié");
                } catch {
                  window.alert("Impossible de copier — sélectionne le texte");
                }
              }}
            >
              Copier le Prompt
            </AdminButton>
          ) : null}
        </div>
        {showPrompt ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-rose-800">
              {eventsPromptRule(creation.nom)}
            </p>
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800">
              {iaPrompt}
            </pre>
          </div>
        ) : null}
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
            <li className="text-sm text-slate-500">Aucun scénario pour l&apos;instant.</li>
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
