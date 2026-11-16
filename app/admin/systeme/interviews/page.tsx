"use client";

import Link from "next/link";
import { CharacterAvatar } from "@/components/characters/CharacterAvatar";
import { KeyberOsComposanteView } from "@/components/admin/KeyberOsComposanteView";
import {
  KeyberOsRuntimePanel,
  OsToggle,
} from "@/components/admin/KeyberOsRuntimePanel";
import { useBookStore } from "@/lib/bookStore";
import type { CharacterVisualId } from "@/lib/characterStyle";
import { resolveCharacterId } from "@/lib/characterStyle";
import { KEYBER_OS_COMPOSANTES } from "@/lib/keyberOsDocs";
import {
  OS_RUNTIME_DEFAULTS,
  useKeyberOsRuntime,
} from "@/lib/keyberOsRuntime";
import { LUMIERE_PNJ_PREVIEW } from "@/lib/lumierePnjPreview";
import { useOsActivePlay } from "@/lib/osActivePlayStore";
import { readParamInterviews } from "@/lib/scenarioParamSchema";

type PnjCard = {
  id: string;
  nom: string;
  role: string;
  visualId: CharacterVisualId | null;
  questions: number;
  trust?: number;
  badge: string;
};

function PnjGallery({ cards }: { cards: PnjCard[] }) {
  return (
    <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-emerald-950">
            Personnages / PNJ
          </h2>
          <p className="mt-0.5 text-xs text-emerald-900/70">
            Galerie toujours visible (démo Lumière + session / Book si
            présents). Portraits SVG — pas de PNG.
          </p>
        </div>
        <p className="text-xs font-semibold tabular-nums text-emerald-800">
          {cards.length} personnage{cards.length > 1 ? "s" : ""}
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-900/80">
          Aucun PNJ — anormal. Recharge la page ou vérifie le param Interviews.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm"
            >
              <CharacterAvatar
                id={p.visualId ?? undefined}
                name={p.nom}
                trust={p.trust ?? 55}
                size={64}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {p.nom}
                </p>
                <p className="truncate text-xs text-slate-600">{p.role}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {p.questions > 0
                    ? `${p.questions} question(s) interview`
                    : "Contact / organigramme"}
                  {typeof p.trust === "number"
                    ? ` · confiance ${p.trust}`
                    : ""}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-emerald-700">
                  {p.badge}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function Page() {
  const { config, setConfig } = useKeyberOsRuntime();
  const mod = config.interviews;
  const active = useOsActivePlay();
  const { entries } = useBookStore();

  const byId = new Map<string, PnjCard>();

  // 1) Toujours : cast Lumière (feeling Test).
  for (const p of LUMIERE_PNJ_PREVIEW) {
    byId.set(p.id, {
      id: p.id,
      nom: p.nom,
      role: p.role,
      visualId: p.visualId,
      questions: p.questions,
      badge: "Démo Lumière & Co",
    });
  }

  // 2) Book params (enrichit / ajoute d'autres entreprises plus tard).
  for (const e of entries) {
    if (!e.paramFile) continue;
    const list = readParamInterviews(e.paramFile) || [];
    for (const iv of list) {
      const visual =
        resolveCharacterId(iv.id) ?? resolveCharacterId(iv.nom) ?? null;
      const prev = byId.get(iv.id);
      byId.set(iv.id, {
        id: iv.id,
        nom: iv.nom || prev?.nom || iv.id,
        role: iv.role || prev?.role || "—",
        visualId: visual ?? prev?.visualId ?? null,
        questions: iv.questions?.length ?? prev?.questions ?? 0,
        trust: prev?.trust,
        badge: `Book · ${e.entrepriseNom || e.nom} (V${e.version})`,
      });
    }
  }

  // 3) Session active (jauges live).
  if (active.play && active.meta) {
    for (const iv of active.play.interviews || []) {
      const visual =
        resolveCharacterId(iv.id) ?? resolveCharacterId(iv.nom) ?? null;
      const prev = byId.get(iv.id);
      byId.set(iv.id, {
        id: iv.id,
        nom: iv.nom || prev?.nom || iv.id,
        role: iv.role || prev?.role || "—",
        visualId: visual ?? prev?.visualId ?? null,
        questions: iv.questions?.length ?? prev?.questions ?? 0,
        trust: active.play.relations?.[iv.id] ?? prev?.trust,
        badge: `Session · ${active.meta.title}`,
      });
    }
    for (const c of active.play.computer?.chatContacts || []) {
      if (byId.has(c.id)) {
        const prev = byId.get(c.id)!;
        byId.set(c.id, {
          ...prev,
          trust: active.play.relations?.[c.id] ?? prev.trust,
        });
        continue;
      }
      byId.set(c.id, {
        id: c.id,
        nom: c.name,
        role: c.role || "Contact chat",
        visualId: resolveCharacterId(c.id) ?? resolveCharacterId(c.name),
        questions: 0,
        trust: active.play.relations?.[c.id],
        badge: "Chat session",
      });
    }
  }

  const cards = Array.from(byId.values());

  return (
    <div>
      <KeyberOsComposanteView
        doc={KEYBER_OS_COMPOSANTES.interviews}
        lead={
          <>
            <PnjGallery cards={cards} />
            {active.meta && active.play ? (
              <p className="mt-2 text-xs text-slate-500">
                Session active : {active.meta.title} ·{" "}
                <Link
                  href={`/jouer/book/${encodeURIComponent(active.meta.bookEntryId)}`}
                  className="underline"
                >
                  ouvrir shell
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Pas de session Test — la galerie montre quand même la démo
                Lumière. Book → Tester pour les jauges live.
              </p>
            )}
          </>
        }
      />

      <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-sm text-violet-950">
        <p className="font-semibold">Dialogues multi-lignes (Étape 16)</p>
        <p className="mt-1 text-violet-900/80">
          Catalogue = pack Ordinateur / param (<code className="text-xs">Interviews</code>{" "}
          avec <code className="text-xs">questions[].choices</code>). Feeling
          visual novel : portrait, questions, réponses → confiance.
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Jauges → sous-onglet{" "}
          <Link
            href="/admin/systeme/relations"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Relations
          </Link>
          .
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
    </div>
  );
}
