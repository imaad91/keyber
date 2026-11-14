"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { useAtelierStore } from "@/lib/atelierStore";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierContextesPage() {
  const { contextesPublies, getSecteur, toast, clearToast } = useAtelierStore();
  const contextes = contextesPublies();

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/chantier" },
          { label: "Contextes d'entreprise" },
        ]}
        title="Atelier — Contextes d'entreprise"
      />

      <p className="mb-4 max-w-2xl text-sm text-slate-600">
        Lecture seule — contextes déjà publiés depuis un Chantier. Pour créer
        un nouveau contexte :{" "}
        <Link
          href="/admin/atelier/chantier"
          className="font-medium text-slate-900 underline"
        >
          Chantier / Création
        </Link>
        .
      </p>

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      {contextes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          Aucun contexte publié pour l&apos;instant.
        </p>
      ) : (
        <div className="space-y-3">
          {contextes.map((c) => {
            const secteur = c.secteurId ? getSecteur(c.secteurId) : undefined;
            return (
              <Link
                key={c.id}
                href={`/admin/atelier/contextes/${c.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{c.nom}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Secteur : {secteur?.nom ?? "—"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {c.organisation || "Organisation non renseignée"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {relativeTimeFr(c.updatedAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
