"use client";

import Link from "next/link";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { useBookStore } from "@/lib/bookStore";
import { resolveCharacterId } from "@/lib/characterStyle";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";
import { useOsActivePlay } from "@/lib/osActivePlayStore";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { readParamInterviews } from "@/lib/scenarioParamSchema";
import type { OsInterview } from "@/lib/keyberOs/types";
import lumiereHistoireParam from "@/data/scenarios/lumiere-co/lumiere-co_logisticien-histoire_v1.json";

type PnjRow = {
  id: string;
  nom: string;
  role: string;
  source: string;
  questions: number;
  trust?: number;
};

function rowsFromInterviews(
  list: OsInterview[],
  source: string,
  relations?: Record<string, number>
): PnjRow[] {
  return list.map((iv) => ({
    id: iv.id,
    nom: iv.nom,
    role: iv.role || "—",
    source,
    questions: iv.questions?.length ?? 0,
    trust: relations?.[iv.id],
  }));
}

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.interviews;
  const active = useOsActivePlay();
  const { entries } = useBookStore();

  const sessionRows: PnjRow[] =
    active.play && active.meta
      ? rowsFromInterviews(
          active.play.interviews || [],
          `Session · ${active.meta.title}`,
          active.play.relations
        )
      : [];

  const bookRows: PnjRow[] = [];
  const seen = new Set(sessionRows.map((r) => r.id));
  for (const e of entries) {
    if (!e.paramFile) continue;
    const list = readParamInterviews(e.paramFile) || [];
    if (!list.length) continue;
    const label = `Book · ${e.entrepriseNom || e.nom} · ${e.nom} (V${e.version})`;
    for (const row of rowsFromInterviews(list, label)) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      bookRows.push(row);
    }
  }

  const chatExtras: PnjRow[] = [];
  if (active.play?.computer?.chatContacts?.length) {
    for (const c of active.play.computer.chatContacts) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      chatExtras.push({
        id: c.id,
        nom: c.name,
        role: c.role || "Contact chat",
        source: "Chat Ordinateur (session)",
        questions: 0,
        trust: active.play.relations?.[c.id],
      });
    }
  }

  // Fallback démo Lumière (fichier scénario) si Book pas encore seedé.
  const demoRows: PnjRow[] = [];
  if (sessionRows.length === 0 && bookRows.length === 0) {
    const demoList =
      readParamInterviews(
        lumiereHistoireParam as unknown as ScenarioParamFile
      ) || [];
    for (const row of rowsFromInterviews(
      demoList,
      "Démo Lumière · fichier scénario"
    )) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      demoRows.push(row);
    }
    const contacts =
      (
        lumiereHistoireParam as {
          Ordinateur?: { chatContacts?: { id: string; name: string; role?: string }[] };
        }
      ).Ordinateur?.chatContacts || [];
    for (const c of contacts) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      demoRows.push({
        id: c.id,
        nom: c.name,
        role: c.role || "Contact chat",
        source: "Démo Lumière · chat",
        questions: 0,
      });
    }
  }

  const rows = [...sessionRows, ...chatExtras, ...bookRows, ...demoRows];

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

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Personnages / PNJ
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Aperçu depuis la session Book OS active et les param Book (pas le
          registry Novacier).
        </p>

        {active.meta && active.play ? (
          <p className="mt-2 text-xs text-slate-500">
            Session : {active.meta.title} ·{" "}
            <Link
              href={`/jouer/book/${encodeURIComponent(active.meta.bookEntryId)}`}
              className="underline"
            >
              ouvrir shell
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-xs text-amber-700">
            Pas de session Test active — liste Book ci-dessous. Pour les jauges
            live : Book → Tester, puis reviens ici.
          </p>
        )}

        {rows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            Aucun PNJ trouvé. Vérifie Book → Vue Code → bloc{" "}
            <code className="rounded bg-slate-100 px-1">Interviews</code> (ex.
            Lumière : Samir, Léa).
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((p) => (
              <li
                key={`${p.source}-${p.id}`}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
              >
                <CharacterAvatar
                  id={resolveCharacterId(p.id) ?? undefined}
                  name={p.nom}
                  trust={p.trust ?? 55}
                  size={56}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {p.nom}
                  </p>
                  <p className="truncate text-xs text-slate-600">{p.role}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {p.questions > 0
                      ? `${p.questions} question(s)`
                      : "Contact"}
                    {typeof p.trust === "number"
                      ? ` · confiance ${p.trust}`
                      : ""}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                    {p.source}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
