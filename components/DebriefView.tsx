"use client";

import Link from "next/link";
import { Trophy, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TARGET_PIECES } from "@/lib/scenario";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DebriefView() {
  const { gameState, resetState } = useGameStore();
  const ending = gameState.ending;

  const icon =
    ending === "VICTOIRE" ? Trophy : ending === "PARTIELLE" ? Scale : AlertTriangle;
  const Icon = icon;
  const title =
    ending === "VICTOIRE"
      ? "Victoire"
      : ending === "PARTIELLE"
        ? "Victoire partielle"
        : "Échec";
  const tone =
    ending === "VICTOIRE"
      ? "border-ok/50 bg-ok/10"
      : ending === "PARTIELLE"
        ? "border-accent-warm/50 bg-accent-warm/10"
        : "border-danger/50 bg-danger/10";

  return (
    <section className="view-enter flex h-full items-center justify-center p-4">
      <div
        className={cn(
          "reward-pop w-full max-w-xl rounded-3xl border p-8 shadow-glow",
          tone
        )}
      >
        <Icon className="mb-4 h-10 w-10 text-accent" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Vendredi 16h00 — Débrief
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {ending === "VICTOIRE" &&
            `≥480 pièces qualité et éthique > 50. AutoVolt reste. Tu as tenu la semaine.`}
          {ending === "PARTIELLE" &&
            `Entre 400 et 479 pièces qualité, ou éthique limite. Le contrat respire — fragile.`}
          {ending === "ECHEC" &&
            `<400 pièces qualité ou éthique < 20. L'ombre de 2022 revient.`}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Pièces qualité"
            value={`${gameState.piecesQualiteSemaine} / ${TARGET_PIECES}`}
          />
          <Stat label="Éthique" value={`${gameState.ethique}`} />
          <Stat
            label="Confiance AutoVolt"
            value={`${gameState.confianceAutoVolt}`}
          />
          <Stat
            label="Trésorerie"
            value={`${gameState.tresorerie.toLocaleString("fr-FR")} €`}
          />
          <Stat label="Moral" value={`${gameState.moral}`} />
          <Stat
            label="Marie"
            value={`${gameState.relations["pers-marie"] ?? 0}`}
          />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/journal">Lire le journal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/livre">Livre Novacier</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetState();
              window.location.href = "/story";
            }}
          >
            Rejouer
          </Button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-panel/80 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="font-display text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
