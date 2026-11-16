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
import { useOsActivePlay } from "@/lib/osActivePlayStore";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.journal;
  const active = useOsActivePlay();
  const entries = active.play?.world?.journal ?? [];

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.journal} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Journal de bord (Étape 27)</p>
        <p className="mt-1 text-violet-900/80">
          Même page <code className="rounded bg-white/70 px-1">/journal</code>{" "}
          que le POC — branchée sur{" "}
          <code className="rounded bg-white/70 px-1">world.journal</code> de la
          session Book OS.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → décisions / events → sidebar Journal → entrées
          listées → Continuer revient au shell.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Journal — runtime"
        description="Affichage du journal joueur (historique OS)."
        onReset={() =>
          setConfig({
            journal: { ...OS_RUNTIME_DEFAULTS.journal },
          })
        }
      >
        <OsToggle
          label="Module Journal activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ journal: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Aperçu session active
        </h2>
        {active.meta && active.play ? (
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
              <Link href="/journal" className="underline">
                /journal
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {entries.length} entrée(s) dans world.journal
            </p>
            {entries.length > 0 ? (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-600">
                {entries.slice(0, 12).map((e) => (
                  <li key={e.id}>
                    J{e.day} · {e.titre}
                  </li>
                ))}
              </ul>
            ) : null}
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
