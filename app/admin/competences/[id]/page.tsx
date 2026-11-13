"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { getCompetenceDef } from "@/lib/competences";
import { usagesOfCompetence } from "@/lib/competenceLocks";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminCompetenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { coeurs, scenarios } = useAdminStore();
  const def = getCompetenceDef(id);

  const usages = useMemo(() => {
    const list = Object.values(coeurs).map((c) => ({
      scenario: {
        id: c.scenario.id,
        titre:
          scenarios.find((s) => s.id === c.scenario.id)?.titre ??
          c.scenario.titre,
      },
      decisions: c.decisions,
    }));
    return usagesOfCompetence(id, list);
  }, [coeurs, scenarios, id]);

  if (!def) {
    return (
      <div className="py-16 text-center text-sm text-slate-500">
        Compétence inconnue.{" "}
        <Link href="/admin/competences" className="underline">
          Retour
        </Link>
      </div>
    );
  }

  const listHref =
    def.type === "generale"
      ? "/admin/competences/generales"
      : "/admin/competences/ciblees";

  return (
    <div>
      <AdminBreadcrumb
        backHref={listHref}
        backLabel="← Liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Compétences", href: "/admin/competences" },
          {
            label: def.type === "generale" ? "Générales" : "Ciblées",
            href: listHref,
          },
          { label: def.nom },
        ]}
        title={def.nom}
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-mono text-xs text-slate-400">{def.id}</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {def.descriptionPrecise}
        </p>
        {def.type === "ciblee" ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Indicateurs observables
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
              {def.indicateurs.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Erreurs fréquentes
            </p>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              {def.erreursFrequentes.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">
        Où est utilisée cette compétence ?
      </h2>
      {usages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-900">
          Jamais utilisée dans un Cœur — à supprimer ou à brancher sur une
          décision.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Scénario</th>
                <th className="px-4 py-3">Décision</th>
                <th className="px-4 py-3">Indicateur testé</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {usages.map((u) => (
                <tr
                  key={`${u.decisionId}-${u.choixId}-${u.competenceId}`}
                  className="border-b border-slate-50"
                >
                  <td className="px-4 py-3 text-slate-700">
                    {u.scenarioTitre}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {u.decisionTitre}
                    </p>
                    <p className="text-xs text-slate-500">{u.choixLabel}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.indicateurTeste}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold text-emerald-700">✓</span>{" "}
                      {u.feedbackSiReussi}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold text-rose-700">✗</span>{" "}
                      {u.feedbackSiEchoue}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.statut === "precis"
                          ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                          : "rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-800"
                      }
                    >
                      {u.statut === "precis"
                        ? "Précis ✓"
                        : u.statut === "incoherent"
                          ? "Incohérent ✗"
                          : "Imprécis ✗"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
