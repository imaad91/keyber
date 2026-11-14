"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Award, Check, History, X } from "lucide-react";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { CharacterPortrait } from "@/components/characters/CharacterPortrait";
import { ProgressionChart } from "@/components/ProgressionChart";
import { Button } from "@/components/ui/button";
import {
  CHARACTER_META,
  type CharacterVisualId,
} from "@/lib/characterStyle";
import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
} from "@/lib/competences";
import { roles } from "@/lib/mock";
import { XP_PER_SKILL_LEVEL } from "@/lib/progression";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CAST: CharacterVisualId[] = [
  "pers-marie",
  "pers-karim",
  "pers-laurent",
  "pers-henri",
];

export default function ProfilPage() {
  const { gameState } = useGameStore();
  const role = roles.find((r) => r.id === gameState.roleId);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Accueil
        </Link>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 border-[#0C3B38] bg-[#F5F1E8] font-display text-xl font-bold text-[#0C3B38]">
              KB
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Profil
              </p>
              <h1 className="font-display text-3xl font-semibold">
                Pilote KEYBER
              </h1>
              <p className="text-sm text-muted">
                {role?.titre ?? "Rôle non choisi"} · Niveau {gameState.level}
              </p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/play">Retour au jeu</Link>
          </Button>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="mb-4 font-display text-sm font-semibold">
            Relations — cast Novacier
          </h2>
          <div className="flex flex-wrap gap-4">
            {CAST.map((id) => {
              const trust = gameState.relations[id] ?? 50;
              return (
                <div key={id} className="flex w-[110px] flex-col items-center gap-2">
                  <CharacterPortrait
                    id={id}
                    trust={trust}
                    size={88}
                    rounded="2xl"
                    showBadge
                    className="border-2 border-[#0C3B38]"
                  />
                  <p className="text-center text-xs font-semibold">
                    {CHARACTER_META[id].shortName}
                  </p>
                  <p className="text-[10px] tabular-nums text-muted">{trust}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted">Barre XP</span>
            <span className="tabular-nums text-accent">
              {gameState.xp} / 500
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(gameState.xp / 500) * 100}%` }}
            />
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Compétences Générales
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {COMPETENCES_GENERALES.map((skill) => {
              const progress = gameState.competencesGenerales[skill.id] ?? {
                niveau: 1,
                xp: 0,
              };
              const open = openId === skill.id;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setOpenId(open ? null : skill.id)}
                  className="rounded-xl border border-white/10 bg-panel-2 px-4 py-3 text-left transition hover:border-accent/40"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{skill.nom}</span>
                    <span className="text-muted">Niv. {progress.niveau}/5</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.min(100, (progress.xp / XP_PER_SKILL_LEVEL) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    {progress.xp}/{XP_PER_SKILL_LEVEL} XP
                  </p>
                  {open ? (
                    <p className="mt-2 text-xs leading-relaxed text-foreground">
                      {skill.descriptionPrecise}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-accent">
                      Cliquer pour la description précise
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="mb-1 font-display text-lg font-semibold">
            Compétences Ciblées — Responsable de Production
          </h2>
          <p className="mb-4 text-xs text-muted">
            Indicateurs observables · erreurs fréquentes
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {COMPETENCES_CIBLEES_PROD.map((skill) => {
              const progress = gameState.competencesCiblees[skill.id] ?? {
                niveau: 1,
                xp: 0,
                indicateursValides: [false, false, false],
              };
              const flags = progress.indicateursValides ?? [false, false, false];
              const open = openId === skill.id;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setOpenId(open ? null : skill.id)}
                  className="rounded-xl border border-white/10 bg-panel-2 px-4 py-3 text-left transition hover:border-accent/40"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{skill.nom}</span>
                    <span className="text-muted">Niv. {progress.niveau}/5</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent-warm"
                      style={{
                        width: `${Math.min(100, (progress.xp / XP_PER_SKILL_LEVEL) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    {progress.xp}/{XP_PER_SKILL_LEVEL} XP
                  </p>
                  {open ? (
                    <div className="mt-2 space-y-2 text-xs">
                      <p className="leading-relaxed text-foreground">
                        {skill.descriptionPrecise}
                      </p>
                      <ul className="space-y-1">
                        {skill.indicateurs.map((ind, i) => (
                          <li
                            key={ind}
                            className="flex items-start gap-2 text-muted"
                          >
                            {flags[i] ? (
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
                            ) : (
                              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                            )}
                            <span
                              className={cn(
                                flags[i] && "text-foreground"
                              )}
                            >
                              {ind}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div>
                        <p className="font-semibold text-foreground">
                          Erreurs fréquentes
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">
                          {skill.erreursFrequentes.map((e) => (
                            <li key={e}>{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-accent">
                      Cliquer pour description, indicateurs et erreurs
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <ProgressionChart />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-accent" />
              <h2 className="font-display font-semibold">
                Entraînements Compétence
              </h2>
            </div>
            {gameState.trainingsCompleted.length === 0 ? (
              <p className="text-sm text-muted">
                Aucun entraînement terminé.
              </p>
            ) : (
              <ul className="space-y-2">
                {gameState.trainingsCompleted.slice(0, 8).map((t, i) => (
                  <li
                    key={`${t.decisionId}-${i}`}
                    className="rounded-lg bg-panel-2 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold">{t.label}</p>
                    <p className="text-[11px] text-muted">
                      {t.competenceId} · +{t.xp} XP
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-accent-warm" />
              <h2 className="font-display font-semibold">
                Histoires / décisions
              </h2>
            </div>
            {gameState.histoiresCompleted.length === 0 &&
            gameState.decisionHistory.length === 0 ? (
              <p className="text-sm text-muted">
                Aucune histoire terminée pour l&apos;instant.
              </p>
            ) : (
              <ul className="space-y-2">
                {gameState.histoiresCompleted.slice(0, 4).map((h, i) => (
                  <li
                    key={`${h.scenarioId}-${i}`}
                    className="rounded-lg bg-panel-2 px-3 py-2 text-sm"
                  >
                    <p className="font-semibold">{h.titre}</p>
                    <p className="text-[11px] text-muted">
                      Fin : {h.ending ?? "—"}
                    </p>
                  </li>
                ))}
                {gameState.decisionHistory.slice(0, 6).map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded-lg bg-panel-2 px-3 py-2 text-sm"
                  >
                    <CharacterAvatar
                      id="pers-marie"
                      size={28}
                      trust={gameState.relations["pers-marie"] ?? 30}
                    />
                    <span className="min-w-0 flex-1 truncate">{d.titre}</span>
                    <span className="shrink-0 text-xs text-muted">{d.at}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/10 bg-panel p-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-accent-warm" />
            <h2 className="font-display font-semibold">Badges</h2>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {gameState.badges.map((b) => (
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
        </section>
      </div>
    </div>
  );
}
