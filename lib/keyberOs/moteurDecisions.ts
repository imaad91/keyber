/**
 * Keyber OS — Moteur de Décisions & Branches (Étape 14).
 * Conséquences structurées du param en priorité ; deltas Admin = fallback test.
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import { osApplyConsequences } from "@/lib/keyberOs/consequences";
import { syncDashboardCards } from "@/lib/keyberOs/ordinateurPack";
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

function applyAdminDeltaFallback(
  state: OsPlayState,
  choiceId: string
): OsPlayState {
  const cfg = getOsRuntimeConfig().moteurDecisions;
  const idx = optionIndex(choiceId);
  const delta = cfg.deltas[idx]!;
  const next: OsPlayState = {
    ...state,
    tresorerieBrute: Math.max(0, state.tresorerieBrute + delta.tresorerie),
    stock: Math.max(0, state.stock + delta.stock),
    production: Math.max(10, state.production + delta.production),
    commandes: Math.max(0, state.commandes + cfg.commandesDelta),
    log: [
      ...state.log,
      `Moteur de Décisions → fallback deltas Admin (opt${idx})`,
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

  let next: OsPlayState = {
    ...state,
    log: [...state.log],
    eventsFired: [...state.eventsFired],
  };
  next.log.push(
    `Moteur de Décisions & Branches → choix « ${choice.label} »`
  );

  const hasParamConsequences =
    Array.isArray(choice.consequences) && choice.consequences.length > 0;

  if (hasParamConsequences) {
    next = osApplyConsequences(next, choice.consequences);
    next.log.push(
      `Moteur de Décisions → ${choice.consequences!.length} conséquence(s) param`
    );
  } else {
    next = applyAdminDeltaFallback(next, choiceId);
  }

  if (decision.xpGagne && decision.xpGagne > 0) {
    next = osApplyConsequences(next, [
      { cible: "xp", valeur: decision.xpGagne },
    ]);
  }

  next.feedback =
    choice.feedbackTexte?.trim() ||
    `Choix enregistré : ${choice.label}`;

  const jour = next.meta?.jourActuel ?? next.day;
  const heure = next.meta?.heureActuelle ?? "12:00";
  next.world = {
    ...next.world,
    dayDecisionId: choiceId,
    journal: [
      {
        id: `j-dec-${decision.id}`,
        day: jour,
        titre: decision.titre,
        narration: next.feedback,
        xp: decision.xpGagne ?? 0,
        at: heure,
      },
      ...(next.world?.journal ?? []).filter((j) => j.id !== `j-dec-${decision.id}`),
    ],
  };
  next.historique = {
    ...(next.historique ?? {
      decisionsPrises: [],
      evenementsDeclenches: [],
    }),
    decisionsPrises: [
      ...(next.historique?.decisionsPrises ?? []).filter(
        (d) => !(d.decisionId === decision.id && d.choixId === choiceId)
      ),
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
  next.computer = syncDashboardCards(next);
  return next;
}
