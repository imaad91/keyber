"use client";

import Link from "next/link";
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
  const mod = config.moteurEvenements;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES["moteur-evenements"]} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">
          Pont Atelier Excel → param → OS (Étape 24)
        </p>
        <p className="mt-1 text-violet-900/80">
          Catalogue = « Événements entreprise » du fichier de paramétrage, rempli
          depuis Atelier → Événements (colonnes Jour / Heure / Urgent /
          Condition / Conséquence…). Mapping :{" "}
          <code className="rounded bg-violet-100 px-1 text-xs">
            lib/atelierEventsToParam.ts
          </code>
          . Champs OS : heure, jour, urgent, deadlineHeure, condition,
          consequences. UI toast / bannière →{" "}
          <Link
            href="/admin/systeme/notifications"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Notifications
          </Link>
          .
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Moteur d'Événements — runtime"
        description="Déclenche les événements du param selon l'horloge (et conditions). Impact stock générique + fallback heures si le param n'a pas de champ heure."
        onReset={() =>
          setConfig({
            moteurEvenements: {
              ...OS_RUNTIME_DEFAULTS.moteurEvenements,
              fallbackHeures: [
                ...OS_RUNTIME_DEFAULTS.moteurEvenements.fallbackHeures,
              ],
            },
          })
        }
      >
        <OsToggle
          label="Module Événements activé"
          checked={mod.enabled}
          onChange={(enabled) =>
            setConfig({ moteurEvenements: { ...mod, enabled } })
          }
        />
        <OsNumberField
          label="Impact stock à chaque événement"
          value={mod.stockImpact}
          min={-100}
          max={100}
          onChange={(stockImpact) =>
            setConfig({ moteurEvenements: { ...mod, stockImpact } })
          }
        />
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-800">
            Heures de repli (CSV HH:MM)
          </span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={mod.fallbackHeures.join(", ")}
            onChange={(e) => {
              const fallbackHeures = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              setConfig({ moteurEvenements: { ...mod, fallbackHeures } });
            }}
          />
        </label>
      </KeyberOsRuntimePanel>
    </div>
  );
}
