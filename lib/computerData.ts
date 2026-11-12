/** Novacier seed data for Accès Ordinateur apps (ERP, docs, browser). */

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

export const erpStockRows: StockRow[] = [
  {
    ref: "A-42",
    nom: "Support Moteur",
    qte: 120,
    seuil: 200,
    emplacement: "Allée B - Étagère 3",
    fournisseur: "MétalPro",
    prixUnitaire: 45,
    derniereEntree: "J-2",
    statut: "Stock bas",
  },
  {
    ref: "B-17",
    nom: "Bride de Frein",
    qte: 340,
    seuil: 100,
    emplacement: "Allée A - Étagère 1",
    fournisseur: "MétalPro",
    prixUnitaire: 62,
    derniereEntree: "J-1",
    statut: "OK",
  },
  {
    ref: "C-09",
    nom: "Carter",
    qte: 45,
    seuil: 80,
    emplacement: "Allée C - Bac 2",
    fournisseur: "Nord Acier",
    prixUnitaire: 88,
    derniereEntree: "J-5",
    statut: "Stock bas",
  },
  {
    ref: "AC-2MM",
    nom: "Acier 2mm (coil)",
    qte: 850,
    seuil: 200,
    emplacement: "Quai matières",
    fournisseur: "MétalPro",
    prixUnitaire: 1.2,
    derniereEntree: "J-3",
    statut: "OK",
  },
  {
    ref: "VIS-M6",
    nom: "Vis M6",
    qte: 0,
    seuil: 150,
    emplacement: "Allée D - Tiroir 4",
    fournisseur: "FixOutillage",
    prixUnitaire: 0.08,
    derniereEntree: "J-12",
    statut: "Rupture",
  },
];

export const erpCommandes: CommandeRow[] = [
  {
    numero: "CMD-248",
    client: "AutoVolt",
    piece: "A-42",
    qteCommandee: 500,
    qteProduite: 0,
    dateLimite: "Vendredi 16h",
    statut: "En cours",
    montant: 186000,
  },
  {
    numero: "CMD-1043",
    client: "Nord Méca",
    piece: "B-17",
    qteCommandee: 80,
    qteProduite: 80,
    dateLimite: "J+5",
    statut: "Livrée",
    montant: 12400,
  },
  {
    numero: "CMD-1051",
    client: "Helio Parts",
    piece: "C-09",
    qteCommandee: 40,
    qteProduite: 12,
    dateLimite: "J+2",
    statut: "En retard",
    montant: 9800,
  },
];

export const erpProduction: ProductionRow[] = [
  {
    ligne: "Presse 1",
    piece: "A-42 Support Moteur",
    objectifJour: 80,
    produitAujourdhui: 22,
    tauxRebut: "6 %",
    vitesse: "22 p/h",
    etat: "En marche",
  },
  {
    ligne: "CNC 2",
    piece: "B-17 Bride",
    objectifJour: 70,
    produitAujourdhui: 20,
    tauxRebut: "4 %",
    vitesse: "20 p/h",
    etat: "En marche",
  },
  {
    ligne: "Assembleuse 3",
    piece: "A-42 assemblage",
    objectifJour: 90,
    produitAujourdhui: 18,
    tauxRebut: "18 %",
    vitesse: "???",
    etat: "En panne",
  },
  {
    ligne: "Contrôle Q4",
    piece: "—",
    objectifJour: 0,
    produitAujourdhui: 0,
    tauxRebut: "—",
    vitesse: "0",
    etat: "Arrêt",
  },
];

