"use client";

import { useState } from "react";
import { examplePersonnages } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function InterviewView() {
  const { selectedPersonnageId, setSelectedPersonnageId } = useGameStore();
  const personnage =
    examplePersonnages.find((p) => p.id === selectedPersonnageId) ??
    examplePersonnages[0];
  const [activeQ, setActiveQ] = useState<string | null>(null);
  const answer = personnage.questions.find((q) => q.id === activeQ);

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
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {p.nom}
              </span>
              <span className="text-[11px] text-muted">{p.role}</span>
            </span>
          </button>
        ))}
      </aside>

      <div className="flex flex-col rounded-2xl border border-white/10 bg-panel p-5 shadow-soft">
        <div className="mb-4 flex items-start gap-3 border-b border-white/10 pb-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 font-display text-lg font-bold text-accent">
            {personnage.avatar}
          </span>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {personnage.nom}
            </h2>
            <p className="text-sm text-muted">{personnage.role}</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {personnage.bio}
            </p>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {personnage.questions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setActiveQ(q.id)}
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

        <div className="mt-auto rounded-xl border border-dashed border-white/15 bg-panel-2 p-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            Réponse
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            {answer?.reponse ??
              "Choisissez une question pour lancer le dialogue."}
          </p>
        </div>
      </div>
    </section>
  );
}
