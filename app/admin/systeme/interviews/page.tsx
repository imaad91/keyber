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
  const mod = config.interviews;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.interviews} />
      <KeyberOsRuntimePanel
        title="Interviews — runtime"
        description="Active l'action Interview / PNJ dans le shell joueur."
        onReset={() =>
          setConfig({ interviews: { ...OS_RUNTIME_DEFAULTS.interviews } })
        }
      >
        <OsToggle
          label="Module Interviews activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ interviews: { ...mod, enabled } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
