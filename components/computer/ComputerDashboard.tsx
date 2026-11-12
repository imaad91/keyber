"use client";

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
import { dashboardSeries } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

export function ComputerDashboard() {
  const { gameState } = useGameStore();
  const fog = !gameState.sensorInstalled && gameState.visibilityLevel < 2;
  const advanced = gameState.visibilityLevel >= 3;

  const series = fog
    ? dashboardSeries.map((d) => ({
        ...d,
        prod: 0,
        panne: 0,
      }))
    : dashboardSeries;

  return (
    <div className="space-y-4 bg-white p-4 text-slate-900">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Dashboard opérationnel
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Production & pannes
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {fog
            ? "Données indisponibles — Visibilité : Aucune. Graphiques masqués jusqu'au capteur."
            : advanced
              ? "Mode avancé — prédictions débloquées."
              : "Graphiques hebdomadaires Novacier."}
        </p>
      </header>

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
            Pannes {advanced && !fog ? "+ tendance" : fog ? "(???)" : ""}
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
