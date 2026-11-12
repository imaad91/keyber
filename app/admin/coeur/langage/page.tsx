"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/AdminPrimitives";
import { relativeTimeFr } from "@/lib/coeurHistory";
import { useAdminStore } from "@/lib/adminStore";

export default function CoeurLangageListPage() {
  const { scenarios, coeurMeta, getCoeurMeta } = useAdminStore();
  const list = [...scenarios].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Cœur — Langage Cœur"
        subtitle="Liste des scénarios. Cliquez pour ouvrir le JSON verrouillé en plein écran."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Version</th>
              <th className="px-4 py-3">Dernière modification</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const meta = coeurMeta[s.id] ?? getCoeurMeta(s.id);
              const v = meta.versions[0];
              return (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/coeur/langage/${s.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      {s.titre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {v ? `v${v.version}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {v
                      ? `${relativeTimeFr(v.createdAt)} · ${v.originLabel}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Synchronisé ✓
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={s.statut} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/coeur/langage/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700"
                    >
                      Ouvrir
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
