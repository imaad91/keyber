"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Handshake,
  Package,
  Siren,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { skills } from "@/lib/mock";
import { cn } from "@/lib/utils";


const ICONS: Record<string, LucideIcon> = {
  Handshake,
  Siren,
  Users,
  Package,
  Wallet,
  Eye,
};

export default function SkillsPage() {
  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Accueil
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Mode Compétence
            </p>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">
              Grille de compétences
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Aucun scénario réel pour l&apos;instant — progression d&apos;exemple
              pour valider le système.
            </p>
          </div>
          <Button asChild>
            <Link href="/play">Entrer dans /play</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, i) => {
            const Icon = ICONS[skill.icone] ?? Package;
            const pct = Math.round((skill.xp / skill.xpMax) * 100);
            return (
              <article
                key={skill.id}
                className={cn(
                  "value-enter rounded-2xl border border-white/10 bg-panel p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow"
                )}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {skill.nom}
                    </h2>
                    <p className="text-xs text-muted">Niveau {skill.niveau}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {skill.description}
                </p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-muted">
                    <span>XP</span>
                    <span>
                      {skill.xp}/{skill.xpMax}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  Scénarios liés : bientôt
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
