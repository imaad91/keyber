"use client";

import { KpiCard } from "@/components/KpiCard";
import { useGameStore } from "@/lib/store";

function formatMoney(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function KpiBar() {
  const { gameState } = useGameStore();

  return (
    <div className="flex flex-wrap gap-3 border-b border-slate-200/80 bg-white/60 px-6 py-4 backdrop-blur-sm">
      <KpiCard label="Trésorerie" value={formatMoney(gameState.tresorerie)} />
      <KpiCard
        label="Production"
        value={gameState.production}
        unit="/ 100"
      />
      <KpiCard label="Moral" value={gameState.moral} unit="/ 100" />
    </div>
  );
}
