"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  Eye,
  Factory,
  Handshake,
  ListOrdered,
  MessagesSquare,
  Package,
  Siren,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trainingForCompetence } from "@/data/trainings";
import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
  type CompetenceType,
} from "@/lib/competences";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import { startCompetenceTraining, useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Handshake,
  Siren,
  Users,
  Eye,
  MessagesSquare,
  ListOrdered,
  CalendarRange,
  Package,
  Wrench,
  BadgeCheck,
  Factory,
};

export default function JouerCompetencePage() {
  const { gameState } = useGameStore();
  const [typeFilter, setTypeFilter] = useState<CompetenceType | null>(null);

  const list = useMemo(() => {
    if (typeFilter === "generale") return COMPETENCES_GENERALES;
    if (typeFilter === "ciblee") return COMPETENCES_CIBLEES_PROD;
    return [];
  }, [typeFilter]);

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Mode Compétence
            </p>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">
              Entraînements
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Choisis d&apos;abord le type (Générale ou Ciblée), puis la
              compétence précise. Même progression que le Mode Histoire.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3 text-sm">
            <p className="text-muted">Niveau global</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {gameState.level}{" "}
              <span className="text-sm font-normal text-accent">
                · {gameState.xp} XP
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={typeFilter === "generale" ? "default" : "outline"}
            onClick={() => setTypeFilter("generale")}
          >
            Générale
          </Button>
          <Button
            variant={typeFilter === "ciblee" ? "default" : "outline"}
            onClick={() => setTypeFilter("ciblee")}
          >
            Ciblée — Responsable de Production
          </Button>
          {typeFilter ? (
            <Button variant="ghost" onClick={() => setTypeFilter(null)}>
              Réinitialiser
            </Button>
          ) : null}
        </div>

        {!typeFilter ? (
          <p className="text-sm text-muted">
            Sélectionne un type pour afficher les compétences disponibles.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((skill, i) => {
              const Icon = ICONS[skill.id] ?? Package;
              const progress =
                skill.type === "generale"
                  ? gameState.competencesGenerales[skill.id]
                  : gameState.competencesCiblees[skill.id];
              const niveau = progress?.niveau ?? 1;
              const xp = progress?.xp ?? 0;
              const training = trainingForCompetence(skill.id);
              const pct = Math.round((xp / XP_PER_SKILL_LEVEL) * 100);
              return (
                <article
                  key={skill.id}
                  className={cn(
                    "value-enter flex flex-col rounded-2xl border border-white/10 bg-panel p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
                  )}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {skill.nom}
                      </h2>
                      <p className="text-xs text-muted">Niveau {niveau}/5</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {skill.descriptionPrecise}
                  </p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-[11px] text-muted">
                      <span>XP compétence</span>
                      <span>
                        {xp}/{XP_PER_SKILL_LEVEL}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                  {training ? (
                    <p className="mt-3 text-[11px] text-muted">
                      {training.titre} · ~{training.dureeMin} min
                    </p>
                  ) : null}
                  <div className="mt-auto pt-4">
                    <Button asChild className="w-full">
                      <Link
                        href={`/jouer/competence/${skill.id}`}
                        onClick={() => startCompetenceTraining(skill.id)}
                      >
                        S&apos;entraîner
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
