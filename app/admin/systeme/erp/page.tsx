"use client";

import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import { AdminButton } from "@/components/admin/AdminPrimitives";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";

/**
 * Keyber OS — ERP : doc + paramètre runtime (facteur Trésorerie).
 * Le Front-End lit keyber-os-runtime-v1 via applyOsTresorerie.
 */
export default function Page() {
  const { config, setTresorerieFacteur } = useKeyberOsRuntime();

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["erp"]} />

      <section className="mt-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-emerald-950">
          Paramètre runtime OS — Trésorerie
        </h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          Modifie le calcul d&apos;affichage ERP / Interface Joueur. Le
          Front-End utilise immédiatement ce facteur (pas de code en dur
          séparé). Formule :{" "}
          <code className="text-xs">{config.tresorerieFormuleLabel}</code>
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-emerald-800">
              Facteur Trésorerie
            </span>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              className="w-28 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm"
              value={config.tresorerieFacteur}
              onChange={(e) =>
                setTresorerieFacteur(Number(e.target.value) || 0)
              }
            />
          </label>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => setTresorerieFacteur(1)}
          >
            Reset ×1
          </AdminButton>
          <AdminButton
            type="button"
            onClick={() => setTresorerieFacteur(2)}
          >
            Tester ×2
          </AdminButton>
        </div>
        <p className="mt-3 text-xs text-emerald-800">
          Valeur actuelle : ×{config.tresorerieFacteur} · maj{" "}
          {config.updatedAt}
        </p>
      </section>
    </div>
  );
}
