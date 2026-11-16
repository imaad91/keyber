"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsNumberField,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import { OS_VISIBILITY_MATRIX } from "@/lib/keyberOs/visibilite";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.visibilite;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.visibilite} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Panneau Visibilité (Étape 18)</p>
        <p className="mt-1 text-violet-900/80">
          Feeling POC : investissements, matrice de tiers, inventaire
          capteurs (param <code className="text-xs">Ordinateur.sensors</code>
          ). Installer un capteur débite la trésorerie et clarifie KPI/ERP.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → brouillard ??? → Visibilité → Installer → KPI
          lisibles.
        </p>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <p className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Matrice des tiers (référence)
        </p>
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2">Tier</th>
              <th className="px-4 py-2">Sens</th>
              <th className="px-4 py-2">ERP</th>
              <th className="px-4 py-2">KPI</th>
            </tr>
          </thead>
          <tbody>
            {OS_VISIBILITY_MATRIX.map((row) => (
              <tr key={row.tier} className="border-b border-slate-50">
                <td className="px-4 py-2 font-semibold text-slate-900">
                  {row.tier} · {row.label}
                </td>
                <td className="px-4 py-2 text-slate-600">{row.meaning}</td>
                <td className="px-4 py-2 text-slate-600">{row.erp}</td>
                <td className="px-4 py-2 text-slate-600">{row.kpi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <KeyberOsRuntimePanel
        title="Visibilité — brouillard ERP / KPI"
        description="Si fog ON et niveau < seuil sans capteur, les KPI finance affichent ???."
        onReset={() =>
          setConfig({
            visibilite: {
              ...OS_RUNTIME_DEFAULTS.visibilite,
              investments: [
                ...OS_RUNTIME_DEFAULTS.visibilite.investments,
              ],
            },
          })
        }
      >
        <OsToggle
          label="Module Visibilité activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ visibilite: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Brouillard activé"
          checked={mod.fogEnabled}
          onChange={(fogEnabled) =>
            setConfig({ visibilite: { ...mod, fogEnabled } })
          }
        />
        <OsToggle
          label="Capteur installé par défaut"
          checked={mod.sensorDefaultInstalled}
          onChange={(sensorDefaultInstalled) =>
            setConfig({ visibilite: { ...mod, sensorDefaultInstalled } })
          }
        />
        <OsToggle
          label="Afficher la matrice dans le panneau joueur"
          checked={mod.showMatrix}
          onChange={(showMatrix) =>
            setConfig({ visibilite: { ...mod, showMatrix } })
          }
        />
        <div className="flex flex-wrap gap-3">
          <OsNumberField
            label="Niveau départ (0–3)"
            value={mod.defaultLevel}
            min={0}
            max={3}
            onChange={(defaultLevel) =>
              setConfig({ visibilite: { ...mod, defaultLevel } })
            }
          />
          <OsNumberField
            label="Fog si niveau <"
            value={mod.fogBelowLevel}
            min={0}
            max={3}
            onChange={(fogBelowLevel) =>
              setConfig({ visibilite: { ...mod, fogBelowLevel } })
            }
          />
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
