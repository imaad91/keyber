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
  const mod = config.objectifs;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.objectifs} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Panneau Objectifs (Étape 17)</p>
        <p className="mt-1 text-violet-900/80">
          Aside droite Book = feeling{" "}
          <code className="text-xs">ObjectivePanel</code> POC. Statuts{" "}
          <code className="text-xs">EN_COURS / COMPLETE / ECHOUE</code>. Éval
          générique via <code className="text-xs">metric</code> +{" "}
          <code className="text-xs">cibleNombre</code> (stock, stepIndex,
          emailsReadUrgent…).
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → décider / lire mail → barre progression + COMPLETE.
          DayEnd → journaliers restants ECHOUE.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Objectifs — runtime"
        description="Suivi objectifs dans l'aside joueur + règles d'évaluation."
        onReset={() =>
          setConfig({ objectifs: { ...OS_RUNTIME_DEFAULTS.objectifs } })
        }
      >
        <OsToggle
          label="Module Objectifs activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ objectifs: { ...mod, enabled } })}
        />
        <OsToggle
          label="Attribuer XP à la complétion"
          checked={mod.awardXp}
          onChange={(awardXp) => setConfig({ objectifs: { ...mod, awardXp } })}
        />
        <OsToggle
          label="Journaliers EN_COURS → ECHOUE au DayEnd"
          checked={mod.failJournalierOnDayEnd}
          onChange={(failJournalierOnDayEnd) =>
            setConfig({ objectifs: { ...mod, failJournalierOnDayEnd } })
          }
        />
        <OsNumberField
          label="XP par défaut (si objectif sans xp)"
          value={mod.xpOnComplete}
          min={0}
          max={500}
          onChange={(xpOnComplete) =>
            setConfig({ objectifs: { ...mod, xpOnComplete } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
