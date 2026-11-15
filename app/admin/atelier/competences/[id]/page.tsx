"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  competencePreviewEntries,
  coursPreviewEntries,
} from "@/lib/atelierCompetencesExcel";
import { useAtelierCompetencesStore } from "@/lib/atelierCompetencesStore";

export default function AtelierCompetenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getCompetence, getCoursForCompetence } = useAtelierCompetencesStore();
  const competence = getCompetence(id);

  if (!competence) {
    return (
      <p className="text-sm text-slate-500">
        Compétence introuvable.{" "}
        <Link href="/admin/atelier/competences" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const entries = competencePreviewEntries(competence.fields);
  const linked = getCoursForCompetence(competence.id);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/competences"
        backLabel="← Retour aux Compétences"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Compétences", href: "/admin/atelier/competences" },
          { label: competence.nom },
        ]}
        title={competence.nom}
      />

      <p className="mb-4 text-sm text-slate-600">
        Lecture seule — bibliothèque globale. Pour ajouter des cours ou des
        compétences, réimportez un Excel (homonymes ignorés).
      </p>

      <div className="mb-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {entries.map((e) => (
          <div
            key={e.label}
            className="border-b border-slate-50 pb-3 last:border-0"
          >
            <p className="text-xs font-medium text-slate-500">{e.label}</p>
            <p
              className={
                e.filled
                  ? "mt-0.5 whitespace-pre-wrap text-sm text-slate-900"
                  : "mt-0.5 text-sm text-slate-400"
              }
            >
              {e.filled ? e.value : "—"}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cours liés ({linked.length})
      </h2>
      {linked.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucun cours pour cette compétence.
        </p>
      ) : (
        <div className="space-y-4">
          {linked.map((cours) => {
            const cEntries = coursPreviewEntries(cours.fields);
            return (
              <div
                key={cours.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{cours.titre}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {cours.niveau || "Niveau —"}
                  {cours.ordre ? ` · ordre ${cours.ordre}` : ""}
                </p>
                <div className="mt-3 space-y-2">
                  {cEntries.map((e) => (
                    <div key={e.label}>
                      <p className="text-xs font-medium text-slate-500">
                        {e.label}
                      </p>
                      <p
                        className={
                          e.filled
                            ? "mt-0.5 whitespace-pre-wrap text-sm text-slate-800"
                            : "mt-0.5 text-sm text-slate-400"
                        }
                      >
                        {e.filled ? e.value : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
