/**
 * Keyber OS — Débrief fin de semaine (Étape 13).
 * Seuils / narrations génériques — aucun scénario hardcodé.
 */

import type { OsEndingKind, OsPlayState } from "@/lib/keyberOs/types";
import { osDonneesSaveProgress } from "@/lib/keyberOs/donneesSauvegarde";
import { osEvaluateFin, osFinsModuleEnabled } from "@/lib/keyberOs/fins";
import { osSkillProgressList } from "@/lib/keyberOs/progression";
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
  if (osFinsModuleEnabled()) {
    return osEvaluateFin(state).kind;
  }
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

  const skills = osSkillProgressList(state);
  if (skills.length) {
    for (const s of skills.slice(0, 5)) {
      const kind = s.type === "ciblee" ? "Ciblée" : "Générale";
      lines.push(
        `${kind} — ${s.nom} : niv. ${s.niveau} · ${s.xp}/${s.threshold} XP`
      );
    }
  } else {
    lines.push(
      "Compétences : ajoute des compétences au param (Compétences sélectionnées)."
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
  const match = osFinsModuleEnabled()
    ? osEvaluateFin(state)
    : {
        fin: null as null,
        kind: osComputeEnding(state) as Exclude<OsEndingKind, null>,
        narration: "",
        xp: 0,
        source: "legacy" as const,
      };
  const ending = match.kind;
  const pieces = osPiecesQualite(state);
  const ethique = state.humain?.ethique ?? 70;
  const narration =
    match.narration || osEndingNarration(ending, pieces, ethique);
  const skillLines = osBuildSkillDebriefLines(state);
  const xpGain =
    match.xp ||
    (ending === "VICTOIRE" ? 80 : ending === "PARTIELLE" ? 50 : 30);
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
    feedback: narration,
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
      matchedFinId: match.fin?.id ?? null,
      matchedFinLabel: match.fin?.label ?? null,
      lastSkillDebrief: skillLines,
      journal: [
        {
          id: `j-debrief-${Date.now()}`,
          day: state.meta?.jourActuel ?? state.day,
          titre: match.fin?.label || "Débrief de fin de semaine",
          narration,
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
      match.source === "param" && match.fin
        ? `Fins → ${match.fin.id} (${ending}) +${xpGain} XP`
        : `Cycle de vie → débrief ${ending} (+${xpGain} XP)`,
    ],
  };
  return osDonneesSaveProgress(next);
}
