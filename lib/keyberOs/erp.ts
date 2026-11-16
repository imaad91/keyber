/**
 * Keyber OS — ERP
 */

import {
  applyOsTresorerie,
  getOsRuntimeConfig,
  isOsModuleEnabled,
} from "@/lib/keyberOsRuntime";
import { osVisibiliteFog } from "@/lib/keyberOs/visibilite";
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
    fournisseurs:
      state.computer.fournisseurs.length ||
      events.filter((e) => /fournisseur/i.test(e.type)).length,
    clients:
      state.computer.clients.length ||
      events.filter((e) => /client/i.test(e.type)).length,
    equipe: state.computer.employes.length || cfg.erp.equipeBase,
    fog: osVisibiliteFog(state),
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
      `ERP → chiffres mis à jour (Trésorerie brute ${state.tresorerieBrute}, facteur OS ${cfg.erp.tresorerieFacteur}, fog=${osVisibiliteFog(state)})`,
    ],
  };
}
