"use client";

/**
 * Barre KPI OS — chrome exact KpiBar (Étape 9).
 * Définitions = play.kpis ; pastilles INCONNU / ESTIMÉ / TEMPS_REEL.
 */

import { useState } from "react";
import { CloudFog, Eye, Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  osKpiBarItems,
  osVisibiliteInstallSensor,
  type OsPlayState,
} from "@/lib/keyberOs";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

const INVESTMENTS = [
  {
    level: 1,
    label: "Reporting basique",
    description: "Estimations arrondies sur les jauges principales.",
    cost: 5_000,
  },
  {
    level: 2,
    label: "Capteur atelier",
    description: "Lève le brouillard ERP / dashboard / KPI finance.",
    cost: 25_000,
  },
  {
    level: 3,
    label: "Temps réel",
    description: "Pastilles LIVE — pilotage minute par minute.",
    cost: 80_000,
  },
] as const;

export function OsKpiBar({ play, setPlay }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const items = osKpiBarItems(play);
  const level = play.visibilite?.level ?? play.visibilityLevel ?? 0;
  const sensor =
    play.visibilite?.sensorInstalled ?? play.sensorInstalled ?? false;

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-2 border-b border-white/10 bg-panel/80 px-4 py-3 backdrop-blur-md">
        {items.map((kpi, index) => (
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

      {panelOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="reward-pop w-full max-w-lg rounded-2xl border border-white/15 bg-panel p-5 shadow-soft">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  <Eye className="h-3.5 w-3.5" />
                  Visibilité des données
                </p>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Investir pour y voir clair
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Niveau actuel : {level} / 3
                  {sensor ? " · Capteur OK" : " · Capteur absent"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-md p-1 text-muted hover:bg-white/10"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {INVESTMENTS.map((inv) => {
                const owned =
                  inv.level === 2
                    ? sensor
                    : level >= inv.level || (inv.level === 3 && sensor && level >= 3);
                return (
                  <div
                    key={inv.level}
                    className={cn(
                      "rounded-xl border p-4",
                      owned
                        ? "border-ok/40 bg-ok/10"
                        : "border-white/10 bg-panel-2"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Niveau {inv.level}
                        </p>
                        <h3 className="font-display text-base font-semibold">
                          {inv.label}
                        </h3>
                        <p className="mt-1 text-xs text-muted">
                          {inv.description}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-accent-warm">
                          {inv.cost.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                      {owned ? (
                        <span className="text-xs font-bold text-ok">Actif</span>
                      ) : inv.level === 2 ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setPlay(osVisibiliteInstallSensor(play));
                            setPanelOpen(false);
                          }}
                        >
                          Installer
                        </Button>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase text-muted">
                          Via décisions
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
