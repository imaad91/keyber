"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { useAdminStore } from "@/lib/adminStore";
import type { CharacterVisualId } from "@/lib/characterStyle";

export default function AdminPersonnagesPage() {
  const router = useRouter();
  const { personnages, entreprises, createPersonnage } = useAdminStore();

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Admin"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Bibliothèque", href: "/admin/entreprises" },
          { label: "Personnages" },
        ]}
        title="Personnages"
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Fiches, confiance de départ, dialogues et conséquences.
        </p>
        <AdminButton
          onClick={() => {
            const id = createPersonnage();
            router.push(`/admin/personnages/${id}`);
          }}
        >
          <Plus className="h-4 w-4" />
          Nouveau Personnage
        </AdminButton>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {personnages.map((p) => {
          const ent = entreprises.find((e) => e.id === p.entrepriseId);
          const visualOk = [
            "pers-marie",
            "pers-karim",
            "pers-laurent",
            "pers-henri",
          ].includes(p.avatarStyle);
          return (
            <Link
              key={p.id}
              href={`/admin/personnages/${p.id}`}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              {visualOk ? (
                <CharacterAvatar
                  id={p.avatarStyle as CharacterVisualId}
                  trust={p.confianceDepart}
                  size={64}
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                  {(p.prenom[0] || "?") + (p.nom[0] || "")}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {p.prenom} {p.nom}
                </p>
                <p className="text-sm text-slate-500">{p.poste || "Poste à définir"}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {ent?.nom ?? "Sans entreprise"} · Confiance {p.confianceDepart} ·{" "}
                  {p.dialogues.length} dialogue{p.dialogues.length === 1 ? "" : "s"}
                </p>
                {p.caractere ? (
                  <p className="mt-2 line-clamp-2 text-xs italic text-slate-500">
                    « {p.caractere} »
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
