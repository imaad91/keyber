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
import { cn } from "@/lib/utils";

/**
 * Catalogue joueur Book Live — Scénarios et Histoires séparés.
 * Les entrées « En cours de test » n'apparaissent jamais ici.
 */
export default function JouerLiveBookPage() {
  const [entries, setEntries] = useState<BookEntry[]>([]);

  useEffect(() => {
    setEntries(listLiveBookEntriesForPlayers());
  }, []);

  const scenarios = entries.filter((e) => e.mode === "competence");
  const histoires = entries.filter((e) => e.mode === "histoire");

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
          Uniquement les versions Live. Scénarios (Compétence) et Histoires
          restent séparés.
        </p>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-sky-700">
            Scénarios — Entraînement Compétence
          </h2>
          <p className="mt-1 text-sm text-muted">
            Entraînement intensif sur une compétence précise.
          </p>
          {scenarios.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">
              Aucun scénario Live.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {scenarios.map((e) => (
                <div
                  key={e.id}
                  className={cn(
                    "rounded-2xl border border-sky-500/30 bg-card/40 p-5"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{bookVersionLabel(e)}</p>
                    <ModeBadge mode="competence" />
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Compétence :{" "}
                    {e.competenceName || e.competenceNames[0] || "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Entreprise : {e.entrepriseNom || "—"}
                  </p>
                  <Link
                    href={`/jouer/book/${e.id}`}
                    className="mt-3 inline-block text-accent underline"
                  >
                    Jouer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-violet-700">
            Histoires — Mode Histoire
          </h2>
          <p className="mt-1 text-sm text-muted">
            Mise en pratique. Rôle → Secteur → Entreprise → Histoire libre.
          </p>
          {histoires.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">
              Aucune histoire Live.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {histoires.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-violet-500/30 bg-card/40 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{bookVersionLabel(e)}</p>
                    <ModeBadge mode="histoire" />
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Rôle : {e.roleName || e.roleNames[0] || "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Secteur : {e.secteur || "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Entreprise : {e.entrepriseNom || "—"}
                  </p>
                  <Link
                    href={`/jouer/book/${e.id}`}
                    className="mt-3 inline-block text-accent underline"
                  >
                    Jouer
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
