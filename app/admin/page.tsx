"use client";

import Link from "next/link";
import { Building2, Plus, ScrollText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import { niveauLabel } from "@/lib/adminTypes";

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    scenarios,
    entreprises,
    personnages,
    decisions,
    createScenario,
    createEntreprise,
    createPersonnage,
  } = useAdminStore();

  const sorted = [...scenarios].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Vue d'ensemble du contenu Keyber Studio."
        actions={
          <>
            <AdminButton
              onClick={() => {
                const id = createScenario();
                router.push(`/admin/scenarios/${id}`);
              }}
            >
              <Plus className="h-4 w-4" />
              Nouveau Scénario
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => {
                const id = createEntreprise();
                router.push(`/admin/entreprises/${id}`);
              }}
            >
              <Building2 className="h-4 w-4" />
              Nouvelle Entreprise
            </AdminButton>
            <AdminButton
              variant="secondary"
              onClick={() => {
                const id = createPersonnage();
                router.push(`/admin/personnages/${id}`);
              }}
            >
              <Users className="h-4 w-4" />
              Nouveau Personnage
            </AdminButton>
          </>
        }
      />

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-sm">
        <p className="text-sm font-semibold">Logique · Cœur · Agents</p>
        <p className="mt-1 text-xs text-slate-300">
          Menu{" "}
          <Link
            href="/admin/decisions"
            className="underline decoration-white/40 underline-offset-2 hover:decoration-white"
          >
            Logique
          </Link>{" "}
          → schéma lecture seule. Onglet{" "}
          <strong>Cœur</strong> → JSON verrouillé + Agents (seul pilotage
          modifiable).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scénarios" value={scenarios.length} />
        <StatCard label="Entreprises" value={entreprises.length} />
        <StatCard label="Personnages" value={personnages.length} />
        <StatCard label="Décisions" value={decisions.length} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Scénarios
          </h2>
          <Link
            href="/admin/scenarios"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Tout voir
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Secteur</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Compétence</th>
                <th className="px-4 py-3 font-medium">Niveau</th>
                <th className="px-4 py-3 font-medium">Durée</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/scenarios/${s.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      <span className="mr-2 inline-flex items-center gap-1 text-slate-400">
                        <ScrollText className="h-3.5 w-3.5" />
                        #{s.order}
                      </span>
                      {s.titre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.secteur}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.statut} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.competence || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {niveauLabel(s.niveau)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {s.dureeJours} j
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
