"use client";

/**
 * Dashboard Ordinateur OS — chrome exact ComputerDashboard (Étape 7).
 * Séries + fog depuis play.computer / visibilité. Aucun useGameStore.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OsPlayState } from "@/lib/keyberOs";

type Props = {
  play: OsPlayState;
  fog: boolean;
};

export function OsComputerDashboard({ play, fog }: Props) {
  const visibility =
    play.visibilite?.level ?? play.visibilityLevel ?? 0;
  const advanced = visibility >= 3 && !fog;

  const series = fog
    ? play.computer.dashboardSeries.map((d) => ({
        ...d,
        prod: 0,
        panne: 0,
      }))
    : play.computer.dashboardSeries;

  return (
    <div className="space-y-4 bg-white p-4 text-slate-900">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Dashboard opérationnel
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Production &amp; pannes
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {fog
            ? "Données indisponibles — Visibilité : Aucune. Graphiques masqués jusqu'au capteur."
            : advanced
              ? "Mode avancé — prédictions débloquées."
              : "Vue opérationnelle — production hebdo et tendance pannes."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {play.computer.dashboardCards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {c.label}
            </p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">
              {fog ? "???" : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-sm font-medium text-slate-600">
            Production hebdo {fog ? "(???)" : ""}
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="prod" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-sm font-medium text-slate-600">
            Pannes {advanced ? "+ tendance" : fog ? "(???)" : ""}
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="panne"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
