"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import {
  ROLE_LABELS,
  useEquipeStore,
  type EquipeRole,
} from "@/lib/equipeStore";

const ROLES: EquipeRole[] = ["admin", "testeur", "consultant", "joueur"];

export default function EquipeUtilisateursPage() {
  const router = useRouter();
  const { users, addUser, deactivateUser, toast, clearToast } = useEquipeStore();
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EquipeRole>("joueur");
  const [pwd, setPwd] = useState("Temp-Change-Me");

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Équipe", href: "/admin/equipe/utilisateurs" },
          { label: "Utilisateurs" },
        ]}
        title="Équipe — Utilisateurs"
      />

      <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
        Seule zone où vous paramétrez vous-même. Pas de faux utilisateurs
        personnages en dur.
      </div>

      {toast ? (
        <p className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          {toast}{" "}
          <button type="button" className="underline" onClick={clearToast}>
            OK
          </button>
        </p>
      ) : null}

      <div className="mb-4 flex justify-end">
        <AdminButton onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </AdminButton>
      </div>

      {open ? (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nouvel utilisateur</h2>
            <button type="button" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as EquipeRole)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Mot de passe temporaire"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
          </div>
          <div className="mt-3">
            <AdminButton
              onClick={() => {
                if (!prenom.trim() || !nom.trim() || !email.trim()) return;
                const u = addUser({
                  prenom,
                  nom,
                  email,
                  role,
                  tempPassword: pwd,
                });
                setOpen(false);
                router.push(`/admin/equipe/utilisateurs/${u.id}`);
              }}
            >
              Enregistrer
            </AdminButton>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Créé</th>
              <th className="px-4 py-3">Dernier accès</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link
                    href={`/admin/equipe/utilisateurs/${u.id}`}
                    className="hover:underline"
                  >
                    {u.prenom} {u.nom}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3">
                  {u.actif ? (
                    <span className="text-emerald-700">Actif</span>
                  ) : (
                    <span className="text-slate-400">Inactif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                    timeZone: "Europe/Paris",
                  })}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {u.lastAccessAt
                    ? new Date(u.lastAccessAt).toLocaleString("fr-FR", {
                        timeZone: "Europe/Paris",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.actif && u.id !== "user-admin-me" ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-700"
                      onClick={() => deactivateUser(u.id)}
                    >
                      Désactiver
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
