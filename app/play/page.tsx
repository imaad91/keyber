"use client";

import { AnalyzeView } from "@/components/AnalyzeView";
import { DashboardView } from "@/components/DashboardView";
import { DecisionView } from "@/components/DecisionView";
import { InterviewView } from "@/components/InterviewView";
import { ModuleView } from "@/components/ModuleView";
import { exampleDecision, examplePersonnage } from "@/lib/mock-data";
import { useGameStore } from "@/lib/store";
import { ActionSidebar } from "./components/ActionSidebar";
import { KpiBar } from "./components/KpiBar";

function ActionWorkspace({
  type,
  titre,
}: {
  type: string;
  titre: string;
}) {
  switch (type) {
    case "CONSULT_MODULE":
      return <ModuleView title={titre} />;
    case "VIEW_DASHBOARD":
      return <DashboardView title={titre} />;
    case "ANALYZE_DATA":
      return <AnalyzeView title={titre} />;
    case "INTERVIEW":
      return <InterviewView personnage={examplePersonnage} />;
    case "DECIDE":
      return <DecisionView decision={exampleDecision} />;
    default:
      return null;
  }
}

export default function PlayPage() {
  const { activeAction } = useGameStore();

  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-navy">
      <ActionSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <KpiBar />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {!activeAction ? (
            <div className="view-enter flex h-full max-w-lg flex-col justify-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Démo
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-navy">
                Choisissez une action
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Utilisez la barre latérale pour ouvrir chaque type
                d&apos;action et afficher la vue correspondante.
              </p>
            </div>
          ) : (
            <ActionWorkspace
              type={activeAction.type}
              titre={activeAction.titre}
            />
          )}
        </main>
      </div>
    </div>
  );
}
