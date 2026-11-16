"use client";

/**
 * Atelier Live OS — chrome exact AtelierLiveView (Étape 7).
 * Machines / stats depuis play.computer + finance / world. Aucun useGameStore.
 */

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Gauge, Wrench, X } from "lucide-react";
import type { MachineRow } from "@/lib/computerTypes";
import type { OsPlayState } from "@/lib/keyberOs";
import type { MachineEtat } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  fog: boolean;
};

type LiveMachine = {
  id: string;
  nom: string;
  etat: MachineEtat;
  production: number;
  nextMaintenance: string;
  x: number;
  y: number;
};

const LAYOUT: { x: number; y: number }[] = [
  { x: 12, y: 22 },
  { x: 55, y: 18 },
  { x: 18, y: 58 },
  { x: 62, y: 55 },
  { x: 38, y: 38 },
  { x: 72, y: 70 },
];

function normalizeEtat(raw: string): MachineEtat {
  const u = raw.toUpperCase();
  if (u.includes("PANNE") || u.includes("FAULT")) return "PANNE";
  if (
    u.includes("ARRET") ||
    u.includes("ARRÊT") ||
    u.includes("STOP") ||
    u.includes("OFF")
  ) {
    return "ARRET";
  }
  return "PRODUCTION";
}

function parseProd(vitesse: string, fallback: number): number {
  const n = Number(String(vitesse).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toLiveMachines(
  rows: MachineRow[],
  fallbackProd: number
): LiveMachine[] {
  return rows.map((m, i) => {
    const layout = LAYOUT[i % LAYOUT.length]!;
    return {
      id: `os-m-${i}`,
      nom: m.nom,
      etat: normalizeEtat(m.etat),
      production: parseProd(m.vitesse, fallbackProd),
      nextMaintenance: m.prochaineMaint,
      x: layout.x,
      y: layout.y,
    };
  });
}

export function OsAtelierLive({ play, fog }: Props) {
  const visibility =
    play.visibilite?.level ?? play.visibilityLevel ?? 0;
  const detailed = !fog && visibility >= 2;
  const [selected, setSelected] = useState<LiveMachine | null>(null);

  const fallbackProd = Math.max(
    20,
    Math.round(
      (play.finance?.productionParJour ?? play.production ?? 60) /
        Math.max(1, play.computer.machines.length)
    )
  );

  const machines = useMemo(
    () => toLiveMachines(play.computer.machines, fallbackProd),
    [play.computer.machines, fallbackProd]
  );

  const vitesse =
    play.finance?.productionParJour ?? play.production ?? 0;
  const pieces =
    play.finance?.piecesAujourdhui ??
    play.computer.production[0]?.produitAujourdhui ??
    play.production ??
    0;
  const tauxPanne =
    play.flags?.tauxPanne ??
    (machines.some((m) => m.etat === "PANNE") ? 12 : 5);
  const alarm =
    play.world?.alarmActive || machines.some((m) => m.etat === "PANNE");

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
            {fog
              ? "Brouillard actif — données masquées jusqu'au capteur."
              : detailed
                ? "Capteurs IoT actifs — données détaillées."
                : "Vue de base. Investissez en Capteurs IoT pour le détail."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatChip
            icon={Gauge}
            label="Vitesse"
            value={fog ? "???" : `${Math.round(vitesse)} u/h`}
          />
          <StatChip
            icon={Activity}
            label="Pièces aujourd'hui"
            value={fog ? "???" : `${pieces}`}
          />
          <StatChip
            icon={AlertTriangle}
            label="Taux panne"
            value={fog ? "???" : `${Number(tauxPanne).toFixed(1)}%`}
            danger={!fog && Number(tauxPanne) > 10}
          />
        </div>
      </header>

      <div
        className={`relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border shadow-soft ${
          alarm
            ? "border-danger/60 bg-[#1a0a0c] ring-2 ring-danger/40"
            : "border-white/10 bg-[#0a1422]"
        }`}
      >
        {alarm ? (
          <div className="machine-fault absolute left-4 top-4 z-10 rounded-full bg-danger px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Alarme atelier
          </div>
        ) : null}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(61,214,198,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,198,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="conveyor-belt absolute left-[8%] right-[8%] top-[48%] h-10 overflow-hidden rounded-full border border-white/10 opacity-90">
          <div className="conveyor-parts absolute inset-y-1 flex items-center gap-8 pl-2">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="h-5 w-5 shrink-0 rounded-sm bg-accent-warm/90 shadow-[0_0_10px_rgba(240,160,90,0.5)]"
              />
            ))}
          </div>
        </div>

        {detailed ? (
          <>
            <span className="operator-dot absolute left-[28%] top-[38%] h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.8)]" />
            <span className="operator-dot absolute left-[55%] top-[55%] h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.8)]" />
            <span className="operator-dot absolute left-[40%] top-[70%] h-2.5 w-2.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
          </>
        ) : null}

        {machines.map((machine) => (
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
              {fog ? "???" : machine.etat}
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
          <div className="reward-pop absolute bottom-4 right-4 w-[280px] rounded-2xl border border-white/15 bg-panel p-4 shadow-soft">
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
              <Row label="État" value={fog ? "???" : selected.etat} />
              <Row
                label="Production"
                value={
                  fog
                    ? "???"
                    : detailed
                      ? `${selected.production} u/h`
                      : "Visibilité limitée"
                }
              />
              <Row
                label="Prochaine maintenance"
                value={fog ? "???" : selected.nextMaintenance}
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
