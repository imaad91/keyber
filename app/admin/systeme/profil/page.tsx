"use client";

import Link from "next/link";
import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { osSkillProgressList } from "@/lib/keyberOs";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";
import { useOsActivePlay } from "@/lib/osActivePlayStore";

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.profil;
  const active = useOsActivePlay();
  const play = active.play;
  const skills = play ? osSkillProgressList(play) : [];
  const badges = play?.world?.badges ?? [];

  return (
    <div>
      <KeyberOsComposanteView doc={KEYBER_OS_COMPOSANTES.profil} />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Profil & Badges (Étape 29)</p>
        <p className="mt-1 text-violet-900/80">
          Même page <code className="rounded bg-white/70 px-1">/profil</code> —
          branchée sur Progression OS +{" "}
          <code className="rounded bg-white/70 px-1">world.badges</code>.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Vérif : Book → décisions → sidebar Mon profil → XP / skills / badges
          à jour.
        </p>
      </section>

      <KeyberOsRuntimePanel
        title="Profil — runtime"
        description="Affichage du profil joueur (séparé des seuils Progression)."
        onReset={() =>
          setConfig({
            profil: { ...OS_RUNTIME_DEFAULTS.profil },
          })
        }
      >
        <OsToggle
          label="Module Profil activé"
          checked={mod.enabled}
          onChange={(enabled) => setConfig({ profil: { ...mod, enabled } })}
        />
      </KeyberOsRuntimePanel>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Aperçu session active
        </h2>
        {active.meta && play ? (
          <>
            <p className="mt-1 text-xs text-slate-500">
              {active.meta.title} · XP {play.progression?.xp ?? play.xp ?? 0} ·
              niv. {play.progression?.niveau ?? play.niveau ?? 1} ·{" "}
              <Link href="/profil" className="underline">
                /profil
              </Link>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {skills.length} compétence(s) · {badges.length} badge(s) ·{" "}
              {Object.keys(play.relations ?? {}).length} relation(s)
            </p>
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
