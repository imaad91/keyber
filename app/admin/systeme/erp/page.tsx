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

/**
 * Keyber OS — ERP : doc + module runtime (facteur Trésorerie, équipe…).
 */
export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const erp = config.erp;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["erp"]} />

      <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-950">
        <p className="font-semibold">Tables Ordinateur ERP (Étape 4)</p>
        <p className="mt-1 text-sky-900/80">
          Dans le jeu Book → Accès Ordinateur → ERP : 10 modules (dashboard,
          stock, commandes, production, employés, factures, machines, clients,
          fournisseurs, maintenance). Fog colonnes via{" "}
          <strong>Visibilité</strong>. Données = pack param / synthèse OS.
        </p>
        <p className="mt-2 text-xs text-sky-800">
          KPI bar (Étape 9) — définitions génériques dans{" "}
          <code className="rounded bg-white/80 px-1">play.kpis</code> : Trésorerie,
          Stock, Production, Rebut, Moral, Éthique, Confiance client. Affichage
          : Interface Joueur → barre KPI.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="ERP — paramètres runtime"
        description="Pilotent les jauges Front-End (Trésorerie affichée, équipe de base). Formule : tresorerie_affichee = tresorerie_brute × facteur."
        onReset={() => setConfig({ erp: { ...OS_RUNTIME_DEFAULTS.erp } })}
      >
        <OsToggle
          label="Module ERP activé"
          checked={erp.enabled}
          onChange={(enabled) => setConfig({ erp: { ...erp, enabled } })}
        />
        <div className="flex flex-wrap items-end gap-3">
          <OsNumberField
            label="Facteur Trésorerie"
            value={erp.tresorerieFacteur}
            min={0}
            max={10}
            step={0.1}
            onChange={(tresorerieFacteur) =>
              setConfig({ erp: { ...erp, tresorerieFacteur } })
            }
          />
          <OsNumberField
            label="Équipe (base)"
            value={erp.equipeBase}
            min={0}
            max={500}
            onChange={(equipeBase) => setConfig({ erp: { ...erp, equipeBase } })}
          />
          <AdminButton
            type="button"
            variant="secondary"
            onClick={() => setConfig({ erp: { ...erp, tresorerieFacteur: 1 } })}
          >
            ×1
          </AdminButton>
          <AdminButton
            type="button"
            onClick={() => setConfig({ erp: { ...erp, tresorerieFacteur: 2 } })}
          >
            Tester ×2
          </AdminButton>
        </div>
        <p className="text-xs text-emerald-800">
          Actuel : ×{erp.tresorerieFacteur} · équipe {erp.equipeBase} · maj{" "}
          {config.updatedAt}
        </p>
      </KeyberOsRuntimePanel>
    </div>
  );
}
