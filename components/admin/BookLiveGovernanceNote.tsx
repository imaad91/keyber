"use client";

import Link from "next/link";
import { formatLivePublishersLabel } from "@/lib/equipeLiveRights";
import { useEquipeStore } from "@/lib/equipeStore";

/** Étape 26 — note gouvernance Live (affichage, pas de blocage V1). */
export function BookLiveGovernanceNote() {
  const { users } = useEquipeStore();
  const label = formatLivePublishersLabel(users);

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
      <span className="font-semibold text-slate-900">Droit publier Live — </span>
      {label}.{" "}
      <span className="text-slate-500">
        V1 : visible seulement, le passage Live n’est pas bloqué.{" "}
      </span>
      <Link
        href="/admin/equipe/utilisateurs"
        className="font-medium text-violet-700 underline-offset-2 hover:underline"
      >
        Gérer dans Équipe
      </Link>
    </div>
  );
}
