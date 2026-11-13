"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionSidebar } from "@/components/ActionSidebar";
import { AtelierLiveView } from "@/components/AtelierLiveView";
import { ComputerDesktop } from "@/components/computer/ComputerDesktop";
import { DayEndScreen } from "@/components/DayEndScreen";
import { DecisionCard } from "@/components/DecisionCard";
import { EventFeed } from "@/components/EventFeed";
import { EventNotificationToast } from "@/components/EventNotificationToast";
import { FeedbackToast } from "@/components/FeedbackToast";
import { GameClockBar } from "@/components/GameClockBar";
import { InterviewView } from "@/components/InterviewView";
import { KpiBar } from "@/components/KpiBar";
import { ObjectivePanel } from "@/components/ObjectivePanel";
import { DebriefView } from "@/components/DebriefView";
import { OnboardingCoach } from "@/components/OnboardingCoach";
import { ScenarioDayBanner } from "@/components/ScenarioDayBanner";
import { UrgentEventBanner } from "@/components/UrgentEventBanner";
import { VisibilityPanel } from "@/components/VisibilityPanel";
import { exampleActions, roles } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

function ActionWorkspace() {
  const { activeAction, gameState } = useGameStore();

  if (gameState.showDebrief) {
    return <DebriefView />;
  }

  if (!activeAction) {
    return (
      <div className="view-enter flex h-full max-w-lg flex-col justify-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Novacier · Semaine critique
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          La Semaine Qui Décide De Tout
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Ouvre l&apos;ordinateur pour l&apos;ERP, les mails et le chat.
          Interroge Karim et Marie, visite l&apos;atelier, puis prends la
          décision du jour. Objectif : 500 pièces qualité avant vendredi 16h.
        </p>
      </div>
    );
  }

  switch (activeAction.type) {
    case "ACCESS_COMPUTER":
      return <ComputerDesktop />;
    case "INTERVIEW":
      return <InterviewView />;
    case "DECIDE":
      return <DecisionCard />;
    case "VIEW_ATELIER_LIVE":
      return <AtelierLiveView />;
    default:
      return null;
  }
}

function PlayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { gameState, setActiveAction } = useGameStore();
  const { activeAction } = useGameStore();
  const role = roles.find((r) => r.id === gameState.roleId);
  const computerOpen = activeAction?.type === "ACCESS_COMPUTER";

  useEffect(() => {
    if (gameState.mode === "story" && gameState.roleId && !gameState.introSeen) {
      router.replace("/intro");
    }
  }, [gameState.mode, gameState.roleId, gameState.introSeen, router]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "interview") {
      const interview = exampleActions.find((a) => a.type === "INTERVIEW");
      if (interview) setActiveAction({ ...interview, timeCostMinutes: 0 });
    }
  }, [searchParams, setActiveAction]);

  return (
    <div className="flex h-screen overflow-hidden atmosphere-play text-foreground">
      <ActionSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <GameClockBar />
        <UrgentEventBanner />
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs text-muted">
          <span>
            {role ? role.titre : "Mode libre"} · Semaine {gameState.week} · Jour{" "}
            {gameState.day} · Niv. {gameState.level}
          </span>
          <span className="tabular-nums text-accent">
            XP {gameState.xp}/500
          </span>
        </div>
        {!computerOpen ? <KpiBar /> : null}
        <div
          className={
            computerOpen
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
            {!computerOpen ? <OnboardingCoach /> : null}
            {!computerOpen ? <ScenarioDayBanner /> : null}
            <ActionWorkspace />
          </main>
          {!computerOpen ? (
            <aside className="hidden min-h-0 space-y-6 overflow-y-auto border-l border-white/10 bg-panel/60 p-4 lg:block">
              <ObjectivePanel />
              <EventFeed />
            </aside>
          ) : null}
        </div>
      </div>
      <VisibilityPanel />
      <FeedbackToast />
      <EventNotificationToast />
      <DayEndScreen />
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center atmosphere-play text-muted">
          Chargement…
        </div>
      }
    >
      <PlayInner />
    </Suspense>
  );
}
