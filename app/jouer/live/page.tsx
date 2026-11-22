"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Brain } from "lucide-react";
import { setAdminPlaySession } from "@/lib/playCatalog";
import { useBookStore } from "@/lib/bookStore";

/**
 * Hub Live Book — deux portes distinctes (Compétence ≠ Histoire).
 * Plus de liste plate commune.
 */
export default function JouerLiveHubPage() {
  const { syncPlayerCatalog } = useBookStore();

  useEffect(() => {
    syncPlayerCatalog();
    setAdminPlaySession(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Accueil
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Book Live
        </p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          Choisis ton mode
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Uniquement les versions Live avec fichier de paramétrage. Piloté par
          Keyber OS — pas d&apos;Atelier.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/jouer/live/competence"
            className="group flex flex-col rounded-3xl border border-sky-400/35 bg-sky-500/10 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-300/60 hover:bg-sky-500/15"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-200">
              <Brain className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-sky-100">
              Mode Compétence
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-sky-100/70">
              S&apos;entraîner sur une compétence. Parcours : compétence →
              scénario Live.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-200 group-hover:underline">
              Entrer
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/jouer/live/histoire"
            className="group flex flex-col rounded-3xl border border-violet-400/35 bg-violet-500/10 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-violet-300/60 hover:bg-violet-500/15"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-200">
              <BookOpen className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-violet-100">
              Mode Histoire
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-violet-100/70">
              Jouer une histoire. Parcours : rôle (Admin) → secteur (Création)
              → entreprise → histoire.
            </p>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-violet-200 group-hover:underline">
              Entrer
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
