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
  const mod = config.donneesSauvegarde;

  return (
    <div>
      <KeyberOsComposanteView
        doc={KEYBER_OS_COMPOSANTES["donnees-sauvegarde"]}
      />

      <KeyberOsRuntimePanel
        title="Données & Sauvegarde — runtime"
        description="Charge le fichier de paramétrage et écrit la progression dans keyber-os-play-saves-v1 (pas le Studio)."
        onReset={() =>
          setConfig({
            donneesSauvegarde: { ...OS_RUNTIME_DEFAULTS.donneesSauvegarde },
          })
        }
      >
        <OsToggle
          label="Module Données & Sauvegarde activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ donneesSauvegarde: { ...mod, enabled } })
          }
        />
        <OsToggle
          label="Autosave après chaque étape"
          checked={mod.autosave}
          onChange={(autosave) =>
            setConfig({ donneesSauvegarde: { ...mod, autosave } })
          }
        />
      </KeyberOsRuntimePanel>
    </div>
  );
}
