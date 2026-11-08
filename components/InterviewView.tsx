"use client";

import { useState } from "react";
import { examplePersonnages } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DialogueChoice } from "@/lib/types";

export function InterviewView() {
  const {
    selectedPersonnageId,
    setSelectedPersonnageId,
    gameState,
    applyDialogueChoice,
  } = useGameStore();
  const personnage =
    examplePersonnages.find((p) => p.id === selectedPersonnageId) ??
    examplePersonnages[0];
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const [lastChoice, setLastChoice] = useState<DialogueChoice | null>(null);
  const trust = gameState.relations[personnage.id] ?? personnage.relationConfiance;
  const question = personnage.questions.find((q) => q.id === activeQ);

  return (
    <section className="view-enter grid h-full gap-4 md:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Interview
        </p>
        {examplePersonnages.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelectedPersonnageId(p.id);
              setActiveQ(null);
              setLastChoice(null);
            }}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
              p.id === personnage.id
                ? "border-accent/40 bg-accent/10"
                : "border-white/10 bg-panel-2 hover:bg-white/5"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-mid font-display text-sm font-bold text-accent">
              {p.avatar}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {p.nom}
              </span>
              <span className="text-[11px] text-muted">{p.role}</span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full bg-accent"
                  style={{
                    width: `${gameState.relations[p.id] ?? p.relationConfiance}%`,
                  }}
                />
              </span>
            </span>
          </button>
        ))}
      </aside>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-panel p-5 shadow-soft">
        <div className="mb-4 flex items-start gap-3 border-b border-white/10 pb-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 font-display text-lg font-bold text-accent">
            {personnage.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {personnage.nom}
            </h2>
            <p className="text-sm text-muted">{personnage.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {personnage.bio}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-muted">
                <span>Confiance</span>
                <span>{trust}/100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${trust}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Questions
          </p>
          {personnage.questions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setActiveQ(q.id);
                setLastChoice(null);
              }}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition",
                activeQ === q.id
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-white/10 bg-panel-2 text-muted hover:text-foreground"
              )}
            >
              {q.texte}
            </button>
          ))}
        </div>

        {question ? (
          <div className="mb-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Tes réponses
            </p>
            {question.choices.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  applyDialogueChoice(personnage.id, c);
                  setLastChoice(c);
                }}
                className="w-full rounded-xl border border-accent/30 bg-accent/5 px-3 py-2.5 text-left text-sm font-medium text-foreground transition hover:bg-accent/15"
              >
                {c.texte}
                <span className="mt-1 block text-[11px] font-normal text-muted">
                  Confiance {c.confianceDelta >= 0 ? "+" : ""}
                  {c.confianceDelta}
                  {c.xp ? ` · +${c.xp} XP` : ""}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-auto rounded-xl border border-dashed border-white/15 bg-panel-2 p-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Réponse
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {lastChoice?.reponse ??
              "Choisis une question, puis une réponse pour faire évoluer la confiance."}
          </p>
          {lastChoice?.unlockInfo ? (
            <p className="mt-2 text-xs font-semibold text-accent-warm">
              Info débloquée : {lastChoice.unlockInfo}
            </p>
          ) : null}
          {gameState.unlockedInfos.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] text-muted">
              {gameState.unlockedInfos.map((info) => (
                <li key={info}>• {info}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
