"use client";

/**
 * Panneau Visibilité OS — feeling VisibilityPanel POC (Étape 18).
 * Investissements + matrice tiers + inventaire capteurs param.
 */

import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OS_VISIBILITY_MATRIX,
  osVisibiliteInstallSensor,
  osVisibiliteInvest,
  osVisibiliteInvestments,
  osVisibiliteSensors,
  type OsPlayState,
} from "@/lib/keyberOs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
  open: boolean;
  onClose: () => void;
};

export function OsVisibilityPanel({ play, setPlay, open, onClose }: Props) {
  const { config } = useKeyberOsRuntime();
  if (!open) return null;
  if (!config.visibilite?.enabled) return null;

  const level = play.visibilite?.level ?? play.visibilityLevel ?? 0;
  const sensor =
    play.visibilite?.sensorInstalled ?? play.sensorInstalled ?? false;
  const investments = osVisibiliteInvestments();
  const sensors = osVisibiliteSensors(play);
  const showMatrix = config.visibilite.showMatrix !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="reward-pop max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-panel p-5 shadow-soft">
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
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showMatrix ? (
          <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
            <p className="border-b border-slate-200 bg-panel-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              Matrice des tiers
            </p>
            <table className="w-full text-left text-[11px]">
              <thead className="text-muted">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-1.5 font-semibold">Tier</th>
                  <th className="px-3 py-1.5 font-semibold">ERP</th>
                  <th className="px-3 py-1.5 font-semibold">KPI</th>
                </tr>
              </thead>
              <tbody>
                {OS_VISIBILITY_MATRIX.map((row) => (
                  <tr
                    key={row.tier}
                    className={cn(
                      "border-b border-slate-100",
                      level === row.tier && "bg-accent/10"
                    )}
                  >
                    <td className="px-3 py-1.5">
                      <span className="font-semibold text-foreground">
                        {row.tier} · {row.label}
                      </span>
                      <span className="mt-0.5 block text-muted">
                        {row.meaning}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-muted">{row.erp}</td>
                    <td className="px-3 py-1.5 text-muted">{row.kpi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Investissements
          </p>
          {investments.map((inv) => {
            const owned =
              inv.level === 2
                ? sensor
                : level >= inv.level ||
                  (inv.level === 3 && sensor && level >= 3);
            return (
              <div
                key={inv.level}
                className={cn(
                  "rounded-xl border p-4",
                  owned ? "border-ok/40 bg-ok/10" : "border-slate-200 bg-panel-2"
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
                    <p className="mt-1 text-xs text-muted">{inv.description}</p>
                    <p className="mt-2 text-sm font-semibold text-accent-warm">
                      {inv.cost.toLocaleString("fr-FR")} €
                    </p>
                  </div>
                  {owned ? (
                    <span className="text-xs font-bold text-ok">Actif</span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPlay(osVisibiliteInvest(play, inv.level));
                        if (inv.level >= 2) onClose();
                      }}
                    >
                      {inv.level === 2 ? "Installer" : "Acheter"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            Inventaire capteurs
          </p>
          {sensors.map((s) => (
            <div
              key={s.id}
              className={cn(
                "rounded-xl border p-4",
                s.installed
                  ? "border-ok/40 bg-ok/10"
                  : "border-slate-200 bg-panel-2"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted">{s.description}</p>
                  <p className="mt-2 text-[11px] text-muted">
                    Unlock niv. {s.unlockLevel}
                    {s.modules?.length
                      ? ` · ${s.modules.length} module(s)`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-accent-warm">
                    {s.cost.toLocaleString("fr-FR")} €
                  </p>
                </div>
                {s.installed ? (
                  <span className="text-xs font-bold text-ok">Installé</span>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setPlay(osVisibiliteInstallSensor(play, s.id));
                      onClose();
                    }}
                  >
                    Installer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
