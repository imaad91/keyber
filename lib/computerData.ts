/**
 * Constantes Ordinateur génériques (pas de registry / contexte).
 * Tables ERP Book = play.computer (OsComputerErp), plus getContexteActif.
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
