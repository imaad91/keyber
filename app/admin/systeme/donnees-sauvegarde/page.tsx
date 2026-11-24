"use client";

import { useEffect, useState } from "react";
import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { OsStateSchemaPanel } from "@/components/admin/OsStateSchemaPanel";
import { ClearCampusSchemaPanel } from "@/components/admin/ClearCampusSchemaPanel";
import { ScenarioFileContractPanel } from "@/components/admin/ScenarioFileContractPanel";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";
import {
  OS_PARAM_LOADER_RULES,
  readRememberedOsParamSource,
  type OsParamLoadSource,
} from "@/lib/keyberOs/paramLoader";
import { getOsActivePlay } from "@/lib/osActivePlayStore";
import { SCENARIO_FILE_CONTRACT } from "@/lib/scenarioFileContract";

const LUMIERE_SAMPLE =
  "/api/scenarios/lumiere-co_logisticien-histoire_v1.json";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.donneesSauvegarde;
  const [lumiereParam, setLumiereParam] = useState<unknown>(null);
  const [lumiereErr, setLumiereErr] = useState<string | null>(null);
  const [bootSource, setBootSource] = useState<
    (OsParamLoadSource & { at?: string }) | null
  >(null);
  const [activeSource, setActiveSource] = useState<OsParamLoadSource | null>(
    null
  );

  useEffect(() => {
    setBootSource(readRememberedOsParamSource());
    const active = getOsActivePlay();
    setActiveSource(active.play?.paramSource ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(LUMIERE_SAMPLE);
        if (!res.ok) {
          if (!cancelled) setLumiereErr(`HTTP ${res.status}`);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setLumiereParam(json);
          setLumiereErr(null);
        }
      } catch (e) {
        if (!cancelled) {
          setLumiereErr(
            e instanceof Error ? e.message : "Chargement impossible"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayed = activeSource || bootSource;

  return (
    <div>
      <KeyberOsComposanteView
        doc={KEYBER_OS_COMPOSANTES["donnees-sauvegarde"]}
      />

      <section className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Loader OS — source param (Étape 36)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Boot Book : uniquement fichier disk ou embedded Book.{" "}
          <strong>Pas de fallback Novacier</strong>.
        </p>
        <ul className="mt-3 list-inside list-disc text-xs text-slate-700">
          {OS_PARAM_LOADER_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        {displayed ? (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-3 font-mono text-xs text-indigo-950">
            <p className="font-semibold">{displayed.label}</p>
            <p className="mt-1 text-slate-600">
              kind={displayed.kind} · fichier={displayed.fileName}
              {displayed.relativePath
                ? ` · ${displayed.relativePath}`
                : ""}
            </p>
            {bootSource?.at && !activeSource ? (
              <p className="mt-1 text-[10px] text-slate-400">
                Dernier boot session (Europe/Paris) :{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Paris",
                }).format(new Date(bootSource.at))}
              </p>
            ) : null}
            {activeSource ? (
              <p className="mt-1 text-[10px] text-emerald-700">
                Session Book OS active
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Aucune source mémorisée — lance{" "}
            <code className="text-xs">/jouer/book/[id]</code> pour peupler le
            log.
          </p>
        )}
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Contrat fichier unique (Étape 35)
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {SCENARIO_FILE_CONTRACT.title} — l&apos;OS ne lit qu&apos;un JSON par
          scénario sous <code className="text-xs">data/scenarios/&lt;id&gt;/</code>
          . Vérif démo Lumière ci-dessous.
        </p>
        {lumiereErr ? (
          <p className="mt-3 text-sm text-rose-600">{lumiereErr}</p>
        ) : lumiereParam ? (
          <ScenarioFileContractPanel
            className="mt-4"
            rawParam={lumiereParam}
          />
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Chargement échantillon Lumière…
          </p>
        )}
      </section>

      <KeyberOsRuntimePanel
        title="Données & Sauvegarde — runtime"
        description="Charge le fichier de paramétrage et écrit la progression dans keyber-os-play-saves-v1 (pas le Studio)."
        onReset={() =>
          setConfig({
            donneesSauvegarde: { ...OS_RUNTIME_DEFAULTS.donneesSauvegarde },
          })
        }
      >
        <OsToggle
          label="Module Données & Sauvegarde activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ donneesSauvegarde: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Autosave après chaque étape"
          checked={mod.autosave}
          onChange={(autosave) =>
            setConfig({ donneesSauvegarde: { ...mod, autosave } })
          }
        />
      </KeyberOsRuntimePanel>

      <ClearCampusSchemaPanel param={lumiereParam} />

      <OsStateSchemaPanel />
    </div>
  );
}
