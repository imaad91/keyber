"use client";

import Link from "next/link";
import { PageHeader } from "@/components/admin/AdminPrimitives";
import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
} from "@/lib/competences";

export default function AdminCompetencesPage() {
  return (
    <div>
      <PageHeader
        title="Compétences"
        subtitle="Catalogue verrouillé — références par id uniquement. L'IA ne peut pas inventer."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/competences/generales"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
        >
          <h2 className="font-semibold text-slate-900">Générales</h2>
          <p className="mt-1 text-sm text-slate-500">
            {COMPETENCES_GENERALES.length} compétences transverses
          </p>
        </Link>
        <Link
          href="/admin/competences/ciblees"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
        >
          <h2 className="font-semibold text-slate-900">Ciblées</h2>
          <p className="mt-1 text-sm text-slate-500">
            {COMPETENCES_CIBLEES_PROD.length} compétences rôle production
          </p>
        </Link>
      </div>
    </div>
  );
}
