"use client";

import Link from "next/link";
import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import {
  finsFromParam,
  osEvaluateFin,
} from "@/lib/keyberOs/fins";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";
import { useOsActivePlay } from "@/lib/osActivePlayStore";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.fins;
  const active = useOsActivePlay();
  const play = active.play;
  const fins = play ? finsFromParam(play.param) : [];
  const preview = play ? osEvaluateFin(play) : null;

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.fins} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Fins & Endings (Étape 30)</p>
        <p className="mt-1 text-violet-900/80">
          Lecture du bloc{" "}
          <code className="rounded bg-white/70 px-1">Fins</code> du param Book
          (Vue Code). Conditions → kind → écran. Contenu Lumière = Phase E ;
          structure vide OK.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → remplir Fins (ou forcer débrief) → écran fin avec
          label param.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Fins — runtime"
        description="Active l'évaluation param.Fins (sinon bandes legacy génériques)."
        onReset={() =>
          setConfig({
            fins: { ...OS_RUNTIME_DEFAULTS.fins },
          })
        }
      >
        <OsToggle
          label="Module Fins activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ fins: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Fins du param (session active)
        </h2>
        {active.meta && play ? (
          <>
            <p className="mt-1 text-xs text-slate-500">
              {active.meta.title} · {fins.length} fin(s) ·{" "}
              <Link
                href={`/admin/book/${encodeURIComponent(active.meta.bookEntryId)}`}
                className="underline"
              >
                Book Vue Code
              </Link>
            </p>
            {fins.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Bloc Fins vide — fallback legacy au débrief.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {fins.map((f) => (
                  <li
                    key={f.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <p className="font-medium text-slate-900">
                      {f.label}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        ({f.kind}) · {f.id}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">
                      {(f.conditions?.length ?? 0) > 0
                        ? `${f.conditions!.length} condition(s)`
                        : "Sans condition (match par kind / fallback)"}
                      {f.xp != null ? ` · XP ${f.xp}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {preview ? (
              <p className="mt-3 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-950">
                Évaluation actuelle :{" "}
                <strong>
                  {preview.fin?.label || preview.kind}
                </strong>{" "}
                · source {preview.source}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Aucune session Book OS active. Lance un Test / Live puis reviens
            ici.
          </p>
        )}
      </section>
    </div>
  );
}
