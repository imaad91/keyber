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
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.progression} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">XP compétences (Étape 19)</p>
        <p className="mt-1 text-violet-900/80">
          Ids compétences = param (« Compétences sélectionnées » / Compétence
          mode). Après une décision : XP global + XP skill (impacts choix ou
          fallback). Débrief liste niv. / XP par compétence.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book Lumière Compétence → décider → jauge « Planification
          MRP » + XP global.
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-950">
        <p className="font-semibold">Débrief (Étape 13)</p>
        <p className="mt-1 text-emerald-900/80">
          Fin de semaine → XP bonus selon ending + lignes compétences dans
          OsDebriefView. Forcer via Admin → Cycle de vie.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Progression — XP / score / skills"
        description="Global = XP/score/niveau partie. Skills = barres compétences param."
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
        <OsToggle
          label="XP compétences à chaque décision"
          checked={mod.skillXpEnabled}
          onChange={(skillXpEnabled) =>
            setConfig({ progression: { ...mod, skillXpEnabled } })
          }
        />
        <div className="flex flex-wrap gap-3">
          <OsNumberField
            label="XP global par choix"
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
            label="XP par niveau global"
            value={mod.xpPerLevel}
            min={1}
            max={10000}
            onChange={(xpPerLevel) =>
              setConfig({ progression: { ...mod, xpPerLevel } })
            }
          />
          <OsNumberField
            label="XP skill par décision"
            value={mod.xpPerSkillChoice}
            min={0}
            max={1000}
            onChange={(xpPerSkillChoice) =>
              setConfig({ progression: { ...mod, xpPerSkillChoice } })
            }
          />
          <OsNumberField
            label="Seuil XP / niveau skill"
            value={mod.xpPerSkillLevel}
            min={1}
            max={10000}
            onChange={(xpPerSkillLevel) =>
              setConfig({ progression: { ...mod, xpPerSkillLevel } })
            }
          />
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
