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
  const mod = config.moteurEvenements;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["moteur-evenements"]} />

      <KeyberOsRuntimePanel
        title="Moteur d'Événements — runtime"
        description="Déclenche un événement du fichier de paramétrage (catalogue entreprise) et applique un impact stock générique configurable."
        onReset={() =>
          setConfig({
            moteurEvenements: { ...OS_RUNTIME_DEFAULTS.moteurEvenements },
          })
        }
      >
        <OsToggle
          label="Module Événements activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ moteurEvenements: { ...mod, enabled } })
          }
        />
        <OsNumberField
          label="Impact stock à chaque événement"
          value={mod.stockImpact}
          min={-100}
          max={100}
          onChange={(stockImpact) =>
            setConfig({ moteurEvenements: { ...mod, stockImpact } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
