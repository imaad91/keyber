"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  ALL_COMPETENCES,
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
} from "@/lib/competences";

export default function SystemeCompetencesPage() {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/systeme/coeur"
        backLabel="← Système"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Compétences" },
        ]}
        title="Système — Compétences"
      />
      <p className="mb-6 text-sm text-slate-600">
        Catalogue verrouillé — {COMPETENCES_GENERALES.length} générales ·{" "}
        {COMPETENCES_CIBLEES_PROD.length} ciblées. Lecture pour comprendre.
      </p>
      <div className="space-y-3">
        {ALL_COMPETENCES.map((c) => (
          <Link
            key={c.id}
            href={`/admin/systeme/competences/${c.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <p className="font-semibold text-slate-900">
              {c.nom}{" "}
              <span className="font-mono text-xs font-normal text-slate-400">
                {c.id}
              </span>
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {c.type === "generale" ? "Générale" : "Ciblée"}
            </p>
            <p className="mt-2 text-sm text-slate-600">{c.descriptionPrecise}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
