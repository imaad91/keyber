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
  const mod = config.moteurDecisions;

  function patchDelta(
    index: 0 | 1 | 2,
    field: "tresorerie" | "stock" | "production",
    value: number
  ) {
    const deltas = mod.deltas.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    ) as typeof mod.deltas;
    setConfig({ moteurDecisions: { ...mod, deltas } });
  }

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["moteur-decisions"]} />

      <KeyberOsRuntimePanel
        title="Moteur de Décisions — deltas runtime"
        description="Quand le joueur choisit l'option 0 / 1 / 2, ces deltas génériques mettent à jour Trésorerie brute, Stock et Production avant l'ERP."
        onReset={() =>
          setConfig({
            moteurDecisions: {
              ...OS_RUNTIME_DEFAULTS.moteurDecisions,
              deltas: OS_RUNTIME_DEFAULTS.moteurDecisions.deltas.map((d) => ({
                ...d,
              })) as typeof mod.deltas,
            },
          })
        }
      >
        <OsToggle
          label="Module Décisions activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ moteurDecisions: { ...mod, enabled } })
          }
        />
        <OsNumberField
          label="Δ Commandes (chaque choix)"
          value={mod.commandesDelta}
          min={-50}
          max={50}
          onChange={(commandesDelta) =>
            setConfig({ moteurDecisions: { ...mod, commandesDelta } })
          }
        />
        {([0, 1, 2] as const).map((i) => (
          <div
            key={i}
            className="rounded-xl border border-emerald-200 bg-white/70 p-3"
          >
            <p className="mb-2 text-xs font-semibold text-emerald-900">
              Option {i} (opt{i})
            </p>
            <div className="flex flex-wrap gap-3">
              <OsNumberField
                label="Δ Trésorerie"
                value={mod.deltas[i]!.tresorerie}
                min={-100000}
                max={100000}
                onChange={(v) => patchDelta(i, "tresorerie", v)}
              />
              <OsNumberField
                label="Δ Stock"
                value={mod.deltas[i]!.stock}
                min={-500}
                max={500}
                onChange={(v) => patchDelta(i, "stock", v)}
              />
              <OsNumberField
                label="Δ Production"
                value={mod.deltas[i]!.production}
                min={-100}
                max={100}
                onChange={(v) => patchDelta(i, "production", v)}
              />
            </div>
          </div>
        ))}
      </KeyberOsRuntimePanel>
    </div>
  );
}
