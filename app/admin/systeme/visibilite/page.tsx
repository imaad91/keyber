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
  const mod = config.visibilite;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.visibilite} />
      <KeyberOsRuntimePanel
        title="Visibilité — brouillard ERP"
        description="Si fog ON et niveau &lt; seuil sans capteur, les chiffres affichent ???."
        onReset={() =>
          setConfig({ visibilite: { ...OS_RUNTIME_DEFAULTS.visibilite } })
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
            label="Fog si niveau &lt;"
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
