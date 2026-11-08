"use client";

import { ActionSidebar } from "@/components/ActionSidebar";
import { AnalyzeView } from "@/components/AnalyzeView";
import { AtelierLiveView } from "@/components/AtelierLiveView";
import { ChatPanel } from "@/components/ChatPanel";
import { DashboardView } from "@/components/DashboardView";
import { DecisionCard } from "@/components/DecisionCard";
import { EmailInbox } from "@/components/EmailInbox";
import { ErpTable } from "@/components/ErpTable";
import { EventFeed } from "@/components/EventFeed";
import { FeedbackToast } from "@/components/FeedbackToast";
import { InterviewView } from "@/components/InterviewView";
import { KpiBar } from "@/components/KpiBar";
import { ObjectivePanel } from "@/components/ObjectivePanel";
import { VisibilityPanel } from "@/components/VisibilityPanel";
import { roles } from "@/lib/mock";
import { useGameStore } from "@/lib/store";

function ActionWorkspace() {
  const { activeAction, playTab } = useGameStore();

  if (playTab === "emails" || activeAction?.type === "EMAILS") {
    return <EmailInbox />;
  }
  if (playTab === "chat" || activeAction?.type === "CHAT") {
    return <ChatPanel />;
  }

  if (!activeAction) {
    return (
      <div className="view-enter flex h-full max-w-lg flex-col justify-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Quotidien
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Une journée à piloter
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Ouvre l&apos;ERP, regarde l&apos;atelier live, lis tes emails, investis
          dans la visibilité — chaque action consomme du temps.
        </p>
      </div>
    );
  }

  switch (activeAction.type) {
    case "OPEN_ERP":
      return <ErpTable embedded />;
    case "VIEW_DASHBOARD":
      return <DashboardView />;
    case "ANALYZE_DATA":
      return <AnalyzeView />;
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

export default function PlayPage() {
  const { gameState } = useGameStore();
  const role = roles.find((r) => r.id === gameState.roleId);

  return (
    <div className="flex h-screen overflow-hidden atmosphere-play text-foreground">
      <ActionSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2 text-xs text-muted">
          <span>
            {role ? role.titre : "Mode libre"} · Semaine {gameState.week} · Jour{" "}
            {gameState.day} · Niv. {gameState.level}
          </span>
          <span className="tabular-nums text-accent">
            XP {gameState.xp}/500
          </span>
        </div>
        <KpiBar />
        <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_300px]">
          <main className="min-h-0 overflow-auto p-4 md:p-6">
            <ActionWorkspace />
          </main>
          <aside className="hidden min-h-0 space-y-6 overflow-y-auto border-l border-white/10 bg-panel/60 p-4 lg:block">
            <ObjectivePanel />
            <EventFeed />
          </aside>
        </div>
      </div>
      <VisibilityPanel />
      <FeedbackToast />
    </div>
  );
}
