"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Handshake,
  Package,
  Siren,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trainingForCompetence } from "@/data/trainings";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import { skills } from "@/lib/mock";
import { startCompetenceTraining, useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Handshake,
  Siren,
  Users,
  Package,
  Eye,
};

export default function JouerCompetencePage() {
  const { gameState } = useGameStore();

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
              Même progression que le Mode Histoire. Un entraînement = une
              décision, 10–15 min. Monte de niveau pour débloquer des choix
              d&apos;histoire.
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => {
            const Icon = ICONS[skill.icone] ?? Package;
            const progress = gameState.skillProgress[skill.id] ?? {
              niveau: skill.niveau,
              xp: skill.xp,
            };
            const training = trainingForCompetence(skill.id);
            const pct = Math.round(
              (progress.xp / XP_PER_SKILL_LEVEL) * 100
            );
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
                    <p className="text-xs text-muted">
                      Niveau {progress.niveau}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {skill.description}
                </p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-muted">
                    <span>XP compétence</span>
                    <span>
                      {progress.xp}/{XP_PER_SKILL_LEVEL}
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
                    Dispo : {training.titre} · ~{training.dureeMin} min
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
      </div>
    </div>
  );
}
