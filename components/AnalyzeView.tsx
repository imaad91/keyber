"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Row = { id: string; categorie: string; metrique: string; valeur: number };

const ROWS: Row[] = [
  { id: "1", categorie: "Exemple", metrique: "Volume", valeur: 120 },
  { id: "2", categorie: "Exemple", metrique: "Délai", valeur: 48 },
  { id: "3", categorie: "Autre", metrique: "Qualité", valeur: 91 },
  { id: "4", categorie: "Autre", metrique: "Coût", valeur: 34 },
];

type AnalyzeViewProps = {
  title?: string;
};

export function AnalyzeView({
  title = "Analyser les données",
}: AnalyzeViewProps) {
  const [filter, setFilter] = useState<"Tous" | "Exemple" | "Autre">("Tous");

  const filtered = useMemo(
    () =>
      filter === "Tous" ? ROWS : ROWS.filter((row) => row.categorie === filter),
    [filter]
  );

  return (
    <section className="view-enter flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Analyse
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Table et filtres génériques — placeholder.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["Tous", "Exemple", "Autre"] as const).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={filter === option ? "default" : "outline"}
            onClick={() => setFilter(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">Métrique</th>
              <th className="px-4 py-3 font-semibold">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3 text-slate-600">{row.categorie}</td>
                <td className="px-4 py-3 font-medium text-navy">
                  {row.metrique}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.valeur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
