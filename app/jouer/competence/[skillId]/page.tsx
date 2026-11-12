"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trainingForCompetence } from "@/data/trainings";
import { skills } from "@/lib/mock";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import {
  applyCompetenceTraining,
  startCompetenceTraining,
  useGameStore,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export default function CompetenceTrainingPage() {
  const { skillId } = useParams<{ skillId: string }>();
  const { gameState } = useGameStore();
  const skill = skills.find((s) => s.id === skillId);
  const training = trainingForCompetence(skillId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const progress = gameState.skillProgress[skillId] ?? {
    niveau: 1,
    xp: 0,
  };

  const decision = training?.decision;
  const selected = useMemo(() => {
    if (!decision) return null;
    return (
      decision.choix.find((c) => c.id === selectedId) ?? decision.choix[0]
    );
  }, [decision, selectedId]);

  if (!skill || !training || !decision || !selected) {
    return (
      <div className="min-h-screen atmosphere-play p-8 text-foreground">
        <p className="text-sm text-muted">
          Entraînement introuvable.{" "}
          <Link href="/jouer/competence" className="underline">
            Retour
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href="/jouer/competence"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Compétences
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Mode Compétence · {skill.nom}
        </p>
        <h1 className="font-display text-3xl font-semibold">{training.titre}</h1>
        <p className="mt-1 text-sm text-muted">
          Niveau {progress.niveau} · {progress.xp}/{XP_PER_SKILL_LEVEL} XP · ~
          {training.dureeMin} min
        </p>

        <section className="mt-8 grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-2">
            <p className="text-sm leading-relaxed text-muted">
              {decision.dilemme}
            </p>
            {decision.choix.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={done}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2.5 text-left transition",
                  (selectedId ?? decision.choix[0]!.id) === c.id
                    ? "border-accent/50 bg-accent/10"
                    : "border-white/10 bg-panel-2 hover:bg-white/5",
                  done && "opacity-70"
                )}
              >
                <span className="block text-sm font-semibold">{c.label}</span>
              </button>
            ))}
          </aside>

          <article className="rounded-2xl border border-white/10 bg-panel p-6 shadow-soft">
            <h2 className="font-display text-2xl font-semibold">
              {selected.label}
            </h2>
            <p className="mt-2 text-sm text-muted">{selected.description}</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {(selected.impacts ?? []).map((impact) => (
                <div
                  key={impact.label}
                  className={cn(
                    "rounded-xl border px-3 py-3",
                    impact.tone === "pos" && "border-ok/40 bg-ok/10",
                    impact.tone === "neg" && "border-danger/40 bg-danger/10",
                    impact.tone === "neu" && "border-white/10 bg-panel-2"
                  )}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    {impact.label}
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold">
                    {impact.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {!done ? (
                <Button
                  size="lg"
                  className="cta-pulse"
                  onClick={() => {
                    startCompetenceTraining(skillId);
                    applyCompetenceTraining(decision, selected.id);
                    setDone(true);
                  }}
                >
                  Valider l&apos;entraînement
                </Button>
              ) : (
                <>
                  <p className="w-full text-sm text-accent">
                    {gameState.feedbackFlash}
                  </p>
                  <Button asChild variant="accent">
                    <Link href="/jouer/competence">Retour compétences</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/jouer/histoire">Lancer Mode Histoire</Link>
                  </Button>
                </>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
