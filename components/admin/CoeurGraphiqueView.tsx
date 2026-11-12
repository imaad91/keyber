"use client";

import { useMemo, useState } from "react";
import { ArrowDown, GitBranch } from "lucide-react";
import {
  dayTitleFor,
  humanizeChoixSummary,
  humanizeConsequence,
  patchConsequenceValeur,
  patchDecisionField,
  type CoeurChoix,
  type CoeurDecision,
  type CoeurEvenement,
  type ScenarioCoeur,
} from "@/lib/adminCoeur";
import { cn } from "@/lib/utils";
import { inputClass, textareaClass } from "@/components/admin/AdminPrimitives";

type Props = {
  coeur: ScenarioCoeur;
  onChange: (next: ScenarioCoeur) => void;
  syncOk: boolean;
};

export function CoeurGraphiqueView({ coeur, onChange, syncOk }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const days = useMemo(() => {
    const set = new Set<number>();
    coeur.decisions.forEach((d) => set.add(d.jour));
    coeur.evenements.forEach((e) => set.add(e.jour));
    for (let i = 1; i <= 5; i++) set.add(i);
    return Array.from(set).sort((a, b) => a - b);
  }, [coeur]);

  const selected = coeur.decisions.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Traduction visuelle du CŒUR — toute modification met à jour la source
          de vérité.
        </p>
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold",
            syncOk
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          )}
        >
          {syncOk
            ? "Synchronisé ✓ — CŒUR et Graphique identiques"
            : "Non synchronisé — En attente de validation"}
        </span>
      </div>

      <div className="space-y-6">
        {days.map((jour) => {
          const decision = coeur.decisions.find((d) => d.jour === jour);
          const events = coeur.evenements
            .filter((e) => e.jour === jour)
            .sort((a, b) => a.heure.localeCompare(b.heure));
          return (
            <DayCard
              key={jour}
              jour={jour}
              title={dayTitleFor(jour, decision?.titre)}
              decision={decision}
              events={events}
              selected={selectedId === decision?.id}
              onSelect={() => decision && setSelectedId(decision.id)}
            />
          );
        })}
      </div>

      {selected ? (
        <InlineDecisionEditor
          decision={selected}
          onClose={() => setSelectedId(null)}
          onPatchDilemme={(value) =>
            onChange(patchDecisionField(coeur, selected.id, "dilemme", value))
          }
          onPatchTitre={(value) =>
            onChange(patchDecisionField(coeur, selected.id, "titre", value))
          }
          onPatchValeur={(choixId, cible, valeur) =>
            onChange(
              patchConsequenceValeur(coeur, selected.id, choixId, cible, valeur)
            )
          }
        />
      ) : null}
    </div>
  );
}

function DayCard({
  jour,
  title,
  decision,
  events,
  selected,
  onSelect,
}: {
  jour: number;
  title: string;
  decision?: CoeurDecision;
  events: CoeurEvenement[];
  selected: boolean;
  onSelect: () => void;
}) {
  const xp =
    decision?.xpGagne ??
    decision?.choix.reduce((max, c) => {
      const xpCons = c.consequences.find((x) => x.cible === "xp");
      return Math.max(max, xpCons?.valeur ?? 0);
    }, 0) ??
    0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Flux jour {jour}
          </p>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <div className="flex gap-3 text-xs text-slate-500">
          <span>Heure décision : {decision?.heure ?? "—"}</span>
          <span>XP max : {xp}</span>
        </div>
      </header>

      {events.length > 0 ? (
        <div className="mb-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Événements
          </p>
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <span className="font-semibold text-slate-900">{ev.heure}</span>
              {" — "}
              <span className="text-slate-500">{ev.type}</span>
              {" : "}
              {ev.titre}
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-slate-400">Aucun événement ce jour.</p>
      )}

      <div className="mb-2 flex justify-center text-slate-300">
        <ArrowDown className="h-4 w-4" />
      </div>

      {decision ? (
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "w-full rounded-xl border p-4 text-left transition",
            selected
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          )}
        >
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              selected ? "text-slate-300" : "text-slate-400"
            )}
          >
            Décision · {decision.titre}
          </p>
          <p className="mt-1 text-base font-medium leading-snug">
            {decision.dilemme}
          </p>
          <p
            className={cn(
              "mt-2 text-xs",
              selected ? "text-slate-300" : "text-slate-500"
            )}
          >
            Cliquer pour éditer les chiffres → met à jour le CŒUR
          </p>
        </button>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
          Pas de décision dans le CŒUR pour ce jour
        </div>
      )}

      {decision ? (
        <>
          <div className="my-3 flex justify-center text-slate-300">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="grid gap-2 lg:grid-cols-3">
            {decision.choix.slice(0, 3).map((c) => (
              <ChoixBranch key={c.id} choix={c} muted={selected} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function ChoixBranch({
  choix,
  muted,
}: {
  choix: CoeurChoix;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-3",
        muted && "opacity-90"
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <ArrowDown className="h-3.5 w-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Branche
        </span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{choix.label}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">
        → {humanizeChoixSummary(choix)}
      </p>
    </div>
  );
}

function InlineDecisionEditor({
  decision,
  onClose,
  onPatchDilemme,
  onPatchTitre,
  onPatchValeur,
}: {
  decision: CoeurDecision;
  onClose: () => void;
  onPatchDilemme: (v: string) => void;
  onPatchTitre: (v: string) => void;
  onPatchValeur: (choixId: string, cible: string, valeur: number) => void;
}) {
  return (
    <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-900 bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Édition Graphique → CŒUR
          </p>
          <h4 className="font-semibold text-slate-900">{decision.titre}</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
        >
          Fermer
        </button>
      </div>

      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-medium text-slate-600">
          Titre
          <input
            className={cn(inputClass, "mt-1")}
            value={decision.titre}
            onChange={(e) => onPatchTitre(e.target.value)}
          />
        </label>
        <label className="block text-xs font-medium text-slate-600 md:col-span-2">
          Dilemme
          <textarea
            className={cn(textareaClass, "mt-1 min-h-[64px]")}
            value={decision.dilemme}
            onChange={(e) => onPatchDilemme(e.target.value)}
          />
        </label>
      </div>

      <div className="space-y-3">
        {decision.choix.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
          >
            <p className="mb-2 text-sm font-semibold text-slate-800">{c.label}</p>
            <div className="space-y-1.5">
              {c.consequences.map((cons, i) => (
                <div
                  key={`${cons.cible}-${i}`}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="min-w-[10rem] flex-1 text-xs text-slate-600">
                    {humanizeConsequence(cons)}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {cons.cible}
                  </span>
                  <input
                    type="number"
                    className={cn(inputClass, "w-28")}
                    value={cons.valeur}
                    onChange={(e) =>
                      onPatchValeur(
                        c.id,
                        cons.cible,
                        Number(e.target.value) || 0
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
