"use client";

import { Button } from "@/components/ui/button";
import { decisionForDay, dayTitles } from "@/data/scenarioNovacier";
import { choixDisponibles } from "@/lib/engine";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DecisionCard() {
  const {
    selectedDecisionId,
    setSelectedDecisionId,
    applyDecision,
    advanceDay,
    gameState,
    rawState,
  } = useGameStore();

  const day = Math.min(5, Math.max(1, gameState.day || 1));
  const decision = decisionForDay(day);
  const choix = decision
    ? choixDisponibles(rawState, decision)
    : [];

  const selected =
    choix.find((c) => c.id === selectedDecisionId) ?? choix[0];
  const already = Boolean(gameState.dayDecisionId);

  if (!decision || !selected) {
    return (
      <p className="text-sm text-muted">Aucune décision pour ce jour.</p>
    );
  }

  const timeCost =
    selected.consequences
      .filter((c) => c.cible === "temps")
      .reduce((s, c) => s + (c.mode === "set" ? 0 : c.valeur), 0) || 0;
  const cashCost = selected.consequences
    .filter((c) => c.cible === "tresorerie" && c.valeur < 0)
    .reduce((s, c) => s + Math.abs(c.valeur), 0);

  return (
    <section className="view-enter grid h-full gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-3 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          {dayTitles[day] ?? `Jour ${day}`}
        </p>
        <p className="text-sm leading-relaxed text-muted">{decision.dilemme}</p>
        <div className="space-y-1.5">
          {choix.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={already}
              onClick={() => setSelectedDecisionId(c.id)}
              className={cn(
                "w-full rounded-xl border px-3 py-2.5 text-left transition",
                selected.id === c.id
                  ? "border-accent/50 bg-accent/10"
                  : "border-white/10 bg-panel-2 hover:bg-white/5",
                already && gameState.dayDecisionId === c.id && "ring-1 ring-ok",
                already && "opacity-70"
              )}
            >
              <span className="block text-sm font-semibold text-foreground">
                {c.label}
              </span>
              <span className="text-[11px] text-muted">
                {timeCostFor(c)} min
                {cashFor(c)
                  ? ` · ${cashFor(c)!.toLocaleString("fr-FR")} €`
                  : ""}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <article className="reward-pop flex flex-col rounded-2xl border border-white/10 bg-panel p-6 shadow-soft">
        <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
          {decision.categorie ?? `Jour ${decision.jour}`}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">
          {selected.label}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {selected.description}
        </p>

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
              <p className="mt-1 font-display text-sm font-semibold text-foreground">
                {impact.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-8">
          <p className="text-xs text-muted">
            Qualité semaine : {gameState.piecesQualiteSemaine}/500 · Éthique :{" "}
            {gameState.ethique} · Cash :{" "}
            {gameState.tresorerie.toLocaleString("fr-FR")} €
            {cashCost ? ` · Coût choix ${cashCost.toLocaleString("fr-FR")} €` : ""}
            {timeCost ? ` · ${timeCost} min` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {!already ? (
              <Button
                size="lg"
                className="cta-pulse"
                onClick={() => applyDecision(decision, selected.id)}
              >
                Valider la décision
              </Button>
            ) : (
              <Button size="lg" variant="accent" onClick={() => advanceDay()}>
                {day >= 5 ? "Voir le débrief" : "Jour suivant"}
              </Button>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function timeCostFor(c: {
  consequences: { cible: string; valeur: number; mode?: string }[];
}) {
  return c.consequences
    .filter((x) => x.cible === "temps")
    .reduce((s, x) => s + (x.mode === "set" ? 0 : x.valeur), 0);
}

function cashFor(c: {
  consequences: { cible: string; valeur: number }[];
}) {
  const v = c.consequences
    .filter((x) => x.cible === "tresorerie" && x.valeur < 0)
    .reduce((s, x) => s + Math.abs(x.valeur), 0);
  return v || null;
}
