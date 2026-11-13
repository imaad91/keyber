"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { skillEvolution } from "@/lib/mock";

export function ProgressionChart() {
  return (
    <div className="h-[260px] w-full rounded-2xl border border-white/10 bg-panel-2 p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">
        Évolution des compétences
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={skillEvolution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#243552" />
          <XAxis dataKey="mois" tick={{ fill: "#8aa0b8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#8aa0b8", fontSize: 12 }} domain={[0, 5]} />
          <Tooltip
            contentStyle={{
              background: "#121c2e",
              border: "1px solid #243552",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="nego" name="Négociation" stroke="#3dd6c6" strokeWidth={2} />
          <Line type="monotone" dataKey="crise" name="Gestion de crise" stroke="#f07178" strokeWidth={2} />
          <Line type="monotone" dataKey="lead" name="Leadership" stroke="#f0a05a" strokeWidth={2} />
          <Line type="monotone" dataKey="stock" name="Gestion des stocks" stroke="#7dd3fc" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
