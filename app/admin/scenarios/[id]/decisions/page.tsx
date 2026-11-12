"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ScenarioCoeurDualView } from "@/components/admin/ScenarioCoeurDualView";
import { PageHeader } from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function ScenarioDecisionsDualViewPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios } = useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);

  if (!scenario) {
    return (
      <div>
        <p className="text-sm text-slate-500">Scénario introuvable.</p>
        <Link
          href="/admin/decisions"
          className="mt-2 inline-block text-sm text-slate-900 underline"
        >
          Retour à Décisions & événements
        </Link>
      </div>
    );
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

      <ScenarioCoeurDualView scenarioId={scenario.id} />
    </div>
  );
}
