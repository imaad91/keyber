"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { KeyberOsFluxGraph } from "@/components/admin/KeyberOsFluxGraph";
import { KeyberOsSubNav } from "@/components/admin/KeyberOsSubNav";
import { KEYBER_OS_NAV } from "@/lib/keyberOsDocs";

export default function KeyberOsVueGlobalePage() {
  const composantes = KEYBER_OS_NAV.filter((n) => n.id !== "vue-globale");

  return (
    <div>
      <AdminBreadcrumb
        backHref="/admin"
        backLabel="← Studio"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Keyber OS", href: "/admin/systeme/vue-globale" },
          { label: "Vue Globale" },
        ]}
        title="Keyber OS — Vue Globale"
      />
      <KeyberOsSubNav />

      <p className="mb-4 max-w-3xl text-base font-medium text-slate-900">
        Keyber OS, c&apos;est le moteur. Il ne connaît aucun scénario, aucune
        entreprise. Il lit juste les fichiers de paramétrage.
      </p>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Composantes
        </h2>
        <ul className="mt-3 space-y-2">
          {composantes.map((c) => (
            <li key={c.id} className="text-sm text-slate-800">
              <Link
                href={c.href}
                className="font-semibold text-slate-900 underline-offset-2 hover:underline"
              >
                {c.label}
              </Link>
              <span className="text-slate-600"> — {c.blurb}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-700">
          Tu vois l&apos;image entière ici. Ensuite, tu consultes chaque
          composante, une par une, dans ses sous-onglets, pour voir son détail.
        </p>
      </section>

      <KeyberOsFluxGraph />
    </div>
  );
}
