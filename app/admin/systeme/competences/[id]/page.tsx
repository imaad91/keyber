"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { getCompetenceDef } from "@/lib/competences";

export default function SystemeCompetenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const def = getCompetenceDef(id);

  if (!def) {
    return (
      <p className="text-sm text-slate-500">
        Compétence inconnue.{" "}
        <Link href="/admin/systeme/competences" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/systeme/competences"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Compétences", href: "/admin/systeme/competences" },
          { label: def.nom },
        ]}
        title={def.nom}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-mono text-xs text-slate-400">{def.id}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {def.descriptionPrecise}
        </p>
        {def.type === "ciblee" ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Indicateurs
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                {def.indicateurs.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Erreurs fréquentes
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                {def.erreursFrequentes.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
