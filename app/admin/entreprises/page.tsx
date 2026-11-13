"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminEntreprisesPage() {
  const router = useRouter();
  const { entreprises, scenarios, createEntreprise } = useAdminStore();

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Admin"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bibliothèque", href: "/admin/entreprises" },
          { label: "Entreprises" },
        ]}
        title="Entreprises"
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Livre de l&apos;Entreprise : histoire, activité, chiffres, valeurs,
          glossaire.
        </p>
        <AdminButton
          onClick={() => {
            const id = createEntreprise();
            router.push(`/admin/entreprises/${id}`);
          }}
        >
          <Plus className="h-4 w-4" />
          Nouvelle Entreprise
        </AdminButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {entreprises.map((e) => {
          const linked = scenarios.filter((s) => s.entrepriseId === e.id || e.scenarioIds.includes(s.id));
          return (
            <Link
              key={e.id}
              href={`/admin/entreprises/${e.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <p className="text-lg font-semibold text-slate-900">{e.nom}</p>
              <p className="mt-1 text-sm text-slate-500">
                {e.ville || "Ville non renseignée"} · {e.secteur}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {linked.length} scénario{linked.length === 1 ? "" : "s"} lié
                {linked.length === 1 ? "" : "s"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
