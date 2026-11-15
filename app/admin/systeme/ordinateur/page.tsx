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
      <KeyberOsRuntimePanel
        title="Ordinateur — apps runtime"
        description="Active ou désactive les applications du desktop joueur (ERP, mail, chat…)."
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