export const erpEmployes: EmployeRow[] = [
  {
    nom: "Marie Dubois",
    poste: "Cheffe d'atelier",
    equipe: "Équipe A",
    anciennete: "18 ans",
    heuresSup: "2h",
    tauxAbsence: "2 %",
    statut: "Présent",
  },
  {
    nom: "Karim Benali",
    poste: "Technicien Maintenance",
    equipe: "Équipe A",
    anciennete: "4 ans",
    heuresSup: "5h",
    tauxAbsence: "1 %",
    statut: "Présent",
  },
  {
    nom: "Laurent Perrin",
    poste: "Directeur",
    equipe: "Direction",
    anciennete: "11 ans",
    heuresSup: "0h",
    tauxAbsence: "0 %",
    statut: "Présent",
  },
  {
    nom: "Léa Moreau",
    poste: "Contrôle Qualité",
    equipe: "Équipe B",
    anciennete: "6 ans",
    heuresSup: "1h",
    tauxAbsence: "3 %",
    statut: "Présent",
  },
  {
    nom: "Tom Rivière",
    poste: "Opérateur Presse",
    equipe: "Équipe A",
    anciennete: "2 ans",
    heuresSup: "6h",
    tauxAbsence: "4 %",
    statut: "Absent",
  },
];

export const erpFactures: FactureRow[] = [
  {
    numero: "FAC-880",
    client: "AutoVolt",
    montant: 42000,
    emission: "J-10",
    echeance: "J+5",
    statut: "En attente",
  },
  {
    numero: "FAC-881",
    client: "Nord Méca",
    montant: 6400,
    emission: "J-20",
    echeance: "J-5",
    statut: "Payée",
  },
  {
    numero: "FAC-872",
    client: "Helio Parts",
    montant: 11200,
    emission: "J-30",
    echeance: "J-8",
    statut: "En retard",
  },
];

export const erpMachines: MachineRow[] = [
  {
    nom: "Presse 1",
    type: "Presse hydraulique",
    etat: "PRODUCTION",
    vitesse: "22 p/h",
    tauxRebut: "6 %",
    derniereMaint: "J-14",
    prochaineMaint: "J+4",
  },
  {
    nom: "CNC 2",
    type: "Centre usinage",
    etat: "PRODUCTION",
    vitesse: "20 p/h",
    tauxRebut: "4 %",
    derniereMaint: "J-7",
    prochaineMaint: "J+2",
  },
  {
    nom: "Assembleuse 3",
    type: "Ligne assemblage",
    etat: "Capteur HS",
    vitesse: "???",
    tauxRebut: "???",
    derniereMaint: "J-40",
    prochaineMaint: "Capteur HS",
  },
  {
    nom: "Contrôle Q4",
    type: "Banc contrôle",
    etat: "ARRET",
    vitesse: "0",
    tauxRebut: "—",
    derniereMaint: "J-3",
    prochaineMaint: "J+6",
  },
];

export const erpClients: ClientRow[] = [
  {
    nom: "AutoVolt",
    pctCa: "45 %",
    derniereCommande: "CMD-248",
    relation: "Critique",
    contact: "Achats AutoVolt",
  },
  {
    nom: "Nord Méca",
    pctCa: "18 %",
    derniereCommande: "CMD-1043",
    relation: "Bon",
    contact: "Sophie L.",
  },
  {
    nom: "Helio Parts",
    pctCa: "12 %",
    derniereCommande: "CMD-1051",
    relation: "Tendu",
    contact: "Marc D.",
  },
];

export const erpFournisseurs: FournisseurRow[] = [
  {
    nom: "MétalPro",
    piece: "Acier 2mm / A-42 brut",
    delai: "5 jours",
    prix: "1,20 €/kg",
    fiabilite: "Moyenne — retards récents",
  },
  {
    nom: "Nord Acier",
    piece: "Carter C-09 brut",
    delai: "8 jours",
    prix: "2,10 €/kg",
    fiabilite: "Bonne",
  },
  {
    nom: "FixOutillage",
    piece: "Vis M6 / consommables",
    delai: "2 jours",
    prix: "0,08 €/u",
    fiabilite: "Bonne",
  },
];

export type DocItem = {
  id: string;
  titre: string;
  type: string;
  contenu: string;
};

