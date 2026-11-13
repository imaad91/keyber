"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { useEquipeStore } from "@/lib/equipeStore";

export default function EquipeSuiviDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { parties, users } = useEquipeStore();
  const partie = parties.find((p) => p.id === id);
  const user = partie
    ? users.find((u) => u.id === partie.userId)
    : undefined;

  if (!partie) {
    return (
      <p className="text-sm text-slate-500">
        Partie introuvable.{" "}
        <Link href="/admin/equipe/suivi" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/equipe/suivi"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Équipe", href: "/admin/equipe/utilisateurs" },
          { label: "Suivi", href: "/admin/equipe/suivi" },
          { label: partie.scenarioTitre },
        ]}
        title={partie.scenarioTitre}
      />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
        <p>
          <span className="font-semibold">Utilisateur :</span>{" "}
          {user ? (
            <Link
              href={`/admin/equipe/utilisateurs/${user.id}`}
              className="underline"
            >
              {user.prenom} {user.nom}
            </Link>
          ) : (
            partie.userId
          )}
        </p>
        <p>
          <span className="font-semibold">Progression :</span>{" "}
          {partie.progression}%
        </p>
        <p>
          <span className="font-semibold">Score :</span> {partie.score}
        </p>
        <p>
          <span className="font-semibold">Bloqué sur :</span>{" "}
          {partie.bloqueSur ?? "—"}
        </p>
        <p className="text-xs text-slate-500">
          Mis à jour{" "}
          {new Date(partie.updatedAt).toLocaleString("fr-FR", {
            timeZone: "Europe/Paris",
          })}
        </p>
      </div>
    </div>
  );
}
