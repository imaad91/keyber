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
  const mod = config.productionLive;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["production-live"]} />

      <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-sm text-teal-950">
        <p className="font-semibold">Vue Live Production · Phase 2</p>
        <p className="mt-1 text-teal-900/80">
          Sol opérationnel du <strong>contexte</strong> (param{" "}
          <code className="text-xs">ProductionLive</code>) — Novacier ≠ Lumière.
          Fallback machines ERP si le bloc est vide. UI claire (pas de dark).
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Production Live — runtime"
        description="Action shell « Vue Live Production » (atelier-live) + hotspot productionLive."
        onReset={() =>
          setConfig({
            productionLive: { ...OS_RUNTIME_DEFAULTS.productionLive },
          })
        }
      >
        <OsToggle
          label="Module Vue Live Production activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ productionLive: { ...mod, enabled } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
