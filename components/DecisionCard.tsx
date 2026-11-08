"use client";

import { Button } from "@/components/ui/button";
import { exampleDecisions } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DecisionCard() {
  const {
    selectedDecisionId,
    setSelectedDecisionId,
    applyDecision,
    gameState,
  } = useGameStore();

  const selected =
    exampleDecisions.find((d) => d.id === selectedDecisionId) ??
    exampleDecisions[0];

  const categories = Array.from(
    new Set(exampleDecisions.map((d) => d.categorie))
  );

  return (
    <section className="view-enter grid h-full gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Décisions
        </p>
        {categories.map((cat) => (
          <div key={cat}>
            <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              {cat}
            </p>
            <div className="space-y-1.5">
              {exampleDecisions
                .filter((d) => d.categorie === cat)
                .map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDecisionId(d.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left transition",
                      selected.id === d.id
                        ? "border-accent/50 bg-accent/10"
                        : "border-white/10 bg-panel-2 hover:bg-white/5"
                    )}
                  >
                    <span className="block text-sm font-semibold text-foreground">
                      {d.titre}
                    </span>
                    <span className="text-[11px] text-muted">
                      {d.timeCostMinutes} min
                      {d.costEuros
                        ? ` · ${d.costEuros.toLocaleString("fr-FR")} €`
                        : ""}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </aside>

      <article className="reward-pop flex flex-col rounded-2xl border border-white/10 bg-panel p-6 shadow-soft">
        <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
          {selected.categorie}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          {selected.titre}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {selected.description}
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {selected.impacts.map((impact) => (
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
              <p className="mt-1 font-display text-sm font-semibold text-foreground">
                {impact.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
          <p className="text-xs text-muted">
            Coût temps : {selected.timeCostMinutes} min · XP : +
            {selected.xpReward ?? 0} · Cash :{" "}
            {gameState.tresorerie.toLocaleString("fr-FR")} €
          </p>
          <Button
            size="lg"
            className="cta-pulse"
            onClick={() => applyDecision(selected)}
          >
            Valider la décision
          </Button>
        </div>
      </article>
    </section>
  );
}
