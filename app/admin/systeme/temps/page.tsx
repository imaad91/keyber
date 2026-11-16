"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsNumberField,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
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
      <KeyberOsRuntimePanel
        title="Temps & Horloge — runtime"
        description="Durée d'une journée et heure de départ de session."
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
            label="Minutes depuis minuit (départ)"
            value={mod.startMinutes}
            min={0}
            max={1439}
            onChange={(startMinutes) =>
              setConfig({ temps: { ...mod, startMinutes } })
            }
          />
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
