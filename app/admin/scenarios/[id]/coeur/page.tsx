"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AgentsPanel } from "@/components/admin/AgentsPanel";
import { CoeurLangageLocked } from "@/components/admin/CoeurLangageLocked";
import { ScenarioWorkspaceNav } from "@/components/admin/ScenarioWorkspaceNav";
import { useAdminStore } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

type Sub = "langage" | "agents";

export default function ScenarioCoeurPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios, getScenarioCoeur, getCoeurMeta, coeurMeta } =
    useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);
  const coeur = getScenarioCoeur(id);
  const meta = coeurMeta[id] ?? getCoeurMeta(id);
  const [sub, setSub] = useState<Sub>("langage");

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/scenarios" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <ScenarioWorkspaceNav scenarioId={id} titre={scenario.titre} />

      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <SubTab
          active={sub === "langage"}
          onClick={() => setSub("langage")}
          label="Langage Cœur"
          hint="JSON verrouillé"
        />
        <SubTab
          active={sub === "agents"}
          onClick={() => setSub("agents")}
          label="Agents"
          hint="Pilotage modifiable"
        />
      </div>

      {sub === "langage" ? (
        <CoeurLangageLocked
          coeur={coeur}
          version={meta.versions[0]}
          lastOriginLabel={meta.lastOriginLabel}
          audit={meta.audit}
        />
      ) : (
        <AgentsPanel scenarioId={id} />
      )}
    </div>
  );
}

function SubTab({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg px-4 py-2.5 text-left transition",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      )}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="block text-[11px] opacity-70">{hint}</span>
    </button>
  );
}
