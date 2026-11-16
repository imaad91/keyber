"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { KeyberOsFluxGraph } from "@/components/admin/KeyberOsFluxGraph";
import { KeyberOsSubNav } from "@/components/admin/KeyberOsSubNav";
import { KEYBER_OS_NAV } from "@/lib/keyberOsDocs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import type { OsModuleId } from "@/lib/keyberOs/types";

function moduleEnabled(
  id: string,
  config: ReturnType<typeof useKeyberOsRuntime>["config"]
): boolean | null {
  const map: Partial<Record<OsModuleId, boolean>> = {
    "donnees-sauvegarde": config.donneesSauvegarde.enabled,
    "moteur-scenarios": config.moteurScenarios.enabled,
    "moteur-decisions": config.moteurDecisions.enabled,
    "moteur-evenements": config.moteurEvenements.enabled,
    erp: config.erp.enabled,
    progression: config.progression.enabled,
    "interface-joueur": config.interfaceJoueur.enabled,
    ordinateur: config.ordinateur.enabled,
    temps: config.temps.enabled,
    "cycle-vie": config.cycleVie.enabled,
    interviews: config.interviews.enabled,
    objectifs: config.objectifs.enabled,
    visibilite: config.visibilite.enabled,
  };
  if (id in map) return map[id as OsModuleId] ?? null;
  return null;
}

export default function KeyberOsVueGlobalePage() {
  const { config } = useKeyberOsRuntime();
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
        Keyber OS, c&apos;est le moteur. Chaque composante ci-dessous est un
        module runtime branché au Front-End (réglages dans son sous-onglet).
      </p>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Composantes runtime
        </h2>
        <ul className="mt-3 space-y-2">
          {composantes.map((c) => {
            const on = moduleEnabled(c.id, config);
            return (
              <li key={c.id} className="text-sm text-slate-800">
                <Link
                  href={c.href}
                  className="font-semibold text-slate-900 underline-offset-2 hover:underline"
                >
                  {c.label}
                </Link>
                {on === null ? null : (
                  <span
                    className={
                      on
                        ? "ml-2 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
                        : "ml-2 rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600"
                    }
                  >
                    {on ? "ON" : "OFF"}
                  </span>
                )}
                <span className="text-slate-600"> — {c.blurb}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-slate-700">
          Pipeline : Données → Scénarios → Décisions + Événements → ERP →
          Progression → Interface → Sauvegarde. Code :{" "}
          <code className="text-xs">lib/keyberOs/</code>.
        </p>
      </section>

      <KeyberOsFluxGraph />
    </div>
  );
}
