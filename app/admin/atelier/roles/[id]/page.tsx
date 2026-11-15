"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { rolePreviewEntries } from "@/lib/atelierRolesExcel";
import { useAtelierRolesStore } from "@/lib/atelierRolesStore";

export default function AtelierRoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getRole } = useAtelierRolesStore();
  const role = getRole(id);

  if (!role) {
    return (
      <p className="text-sm text-slate-500">
        Rôle introuvable.{" "}
        <Link href="/admin/atelier/roles" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  const entries = rolePreviewEntries(role.fields);

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/atelier/roles"
        backLabel="← Retour aux Rôles"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Atelier", href: "/admin/atelier/creation" },
          { label: "Rôles", href: "/admin/atelier/roles" },
          { label: role.nom },
        ]}
        title={role.nom}
      />

      <p className="mb-4 text-sm text-slate-600">
        Lecture seule — bibliothèque globale. Pour modifier, réimportez un
        Excel (les homonymes sont ignorés ; créez un nouveau nom si besoin).
      </p>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
    </div>
  );
}
