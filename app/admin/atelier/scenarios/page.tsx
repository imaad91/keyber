"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { StatusBadge } from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function AtelierScenariosPage() {
  const { scenarios, fiches } = useAdminStore();
  const list = [...scenarios].sort((a, b) => a.order - b.order);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/briefs"
        backLabel="← Atelier"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/briefs" },
          { label: "Scénarios" },
        ]}
        title="Atelier — Scénarios"
      />
      <p className="mb-4 text-sm text-slate-600">
        Scénarios issus des briefs. Résumé et statut seulement — pas
        d&apos;éditeur de partie.
      </p>
      <div className="space-y-3">
        {list.map((s) => {
          const brief = fiches.find((f) => f.scenarioId === s.id);
          return (
            <Link
              key={s.id}
              href={`/admin/atelier/scenarios/${s.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{s.titre}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {s.description || "—"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Brief : {brief?.titre ?? "—"} · {s.dureeJours} jours
                  </p>
                </div>
                <StatusBadge status={s.statut} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
