"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsNumberField,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.cycleVie;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["cycle-vie"]} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">DayEnd (Étape 11)</p>
        <p className="mt-1 text-violet-900/80">
          Overlay fin de journée (18:00) → résumé → passage jour suivant ou
          débrief. Déclenché automatiquement quand l&apos;horloge est pleine, ou
          via le bouton test ci-dessous.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book ouvert → Admin → Forcer DayEnd → revenir au Book (overlay).
          Ou épuiser le temps de la journée.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Cycle de vie — runtime"
        description="Règles de fin de journée et longueur de semaine jouable."
        onReset={() =>
          setConfig({ cycleVie: { ...OS_RUNTIME_DEFAULTS.cycleVie } })
        }
      >
        <OsToggle
          label="Module Cycle de vie activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ cycleVie: { ...mod, enabled } })}
        />
        <OsToggle
          label="DayEnd auto quand horloge pleine"
          checked={mod.autoEndOnTimeFull}
          onChange={(autoEndOnTimeFull) =>
            setConfig({ cycleVie: { ...mod, autoEndOnTimeFull } })
          }
        />
        <OsNumberField
          label="Jours max avant débrief"
          value={mod.maxDays}
          min={1}
          max={14}
          onChange={(maxDays) => setConfig({ cycleVie: { ...mod, maxDays } })}
        />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <AdminButton
            type="button"
            onClick={() =>
              setConfig({
                cycleVie: { ...mod, pendingForceDayEnd: true },
              })
            }
          >
            Forcer DayEnd (prochain rendu Book)
          </AdminButton>
          {mod.pendingForceDayEnd ? (
            <span className="text-xs font-semibold text-amber-700">
              En attente — ouvre / rafraîchis le Book
            </span>
          ) : null}
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
