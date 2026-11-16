"use client";

import Link from "next/link";
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
  const mod = config.interviews;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.interviews} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Dialogues multi-lignes (Étape 16)</p>
        <p className="mt-1 text-violet-900/80">
          Catalogue = pack Ordinateur / param (<code className="text-xs">interviews</code>{" "}
          avec <code className="text-xs">questions[].choices</code>). Feeling
          visual novel POC : portrait, questions, réponses → confiance.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Jauges → sous-onglet{" "}
          <Link
            href="/admin/systeme/relations"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Relations
          </Link>
          . Contenu narratif riche = Phase E.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Interviews — runtime"
        description="Active l'action Interview / PNJ dans le shell joueur."
        onReset={() =>
          setConfig({ interviews: { ...OS_RUNTIME_DEFAULTS.interviews } })
        }
      >
        <OsToggle
          label="Module Interviews activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ interviews: { ...mod, enabled } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
