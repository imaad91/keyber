/**
 * Keyber OS — Moteur de Décisions & Branches
 * Applique le choix joueur → deltas ERP (config Admin). Générique.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

function optionIndex(choiceId: string): 0 | 1 | 2 {
  if (choiceId.endsWith("opt0")) return 0;
  if (choiceId.endsWith("opt1")) return 1;
  if (choiceId.endsWith("opt2")) return 2;
  const m = choiceId.match(/opt(\d+)$/);
  if (m) {
    const n = Number(m[1]) % 3;
    return (n === 0 ? 0 : n === 1 ? 1 : 2) as 0 | 1 | 2;
  }
  return 0;
}

export function osDecisionsApplyChoice(
  state: OsPlayState,
  choiceId: string
): OsPlayState | null {
  if (!isOsModuleEnabled("moteur-decisions")) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur de Décisions & Branches → module désactivé (Admin)",
      ],
      feedback: "Module Décisions désactivé dans Keyber OS Admin",
    };
  }

  const decision = state.decisions[state.stepIndex];
  if (!decision) return null;
  const choice = decision.options.find((o) => o.id === choiceId);
  if (!choice) return state;

  const cfg = getOsRuntimeConfig().moteurDecisions;
  const idx = optionIndex(choiceId);
  const delta = cfg.deltas[idx]!;

  const next: OsPlayState = {
    ...state,
    log: [...state.log],
    eventsFired: [...state.eventsFired],
  };
  next.log.push(
    `Moteur de Décisions & Branches → choix « ${choice.label} » (opt${idx})`
  );
  next.tresorerieBrute = Math.max(0, next.tresorerieBrute + delta.tresorerie);
  next.stock = Math.max(0, next.stock + delta.stock);
  next.production = Math.max(10, next.production + delta.production);
  next.commandes = Math.max(0, next.commandes + cfg.commandesDelta);
  next.feedback = `Choix enregistré : ${choice.label}`;
  const jour = next.meta?.jourActuel ?? next.day;
  const heure = next.meta?.heureActuelle ?? "12:00";
  next.world = {
    ...next.world,
    dayDecisionId: choiceId,
  };
  next.historique = {
    ...(next.historique ?? {
      decisionsPrises: [],
      evenementsDeclenches: [],
    }),
    decisionsPrises: [
      ...(next.historique?.decisionsPrises ?? []),
      {
        decisionId: decision.id,
        jour,
        choixId: choiceId,
        heure,
        label: choice.label,
      },
    ],
  };
  if (next.finance) {
    next.finance = {
      ...next.finance,
      tresorerie: next.tresorerieBrute,
      stockKg: next.stock,
      productionParJour: next.production,
      commandes: next.commandes,
    };
  }
  return next;
}
