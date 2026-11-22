"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.moteurScenarios;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["moteur-scenarios"]} />

      <KeyberOsRuntimePanel
        title="Moteur de Scénarios — runtime"
        description="Parse le fichier de paramétrage (décisions / étapes). Désactiver = aucune étape jouable côté Front."
        onReset={() =>
          setConfig({
            moteurScenarios: { ...OS_RUNTIME_DEFAULTS.moteurScenarios },
          })
        }
      >
        <OsToggle
          label="Module Scénarios activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ moteurScenarios: { ...mod, enabled } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
