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
import {
  livreFromParam,
  livreHasContent,
  summarizeLivreLore,
} from "@/lib/osLivre";
import { useOsActivePlay } from "@/lib/osActivePlayStore";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.livre;
  const active = useOsActivePlay();
  const livre = active.play ? livreFromParam(active.play.param) : null;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.livre} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Livre de l&apos;entreprise (Étape 28)</p>
        <p className="mt-1 text-violet-900/80">
          Même page <code className="rounded bg-white/70 px-1">/livre</code> que
          le POC — branchée sur{" "}
          <code className="rounded bg-white/70 px-1">param.Livre</code>.
          Structure visible même vide (contenu Lumière = Phase E).
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → sidebar Livre → onglets structure → Continuer revient
          au shell.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Livre — runtime"
        description="Affichage du Livre joueur depuis le param."
        onReset={() =>
          setConfig({
            livre: { ...OS_RUNTIME_DEFAULTS.livre },
          })
        }
      >
        <OsToggle
          label="Module Livre activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ livre: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Aperçu session active
        </h2>
        {active.meta && livre ? (
          <>
            <p className="mt-1 text-xs text-slate-500">
              {active.meta.title} ·{" "}
              <Link
                href={`/jouer/book/${encodeURIComponent(active.meta.bookEntryId)}`}
                className="underline"
              >
                ouvrir shell
              </Link>{" "}
              ·{" "}
              <Link href="/livre" className="underline">
                /livre
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {livreHasContent(livre)
                ? "Contenu lore présent"
                : "Structure vide (OK V1)"}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {summarizeLivreLore(livre).map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Aucune session Book OS active. Lance un Test / Live Book puis
            reviens ici.
          </p>
        )}
      </section>
    </div>
  );
}
