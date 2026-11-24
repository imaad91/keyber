"use client";

import { ClearCampusSchemaPanel } from "@/components/admin/ClearCampusSchemaPanel";
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
  const mod = config.campus;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.campus} />

      <section className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/50 p-4 text-sm text-teal-950">
        <p className="font-semibold">Clear Campus · Phase 2</p>
        <p className="mt-1 text-teal-900/80">
          Navigation ailes / salles + résolution hotspots (
          <code className="text-xs">suite</code>,{" "}
          <code className="text-xs">interview</code>,{" "}
          <code className="text-xs">decision</code>,{" "}
          <code className="text-xs">document</code>,{" "}
          <code className="text-xs">productionLive</code>). Thème clair
          uniquement.
        </p>
      </section>

      <ClearCampusSchemaPanel />

      <KeyberOsRuntimePanel
        title="Campus — runtime"
        description="Active la navigation monde et les hotspots en session Book."
        onReset={() =>
          setConfig({ campus: { ...OS_RUNTIME_DEFAULTS.campus } })
        }
      >
        <OsToggle
          label="Module Campus activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ campus: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
