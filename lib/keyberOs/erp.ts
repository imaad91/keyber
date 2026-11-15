/**
 * Keyber OS — ERP
 * Met à jour / expose les chiffres (Stock, Trésorerie, …). Générique.
 */

import {
  applyOsTresorerie,
  getOsRuntimeConfig,
  isOsModuleEnabled,
} from "@/lib/keyberOsRuntime";
import type { OsErpSnapshot, OsPlayState } from "@/lib/keyberOs/types";

export function osErpSnapshot(state: OsPlayState): OsErpSnapshot {
  const cfg = getOsRuntimeConfig();
  const events = state.param["Événements entreprise"] || [];
  return {
    tresorerie: applyOsTresorerie(state.tresorerieBrute),
    tresorerieBrute: state.tresorerieBrute,
    facteur: cfg.erp.tresorerieFacteur,
    formule: cfg.erp.tresorerieFormuleLabel,
    stock: state.stock,
    production: state.production,
    commandes: state.commandes,
    fournisseurs: events.filter((e) => /fournisseur/i.test(e.type)).length,
    clients: events.filter((e) => /client/i.test(e.type)).length,
    equipe: cfg.erp.equipeBase,
  };
}

export function osErpLogUpdate(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("erp")) {
    return {
      ...state,
      log: [...state.log, "ERP → module désactivé (Admin)"],
    };
  }
  const cfg = getOsRuntimeConfig();
  return {
    ...state,
    log: [
      ...state.log,
      `ERP → chiffres mis à jour (Trésorerie brute ${state.tresorerieBrute}, facteur OS ${cfg.erp.tresorerieFacteur}, équipe ${cfg.erp.equipeBase})`,
    ],
  };
}
