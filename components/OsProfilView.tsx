"use client";

/**
 * Étape 29 — Profil joueur branché Progression OS (session Book).
 * Même feeling que le POC ; données = play.progression / world.badges / relations.
 */

import Link from "next/link";
import { Award, History, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { osSkillProgressList, type OsPlayState } from "@/lib/keyberOs";
import { isOsModuleEnabled, useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  returnHref: string;
  title: string;
  subtitle: string;
};

export function OsProfilView({
  play,
  returnHref,
  title,
  subtitle,
}: Props) {
  const { config } = useKeyberOsRuntime();
  const prog = play.progression;
  const xpPerLevel = Math.max(1, config.progression?.xpPerLevel ?? 100);
  const xpInLevel = prog?.xp ?? play.xp ?? 0;
  const niveau = prog?.niveau ?? play.niveau ?? 1;
  const score = prog?.score ?? play.score ?? 0;
  const barPct = Math.min(100, ((xpInLevel % xpPerLevel) / xpPerLevel) * 100);
  const skills = osSkillProgressList(play);
  const badges = play.world?.badges ?? [];
  const relations = Object.entries(play.relations ?? {});
  const decisions = play.historique?.decisionsPrises ?? [];
  const events = play.historique?.evenementsDeclenches ?? [];

  if (!isOsModuleEnabled("profil")) {
    return (
      <div className="min-h-screen atmosphere-play px-6 py-8 text-foreground">
        <div className="mx-auto max-w-3xl">
          <Link
            href={returnHref}
            className="mb-4 inline-flex text-sm text-muted hover:text-accent"
          >
            ← Retour au jeu
          </Link>
          <p className="rounded-2xl border border-dashed border-white/15 bg-panel p-8 text-sm text-muted">
            Module Profil désactivé dans Admin → Keyber OS → Profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-accent/40 bg-panel-2">
              <User className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Profil · Keyber OS
              </p>
              <h1 className="font-display text-3xl font-semibold">{title}</h1>
              <p className="text-sm text-muted">
                {subtitle || "Session Book"} · Niveau {niveau} · Score {score}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href={returnHref}>Retour au jeu</Link>
          </Button>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">Barre XP</span>
            <span className="tabular-nums text-accent">
              {xpInLevel} XP · seuil {xpPerLevel}/niv
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Compétences (Progression OS)
          </h2>
          {skills.length === 0 ? (
            <p className="text-sm text-muted">
              Aucune compétence trackée — le param / catalogue OS est vide.
            </p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {skills.map((s) => {
                const pct = Math.min(
                  100,
                  (s.xp / Math.max(1, s.threshold)) * 100
                );
                return (
                  <li
                    key={s.id}
                    className="rounded-xl border border-white/10 bg-panel-2 px-4 py-3"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{s.nom}</span>
                      <span className="text-muted">Niv. {s.niveau}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      {s.type === "ciblee" ? "Ciblée" : "Générale"}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          s.type === "ciblee" ? "bg-accent-warm" : "bg-accent"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] tabular-nums text-muted">
                      {s.xp}/{s.threshold} XP
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="mb-4 font-display text-sm font-semibold">Relations</h2>
          {relations.length === 0 ? (
            <p className="text-sm text-muted">Aucune jauge relation pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {relations.map(([id, trust]) => (
                <div
                  key={id}
                  className="flex min-w-[100px] flex-col items-center gap-1 rounded-xl border border-white/10 bg-panel-2 px-3 py-2"
                >
                  <p className="text-center text-xs font-semibold">{id}</p>
                  <p className="text-[11px] tabular-nums text-muted">{trust}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(0, Math.min(100, Number(trust)))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-accent" />
              <h2 className="font-display font-semibold">Décisions</h2>
            </div>
            {decisions.length === 0 ? (
              <p className="text-sm text-muted">Aucune décision enregistrée.</p>
            ) : (
              <ul className="space-y-2">
                {decisions.slice(0, 10).map((d, i) => (
                  <li
                    key={`${d.decisionId}-${d.choixId}-${i}`}
                    className="rounded-lg bg-panel-2 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold">
                      {d.label || d.decisionId}
                    </p>
                    <p className="text-[11px] text-muted">
                      Jour {d.jour} · {d.choixId} · {d.heure}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-accent-warm" />
              <h2 className="font-display font-semibold">Événements</h2>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-muted">Aucun événement déclenché.</p>
            ) : (
              <ul className="space-y-2">
                {events.slice(0, 10).map((id) => (
                  <li
                    key={id}
                    className="rounded-lg bg-panel-2 px-3 py-2 text-sm"
                  >
                    {id}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="rounded-2xl border border-white/10 bg-panel p-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-accent-warm" />
            <h2 className="font-display font-semibold">Badges</h2>
          </div>
          {badges.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun badge dans world.badges — structure vide OK.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    b.unlocked
                      ? "border-ok/40 bg-ok/10 text-foreground"
                      : "border-white/10 bg-panel-2 text-muted"
                  }`}
                >
                  <p className="font-semibold">{b.titre}</p>
                  <p className="text-[11px] opacity-80">{b.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
