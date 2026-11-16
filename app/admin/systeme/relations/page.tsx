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
  const mod = config.relations;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.relations} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Jauges PNJ (Étape 16)</p>
        <p className="mt-1 text-violet-900/80">
          Slots génériques <code className="text-xs">relations.&lt;id&gt;</code>{" "}
          — initialisés depuis les interviews du param. Un choix de dialogue
          applique <code className="text-xs">confianceDelta</code>.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → Interview → choisir une réponse → jauge bouge.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Relations — runtime"
        description="Confiance initiale et affichage des jauges dans Interview."
        onReset={() =>
          setConfig({ relations: { ...OS_RUNTIME_DEFAULTS.relations } })
        }
      >
        <OsToggle
          label="Module Relations activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ relations: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Afficher les jauges dans Interview"
          checked={mod.showGauges}
          onChange={(showGauges) =>
            setConfig({ relations: { ...mod, showGauges } })
          }
        />
        <OsNumberField
          label="Confiance initiale (défaut)"
          value={mod.defaultTrust}
          min={0}
          max={100}
          onChange={(defaultTrust) =>
            setConfig({ relations: { ...mod, defaultTrust } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
