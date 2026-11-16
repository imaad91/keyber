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

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950">
        <p className="font-semibold">Débrief (Étape 13)</p>
        <p className="mt-1 text-emerald-900/80">
          Fin de semaine → XP bonus selon ending (Victoire / Partielle / Échec) +
          lignes compétences dans{" "}
          <code className="rounded bg-white/80 px-1 text-xs">
            OsDebriefView
          </code>
          . Forcer via Admin → Cycle de vie.
        </p>
      </section>

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
