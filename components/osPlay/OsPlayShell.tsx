"use client";

import Link from "next/link";
import {
  formatOsClock,
  osInterviewSelect,
  osOrdinateurSetAction,
  osVisibiliteFog,
  osVisibiliteInstallSensor,
  type OsPlayState,
  type OsPlayerAction,
} from "@/lib/keyberOs";
import { OS_SHELL_ACTIONS } from "@/lib/keyberOs/shellActions";
import {
  applyOsBookChoice,
  osBookErpSnapshot,
  osBookInterfaceView,
} from "@/lib/osBookPlay";
import { formatRemainingLabel } from "@/lib/evenements";
import { cn } from "@/lib/utils";
import { OsAtelierLive } from "@/components/osPlay/OsAtelierLive";
import { OsComputerDesktop } from "@/components/osPlay/OsComputerDesktop";
import {
  BookMarked,
  BookOpen,
  Lock,
  Settings2,
  User,
} from "lucide-react";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
  title: string;
  subtitle: string;
};

/**
 * Shell joueur Book — chrome aligné sur `/play` (Étape 2 V1).
 * Données = état OS + param. Aucun contexte hardcodé.
 */
export function OsPlayShell({ play, setPlay, title, subtitle }: Props) {
  const ui = osBookInterfaceView(play);
  const erp = osBookErpSnapshot(play);
  const fog = osVisibiliteFog(play);
  const computerOpen = play.activeAction === "computer";

  if (!ui.showShell) {
    return (
      <SimpleBookPlay
        play={play}
        setPlay={setPlay}
        title={title}
        subtitle={subtitle}
      />
    );
  }

  const minutes =
    play.meta?.minutesSinceStart ?? play.minutesSinceStart ?? 0;
  const dayLen =
    play.meta?.dayLengthMinutes ?? play.dayLengthMinutes ?? 600;
  const remaining =
    play.meta?.tempsRestantMinutes ?? Math.max(0, dayLen - minutes);
  const day = play.meta?.jourActuel ?? play.day;
  const week = play.meta?.week ?? play.week;
  const heure =
    play.meta?.heureActuelle ?? formatOsClock(minutes);
  const chapter = play.world?.chapters?.find(
    (c) => c.id === play.world.chapterId
  );
  const entreprise = play.param.Entreprise || play.param.Nom || "Scénario";
  const progressPct = Math.min(
    100,
    Math.max(0, (minutes / Math.max(1, dayLen)) * 100)
  );
  const showAside =
    ui.showRightAside && !computerOpen && (ui.showObjectives || true);
  const unlocked = play.world?.unlockedActions ?? [
    "computer",
    "decide",
    "interview",
    "atelier-live",
  ];
  const gateOnboarding =
    !play.world?.onboardingDone && play.param.Mode === "Histoire";

  return (
    <div
      className={cn(
        "flex overflow-hidden text-foreground atmosphere-play",
        ui.fullBleedShell
          ? "h-[calc(100vh-2.5rem)] min-h-[560px]"
          : "min-h-[70vh] rounded-2xl border border-white/10 shadow-lg"
      )}
    >
      {/* Sidebar — même structure que ActionSidebar POC */}
      <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-white/10 bg-panel">
        <div className="border-b border-white/10 px-4 py-4">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-accent"
          >
            KEYBER
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
            {chapter
              ? `Ch.${chapter.numero} · ${chapter.titre}`
              : entreprise}
          </p>
          {ui.showClock ? (
            <>
              <p className="mt-2 font-display text-sm font-semibold leading-snug tabular-nums text-foreground">
                {day >= 1
                  ? `Jour ${day} - ${heure} - Il te reste ${formatRemainingLabel(remaining)}`
                  : heure}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </>
          ) : null}
        </div>

        {ui.showSidebarLinks ? (
          <div className="border-b border-white/10 p-2">
            <Link
              href="/livre"
              className="flex items-center gap-2 rounded-xl bg-accent/15 px-3 py-2.5 text-sm font-semibold text-accent ring-1 ring-accent/30 transition hover:bg-accent/25"
            >
              <BookOpen className="h-4 w-4" />
              Livre de l&apos;Entreprise
            </Link>
            <Link
              href="/journal"
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <BookMarked className="h-4 w-4" />
              Journal de bord
            </Link>
          </div>
        ) : null}

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
          aria-label="Actions"
        >
          <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Actions
          </p>
          {OS_SHELL_ACTIONS.map((action) => {
            const locked =
              gateOnboarding &&
              !unlocked.includes(action.id as OsPlayerAction);
            const active = play.activeAction === action.id;
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                disabled={locked}
                onClick={() =>
                  setPlay(
                    osOrdinateurSetAction(play, action.id as OsPlayerAction)
                  )
                }
                className={cn(
                  "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                  locked && "opacity-45",
                  active
                    ? "bg-accent/15 text-foreground shadow-glow ring-1 ring-accent/40"
                    : "text-muted hover:bg-white/5 hover:text-foreground"
                )}
              >
                {locked ? (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                ) : (
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-accent"
                        : "text-muted group-hover:text-accent"
                    )}
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-foreground">
                    {action.titre}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                    {locked
                      ? "Verrouillé — suis le mentor"
                      : `${action.description} · ${action.timeCostMinutes} min`}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        {ui.showSidebarLinks ? (
          <div className="border-t border-white/10 p-2">
            <Link
              href="/profil"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Mon profil
            </Link>
            <Link
              href="/admin/systeme/interface-joueur"
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-white/5 hover:text-accent"
            >
              <Settings2 className="h-4 w-4" />
              Mode Admin
            </Link>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {ui.showClock ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-panel/90 px-4 py-2 text-sm backdrop-blur">
            <p className="font-display font-semibold tabular-nums text-foreground">
              Jour {day} — {heure} — Il te reste{" "}
              {formatRemainingLabel(remaining)}
            </p>
            {play.world?.dayDecisionId ||
            (play.stepIndex > 0 && !play.finished) ? (
              <span className="rounded-md bg-ok/15 px-2 py-0.5 text-[11px] font-semibold text-ok">
                Décision en cours
              </span>
            ) : (
              <span className="rounded-md bg-accent-warm/15 px-2 py-0.5 text-[11px] font-semibold text-accent-warm">
                Décision en attente
              </span>
            )}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs text-muted">
          <span>
            {subtitle} · Semaine {week} · Jour {day}
            {ui.stepLabel ? ` · ${ui.stepLabel}` : ""}
          </span>
          {ui.showProgressionLine ? (
            <span className="tabular-nums text-accent">
              XP {play.progression?.xp ?? play.xp}/
              {(play.progression?.niveau ?? play.niveau) * 100} · Niv.{" "}
              {play.progression?.niveau ?? play.niveau}
            </span>
          ) : null}
        </div>

        {!computerOpen && ui.showErpTiles ? (
          <div className="flex flex-wrap items-stretch gap-2 border-b border-white/10 bg-panel/80 px-4 py-3 backdrop-blur-md">
            {(play.kpis?.length
              ? play.kpis.slice(0, 4)
              : [
                  { id: "t", label: "Trésorerie", path: "" },
                  { id: "s", label: "Stock", path: "" },
                  { id: "p", label: "Production", path: "" },
                  { id: "c", label: "Commandes", path: "" },
                ]
            ).map((kpi, i) => {
              const values = [
                fog
                  ? "???"
                  : `${erp.tresorerie.toLocaleString("fr-FR")} €`,
                fog ? "???" : String(erp.stock),
                fog ? "???" : String(erp.production),
                fog ? "???" : String(erp.commandes),
              ];
              return (
                <div
                  key={kpi.id}
                  className="flex min-w-[110px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-panel-2 px-3 py-2 shadow-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {kpi.label}
                    </p>
                    <p className="font-display text-lg font-semibold tabular-nums leading-tight text-foreground">
                      {values[i] ?? "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div
          className={
            computerOpen || !showAside
              ? "grid min-h-0 flex-1"
              : "grid min-h-0 flex-1 lg:grid-cols-[1fr_300px]"
          }
        >
          <main
            className={
              computerOpen
                ? "min-h-0 overflow-hidden p-3 md:p-4"
                : "min-h-0 overflow-auto p-4 md:p-6"
            }
          >
            {!computerOpen ? (
              <>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  {entreprise}
                </p>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
                  {subtitle}. Ouvre l&apos;ordinateur, interviewe un
                  interlocuteur, visite l&apos;atelier, puis prends une
                  décision.
                </p>
              </>
            ) : null}

            {!play.activeAction ? null : null}

            {play.activeAction === "computer" ? (
              <OsComputerDesktop play={play} setPlay={setPlay} fog={fog} />
            ) : null}
            {play.activeAction === "decide" ? (
              <OsDecide play={play} setPlay={setPlay} />
            ) : null}
            {play.activeAction === "interview" ? (
              <OsInterviewPanel play={play} setPlay={setPlay} />
            ) : null}
            {play.activeAction === "atelier-live" ? (
              <OsAtelierLive play={play} fog={fog} />
            ) : null}

            {!play.activeAction ? (
              <p className="mt-8 text-sm text-muted">
                Choisis une action dans la barre de gauche.
              </p>
            ) : null}

            {fog && !computerOpen ? (
              <button
                type="button"
                className="mt-4 rounded-lg bg-accent-warm/20 px-3 py-2 text-xs font-semibold text-accent-warm"
                onClick={() => setPlay(osVisibiliteInstallSensor(play))}
              >
                Installer un capteur (lever le brouillard ERP)
              </button>
            ) : null}

            {ui.showPipelineLog ? (
              <div className="mt-6 max-h-28 overflow-auto rounded-xl border border-white/10 bg-black/40 p-2 font-mono text-[10px] text-emerald-200/80">
                {play.log.slice(-8).map((l, i) => (
                  <div key={`${i}-${l.slice(0, 20)}`}>{l}</div>
                ))}
              </div>
            ) : null}
          </main>

          {showAside ? (
            <aside className="hidden min-h-0 space-y-6 overflow-y-auto border-l border-white/10 bg-panel/60 p-4 lg:block">
              {ui.showObjectives ? (
                <section>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Objectifs
                  </p>
                  <ul className="mt-3 space-y-2">
                    {play.objectives.map((o) => (
                      <li
                        key={o.id}
                        className="rounded-xl border border-white/10 bg-panel-2 px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {o.status === "COMPLETE" ? "✓ " : ""}
                          {o.titre}
                        </p>
                        <p className="text-[11px] text-muted">
                          {o.type} · {o.status}
                          {o.cible ? ` · ${o.cible}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Fil d&apos;événements
                </p>
                <ul className="mt-3 space-y-2 text-xs text-muted">
                  {(play.historique?.evenementsDeclenches?.length
                    ? play.historique.evenementsDeclenches
                    : play.eventsFired
                  ).length === 0 ? (
                    <li className="rounded-lg border border-dashed border-white/10 px-3 py-2">
                      Aucun événement déclenché
                    </li>
                  ) : (
                    (
                      play.historique?.evenementsDeclenches?.length
                        ? play.historique.evenementsDeclenches
                        : play.eventsFired
                    ).map((e) => (
                      <li
                        key={e}
                        className="rounded-lg border border-white/10 bg-panel-2 px-3 py-2 text-foreground"
                      >
                        {e}
                      </li>
                    ))
                  )}
                </ul>
              </section>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}


function OsDecide({
  play,
  setPlay,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
}) {
  const decision = play.decisions[play.stepIndex];
  if (play.finished) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-panel-2 p-4">
        <h2 className="font-display text-lg font-semibold">Fin de scénario</h2>
        <p className="mt-2 text-sm text-muted">
          Score {play.score} · XP {play.xp} · Niveau {play.niveau}
        </p>
      </div>
    );
  }
  if (!decision) {
    return <p className="mt-4 text-sm text-muted">Aucune décision.</p>;
  }
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-panel-2 p-4">
      <p className="text-xs uppercase tracking-wide text-muted">
        Décision {play.stepIndex + 1}/{play.decisions.length}
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold">
        {decision.titre}
      </h2>
      <div className="mt-4 space-y-2">
        {decision.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
            onClick={() => setPlay(applyOsBookChoice(play, o.id))}
          >
            {o.label}
          </button>
        ))}
      </div>
      {play.feedback ? (
        <p className="mt-3 text-sm text-ok">{play.feedback}</p>
      ) : null}
    </div>
  );
}

function OsInterviewPanel({
  play,
  setPlay,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
}) {
  const current = play.interviews.find(
    (i) => i.id === play.selectedInterviewId
  );
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {play.interviews.map((i) => (
          <button
            key={i.id}
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm",
              play.selectedInterviewId === i.id
                ? "bg-accent/20 text-accent ring-1 ring-accent/40"
                : "bg-white/10 text-muted"
            )}
            onClick={() => setPlay(osInterviewSelect(play, i.id))}
          >
            {i.nom}
          </button>
        ))}
      </div>
      {current ? (
        <div className="rounded-xl border border-white/10 bg-panel-2 p-4">
          <p className="text-sm font-semibold">
            {current.nom} · {current.role}
          </p>
          <ul className="mt-3 space-y-3">
            {current.lines.map((l, idx) => (
              <li key={idx} className="text-sm">
                <p className="text-muted">Toi : {l.q}</p>
                <p className="mt-1 text-foreground">
                  {current.nom} : {l.a}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">Choisis un interlocuteur.</p>
      )}
    </div>
  );
}

function SimpleBookPlay({ play, setPlay, title, subtitle }: Props) {
  const decision = play.decisions[play.stepIndex];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-slate-600">{subtitle}</p>
      {play.finished ? (
        <p className="mt-4 text-sm">Fin — score {play.score}</p>
      ) : decision ? (
        <div className="mt-4 space-y-2">
          <p className="font-medium">{decision.titre}</p>
          {decision.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="block w-full rounded-xl border px-4 py-3 text-left text-sm"
              onClick={() => setPlay(applyOsBookChoice(play, o.id))}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
