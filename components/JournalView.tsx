"use client";

import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/store";

export function JournalView() {
  const { gameState } = useGameStore();

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/play"
              className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour au jeu
            </Link>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              <BookMarked className="h-3.5 w-3.5" />
              Journal de bord
            </p>
            <h1 className="font-display text-3xl font-semibold">
              Ton histoire chez Novacier
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/play">Continuer</Link>
          </Button>
        </div>

        {gameState.journal.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 bg-panel p-8 text-sm text-muted">
            Le journal se remplira au fil de tes choix, dialogues et décisions.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-accent/30 pl-6">
            {gameState.journal.map((entry) => (
              <li key={entry.id} className="view-enter relative">
                <span className="absolute -left-[1.7rem] top-2 h-3 w-3 rounded-full bg-accent shadow-glow" />
                <article className="rounded-2xl border border-white/10 bg-panel p-5 shadow-soft">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                    <span className="font-bold uppercase tracking-wider text-accent">
                      Jour {entry.day}
                    </span>
                    <span>·</span>
                    <span>{entry.at}</span>
                    {entry.xp > 0 ? (
                      <>
                        <span>·</span>
                        <span className="text-accent-warm">+{entry.xp} XP</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="font-display text-lg font-semibold">
                    {entry.titre}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {entry.narration}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
