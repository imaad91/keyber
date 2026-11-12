"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eraser, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearSlot,
  hydrateFromCloud,
  loadProgressionLocale,
  loadSavesBundle,
} from "@/lib/saveStore";
import {
  formatRelativeSave,
  type Sauvegarde,
  type SlotNumber,
} from "@/lib/sauvegarde";
import {
  ensureActiveSlot,
  loadGameFromSave,
  startNewGameInSlot,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const SLOTS: SlotNumber[] = [1, 2, 3];

export default function JouerSlotsPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Partial<Record<SlotNumber, Sauvegarde>>>(
    {}
  );
  const [activeSlot, setActive] = useState<SlotNumber | null>(null);
  const [progLabel, setProgLabel] = useState("");

  function refresh() {
    const bundle = loadSavesBundle();
    setSlots(bundle.slots);
    setActive(bundle.activeSlot);
    const p = loadProgressionLocale();
    const nSkills = Object.keys(p.competences).length;
    setProgLabel(
      `Niv. global ${p.niveauGlobal} · ${nSkills} compétence(s) persistantes`
    );
  }

  useEffect(() => {
    refresh();
    void hydrateFromCloud().then(refresh);
  }, []);

  function resume(save: Sauvegarde) {
    ensureActiveSlot(save.slot);
    loadGameFromSave(save.gameState, save.slot);
    const dest =
      save.mode === "competence"
        ? "/jouer/competence"
        : save.gameState.world?.introSeen
          ? "/play"
          : "/intro";
    router.push(dest);
  }

  function startNew(slot: SlotNumber) {
    const existing = slots[slot];
    if (
      existing &&
      !window.confirm(
        `Écraser le slot ${slot} (${labelSave(existing)}) ? La progression des compétences est conservée.`
      )
    ) {
      return;
    }
    startNewGameInSlot(slot);
    refresh();
    router.push("/jouer/histoire");
  }

  function erase(slot: SlotNumber) {
    if (!window.confirm(`Effacer le slot ${slot} ?`)) return;
    clearSlot(slot);
    refresh();
  }

  return (
    <div className="min-h-screen atmosphere-play text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Accueil
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Sauvegardes
        </p>
        <h1 className="font-display text-3xl font-semibold">3 slots</h1>
        <p className="mt-2 text-sm text-muted">
          Sauvegarde auto à chaque décision. {progLabel}
        </p>

        <div className="mt-8 space-y-3">
          {SLOTS.map((slot) => {
            const save = slots[slot];
            const isActive = activeSlot === slot;
            return (
              <article
                key={slot}
                className={cn(
                  "rounded-2xl border bg-panel p-5 shadow-soft",
                  isActive ? "border-accent/50" : "border-white/10"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Slot {slot}
                      {isActive ? " · actif" : ""}
                    </p>
                    {save ? (
                      <>
                        <h2 className="mt-1 font-display text-lg font-semibold">
                          {labelSave(save)}
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                          {save.pourcentageProgression}% · Dernière sauvegarde{" "}
                          {formatRelativeSave(save.dateDerniereSauvegarde)}
                        </p>
                      </>
                    ) : (
                      <h2 className="mt-1 font-display text-lg font-semibold text-muted">
                        Vide
                      </h2>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {save ? (
                      <>
                        <Button size="sm" onClick={() => resume(save)}>
                          <Play className="h-3.5 w-3.5" />
                          Reprendre
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startNew(slot)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Nouvelle
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => erase(slot)}
                        >
                          <Eraser className="h-3.5 w-3.5" />
                          Effacer
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => startNew(slot)}>
                        <Plus className="h-3.5 w-3.5" />
                        Nouvelle partie
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function labelSave(save: Sauvegarde): string {
  const name =
    save.scenarioId?.includes("novacier") || save.mode === "histoire"
      ? "Novacier"
      : save.mode === "competence"
        ? "Compétence"
        : save.scenarioId ?? "Partie";
  return `${name} — Jour ${save.jourActuel}`;
}
