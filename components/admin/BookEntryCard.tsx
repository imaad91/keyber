"use client";

import Link from "next/link";
import {
  bookStatusLabel,
  bookVersionLabel,
  isPlayerVisible,
  type BookEntry,
} from "@/lib/bookStore";
import { ATELIER_SCENARIO_MODE_LABELS } from "@/lib/atelierScenarioMode";
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
  onPasserEnLive,
  onRetirerDuLive,
  onRetournerEnCreation,
}: {
  entry: BookEntry;
  history: BookEntry[];
  onPasserEnLive?: () => void;
  onRetirerDuLive?: () => void;
  onRetournerEnCreation: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">
            {bookVersionLabel(entry)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-500">Secteur :</span>{" "}
            {entry.secteur || "—"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-500">
              Date de validation :
            </span>{" "}
            {formatDateFr(entry.validatedAt)}
            <span className="ml-1 text-xs text-slate-400">(Europe/Paris)</span>
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
                · Admin uniquement (invisible joueurs)
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/book/${entry.id}`}>
            <AdminButton variant="secondary" type="button">
              Voir
            </AdminButton>
          </Link>
          {entry.status === "en_test" && onPasserEnLive ? (
            <AdminButton type="button" onClick={onPasserEnLive}>
              Passer en Live
            </AdminButton>
          ) : null}
          {entry.status === "live" && onRetirerDuLive ? (
            <AdminButton
              type="button"
              variant="secondary"
              onClick={onRetirerDuLive}
            >
              Retirer du Live
            </AdminButton>
          ) : null}
          <AdminButton
            type="button"
            variant="ghost"
            onClick={onRetournerEnCreation}
          >
            Retourner en Création
          </AdminButton>
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Rôles sélectionnés
          </p>
          <p className="mt-1 text-slate-800">
            {entry.roleNames.length ? entry.roleNames.join(", ") : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Compétences sélectionnées
          </p>
          <p className="mt-1 text-slate-800">
            {entry.competenceNames.length
              ? entry.competenceNames.join(", ")
              : "—"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Scénarios validés
          </p>
          {entry.scenarios.length === 0 ? (
            <p className="mt-1 text-slate-500">—</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {entry.scenarios.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-800">{s.nom}</span>
                  <ModeBadge mode={s.mode} />
                  <span className="text-xs text-slate-400">
                    {ATELIER_SCENARIO_MODE_LABELS[s.mode]}
                  </span>
                </li>
              ))}
            </ul>
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
