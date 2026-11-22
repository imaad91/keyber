"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsNumberField,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import { OS_ACTION_TIME_COST } from "@/lib/keyberOs/temps";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.temps;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.temps} />

      <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-sm text-teal-950">
        <p className="font-semibold">Journée jouable (Étape 10)</p>
        <p className="mt-1 text-teal-900/80">
          Horloge 08:00 → fin de journée · barre de progression · « Il te reste… »
          · chaque action / app consomme des minutes. Cap fin de journée →{" "}
          <strong>Cycle de vie</strong> (DayEnd).
        </p>
        <p className="mt-2 text-xs text-teal-800">
          Vérif : Book → ouvrir Interview / Atelier / une app Ordinateur → horloge
          avance, barre se remplit, reste diminue.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Temps & Horloge — runtime"
        description="Durée d'une journée et point de départ (minutes déjà écoulées, 0 = 08:00)."
        onReset={() => setConfig({ temps: { ...OS_RUNTIME_DEFAULTS.temps } })}
      >
        <OsToggle
          label="Module Temps activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ temps: { ...mod, enabled } })}
        />
        <div className="flex flex-wrap gap-3">
          <OsNumberField
            label="Minutes / jour"
            value={mod.dayLengthMinutes}
            min={60}
            max={1440}
            onChange={(dayLengthMinutes) =>
              setConfig({ temps: { ...mod, dayLengthMinutes } })
            }
          />
          <OsNumberField
            label="Jour de départ"
            value={mod.startDay}
            min={0}
            max={7}
            onChange={(startDay) => setConfig({ temps: { ...mod, startDay } })}
          />
          <OsNumberField
            label="Minutes déjà écoulées (0 = 08:00)"
            value={mod.startMinutes}
            min={0}
            max={1439}
            onChange={(startMinutes) =>
              setConfig({ temps: { ...mod, startMinutes } })
            }
          />
        </div>
      </KeyberOsRuntimePanel>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
        <p className="font-semibold text-slate-900">Coûts minutes (référence)</p>
        <p className="mt-1 text-xs text-slate-500">
          Constantes <code>OS_ACTION_TIME_COST</code> — lecture seule Admin.
        </p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(OS_ACTION_TIME_COST).map(([id, min]) => (
            <li
              key={id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span className="font-mono text-xs text-slate-600">{id}</span>
              <span className="tabular-nums font-semibold">{min} min</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
