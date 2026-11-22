"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { KeyberOsFluxGraph } from "@/components/admin/KeyberOsFluxGraph";
import { KeyberOsSubNav } from "@/components/admin/KeyberOsSubNav";
import { OsModuleHealthPill } from "@/components/admin/OsModuleDashboard";
import { useBookStore } from "@/lib/bookStore";
import {
  KEYBER_OS_NAV,
  type KeyberOsComposanteId,
} from "@/lib/keyberOsDocs";
import { osBookBridgeInfo } from "@/lib/keyberOs/bookBridge";
import {
  diagnoseOsModule,
  formatRelativeFr,
} from "@/lib/keyberOs/moduleDiagnostics";
import { useOsModuleChangeLog } from "@/lib/keyberOs/moduleChangeLog";
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
    journal: config.journal.enabled,
    livre: config.livre.enabled,
    profil: config.profil.enabled,
    fins: config.fins.enabled,
  };
  if (id in map) return map[id as OsModuleId] ?? null;
  return null;
}

export default function KeyberOsVueGlobalePage() {
  const { config } = useKeyberOsRuntime();
  const book = useBookStore();
  const live = book.entriesByStatus("live");
  const composantes = KEYBER_OS_NAV.filter((n) => n.id !== "vue-globale");
  const bridge = osBookBridgeInfo();
  const recent = useOsModuleChangeLog(undefined, 8);

  const pulse = useMemo(() => {
    const diags = composantes.map((c) =>
      diagnoseOsModule(c.id as KeyberOsComposanteId, config, live)
    );
    return {
      green: diags.filter((d) => d.tone === "green").length,
      yellow: diags.filter((d) => d.tone === "yellow").length,
      red: diags.filter((d) => d.tone === "red").length,
      total: diags.length,
    };
  }, [composantes, config, live]);

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

      <section className="mb-6 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pulse système
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Santé calculée live depuis le runtime + Book Live. Ouvre un
              module pour son schéma d&apos;architecture.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            maj runtime {formatRelativeFr(config.updatedAt)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-900">{pulse.green}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Vert
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-amber-950">{pulse.yellow}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Jaune
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-rose-950">{pulse.red}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800">
              Rouge
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{pulse.total}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Modules
            </p>
          </div>
        </div>
        {recent.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Fil court — derniers changements
            </p>
            <ul className="space-y-1 text-xs text-slate-700">
              {recent.map((e) => (
                <li key={e.id} className="flex flex-wrap gap-2">
                  <span className="font-mono text-[10px] text-slate-500">
                    {formatRelativeFr(e.at)}
                  </span>
                  <Link
                    href={
                      KEYBER_OS_NAV.find((n) => n.id === e.moduleId)?.href ??
                      "/admin/systeme/vue-globale"
                    }
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {KEYBER_OS_NAV.find((n) => n.id === e.moduleId)?.label ??
                      e.moduleId}
                  </Link>
                  <span>{e.summary}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

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
              Legacy `/play` (Étape 42)
            </dt>
            <dd className="mt-1 font-mono text-xs text-slate-900">
              {bridge.legacyPath} → {bridge.liveCatalog}
            </dd>
            <dd className="mt-1 text-xs text-slate-600">
              {bridge.legacyRetired
                ? "Retiré de l'entrée joueur — POC archivé"
                : "Encore actif"}{" "}
              (
              <code className="rounded bg-violet-100 px-1">
                {bridge.legacyArchiveHref}
              </code>
              ).
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
              <li
                key={c.id}
                className="flex flex-wrap items-center gap-2 text-sm text-slate-800"
              >
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
                        ? "rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
                        : "rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600"
                    }
                  >
                    {on ? "ON" : "OFF"}
                  </span>
                )}
                <OsModuleHealthPill
                  moduleId={c.id as KeyberOsComposanteId}
                />
                <span className="text-slate-600">— {c.blurb}</span>
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
