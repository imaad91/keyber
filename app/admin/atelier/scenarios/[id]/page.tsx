"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { StatusBadge } from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function AtelierScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { scenarios, fiches } = useAdminStore();
  const scenario = scenarios.find((s) => s.id === id);
  const brief = fiches.find((f) => f.scenarioId === id);

  if (!scenario) {
    return (
      <p className="text-sm text-slate-500">
        Scénario introuvable.{" "}
        <Link href="/admin/atelier/scenarios" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/scenarios"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/briefs" },
          { label: "Scénarios", href: "/admin/atelier/scenarios" },
          { label: scenario.titre },
        ]}
        title={scenario.titre}
      />

      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Statut
          </p>
          <div className="mt-2">
            <StatusBadge status={scenario.statut} />
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Résumé
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            {scenario.description || "—"}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {scenario.secteur} · {scenario.niveau} · {scenario.dureeJours} jours
          </p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Brief d&apos;origine
          </p>
          {brief ? (
            <Link
              href={`/admin/atelier/briefs/brief-novacier`}
              className="mt-2 inline-block text-sm font-semibold text-slate-900 underline"
            >
              {brief.titre}
            </Link>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Aucun brief lié.</p>
          )}
        </section>
      </div>
    </div>
  );
}
