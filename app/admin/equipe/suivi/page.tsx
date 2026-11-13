"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { useEquipeStore } from "@/lib/equipeStore";

export default function EquipeSuiviPage() {
  const { parties, users } = useEquipeStore();
  const list = [...parties].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/equipe/utilisateurs"
        backLabel="← Équipe"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Équipe", href: "/admin/equipe/utilisateurs" },
          { label: "Suivi des parties" },
        ]}
        title="Équipe — Suivi des parties"
      />
      <p className="mb-4 text-sm text-slate-600">
        Progression des utilisateurs sur les scénarios. Liste vide tant qu&apos;aucune
        partie n&apos;a été jouée (pas de faux joueurs).
      </p>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500">
          Aucune partie suivie pour l&apos;instant.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => {
            const u = users.find((x) => x.id === p.userId);
            return (
              <Link
                key={p.id}
                href={`/admin/equipe/suivi/${p.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
              >
                <p className="font-semibold text-slate-900">{p.scenarioTitre}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {u ? `${u.prenom} ${u.nom}` : p.userId} · {p.progression}% ·
                  score {p.score}
                  {p.bloqueSur ? ` · bloqué : ${p.bloqueSur}` : ""}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
