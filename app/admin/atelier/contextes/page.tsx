"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { useAtelierStore } from "@/lib/atelierStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierContextesPage() {
  const router = useRouter();
  const { contextes, createContexte, toast, clearToast } = useAtelierStore();

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/contextes" },
          { label: "Contextes d'entreprise" },
        ]}
        title="Atelier — Contextes d'entreprise"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Couche 1 — la vraie entreprise, créée une fois, réutilisée par
          plusieurs scénarios. Organisation, stock, contrats, comptabilité,
          problématiques.
        </p>
        <AdminButton
          onClick={() => {
            const nom = window.prompt("Nom du contexte d'entreprise");
            if (!nom?.trim()) return;
            const c = createContexte(nom);
            router.push(`/admin/atelier/contextes/${c.id}`);
          }}
        >
          <Plus className="h-4 w-4" />
          Créer un contexte
        </AdminButton>
      </div>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="space-y-3">
        {contextes.map((c) => (
          <Link
            key={c.id}
            href={`/admin/atelier/contextes/${c.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{c.nom}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {c.organisation || "Organisation à renseigner"}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {relativeTimeFr(c.updatedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
