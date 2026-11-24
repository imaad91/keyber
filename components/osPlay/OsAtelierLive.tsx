"use client";

/**
 * Vue Live Production OS — Clear Campus Phase 2.
 * Thème clair. Contenu = param.ProductionLive (sinon fallback ERP machines).
 */

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, Gauge, MapPin, Truck, X } from "lucide-react";
import {
  osProductionLiveViewModel,
  type OsProductionLiveViewNode,
} from "@/lib/keyberOs/productionLive";
import type { OsPlayState } from "@/lib/keyberOs";
import { CLEAR_CAMPUS_LIGHT_TOKENS } from "@/lib/clearCampus/charter";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  fog: boolean;
};

export function OsAtelierLive({ play, fog }: Props) {
  const visibility = play.visibilite?.level ?? play.visibilityLevel ?? 0;
  const detailed = !fog && visibility >= 2;
  const [selected, setSelected] = useState<OsProductionLiveViewNode | null>(
    null
  );

  const view = useMemo(() => osProductionLiveViewModel(play), [play]);
  const alarm =
    play.world?.alarmActive ||
    view.nodes.some((n) => /panne|alerte|fault/i.test(n.status));

  const typeLabel =
    view.valueType === "manufactured"
      ? "Bien manufacturé"
      : view.valueType === "logistics"
        ? "Flux logistique"
        : view.valueType === "service"
          ? "Production de service"
          : "Création de valeur";

  return (
    <section className="view-enter flex h-full flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.accent }}
          >
            Vue Live Production
          </p>
          <h2
            className="font-display text-2xl font-semibold"
            style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.text }}
          >
            {view.label}
          </h2>
          <p className="mt-1 text-sm" style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.textMuted }}>
            {typeLabel}
            {view.source === "erp-fallback" ? " · fallback ERP" : null}
            {view.source === "empty" ? " · param vide" : null}
            {" · "}
            {fog
              ? "Brouillard actif"
              : detailed
                ? "Visibilité détaillée"
                : "Vue de base"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(view.kpis.length > 0
            ? view.kpis.slice(0, 3)
            : [
                { id: "n", label: "Nœuds", value: String(view.nodes.length) },
                { id: "z", label: "Zones", value: String(view.zones.length) },
              ]
          ).map((k) => (
            <StatChip
              key={k.id}
              icon={k.id.includes("panne") ? AlertTriangle : Gauge}
              label={k.label}
              value={fog ? "???" : k.value}
            />
          ))}
          {view.vehicles.length > 0 ? (
            <StatChip
              icon={Truck}
              label="Véhicules"
              value={fog ? "???" : String(view.vehicles.length)}
            />
          ) : null}
        </div>
      </header>

      {view.zones.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {view.zones.map((z) => (
            <span
              key={z.id}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
            >
              <MapPin className="h-3 w-3 text-teal-700" />
              {z.label}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "relative min-h-[420px] flex-1 overflow-hidden rounded-2xl border shadow-sm",
          alarm
            ? "border-rose-300 bg-rose-50"
            : "border-slate-200 bg-slate-50"
        )}
      >
        {alarm ? (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Alerte production
          </div>
        ) : null}

        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgba(13,148,136,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Flux simplifiés */}
        {view.flows.slice(0, 8).map((f, i) => (
          <div
            key={f.id}
            className="pointer-events-none absolute left-[10%] right-[10%] h-1 rounded-full bg-teal-200/80"
            style={{ top: `${28 + i * 8}%` }}
            title={f.label || f.id}
          />
        ))}

        {view.operators.map((op, i) => (
          <span
            key={op.id}
            className="absolute h-2.5 w-2.5 rounded-full bg-teal-500 shadow-sm"
            style={{
              left: `${22 + (i % 5) * 12}%`,
              top: `${34 + Math.floor(i / 5) * 18}%`,
            }}
            title={op.label}
          />
        ))}

        {view.nodes.map((node) => {
          const bad = /panne|alerte|fault|stop|arrêt|arret/i.test(node.status);
          const ok = /ok|prod|marche|run/i.test(node.status);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelected(node)}
              className={cn(
                "absolute flex w-[148px] flex-col items-start rounded-xl border px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5",
                bad && "border-rose-300 bg-rose-50 text-rose-800",
                !bad && ok && "border-emerald-300 bg-emerald-50 text-emerald-900",
                !bad && !ok && "border-slate-200 bg-white text-slate-700"
              )}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {fog ? "???" : node.status}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {node.label}
              </span>
              {detailed ? (
                <span className="mt-0.5 text-[11px] text-slate-500">
                  {node.kind}
                </span>
              ) : null}
            </button>
          );
        })}

        {view.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-slate-500">
            Aucun nœud Production Live dans le param — renseigne{" "}
            <code className="mx-1 text-xs">ProductionLive</code> (ou machines ERP).
          </div>
        ) : null}

        {selected ? (
          <div className="absolute bottom-4 right-4 w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Détail
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {selected.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Statut</dt>
                <dd className="font-medium text-slate-900">
                  {fog ? "???" : selected.status}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium text-slate-900">{selected.kind}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Zone</dt>
                <dd className="font-medium text-slate-900">{selected.zoneId}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </div>

      {view.vehicles.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <Activity className="h-3.5 w-3.5 text-teal-700" />
          {view.vehicles.map((v) => (
            <span
              key={v.id}
              className="rounded-md border border-slate-200 bg-white px-2 py-1"
            >
              {v.label}
              {v.zoneId ? ` · ${v.zoneId}` : ""}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Icon className="h-4 w-4 text-teal-700" />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
