/** Generic computer / ERP row types — OS only, no scenario data. */

export type StockRow = {
  ref: string;
  nom: string;
  qte: number;
  seuil: number;
  emplacement: string;
  fournisseur: string;
  prixUnitaire: number;
  derniereEntree: string;
  statut: "OK" | "Stock bas" | "Rupture";
};

export type CommandeRow = {
  numero: string;
  client: string;
  piece: string;
  qteCommandee: number;
  qteProduite: number;
  dateLimite: string;
  statut: "En cours" | "En retard" | "Livrée" | "Annulée";
  montant: number;
};

export type ProductionRow = {
  ligne: string;
  piece: string;
  objectifJour: number;
  produitAujourdhui: number;
  tauxRebut: string;
  vitesse: string;
  etat: "En marche" | "En panne" | "Arrêt";
};

export type EmployeRow = {
  nom: string;
  poste: string;
  equipe: string;
  anciennete: string;
  heuresSup: string;
  tauxAbsence: string;
  statut: "Présent" | "Absent" | "Congé";
};

export type FactureRow = {
  numero: string;
  client: string;
  montant: number;
  emission: string;
  echeance: string;
  statut: "Payée" | "En attente" | "En retard";
};

export type MachineRow = {
  nom: string;
  type: string;
  etat: string;
  vitesse: string;
  tauxRebut: string;
  derniereMaint: string;
  prochaineMaint: string;
};

export type ClientRow = {
  nom: string;
  pctCa: string;
  derniereCommande: string;
  relation: "Bon" | "Tendu" | "Critique";
  contact: string;
};

export type FournisseurRow = {
  nom: string;
  piece: string;
  delai: string;
  prix: string;
  fiabilite: string;
};

export type DocItem = {
  id: string;
  titre: string;
  type: string;
  contenu: string;
};

export type BrowserResult = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  body: string;
  tags: string[];
};

export type ChatContact = {
  id: string;
  name: string;
  role: string;
};

export type ErpDashboardCard = {
  label: string;
  value: string;
};

/** Optional ERP Maintenance module rows — add once in OS, fill per contexte. */
export type MaintenanceRow = {
  id: string;
  equipement: string;
  type: string;
  echeance: string;
  technicien: string;
  statut: "Planifiée" | "En cours" | "Terminée" | "En retard";
  priorite: "Basse" | "Normale" | "Haute" | "Critique";
};

export type ErpModuleId =
  | "dashboard"
  | "stock"
  | "commandes"
  | "production"
  | "employes"
  | "factures"
  | "machines"
  | "clients"
  | "fournisseurs"
  | "maintenance";

/** All computer / ERP payload for one contexte. */
export type ContexteComputerData = {
  erpStockRows: StockRow[];
  erpCommandes: CommandeRow[];
  erpProduction: ProductionRow[];
  erpEmployes: EmployeRow[];
  erpFactures: FactureRow[];
  erpMachines: MachineRow[];
  erpClients: ClientRow[];
  erpFournisseurs: FournisseurRow[];
  /** Optional — if present, ERP shows the Maintenance module automatically. */
  erpMaintenance?: MaintenanceRow[];
  computerDocuments: DocItem[];
  browserCorpus: BrowserResult[];
  chatContacts: ChatContact[];
  erpDashboardCards: ErpDashboardCard[];
  desktop: {
    erpTitle: string;
    mailDescription: string;
    chatDescription: string;
    sessionLabel: string;
    bureauLabel: string;
    docsTitle: string;
    dashboardHint: string;
    browserPlaceholder: string;
    browserSuggestions: string;
    fogHint: string;
  };
};
