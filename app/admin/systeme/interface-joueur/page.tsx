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
        title="Interface Joueur — shell chrome /play (Étape 2)"
        description="Composition exacte : sidebar 232px, horloge, KPI, main + colonne droite. Toggles pour vérifier chaque zone."
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
          label="Plein écran (full-bleed comme /play)"
          checked={mod.fullBleedShell}
          onChange={(fullBleedShell) =>
            setConfig({ interfaceJoueur: { ...mod, fullBleedShell } })
          }
        />
        <OsToggle
          label="Liens sidebar (Livre / Journal / Profil)"
          checked={mod.showSidebarLinks}
          onChange={(showSidebarLinks) =>
            setConfig({ interfaceJoueur: { ...mod, showSidebarLinks } })
          }
        />
        <OsToggle
          label="Colonne droite (objectifs + fil events)"
          checked={mod.showRightAside}
          onChange={(showRightAside) =>
            setConfig({ interfaceJoueur: { ...mod, showRightAside } })
          }
        />
        <OsToggle
          label="Horloge / jour / barre temps"
          checked={mod.showClock}
          onChange={(showClock) =>
            setConfig({ interfaceJoueur: { ...mod, showClock } })
          }
        />
        <OsToggle
          label="Objectifs (colonne droite)"
          checked={mod.showObjectives}
          onChange={(showObjectives) =>
            setConfig({ interfaceJoueur: { ...mod, showObjectives } })
          }
        />
        <OsToggle
          label="Barre KPI (jauges + pastilles visibilité)"
          checked={mod.showErpTiles}
          onChange={(showErpTiles) =>
            setConfig({ interfaceJoueur: { ...mod, showErpTiles } })
          }
        />
        <p className="text-xs text-emerald-800">
          Étape 9 — labels génériques : Trésorerie, Stock, Production, Rebut,
          Moral, Éthique, Confiance client. Bouton Visibilité = panneau capteur.
        </p>
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
