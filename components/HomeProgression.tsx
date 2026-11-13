"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Brain, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skills } from "@/lib/mock";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import {
  getMostRecentSave,
  loadProgressionLocale,
} from "@/lib/saveStore";
import {
  formatClockSave,
  formatRelativeSave,
  type Sauvegarde,
} from "@/lib/sauvegarde";
import {
  ensureActiveSlot,
  loadGameFromSave,
  startNewGameInSlot,
  useGameStore,
} from "@/lib/store";

export function HomeProgression() {
  const router = useRouter();
  const { gameState } = useGameStore();
  const [resume, setResume] = useState<Sauvegarde | null>(null);
  const [skillBars, setSkillBars] = useState(gameState.skillProgress);

  useEffect(() => {
    setResume(getMostRecentSave());
    const p = loadProgressionLocale();
    if (Object.keys(p.competences).length) {
      setSkillBars(p.competences);
    }
  }, []);

  function onResume() {
    if (!resume) return;
    ensureActiveSlot(resume.slot);
    loadGameFromSave(resume.gameState, resume.slot);
    router.push(
      resume.mode === "competence"
        ? "/jouer/competence"
        : resume.gameState.world?.introSeen
          ? "/play"
          : "/intro"
    );
  }

  function onNouvelle() {
    const slot = ensureActiveSlot(resume?.slot ?? 1);
    if (
      resume &&
      !window.confirm(
        "Démarrer une nouvelle partie sur ce slot ? Les compétences globales sont conservées."
      )
    ) {
      return;
    }
    startNewGameInSlot(slot);
    router.push("/jouer");
  }

  const scenarioLabel =
    resume?.mode === "competence"
      ? "Compétence"
      : resume?.scenarioId?.includes("novacier")
        ? "Novacier"
        : resume?.scenarioId ?? "Partie";

  return (
    <section className="hero-enter max-w-3xl">
      <p className="font-display text-5xl font-semibold tracking-tight text-accent md:text-7xl">
        KEYBER
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
        Prends les commandes.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
        Une seule progression, deux façons de jouer. Sauvegarde auto à chaque
        décision — tu ne perds jamais ta partie.
      </p>

      {resume ? (
        <div className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Partie en cours
          </p>
          <p className="mt-1 font-display text-lg font-semibold">
            Reprendre la partie en cours ? {scenarioLabel} — Jour{" "}
            {resume.jourActuel} — {formatClockSave(resume.dateDerniereSauvegarde)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Slot {resume.slot} · {resume.pourcentageProgression}% ·{" "}
            {formatRelativeSave(resume.dateDerniereSauvegarde)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={onResume}>Reprendre</Button>
            <Button variant="outline" onClick={onNouvelle}>
              Nouvelle partie
            </Button>
            <Button asChild variant="ghost">
              <Link href="/jouer">Voir les 3 slots</Link>
            </Button>
          </div>
        </div>
      ) : null}

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
            const p = skillBars[skill.id] ??
              gameState.skillProgress?.[skill.id] ?? {
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild variant="default" size="lg" className="cta-pulse">
          <Link href="/jouer" onClick={() => ensureActiveSlot()}>
            <Save className="h-4 w-4" />
            Slots / Jouer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link
            href="/jouer/competence"
            onClick={() => ensureActiveSlot()}
          >
            <Brain className="h-4 w-4" />
            Mode Compétence
          </Link>
        </Button>
        <Button asChild variant="accent" size="lg">
          <Link href="/jouer/histoire" onClick={() => ensureActiveSlot()}>
            <BookOpen className="h-4 w-4" />
            Mode Histoire
          </Link>
        </Button>
      </div>
    </section>
  );
}
