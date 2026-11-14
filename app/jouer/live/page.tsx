"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  bookVersionLabel,
  listLiveBookEntriesForPlayers,
  type BookEntry,
} from "@/lib/bookStore";
import { ModeBadge } from "@/components/admin/BookEntryCard";

/**
 * Catalogue joueur des créations Book en Live uniquement.
 * Les entrées « En cours de test » n'apparaissent jamais ici.
 */
export default function JouerLiveBookPage() {
  const [entries, setEntries] = useState<BookEntry[]>([]);

  useEffect(() => {
    setEntries(listLiveBookEntriesForPlayers());
  }, []);

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/jouer"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Jouer
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Book Live
        </p>
        <h1 className="font-display text-3xl font-semibold">
          Créations disponibles
        </h1>
        <p className="mt-2 text-sm text-muted">
          Uniquement les versions passées en Live par l&apos;Admin. Mode
          Compétence ou Mode Histoire selon chaque scénario.
        </p>

        {entries.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted">
            Aucune création Live pour l&apos;instant.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {entries.map((e) => (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-card/40 p-5"
              >
                <p className="font-semibold">{bookVersionLabel(e)}</p>
                <p className="mt-1 text-sm text-muted">
                  Secteur : {e.secteur || "—"}
                </p>
                {e.scenarios.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">Aucun scénario publié.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {e.scenarios.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          {s.nom} <ModeBadge mode={s.mode} />
                        </span>
                        <Link
                          href={
                            s.mode === "competence"
                              ? "/jouer/competence"
                              : "/jouer/histoire"
                          }
                          className="text-accent underline"
                        >
                          Jouer
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
