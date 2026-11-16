"use client";

/**
 * Débrief fin de semaine OS — chrome DebriefView (Étape 13).
 */

import Link from "next/link";
import { AlertTriangle, Scale, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OS_DEBRIEF_TARGET_PIECES,
  osEndingNarration,
  osPiecesQualite,
  type OsPlayState,
} from "@/lib/keyberOs";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  onReplay?: () => void;
};

export function OsDebriefView({ play, onReplay }: Props) {
  const ending = play.world?.ending ?? "ECHEC";
  const pieces = osPiecesQualite(play);
  const ethique = play.humain?.ethique ?? 70;
  const target = OS_DEBRIEF_TARGET_PIECES;
  const contact = play.computer.chatContacts[0];
  const skillLines = play.world?.lastSkillDebrief ?? [];

  const Icon =
    ending === "VICTOIRE"
      ? Trophy
      : ending === "PARTIELLE"
        ? Scale
        : AlertTriangle;
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
  const blurb = osEndingNarration(ending, pieces, ethique);

  return (
    <section className="view-enter flex h-full min-h-[480px] items-center justify-center p-4">
      <div
        className={cn(
          "reward-pop w-full max-w-xl rounded-3xl border p-8 shadow-glow",
          tone
        )}
      >
        <Icon className="mb-4 h-10 w-10 text-accent" />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Fin de semaine — Débrief
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{blurb}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Pièces qualité" value={`${pieces} / ${target}`} />
          <Stat label="Éthique" value={`${ethique}`} />
          <Stat
            label="Confiance client"
            value={`${play.humain?.confianceClient ?? 70}`}
          />
          <Stat
            label="Trésorerie"
            value={`${(play.finance?.tresorerie ?? play.tresorerieBrute).toLocaleString("fr-FR")} €`}
          />
          <Stat label="Moral" value={`${play.humain?.moralEquipe ?? 70}`} />
          {contact ? (
            <Stat
              label={contact.name.split(" ")[0] ?? contact.name}
              value={`${play.relations[contact.id] ?? 55}`}
            />
          ) : null}
        </dl>

        {skillLines.length > 0 ? (
          <div className="mt-5 space-y-1.5 rounded-xl border border-white/10 bg-panel/80 p-3 text-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Débrief compétences
            </p>
            {skillLines.map((line) => (
              <p key={line} className="leading-relaxed text-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/journal">Lire le journal</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/livre">Livre de l&apos;entreprise</Link>
          </Button>
          {onReplay ? (
            <Button variant="ghost" onClick={onReplay}>
              Rejouer
            </Button>
          ) : null}
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
