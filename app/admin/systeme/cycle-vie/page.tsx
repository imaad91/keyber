"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsNumberField,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import { OS_ONBOARDING_STEPS } from "@/lib/keyberOs/onboarding";
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
        <p className="font-semibold">DayEnd + Intro / Onboarding (Étapes 11–12)</p>
        <p className="mt-1 text-violet-900/80">
          Overlay fin de journée · Intro Jour 0 · coach 4 étapes (actions
          verrouillées puis unlock). Textes génériques / param — pas de contenu
          Novacier. Textes Lumière = Phase E.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif Histoire : Book Mode Histoire → intro → coach 1–4 → Terminer la
          visite. DayEnd : bouton forcer ci-dessous.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Cycle de vie — runtime"
        description="DayEnd, longueur de semaine, intro & onboarding Mode Histoire."
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
        <OsToggle
          label="Intro + onboarding (Mode Histoire)"
          checked={mod.onboardingEnabled}
          onChange={(onboardingEnabled) =>
            setConfig({ cycleVie: { ...mod, onboardingEnabled } })
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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
        <p className="font-semibold text-slate-900">
          Coach Jour 0 — étapes (référence)
        </p>
        <ol className="mt-3 space-y-2">
          {OS_ONBOARDING_STEPS.map((s) => (
            <li
              key={s.step}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Étape {s.step} · {s.actionHint}
              </p>
              <p className="font-semibold text-slate-900">{s.titre}</p>
              <p className="mt-0.5 text-xs text-slate-600">{s.mentorLine}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}