"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EXAMPLE_DATA = [
  { name: "S1", valeur: 42 },
  { name: "S2", valeur: 58 },
  { name: "S3", valeur: 51 },
  { name: "S4", valeur: 67 },
  { name: "S5", valeur: 62 },
];

type DashboardViewProps = {
  title?: string;
};

export function DashboardView({
  title = "Tableau de bord",
}: DashboardViewProps) {
  return (
    <section className="view-enter flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Dashboard
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Graphique d&apos;exemple — données fictives.
        </p>
      </header>

      <div className="flex min-h-[280px] flex-1 flex-col rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-medium text-slate-600">
          Indicateur exemple
        </p>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EXAMPLE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="valeur" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
