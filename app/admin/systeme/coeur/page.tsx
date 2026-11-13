"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { useAdminStore } from "@/lib/adminStore";

export default function SystemeCoeurListPage() {
  const { scenarios, getScenarioCoeur } = useAdminStore();

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Cœur" },
        ]}
        title="Système — Cœur"
      />
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 Lecture seule — pas de modification, copier / coller / exporter.
        Source de vérité du module actif.
      </div>
      <div className="space-y-3">
        {scenarios.map((s) => {
          const c = getScenarioCoeur(s.id);
          return (
            <Link
              key={s.id}
              href={`/admin/systeme/coeur/${s.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
            >
              <p className="font-semibold text-slate-900">{s.titre}</p>
              <p className="mt-1 text-xs text-slate-500">
                {c.decisions.length} décisions · {c.evenements.length}{" "}
                évènements
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
