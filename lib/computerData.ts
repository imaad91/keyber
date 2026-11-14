/**
 * OS accessors for Ordinateur / ERP data.
 * No entreprise names here — always from getContexteActif().computer
 */

export type {
  BrowserResult,
  ClientRow,
  CommandeRow,
  ContexteComputerData,
  DocItem,
  EmployeRow,
  ErpDashboardCard,
  ErpModuleId,
  FactureRow,
  FournisseurRow,
  MachineRow,
  MaintenanceRow,
  ProductionRow,
  StockRow,
} from "@/lib/computerTypes";

import { getContexteActif } from "@/data/registry";
import type { ErpModuleId } from "@/lib/computerTypes";

/** Generic OS — minutes spent opening computer apps. */
export const COMPUTER_APP_TIME: Record<string, number> = {
  erp: 15,
  mail: 5,
  dashboard: 10,
  documents: 8,
  chat: 5,
  browser: 10,
};

/** Generic calendar labels (not entreprise-specific). */
export const DAY_LABELS: Record<number, string> = {
  0: "Dimanche (arrivée)",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
};

function computer() {
  return getContexteActif().computer;
}

export function getErpStockRows() {
  return computer().erpStockRows;
}
export function getErpCommandes() {
  return computer().erpCommandes;
}
export function getErpProduction() {
  return computer().erpProduction;
}
export function getErpEmployes() {
  return computer().erpEmployes;
}
export function getErpFactures() {
  return computer().erpFactures;
}
export function getErpMachines() {
  return computer().erpMachines;
}
export function getErpClients() {
  return computer().erpClients;
}
export function getErpFournisseurs() {
  return computer().erpFournisseurs;
}
export function getErpMaintenance() {
  return computer().erpMaintenance ?? [];
}
/** Modules available for the active contexte (Maintenance only if data present). */
export function getErpModuleList(): { id: ErpModuleId; label: string }[] {
  const base: { id: ErpModuleId; label: string }[] = [
    { id: "dashboard", label: "Tableau de bord ERP" },
    { id: "stock", label: "Stock" },
    { id: "commandes", label: "Commandes" },
    { id: "production", label: "Production" },
    { id: "employes", label: "Employés" },
    { id: "factures", label: "Factures" },
    { id: "machines", label: "Machines" },
    { id: "clients", label: "Clients" },
    { id: "fournisseurs", label: "Fournisseurs" },
  ];
  if ((computer().erpMaintenance?.length ?? 0) > 0) {
    base.push({ id: "maintenance", label: "Maintenance" });
  }
  return base;
}
export function getComputerDocuments() {
  return computer().computerDocuments;
}
export function getBrowserCorpus() {
  return computer().browserCorpus;
}
export function getChatContacts() {
  return computer().chatContacts;
}
export function getErpDashboardCards() {
  return computer().erpDashboardCards;
}
export function getDesktopCopy() {
  return computer().desktop;
}
