"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AtelierBpmnView } from "@/components/admin/AtelierBpmnView";
import { useAtelierStore } from "@/lib/atelierStore";
import { buildAtelierBpmn } from "@/lib/atelierWorkflow";

export default function AtelierWorkflowDetailPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const { getScenario, contextes, competences } = useAtelierStore();
  const scenario = getScenario(scenarioId);

  const diagram = useMemo(() => {
    if (!scenario) return null;
    const ctx = contextes.find((c) => c.id === scenario.contexteId);
    return buildAtelierBpmn(scenario, ctx?.nom ?? "Contexte", competences);
  }, [scenario, contextes, competences]);

  if (!scenario || !diagram) {
    return (
      <p className="text-sm text-slate-500">
        Workflow introuvable.{" "}
        <Link href="/admin/atelier/workflow" className="underline">
          Retour à la liste
        </Link>
      </p>
    );
  }

  const ctx = contextes.find((c) => c.id === scenario.contexteId);
  const comps = competences.filter((c) =>
    scenario.competenceIds.includes(c.id)
  );

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/workflow"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Workflow", href: "/admin/atelier/workflow" },
          { label: scenario.titre },
        ]}
        title={`Workflow BPMN — ${scenario.titre}`}
      />

      <div className="mb-5 flex flex-wrap gap-4 text-sm text-slate-700">
        <p>
          <span className="font-semibold text-slate-500">Contexte lié :</span>{" "}
          {ctx?.nom ?? "—"}
        </p>
        <p>
          <span className="font-semibold text-slate-500">
            Compétences travaillées :
          </span>{" "}
          {comps.map((c) => c.nom).join(", ") || "—"}
        </p>
      </div>

      <AtelierBpmnView diagram={diagram} />
    </div>
  );
}
