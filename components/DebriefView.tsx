"use client";

import Link from "next/link";
import { Trophy, AlertTriangle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContexteActif, getScenarioActif } from "@/data/registry";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DebriefView() {
  const { gameState, resetState } = useGameStore();
  const ending = gameState.ending;
  const ctx = getContexteActif();
  const target = getScenarioActif().targetPieces ?? 500;
  const contact = ctx.computer.chatContacts[0];

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

  const blurb =
    ending === "VICTOIRE"
      ? ctx.runtime.endingNarration.victoire(
          gameState.piecesQualiteSemaine,
          gameState.ethique
        )
      : ending === "PARTIELLE"
        ? ctx.runtime.endingNarration.partielle(
            gameState.piecesQualiteSemaine,
            gameState.ethique
          )
        : ctx.runtime.endingNarration.echec(
            gameState.piecesQualiteSemaine,
            gameState.ethique
          );

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
        <p className="mt-3 text-sm leading-relaxed text-muted">{blurb}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Stat
            label="Pièces qualité"
            value={`${gameState.piecesQualiteSemaine} / ${target}`}
          />
          <Stat label="Éthique" value={`${gameState.ethique}`} />
          <Stat
            label="Confiance client"
            value={`${gameState.confianceAutoVolt}`}
          />
          <Stat
            label="Trésorerie"
            value={`${gameState.tresorerie.toLocaleString("fr-FR")} €`}
          />
          <Stat label="Moral" value={`${gameState.moral}`} />
          {contact ? (
            <Stat
              label={contact.name.split(" ")[0] ?? contact.name}
              value={`${gameState.relations[contact.id] ?? 0}`}
            />
          ) : null}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/journal">Lire le journal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/livre">Livre de l&apos;entreprise</Link>
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
