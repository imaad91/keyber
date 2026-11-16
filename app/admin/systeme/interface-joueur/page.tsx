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
        title="Interface Joueur — shell & affichage"
        description="Shell type POC (sidebar + Ordinateur) et éléments visibles."
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
          label="Shell play (sidebar + workspace)"
          checked={mod.showShell}
          onChange={(showShell) =>
            setConfig({ interfaceJoueur: { ...mod, showShell } })
          }
        />
        <OsToggle
          label="Horloge / jour"
          checked={mod.showClock}
          onChange={(showClock) =>
            setConfig({ interfaceJoueur: { ...mod, showClock } })
          }
        />
        <OsToggle
          label="Objectifs sidebar"
          checked={mod.showObjectives}
          onChange={(showObjectives) =>
            setConfig({ interfaceJoueur: { ...mod, showObjectives } })
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
