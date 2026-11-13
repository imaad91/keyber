"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { relativeTimeFr } from "@/lib/coeurHistory";
import { useAdminStore } from "@/lib/adminStore";

export default function WorkflowGlossaireListPage() {
  const { glossaire, createGlossaireTerme } = useAdminStore();
  const router = useRouter();
  const list = [...(glossaire ?? [])].sort((a, b) =>
    a.terme.localeCompare(b.terme, "fr")
  );

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/workflow/scenarios"
        backLabel="← Workflow"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workflow", href: "/admin/workflow/scenarios" },
          { label: "Glossaire" },
        ]}
        title="Workflow — Glossaire"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">
          Dictionnaire des données Keyber. Si un mot n&apos;est pas défini ici,
          l&apos;IA ne doit pas l&apos;utiliser. L&apos;IA lit seulement.
        </p>
        <AdminButton
          onClick={() => {
            const raw = window.prompt(
              "Identifiant technique du nouveau terme (ex: confiance.sophie)"
            );
            if (!raw) return;
            const def = window.prompt("Définition précise (obligatoire)");
            if (!def) return;
            const created = createGlossaireTerme({
              terme: raw,
              nomLisible: raw,
              definitionPrecise: def,
            });
            if (created) {
              router.push(
                `/admin/workflow/glossaire/${encodeURIComponent(created.terme)}`
              );
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter un terme
        </AdminButton>
      </div>

      <div className="space-y-3">
        {list.map((t) => (
          <Link
            key={t.terme}
            href={`/admin/workflow/glossaire/${encodeURIComponent(t.terme)}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {t.terme}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t.definitionCourte}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Où : {(t.utilisations ?? []).join(" / ")}
                </p>
              </div>
              <p className="shrink-0 text-xs text-slate-400">
                {relativeTimeFr(t.updatedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
