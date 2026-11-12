"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyzeSeries } from "@/lib/mock";

export function AnalyzeView() {
  return (
    <section className="view-enter flex h-full flex-col gap-4">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Analyse
        </p>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Comparaison de périodes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Semaine en cours vs semaine précédente (données d&apos;exemple).
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-panel p-5 shadow-soft">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyzeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243552" />
              <XAxis dataKey="periode" tick={{ fill: "#8aa0b8", fontSize: 12 }} />
              <YAxis tick={{ fill: "#8aa0b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#121c2e",
                  border: "1px solid #243552",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="actuel" name="Actuel" fill="#3dd6c6" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="precedent"
                name="Précédent"
                fill="#243552"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
