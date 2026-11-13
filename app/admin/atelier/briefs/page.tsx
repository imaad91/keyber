"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  listAtelierBriefs,
  parseImportedBriefMarkdown,
  type AtelierBrief,
} from "@/lib/atelierBriefs";
import { relativeTimeFr } from "@/lib/coeurHistory";

export default function AtelierBriefsPage() {
  const seed = useMemo(() => listAtelierBriefs(), []);
  const [imported, setImported] = useState<AtelierBrief[]>([]);
  const list = [...imported, ...seed];

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/briefs" },
          { label: "Briefs" },
        ]}
        title="Atelier — Briefs"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Import de fiches markdown (`content/fiches/*.md`). Le texte est gardé
          intact. Cursor construira l&apos;app après — pas de génération de Cœur
          ici.
        </p>
        <AdminButton
          onClick={() => {
            const md = window.prompt(
              "Collez le markdown de la fiche (avec # titre et ## sections)"
            );
            if (!md?.trim()) return;
            setImported((prev) => [parseImportedBriefMarkdown(md), ...prev]);
          }}
        >
          <Plus className="h-4 w-4" />
          Importer une fiche
        </AdminButton>
      </div>

      <div className="space-y-3">
        {list.map((b) => (
          <Link
            key={b.id}
            href={`/admin/atelier/briefs/${b.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{b.titre}</p>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  content/fiches/{b.filename}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {b.sections.contexteEntreprise || "—"}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {relativeTimeFr(b.updatedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
