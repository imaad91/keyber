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
  const mod = config.notifications;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.notifications} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Toasts + bannière urgente (Étape 15)</p>
        <p className="mt-1 text-violet-900/80">
          Le Moteur d&apos;Événements déclenche le catalogue param (heure +
          conditions). Ce sous-onglet pilote uniquement l&apos;UI notification
          (toast auto-dismiss, bannière URGENT).
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → avancer le temps (ouvrir apps) ou Forcer événement
          ci-dessous → toast + éventuelle bannière.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Notifications — runtime"
        description="Affichage des événements déclenchés (toast + bannière)."
        onReset={() =>
          setConfig({
            notifications: { ...OS_RUNTIME_DEFAULTS.notifications },
          })
        }
      >
        <OsToggle
          label="Module Notifications activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ notifications: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Afficher la bannière urgente"
          checked={mod.showUrgentBanner}
          onChange={(showUrgentBanner) =>
            setConfig({ notifications: { ...mod, showUrgentBanner } })
          }
        />
        <OsNumberField
          label="Durée toast (ms)"
          value={mod.toastDurationMs}
          min={1000}
          max={30000}
          onChange={(toastDurationMs) =>
            setConfig({ notifications: { ...mod, toastDurationMs } })
          }
        />
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <AdminButton
            type="button"
            onClick={() =>
              setConfig({
                notifications: { ...mod, pendingForceEvent: true },
              })
            }
          >
            Forcer prochain événement (Book)
          </AdminButton>
          {mod.pendingForceEvent ? (
            <span className="text-xs font-semibold text-amber-700">
              En attente — ouvre / rafraîchis le Book
            </span>
          ) : null}
        </div>
      </KeyberOsRuntimePanel>
    </div>
  );
}
