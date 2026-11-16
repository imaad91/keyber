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
  const mod = config.ordinateur;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.ordinateur} />

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-950">
        <p className="font-semibold">Chrome desktop (Étapes 3–7)</p>
        <p className="mt-1 text-emerald-900/80">
          Chrome · ERP · Mail · Chat ·{" "}
          <code className="rounded bg-white/80 px-1 text-xs">
            OsComputerDashboard
          </code>{" "}
          (cartes + graphiques prod/pannes, fog) ·{" "}
          <code className="rounded bg-white/80 px-1 text-xs">OsAtelierLive</code>{" "}
          (vue 2D machines, alarme). Docs/browser encore lite (Étape 8).
        </p>
        <p className="mt-2 text-xs text-emerald-800">
          Vérif : Book → Ordinateur → Dashboard ; barre actions → Atelier Live.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Ordinateur — apps runtime"
        description="Active ou désactive les applications du desktop joueur (ERP, mail, chat…). Les apps OFF disparaissent de la grille Bureau."
        onReset={() =>
          setConfig({
            ordinateur: {
              ...OS_RUNTIME_DEFAULTS.ordinateur,
              apps: { ...OS_RUNTIME_DEFAULTS.ordinateur.apps },
            },
          })
        }
      >
        <OsToggle
          label="Module Ordinateur activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ ordinateur: { ...mod, enabled } })}
        />
        {(
          [
            ["erp", "ERP"],
            ["mail", "Boîte Mail"],
            ["dashboard", "Dashboard / live prod"],
            ["documents", "Documents"],
            ["chat", "Chat"],
            ["browser", "Browser"],
          ] as const
        ).map(([key, label]) => (
          <OsToggle
            key={key}
            label={label}
            checked={mod.apps[key]}
            onChange={(v) =>
              setConfig({
                ordinateur: { ...mod, apps: { ...mod.apps, [key]: v } },
              })
            }
          />
        ))}
      </KeyberOsRuntimePanel>
    </div>
  );
}
