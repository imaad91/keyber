"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skills } from "@/lib/mock";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import { useGameStore } from "@/lib/store";

export function HomeProgression() {
  const { gameState } = useGameStore();

  return (
    <section className="hero-enter max-w-3xl">
      <p className="font-display text-5xl font-semibold tracking-tight text-accent md:text-7xl">
        KEYBER
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        Prends les commandes.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        Une seule progression, deux façons de jouer. Entraîne-toi en Mode
        Compétence, puis débloque des choix en Mode Histoire.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-panel/80 p-5 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Progression unique
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              Niveau {gameState.level}
            </p>
          </div>
          <p className="text-sm tabular-nums text-muted">
            XP total{" "}
            <span className="font-semibold text-accent">{gameState.xp}</span> /
            500
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {skills.map((skill) => {
            const p = gameState.skillProgress[skill.id] ?? {
              niveau: 1,
              xp: 0,
            };
            return (
              <div
                key={skill.id}
                className="rounded-lg border border-white/10 bg-panel-2 px-3 py-2"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{skill.nom}</span>
                  <span className="text-muted">Niv. {p.niveau}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.min(100, (p.xp / XP_PER_SKILL_LEVEL) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="default" size="lg" className="cta-pulse">
          <Link href="/jouer/competence">
            <Brain className="h-4 w-4" />
            Mode Compétence
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="accent" size="lg">
          <Link href="/jouer/histoire">
            <BookOpen className="h-4 w-4" />
            Mode Histoire
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