export const computerDocuments: DocItem[] = [
  {
    id: "doc-autovolt",
    titre: "Contrat AutoVolt",
    type: "Contrat",
    contenu:
      "Contrat-cadre Novacier × AutoVolt — pièces A-42 Support Moteur.\n\nVolume critique semaine : 500 pièces qualité avant vendredi 16h.\nPénalités de retard : jusqu'à 2 % du CA mensuel AutoVolt.\nClause qualité : zéro lot non conforme toléré sans accord écrit.\n\nAutoVolt représente 45 % du CA Novacier. Renégociation possible si volume + transparence.",
  },
  {
    id: "doc-qualite",
    titre: "Procédure Qualité",
    type: "Procédure",
    contenu:
      "PQ-04 Contrôle final — Supports A-42.\n\n1. Échantillonnage 5 % par lot.\n2. Contrôle dimensionnel + micro-fissures.\n3. Tout lot douteux : quarantine + décision Direction / Qualité.\n4. Interdiction de livrer sans signature Qualité.\n\nEn cas de micro-défaut : jeter ou négocier délai — ne jamais « passer ».",
  },
  {
    id: "doc-m3",
    titre: "Fiche Machine 3",
    type: "Fiche technique",
    contenu:
      "Assembleuse 3 — ligne critique A-42.\n\nCapteur IoT : HORS SERVICE depuis plusieurs semaines.\nSans capteur : OEE et rebut non fiables (affichage ???).\nDevis remplacement capteur : 5 000 € — demandé par Karim Benali.\nAlternative : nouvelle machine 80 k€ (délai hors semaine critique).\n\nHistorique : a « sauvé » deux trimestres, en a cassé un.",
  },
  {
    id: "doc-planning",
    titre: "Planning Équipe",
    type: "Planning",
    contenu:
      "Semaine critique — Équipe A (matin) : Marie (cheffe), Tom, Nadia, Karim (maintenance).\nÉquipe B (après-midi) : Léa (qualité), Samir, Inès.\n\nHeures sup possibles : +3 h/jour (coût moral + cash).\nRéorganisation Marie (si confiance > 60) : +2 h utiles sans HS.",
  },
];

export type BrowserResult = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  body: string;
  tags: string[];
};

export const browserCorpus: BrowserResult[] = [
  {
    id: "br-autovolt-pl",
    title: "AutoVolt aurait consulté un concurrent en Pologne",
    url: "industrie-radar.fr/autovolt-pologne",
    snippet:
      "Des sources proches des achats évoquent un devis polonais pour des supports moteur…",
    body: "Rumeur / article : AutoVolt aurait demandé un devis à un équipementier polonais pour des pièces de type support moteur. Non confirmé officiellement. Chez Novacier, le commercial interne affirme que « tout va bien » — à croiser avec Karim.",
    tags: ["autovolt", "concurrent", "pologne", "rumeur"],
  },
  {
    id: "br-novacier",
    title: "Novacier — Saint-Étienne (fiche entreprise)",
    url: "annuaire-indus.fr/novacier",
    snippet:
      "Fondée en 1987. 120 employés. Pièces métalliques auto. Client clé AutoVolt.",
    body: "Novacier, Saint-Étienne. Fondation 1987. Quasi-faillite 2022. Aujourd'hui : 4 machines, focus A-42 / B-17 / C-09. Cette semaine : livraison critique AutoVolt (45 % CA).",
    tags: ["novacier", "entreprise", "saint-etienne"],
  },
  {
    id: "br-metalpro",
    title: "MétalPro — retards de livraison acier signalés",
    url: "supply-watch.fr/metalpro",
    snippet: "Plusieurs PME rhônalpines rapportent des retards coil 2mm…",
    body: "MétalPro, fournisseur acier de Novacier, cumule des retards sur les coils 2mm. Impact possible sur stock de sécurité A-42.",
    tags: ["metalpro", "acier", "fournisseur", "retard"],
  },
];

export const COMPUTER_APP_TIME: Record<string, number> = {
  erp: 15,
  mail: 10,
  dashboard: 10,
  documents: 8,
  chat: 5,
  browser: 10,
};

export const DAY_LABELS: Record<number, string> = {
  0: "Dimanche (arrivée)",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
};
