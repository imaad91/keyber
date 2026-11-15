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
  const mod = config.interfaceJoueur;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["interface-joueur"]} />

      <KeyberOsRuntimePanel
        title="Interface Joueur — affichage"
        description="Contrôle ce que le Front-End Book affiche (jauges ERP, ligne XP, log pipeline). Pas de contenu métier."
        onReset={() =>
          setConfig({
            interfaceJoueur: { ...OS_RUNTIME_DEFAULTS.interfaceJoueur },
          })
        }
      >
        <OsToggle
          label="Module Interface activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ interfaceJoueur: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Afficher jauges ERP"
          checked={mod.showErpTiles}
          onChange={(showErpTiles) =>
            setConfig({ interfaceJoueur: { ...mod, showErpTiles } })
          }
        />
        <OsToggle
          label="Afficher XP / score / niveau"
          checked={mod.showProgressionLine}
          onChange={(showProgressionLine) =>
            setConfig({ interfaceJoueur: { ...mod, showProgressionLine } })
          }
        />
        <OsToggle
          label="Afficher log pipeline OS"
          checked={mod.showPipelineLog}
          onChange={(showPipelineLog) =>
            setConfig({ interfaceJoueur: { ...mod, showPipelineLog } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
