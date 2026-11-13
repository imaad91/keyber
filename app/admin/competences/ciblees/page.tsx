"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { COMPETENCES_CIBLEES_PROD } from "@/lib/competences";

export default function AdminCompetencesCibleesPage() {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/competences"
        backLabel="← Compétences"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Compétences", href: "/admin/competences" },
          { label: "Ciblées" },
        ]}
        title="Compétences Ciblées"
      />
      <div className="space-y-3">
        {COMPETENCES_CIBLEES_PROD.map((c) => (
          <Link
            key={c.id}
            href={`/admin/competences/${c.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <p className="font-semibold text-slate-900">
              {c.nom}{" "}
              <span className="font-mono text-xs font-normal text-slate-400">
                {c.id}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">{c.descriptionPrecise}</p>
            <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
              {c.indicateurs.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
