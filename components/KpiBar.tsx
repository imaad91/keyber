"use client";

import { CloudFog, Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatKpiValue } from "@/lib/engine";
import { kpiDefinitions } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function KpiBar() {
  const { gameState, setShowVisibilityPanel } = useGameStore();

  return (
    <div className="flex flex-wrap items-stretch gap-2 border-b border-white/10 bg-panel/80 px-4 py-3 backdrop-blur-md">
      {kpiDefinitions.map((kpi, index) => {
        const visibility = gameState.kpiVisibility[kpi.id] ?? "INCONNU";
        const raw = resolveRaw(kpi.id, gameState, kpi);

        const formatted = formatKpiValue(raw, kpi.format, visibility);

        return (
          <div
            key={kpi.id}
            className="kpi-tick reward-pop flex min-w-[110px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-panel-2 px-3 py-2 shadow-soft"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {kpi.label}
                </p>
                {formatted.unknown || formatted.estimated ? (
                  <CloudFog className="h-3 w-3 text-accent-warm" />
                ) : formatted.live ? (
                  <Radio className="h-3 w-3 text-ok" />
                ) : (
                  <Eye className="h-3 w-3 text-accent" />
                )}
              </div>
              <p
                className={cn(
                  "font-display text-lg font-semibold tabular-nums leading-tight",
                  formatted.unknown || formatted.estimated
                    ? "text-muted"
                    : "text-foreground"
                )}
              >
                {formatted.display}
                {kpi.unit && !formatted.unknown ? (
                  <span className="ml-1 text-xs font-medium text-muted">
                    {kpi.unit}
                  </span>
                ) : null}
              </p>
              {formatted.live ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-ok">
                  LIVE
                </span>
              ) : null}
            </div>
          </div>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        className="self-center"
        onClick={() => setShowVisibilityPanel(true)}
      >
        <Eye className="h-3.5 w-3.5" />
        Visibilité
      </Button>
    </div>
  );
}

function resolveRaw(
  id: string,
  gameState: ReturnType<typeof useGameStore>["gameState"],
  kpi: { estimatedValue: number; preciseValue: number }
) {
  const visibility = gameState.kpiVisibility[id] ?? "INCONNU";
  if (visibility === "INCONNU" || visibility === "ESTIME") {
    return kpi.estimatedValue;
  }
  switch (id) {
    case "tresorerie":
      return gameState.tresorerie;
    case "production":
      return gameState.production;
    case "moral":
      return gameState.moral;
    case "pieces":
      return gameState.piecesQualiteSemaine;
    case "rebut":
      return gameState.rebutRate;
    case "ethique":
      return gameState.ethique;
    default:
      return kpi.preciseValue;
  }
}
