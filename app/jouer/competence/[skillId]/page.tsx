"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  trainingForCompetence,
  trainingHeadline,
} from "@/data/trainings";
import { getCompetenceDef } from "@/lib/competences";
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
  const skill = getCompetenceDef(skillId);
  const training = trainingForCompetence(skillId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const progress =
    skill?.type === "ciblee"
      ? gameState.competencesCiblees[skillId]
      : gameState.competencesGenerales[skillId];
  const niveau = progress?.niveau ?? 1;
  const xp = progress?.xp ?? 0;

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

  const headline = trainingHeadline(skillId, niveau);

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
          Mode Compétence
        </p>
        <h1 className="font-display text-2xl font-semibold md:text-3xl">
          {headline}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {skill.descriptionPrecise}
        </p>
        <p className="mt-1 text-sm text-muted">
          {xp}/{XP_PER_SKILL_LEVEL} XP · ~{training.dureeMin} min
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
                  <div className="w-full space-y-2 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Débrief compétences
                    </p>
                    {(gameState.lastSkillDebrief.length
                      ? gameState.lastSkillDebrief
                      : [gameState.feedbackFlash ?? ""]
                    ).map((line) => (
                      <p key={line} className="leading-relaxed text-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
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
