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
  const mod = config.progression;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["progression"]} />

      <KeyberOsRuntimePanel
        title="Progression — XP / score / niveaux"
        description="Chaque choix joueur applique ces valeurs. Seuil de niveau = niveau actuel × XP par niveau."
        onReset={() =>
          setConfig({ progression: { ...OS_RUNTIME_DEFAULTS.progression } })
        }
      >
        <OsToggle
          label="Module Progression activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ progression: { ...mod, enabled } })
          }
        />
        <div className="flex flex-wrap gap-3">
          <OsNumberField
            label="XP par choix"
            value={mod.xpPerChoice}
            min={0}
            max={1000}
            onChange={(xpPerChoice) =>
              setConfig({ progression: { ...mod, xpPerChoice } })
            }
          />
          <OsNumberField
            label="Score par choix"
            value={mod.scorePerChoice}
            min={0}
            max={1000}
            onChange={(scorePerChoice) =>
              setConfig({ progression: { ...mod, scorePerChoice } })
            }
          />
          <OsNumberField
            label="XP par niveau"
            value={mod.xpPerLevel}
            min={1}
            max={10000}
            onChange={(xpPerLevel) =>
              setConfig({ progression: { ...mod, xpPerLevel } })
            }
          />
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
