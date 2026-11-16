/**
 * Keyber OS — Débrief fin de semaine (Étape 13).
 * Seuils / narrations génériques — aucun scénario hardcodé.
 */

import type { OsEndingKind, OsPlayState } from "@/lib/keyberOs/types";
import { osDonneesSaveProgress } from "@/lib/keyberOs/donneesSauvegarde";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";

/** Objectif pièces qualité générique (param override possible plus tard). */
export const OS_DEBRIEF_TARGET_PIECES = 500;

export function osPiecesQualite(state: OsPlayState): number {
  return (
    state.finance?.piecesBrutesSemaine ||
    state.finance?.piecesAujourdhui ||
    state.production ||
    0
  );
}

export function osComputeEnding(state: OsPlayState): OsEndingKind {
  const q = osPiecesQualite(state);
  const e = state.humain?.ethique ?? 70;
  const ethiqueFloor = 20;
  if (e < ethiqueFloor || q < 400) return "ECHEC";
  if (q >= 480 && e > 50) return "VICTOIRE";
  if (q >= 400 && q < 480) return "PARTIELLE";
  if (q >= 480 && e <= 50) return "PARTIELLE";
  return "ECHEC";
}

export function osEndingNarration(
  ending: OsEndingKind,
  pieces: number,
  ethique: number
): string {
  if (ending === "VICTOIRE") {
    return `Objectif tenu : ${pieces} pièces qualité, éthique à ${ethique}. L'équipe tient la semaine.`;
  }
  if (ending === "PARTIELLE") {
    return `Résultat mitigé : ${pieces} pièces, éthique ${ethique}. Des arbitrages restent à consolider.`;
  }
  return `La semaine rate la cible (${pieces} pièces, éthique ${ethique}). Analyse les décisions dans le journal.`;
}

export function osBuildSkillDebriefLines(state: OsPlayState): string[] {
  if (state.world?.lastSkillDebrief?.length) {
    return state.world.lastSkillDebrief;
  }
  const lines: string[] = [];
  const xp = state.progression?.xp ?? state.xp ?? 0;
  const niveau = state.progression?.niveau ?? state.niveau ?? 1;
  const score = state.progression?.score ?? state.score ?? 0;
  lines.push(`Progression : niveau ${niveau} · ${xp} XP · score ${score}.`);

  const decisions = state.historique?.decisionsPrises?.length ?? 0;
  lines.push(
    decisions > 0
      ? `${decisions} décision(s) enregistrée(s) cette semaine.`
      : "Aucune décision formalisée — le coach te recommande d'assumer les choix."
  );

  const events = state.historique?.evenementsDeclenches?.length ?? 0;
  if (events > 0) {
    lines.push(`${events} événement(s) déclenché(s) — revois le fil.`);
  }

  const generales = state.progression?.competencesGenerales ?? {};
  const ciblees = state.progression?.competencesCiblees ?? {};
  const skillIds = [
    ...Object.keys(generales),
    ...Object.keys(ciblees),
  ].slice(0, 3);
  if (skillIds.length) {
    lines.push(`Compétences touchées : ${skillIds.join(", ")}.`);
  } else {
    lines.push(
      "Compétences : progresse via les décisions et les interviews (module Progression)."
    );
  }
  return lines;
}

/** Ouvre l'écran débrief (fin de semaine ou force Admin). */
export function osOpenDebrief(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("cycle-vie")) {
    return {
      ...state,
      feedback: "Module Cycle de vie désactivé",
      log: [...state.log, "Débrief → module Cycle de vie OFF"],
    };
  }
  const ending = osComputeEnding(state);
  const pieces = osPiecesQualite(state);
  const ethique = state.humain?.ethique ?? 70;
  const skillLines = osBuildSkillDebriefLines(state);
  const xpGain =
    ending === "VICTOIRE" ? 80 : ending === "PARTIELLE" ? 50 : 30;
  const nextXp = (state.progression?.xp ?? state.xp ?? 0) + xpGain;
  const xpPerLevel = getOsRuntimeConfig().progression.xpPerLevel || 100;
  const nextNiveau = Math.max(
    state.progression?.niveau ?? state.niveau ?? 1,
    Math.floor(nextXp / xpPerLevel) + 1
  );

  const next: OsPlayState = {
    ...state,
    xp: nextXp,
    niveau: nextNiveau,
    finished: true,
    feedback: osEndingNarration(ending, pieces, ethique),
    progression: {
      ...(state.progression ?? {
        xp: nextXp,
        niveau: nextNiveau,
        score: state.score ?? 0,
        competencesGenerales: {},
        competencesCiblees: {},
      }),
      xp: nextXp,
      niveau: nextNiveau,
    },
    world: {
      ...state.world,
      showDayEnd: false,
      showDebrief: true,
      phase: "DEBRIEF",
      ending,
      lastSkillDebrief: skillLines,
      journal: [
        {
          id: `j-debrief-${Date.now()}`,
          day: state.meta?.jourActuel ?? state.day,
          titre: "Débrief de fin de semaine",
          narration: osEndingNarration(ending, pieces, ethique),
          xp: xpGain,
          at: "16:00",
        },
        ...(state.world.journal ?? []),
      ],
    },
    activeAction: null,
    computerApp: null,
    log: [
      ...state.log,
      `Cycle de vie → débrief ${ending} (+${xpGain} XP)`,
    ],
  };
  return osDonneesSaveProgress(next);
}
