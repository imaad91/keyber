"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  getAtelierBrief,
  listAtelierBriefs,
  type AtelierBrief,
} from "@/lib/atelierBriefs";

export default function AtelierBriefDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [extra] = useState<AtelierBrief[]>([]);
  const brief = useMemo(() => {
    return (
      getAtelierBrief(id) ??
      extra.find((b) => b.id === id) ??
      listAtelierBriefs().find((b) => b.id === id)
    );
  }, [id, extra]);

  if (!brief) {
    return (
      <p className="text-sm text-slate-500">
        Brief introuvable.{" "}
        <Link href="/admin/atelier/briefs" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const blocks = [
    { title: "Contexte entreprise", body: brief.sections.contexteEntreprise },
    { title: "Personnages", body: brief.sections.personnages },
    { title: "Décisions", body: brief.sections.decisions },
    { title: "Données réelles", body: brief.sections.donneesReelles },
  ];

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/briefs"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/briefs" },
          { label: "Briefs", href: "/admin/atelier/briefs" },
          { label: brief.titre },
        ]}
        title={brief.titre}
      />

      <p className="mb-4 font-mono text-xs text-slate-400">
        content/fiches/{brief.filename} — lecture / import, pas d&apos;édition
        Cœur
      </p>

      <div className="space-y-4">
        {blocks.map((s) => (
          <section
            key={s.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {s.title}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {s.body || "—"}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
