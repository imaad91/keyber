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

export function DashboardView() {
  const { gameState } = useGameStore();
  const advanced = gameState.visibilityLevel >= 3;

  return (
    <section className="view-enter flex h-full flex-col gap-4">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Dashboard
        </p>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Pilotage opérationnel
        </h2>
        <p className="mt-1 text-sm text-muted">
          {advanced
            ? "Mode avancé — prédictions débloquées (ERP + Analyste)."
            : "Graphiques d'exemple. Niveau 3 de visibilité pour les prédictions."}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-panel p-4 shadow-soft">
          <p className="mb-3 text-sm font-medium text-muted">Production hebdo</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243552" />
                <XAxis dataKey="name" tick={{ fill: "#8aa0b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8aa0b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#121c2e",
                    border: "1px solid #243552",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="prod" fill="#3dd6c6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-panel p-4 shadow-soft">
          <p className="mb-3 text-sm font-medium text-muted">
            Pannes {advanced ? "+ tendance" : ""}
          </p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243552" />
                <XAxis dataKey="name" tick={{ fill: "#8aa0b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8aa0b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#121c2e",
                    border: "1px solid #243552",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="panne"
                  stroke="#f07178"
                  strokeWidth={2}
                  name="Pannes %"
                />
                {advanced ? (
                  <Line
                    type="monotone"
                    dataKey="prod"
                    stroke="#f0a05a"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    name="Signal prod"
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
