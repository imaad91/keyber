"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  CREATION_MILESTONES,
  creationPendingItems,
  creationProgress,
  milestoneDone,
  useAtelierCreationStore,
} from "@/lib/atelierCreationStore";
import { fieldsPreviewEntries } from "@/lib/atelierCreationExcel";
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
  const { getCreation, toast, clearToast } = useAtelierCreationStore();
  const creation = getCreation(id);

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

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/creation"
        backLabel="← Retour à Création"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Création", href: "/admin/atelier/creation" },
          { label: creation.nom },
        ]}
        title={creation.nom}
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
          <span className="font-medium text-slate-500">Progression :</span>{" "}
          {done} / {total} jalons
        </p>
        <p className="text-xs text-slate-400">
          Pas dans le Book
          {creation.dansBook ? " — déjà publié" : " (normal tant que non validé)"}
        </p>
      </div>

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

      {/* En attente */}
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

      {/* Données importées (lecture seule) */}
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
