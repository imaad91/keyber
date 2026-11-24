"use client";

/**
 * Barre KPI OS — chrome exact KpiBar (Étape 9).
 * Bouton Visibilité → OsVisibilityPanel (Étape 18).
 */

import { useState } from "react";
import { CloudFog, Eye, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { osKpiBarItems, type OsPlayState } from "@/lib/keyberOs";
import { cn } from "@/lib/utils";
import { OsVisibilityPanel } from "@/components/osPlay/OsVisibilityPanel";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

export function OsKpiBar({ play, setPlay }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const items = osKpiBarItems(play);

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-2 border-b border-slate-200 bg-panel/80 px-4 py-3 backdrop-blur-md">
        {items.map((kpi, index) => (
          <div
            key={kpi.id}
            className="kpi-tick reward-pop flex min-w-[110px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-panel-2 px-3 py-2 shadow-soft"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {kpi.label}
                </p>
                {kpi.unknown || kpi.estimated ? (
                  <CloudFog className="h-3 w-3 text-accent-warm" />
                ) : kpi.live ? (
                  <Radio className="h-3 w-3 text-ok" />
                ) : (
                  <Eye className="h-3 w-3 text-accent" />
                )}
              </div>
              <p
                className={cn(
                  "font-display text-lg font-semibold tabular-nums leading-tight",
                  kpi.unknown || kpi.estimated
                    ? "text-muted"
                    : "text-foreground"
                )}
              >
                {kpi.display}
                {kpi.unit && !kpi.unknown ? (
                  <span className="ml-1 text-xs font-medium text-muted">
                    {kpi.unit}
                  </span>
                ) : null}
              </p>
              {kpi.live ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-ok">
                  LIVE
                </span>
              ) : null}
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="self-center"
          onClick={() => setPanelOpen(true)}
        >
          <Eye className="h-3.5 w-3.5" />
          Visibilité
        </Button>
      </div>

      <OsVisibilityPanel
        play={play}
        setPlay={setPlay}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />
    </>
  );
}
