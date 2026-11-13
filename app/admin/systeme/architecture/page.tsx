"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

const OS = [
  "Moteur (applyDecision)",
  "GameState",
  "ERP / Ordinateur",
  "Atelier (Briefs)",
  "Décider",
  "Journal de bord",
  "Profil",
  "Temps & Évènements",
  "Sauvegarde locale",
];

const MODULE = [
  "Novacier — données scénario",
  "Personnages Novacier",
  "Décisions J1–J5",
  "Compétences ciblées Prod",
  "Glossaire métier Novacier",
];

export default function SystemeArchitecturePage() {
  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin/systeme/coeur"
        backLabel="← Système"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Système", href: "/admin/systeme/coeur" },
          { label: "Architecture" },
        ]}
        title="Système — Architecture"
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        🔒 Lecture seule — KEYBER = OS · Novacier = module exemple installé
        dessus.
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-slate-900 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            OS KEYBER
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Système d&apos;exploitation
          </h2>
          <ul className="mt-4 space-y-2">
            {OS.map((x) => (
              <li
                key={x}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              >
                {x}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-violet-400 bg-violet-50/40 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-500">
            Module exemple
          </p>
          <h2 className="mt-1 text-lg font-semibold text-violet-950">
            Novacier (démo)
          </h2>
          <ul className="mt-4 space-y-2">
            {MODULE.map((x) => (
              <li
                key={x}
                className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-950"
              >
                {x}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-900">Frontière</p>
        <p className="mt-2">
          L&apos;OS fournit le moteur, l&apos;ERP, l&apos;Ordinateur, Décider,
          Journal, Profil. Le module Novacier fournit uniquement les données
          (Cœur, personnages, décisions). L&apos;Admin Studio ne joue pas et
          n&apos;écrit pas dans le GameState.
        </p>
        <p className="mt-4">
          <Link
            href="/admin/systeme/journal-decisions"
            className="font-semibold underline"
          >
            Voir le Journal des décisions
          </Link>
        </p>
      </div>
    </div>
  );
}
