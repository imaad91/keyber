"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CoeurGraphiqueView } from "@/components/admin/CoeurGraphiqueView";
import { CoeurJsonView } from "@/components/admin/CoeurJsonView";
import { PageHeader } from "@/components/admin/AdminPrimitives";
import {
  formatCoeurJson,
  validateCoeurObject,
  type ScenarioCoeur,
} from "@/lib/adminCoeur";
import { useAdminStore } from "@/lib/adminStore";
import { cn } from "@/lib/utils";

type Tab = "coeur" | "graphique";

export default function ScenarioDecisionsDualViewPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios, coeurs, applyScenarioCoeur, getScenarioCoeur } =
    useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);

  const [tab, setTab] = useState<Tab>("graphique");
  const stored = coeurs[id] ?? (scenario ? getScenarioCoeur(id) : null);
  const [pending, setPending] = useState<ScenarioCoeur | null>(null);

  const coeur = pending ?? stored;

  const syncOk = useMemo(() => {
    if (!coeur || !stored) return false;
    if (pending) {
      return formatCoeurJson(pending) === formatCoeurJson(stored);
    }
    return validateCoeurObject(stored).ok;
  }, [coeur, stored, pending]);

  if (!scenario || !coeur) {
    return (
      <div>
        <p className="text-sm text-slate-500">Scénario introuvable.</p>
        <Link
          href="/admin/decisions"
          className="mt-2 inline-block text-sm text-slate-900 underline"
        >
          Retour
        </Link>
      </div>
    );
  }

  function onGraphiqueChange(next: ScenarioCoeur) {
    const result = validateCoeurObject(next);
    if (result.ok) {
      applyScenarioCoeur(result.coeur, { silent: true });
      setPending(null);
    } else {
      setPending(next);
    }
  }

  return (
    <div>
      <Link
        href="/admin/decisions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Décisions & événements
      </Link>

      <PageHeader
        title={scenario.titre}
        subtitle="Une seule source de vérité : le CŒUR. La Vue Graphique en est la traduction visuelle."
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <TabButton
          active={tab === "graphique"}
          onClick={() => setTab("graphique")}
          label="Vue Graphique"
          hint="Pour l'humain"
        />
        <TabButton
          active={tab === "coeur"}
          onClick={() => setTab("coeur")}
          label="Vue CŒUR"
          hint="Pour l'IA — source de vérité"
        />
      </div>

      {tab === "coeur" ? (
        <CoeurJsonView
          coeur={coeur}
          syncOk={syncOk}
          onValidate={(next) => {
            applyScenarioCoeur(next);
            setPending(null);
          }}
        />
      ) : (
        <CoeurGraphiqueView
          coeur={coeur}
          syncOk={syncOk}
          onChange={onGraphiqueChange}
        />
      )}
    </div>
  );
}

function TabButton({
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
