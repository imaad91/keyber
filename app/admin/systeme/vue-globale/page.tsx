"use client";

import Link from "next/link";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { KeyberOsFluxGraph } from "@/components/admin/KeyberOsFluxGraph";
import { KeyberOsSubNav } from "@/components/admin/KeyberOsSubNav";
import { KEYBER_OS_NAV } from "@/lib/keyberOsDocs";
import { osBookBridgeInfo } from "@/lib/keyberOs/bookBridge";
import { V1_GEL } from "@/lib/keyberOs/v1Gel";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import type { OsModuleId } from "@/lib/keyberOs/types";
import { SCENARIO_FILE_CONTRACT } from "@/lib/scenarioFileContract";

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
    notifications: config.notifications.enabled,
    interviews: config.interviews.enabled,
    relations: config.relations.enabled,
    objectifs: config.objectifs.enabled,
    visibilite: config.visibilite.enabled,
  };
  if (id in map) return map[id as OsModuleId] ?? null;
  return null;
}

export default function KeyberOsVueGlobalePage() {
  const { config } = useKeyberOsRuntime();
  const composantes = KEYBER_OS_NAV.filter((n) => n.id !== "vue-globale");
  const bridge = osBookBridgeInfo();

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

      <section className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-5 text-sm text-emerald-950 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
          Étape 40
        </p>
        <h2 className="mt-1 text-sm font-semibold uppercase tracking-wide text-emerald-900">
          {V1_GEL.title}
        </h2>
        <p className="mt-2 max-w-3xl text-emerald-900/90">
          Contrat OS / Book / Atelier figé pour la V1. Preuve runtime :{" "}
          <Link
            href="/admin/controle/rapports/v1-lumiere"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Contrôle → système prouvé avec Lumière
          </Link>
          . Go / no-go V1 = validation humaine.
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-emerald-950/90">
          {V1_GEL.guarantees.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-emerald-800">
          Contrat fichier :{" "}
          <code className="rounded bg-white/80 px-1">
            {SCENARIO_FILE_CONTRACT.id}
          </code>
          . Différé : {V1_GEL.deferred.join(" · ")}
        </p>
      </section>

      <section className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-5 text-sm text-violet-950 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-800">
          Pont Book → joueur (Étape 20)
        </h2>
        <p className="mt-2 max-w-3xl text-violet-900/90">{bridge.note}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-violet-200/80 bg-white/80 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
              Chemin officiel
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900">
              {bridge.officialPath}
            </dd>
            <dd className="mt-1 text-xs text-slate-600">
              Shell :{" "}
              <code className="rounded bg-violet-100 px-1">{bridge.shell}</code>
            </dd>
          </div>
          <div className="rounded-xl border border-violet-200/80 bg-white/80 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
              Legacy POC (intact)
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900">
              {bridge.legacyPath}
            </dd>
            <dd className="mt-1 text-xs text-slate-600">
              Novacier / useGameStore — non branché sur le Book.
            </dd>
          </div>
          <div className="rounded-xl border border-violet-200/80 bg-white/80 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
              Entrées Admin
            </dt>
            <dd className="mt-1 text-xs text-slate-700">
              <Link
                href="/admin/book/en-cours-de-test"
                className="font-semibold underline-offset-2 hover:underline"
              >
                Book · En cours de test
              </Link>
              {" · "}
              <Link
                href="/admin/book/live"
                className="font-semibold underline-offset-2 hover:underline"
              >
                Live
              </Link>
              {" → Tester"}
            </dd>
          </div>
          <div className="rounded-xl border border-violet-200/80 bg-white/80 px-3 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
              Catalogue joueur (Étape 39)
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900">
              {bridge.liveCatalog}
            </dd>
            <dd className="mt-1 space-y-0.5 font-mono text-[11px] text-slate-700">
              <div>{bridge.liveCompetence}</div>
              <div>{bridge.liveHistoire}</div>
            </dd>
            <dd className="mt-1 text-xs text-slate-600">
              Storage : {bridge.catalogStorage}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-violet-800">
          Bandeaux Test (orange) / Live (vert) inchangés —{" "}
          <code className="rounded bg-white/80 px-1">BookPlayStatusBanner</code>
          . Pipeline :{" "}
          <code className="rounded bg-white/80 px-1">{bridge.pipeline}</code>.
          Live = une version précise par lignée (les autres Live → En test).
        </p>
      </section>

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
