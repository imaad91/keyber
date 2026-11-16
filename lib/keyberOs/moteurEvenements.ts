/**
 * Keyber OS — Moteur d'Événements
 * Déclenche un événement du catalogue param (pas de biblio inventée).
 */

import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type { OsPlayState } from "@/lib/keyberOs/types";

export function osEvenementsTrigger(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("moteur-evenements")) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur d'Événements → module désactivé (Admin)",
      ],
    };
  }

  const catalog = state.param["Événements entreprise"] || [];
  if (!catalog.length) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur d'Événements → aucun événement dans le paramétrage",
      ],
    };
  }

  const cfg = getOsRuntimeConfig().moteurEvenements;
  const ev = catalog[state.stepIndex % catalog.length]!;
  if (state.eventsFired.includes(ev.nom)) {
    return {
      ...state,
      log: [
        ...state.log,
        `Moteur d'Événements → « ${ev.nom} » déjà déclenché`,
      ],
    };
  }

  return {
    ...state,
    eventsFired: [...state.eventsFired, ev.nom],
    stock: Math.max(0, state.stock + cfg.stockImpact),
    log: [
      ...state.log,
      `Moteur d'Événements → « ${ev.nom} » (${ev.type}) → ERP (stock ${cfg.stockImpact >= 0 ? "+" : ""}${cfg.stockImpact})`,
    ],
  };
}
