"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  ROLE_LABELS,
  useEquipeStore,
  type EquipeRole,
} from "@/lib/equipeStore";

const ROLES: EquipeRole[] = ["admin", "testeur", "consultant", "joueur"];

export default function EquipeUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { users, updateUser, partiesForUser, toast, clearToast } =
    useEquipeStore();
  const user = users.find((u) => u.id === id);
  const parties = partiesForUser(id);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EquipeRole>("joueur");
  const [actif, setActif] = useState(true);

  useEffect(() => {
    if (!user) return;
    setPrenom(user.prenom);
    setNom(user.nom);
    setEmail(user.email);
    setRole(user.role);
    setActif(user.actif);
  }, [user]);

  if (!user) {
    return (
      <p className="text-sm text-slate-500">
        Utilisateur introuvable.{" "}
        <Link href="/admin/equipe/utilisateurs" className="underline">
          Retour
        </Link>
      </p>
    );
  }

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/equipe/utilisateurs"
        backLabel="← Retour à la liste"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Équipe", href: "/admin/equipe/utilisateurs" },
          { label: "Utilisateurs", href: "/admin/equipe/utilisateurs" },
          { label: `${user.prenom} ${user.nom}` },
        ]}
        title={`${user.prenom} ${user.nom}`}
      />

      {toast ? (
        <p className="mb-3 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex gap-2">
        <AdminButton
          onClick={() =>
            updateUser(id, { prenom, nom, email, role, actif })
          }
        >
          Enregistrer les modifications
        </AdminButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-500">
          Prénom
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Nom
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-slate-500 sm:col-span-2">
          Email
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          Rôle
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal"
            value={role}
            onChange={(e) => setRole(e.target.value as EquipeRole)}
            disabled={user.id === "user-admin-me"}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={actif}
            disabled={user.id === "user-admin-me"}
            onChange={(e) => setActif(e.target.checked)}
          />
          Compte actif
        </label>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Parties</h2>
        {parties.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Aucune partie enregistrée pour cet utilisateur.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {parties.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/equipe/suivi/${p.id}`}
                  className="text-sm font-medium underline"
                >
                  {p.scenarioTitre} — {p.progression}% · score {p.score}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
