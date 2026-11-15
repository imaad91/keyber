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
  const mod = config.objectifs;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.objectifs} />
      <KeyberOsRuntimePanel
        title="Objectifs — runtime"
        description="Active le suivi d'objectifs dans la sidebar joueur."
        onReset={() =>
          setConfig({ objectifs: { ...OS_RUNTIME_DEFAULTS.objectifs } })
        }
      >
        <OsToggle
          label="Module Objectifs activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ objectifs: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
