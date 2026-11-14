"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  bookStatusLabel,
  bookVersionLabel,
  isPlayerVisible,
  type BookEntry,
} from "@/lib/bookStore";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { cn } from "@/lib/utils";

function formatDateFr(iso: string): string {
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

export function ModeBadge({ mode }: { mode: "competence" | "histoire" }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
        mode === "competence"
          ? "bg-sky-100 text-sky-800"
          : "bg-violet-100 text-violet-800"
      )}
    >
      {mode === "competence" ? "Compétence" : "Histoire"}
    </span>
  );
}

export function BookEntryCard({
  entry,
  history,
  variant,
  onPasserEnLive,
  onRetournerEnTest,
  onRetournerEnCreation,
  onSupprimer,
}: {
  entry: BookEntry;
  history: BookEntry[];
  variant: "en_test" | "live";
  onPasserEnLive?: () => void;
  onRetournerEnTest?: () => void;
  onRetournerEnCreation: () => void;
  onSupprimer?: () => void;
}) {
  const playHref = `/jouer/book/${entry.id}`;
  const isCompetence = entry.mode === "competence";

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm",
        isCompetence ? "border-sky-200" : "border-violet-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {bookVersionLabel(entry)}
            </p>
            <ModeBadge mode={entry.mode} />
            {entry.status === "live" ? (
              <span className="inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                LIVE
              </span>
            ) : (
              <span className="inline-flex rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-950">
                MODE TEST
              </span>
            )}
          </div>

          {isCompetence ? (
            <>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-500">
                  Compétence travaillée :
                </span>{" "}
                {entry.competenceName ||
                  entry.competenceNames[0] ||
                  "—"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-500">
                  Entreprise / Contexte :
                </span>{" "}
                {entry.entrepriseNom || "—"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-500">Rôle joué :</span>{" "}
                {entry.roleName || entry.roleNames[0] || "—"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-500">Secteur :</span>{" "}
                {entry.secteur || "—"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-500">
                  Entreprise / Contexte :
                </span>{" "}
                {entry.entrepriseNom || "—"}
              </p>
            </>
          )}

          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-500">Version :</span> V
            {entry.version}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-500">Statut :</span>{" "}
            {bookStatusLabel(entry.status)}
            {isPlayerVisible(entry) ? (
              <span className="ml-2 text-xs text-emerald-700">
                · visible joueurs
              </span>
            ) : (
              <span className="ml-2 text-xs text-amber-700">
                · Admin uniquement
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Validé {formatDateFr(entry.validatedAt)} (Europe/Paris)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/book/${entry.id}`}>
            <AdminButton variant="secondary" type="button">
              Voir
            </AdminButton>
          </Link>

          {variant === "en_test" ? (
            <>
              <Link href={playHref}>
                <AdminButton variant="secondary" type="button">
                  Tester
                </AdminButton>
              </Link>
              {onPasserEnLive ? (
                <AdminButton type="button" onClick={onPasserEnLive}>
                  Passer en Live
                </AdminButton>
              ) : null}
              <AdminButton
                type="button"
                variant="ghost"
                onClick={onRetournerEnCreation}
              >
                Retourner en Création
              </AdminButton>
              {onSupprimer ? (
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={onSupprimer}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  Supprimer
                </AdminButton>
              ) : null}
            </>
          ) : (
            <>
              <Link href={playHref}>
                <AdminButton type="button">Jouer</AdminButton>
              </Link>
              {onRetournerEnTest ? (
                <AdminButton
                  type="button"
                  variant="secondary"
                  onClick={onRetournerEnTest}
                >
                  Retourner en En cours de test
                </AdminButton>
              ) : null}
              <AdminButton
                type="button"
                variant="ghost"
                onClick={onRetournerEnCreation}
              >
                Retourner en Création
              </AdminButton>
            </>
          )}
        </div>
      </div>

      {history.length > 1 ? (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Historique des versions
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {history.map((h) => `V${h.version}`).join(", ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {history.map((h) => (
              <Link
                key={h.id}
                href={`/admin/book/${h.id}`}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium",
                  h.id === entry.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                V{h.version}
                {h.status === "live" ? " · Live" : ""}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
          Historique : V{entry.version}
        </p>
      )}
    </div>
  );
}

export function BookSection({
  title,
  subtitle,
  accent,
  children,
  emptyLabel,
  isEmpty,
}: {
  title: string;
  subtitle: string;
  accent: "sky" | "violet";
  children: ReactNode;
  emptyLabel: string;
  isEmpty: boolean;
}) {
  return (
    <section
      className={cn(
        "mb-10 rounded-2xl border-2 p-5 sm:p-6",
        accent === "sky"
          ? "border-sky-200 bg-sky-50/50"
          : "border-violet-200 bg-violet-50/50"
      )}
    >
      <h2
        className={cn(
          "text-base font-semibold",
          accent === "sky" ? "text-sky-950" : "text-violet-950"
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mt-1 text-sm leading-relaxed",
          accent === "sky" ? "text-sky-900/80" : "text-violet-900/80"
        )}
      >
        {subtitle}
      </p>
      <div className="mt-4 space-y-3">
        {isEmpty ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-500">
            {emptyLabel}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
