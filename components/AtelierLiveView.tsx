"use client";

import { useState } from "react";
import { Activity, AlertTriangle, Gauge, Wrench, X } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Machine } from "@/lib/types";

export function AtelierLiveView() {
  const { gameState } = useGameStore();
  const [selected, setSelected] = useState<Machine | null>(null);
  const detailed = gameState.visibilityLevel >= 2;

  return (
    <section className="view-enter flex h-full flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Atelier Live
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Vue 2D de l&apos;atelier
          </h2>
          <p className="mt-1 text-sm text-muted">
            {detailed
              ? "Capteurs IoT actifs — données détaillées."
              : "Vue de base. Investissez en Capteurs IoT pour le détail."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatChip
            icon={Gauge}
            label="Vitesse"
            value={`${Math.round(gameState.vitesseProduction)} u/h`}
          />
          <StatChip
            icon={Activity}
            label="Pièces aujourd'hui"
            value={`${gameState.piecesAujourdhui}`}
          />
          <StatChip
            icon={AlertTriangle}
            label="Taux panne"
            value={`${gameState.tauxPanne.toFixed(1)}%`}
            danger={gameState.tauxPanne > 10}
          />
        </div>
      </header>

      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1422] shadow-soft">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(61,214,198,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,198,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Conveyor belt */}
        <div className="absolute left-[8%] right-[8%] top-[48%] h-10 overflow-hidden rounded-full border border-white/10 conveyor-belt opacity-90">
          <div className="conveyor-parts absolute inset-y-1 flex items-center gap-8 pl-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="h-5 w-5 shrink-0 rounded-sm bg-accent-warm/90 shadow-[0_0_10px_rgba(240,160,90,0.5)]"
              />
            ))}
          </div>
        </div>

        {/* Operators */}
        {detailed ? (
          <>
            <span className="operator-dot absolute left-[28%] top-[38%] h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.8)]" />
            <span className="operator-dot absolute left-[55%] top-[55%] h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.8)]" />
            <span className="operator-dot absolute left-[40%] top-[70%] h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
          </>
        ) : null}

        {gameState.machines.map((machine) => (
          <button
            key={machine.id}
            type="button"
            onClick={() => setSelected(machine)}
            className={cn(
              "absolute flex w-[140px] flex-col items-start rounded-xl border px-3 py-2 text-left shadow-soft transition hover:-translate-y-0.5",
              machine.etat === "PRODUCTION" &&
                "machine-prod border-ok/50 bg-ok/20 text-ok",
              machine.etat === "PANNE" &&
                "machine-fault border-danger/60 bg-danger/25 text-danger",
              machine.etat === "ARRET" &&
                "border-white/20 bg-white/10 text-muted"
            )}
            style={{ left: `${machine.x}%`, top: `${machine.y}%` }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {machine.etat}
            </span>
            <span className="font-display text-sm font-semibold text-foreground">
              {machine.nom}
            </span>
            {detailed ? (
              <span className="mt-0.5 text-[11px] text-foreground/70">
                {machine.production} u/h
              </span>
            ) : null}
          </button>
        ))}

        {selected ? (
          <div className="absolute bottom-4 right-4 w-[280px] reward-pop rounded-2xl border border-white/15 bg-panel p-4 shadow-soft">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Détail machine
                </p>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {selected.nom}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md p-1 text-muted hover:bg-white/10 hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="État" value={selected.etat} />
              <Row
                label="Production"
                value={
                  detailed ? `${selected.production} u/h` : "Visibilité limitée"
                }
              />
              <Row
                label="Prochaine maintenance"
                value={selected.nextMaintenance}
                icon={Wrench}
              />
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  danger,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2",
        danger
          ? "border-danger/40 bg-danger/10"
          : "border-white/10 bg-panel-2"
      )}
    >
      <Icon className={cn("h-4 w-4", danger ? "text-danger" : "text-accent")} />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
        <p className="font-display text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Wrench;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-muted">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
