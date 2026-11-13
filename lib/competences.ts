/**
 * Precise skill catalog — générales (transversal) + ciblées (role-specific).
 */

export type CompetenceType = "generale" | "ciblee";

export type CompetenceProgress = {
  niveau: number;
  xp: number;
  /** For ciblées: which of the 3 indicateurs have been demonstrated */
  indicateursValides?: boolean[];
};

export type CompetenceGeneraleDef = {
  id: string;
  type: "generale";
  nom: string;
  descriptionPrecise: string;
};

export type CompetenceCibleeDef = {
  id: string;
  type: "ciblee";
  role: string;
  nom: string;
  descriptionPrecise: string;
  indicateurs: [string, string, string];
  erreursFrequentes: string[];
};

export type CompetenceImpact = {
  competenceId: string;
  type: CompetenceType;
  xp: number;
  /** Precise feedback tied to an observable indicator (never vague). */
  feedback: string;
  /** Index 0–2 of the ciblée indicator demonstrated (optional for générales). */
  indicateurIndex?: number;
};

export const ROLE_PROD = "prod";

export const COMPETENCES_GENERALES: CompetenceGeneraleDef[] = [
  {
    id: "negociation",
    type: "generale",
    nom: "Négociation",
    descriptionPrecise:
      "Obtenir une contrepartie mesurable (prix, délai, volume) sans céder le cadre commercial.",
  },
  {
    id: "gestion_crise",
    type: "generale",
    nom: "Gestion de crise",
    descriptionPrecise:
      "Isoler la cause d'un arrêt, contenir le risque qualité et décider un plan en moins de 30 minutes.",
  },
  {
    id: "leadership",
    type: "generale",
    nom: "Leadership",
    descriptionPrecise:
      "Aligner l'atelier sur une priorité unique et faire exécuter sans brûler la confiance de l'équipe.",
  },
  {
    id: "decision_incertitude",
    type: "generale",
    nom: "Décision sous incertitude",
    descriptionPrecise:
      "Choisir une action avec données partielles en explicitant l'hypothèse et le critère d'arrêt.",
  },
  {
    id: "communication",
    type: "generale",
    nom: "Communication",
    descriptionPrecise:
      "Formuler un statut factuel (chiffres, écart, prochaine action) compréhensible en 60 secondes.",
  },
  {
    id: "priorisation",
    type: "generale",
    nom: "Priorisation",
    descriptionPrecise:
      "Ordonner les tâches sur impact contrat / risque rebut / cash, et reporter le reste sans ambiguïté.",
  },
];

export const COMPETENCES_CIBLEES_PROD: CompetenceCibleeDef[] = [
  {
    id: "planification_mrp",
    type: "ciblee",
    role: ROLE_PROD,
    nom: "Planification MRP",
    descriptionPrecise:
      "Calculer un besoin net (besoin brut − stock − en-cours) et geler un horizon de lancement.",
    indicateurs: [
      "Besoin net recalculé avec stock et en-cours",
      "Horizon de lancement figé (J+n)",
      "Écart plan vs réel tracé le jour même",
    ],
    erreursFrequentes: [
      "Lancer sans retrancher le stock disponible",
      "Ignorer les en-cours atelier",
      "Changer l'horizon en cours de journée sans motif",
    ],
  },
  {
    id: "gestion_stocks",
    type: "ciblee",
    role: ROLE_PROD,
    nom: "Gestion des stocks",
    descriptionPrecise:
      "Calculer un stock de sécurité (demande × délai × facteur de service) et déclencher le réappro au seuil.",
    indicateurs: [
      "Stock de sécurité chiffré pour l'article critique",
      "Seuil de réappro respecté ou justifié",
      "Couverture jours restante explicitée",
    ],
    erreursFrequentes: [
      "Commander au feeling sans formule",
      "Confondre stock physique et stock disponible",
      "Laisser le stock sous seuil sans alerte",
    ],
  },
  {
    id: "maintenance",
    type: "ciblee",
    role: ROLE_PROD,
    nom: "Maintenance",
    descriptionPrecise:
      "Arbitrer panne vs production : diagnostiquer, estimer MTTR, et choisir arrêt planifié ou bypass contrôlé.",
    indicateurs: [
      "Cause probable nommée avant relance",
      "MTTR / fenêtre d'arrêt estimés",
      "Bypass ou arrêt documenté avec risque rebut",
    ],
    erreursFrequentes: [
      "Relancer sans diagnostic",
      "Bypass permanent sans plan de réparation",
      "Oublier l'impact rebut sur le contrat client",
    ],
  },
  {
    id: "qualite",
    type: "ciblee",
    role: ROLE_PROD,
    nom: "Qualité",
    descriptionPrecise:
      "Décider tri / reprise / rebut sur un lot défectueux en chiffrant le risque client et le coût.",
    indicateurs: [
      "Taux de défaut du lot mesuré",
      "Décision tri/reprise/rebut argumentée",
      "Impact éthique / client chiffré",
    ],
    erreursFrequentes: [
      "Livrer sans contrôle pour tenir le délai",
      "Rebuter un lot entier sans échantillonnage",
      "Masquer le défaut au client",
    ],
  },
  {
    id: "ordonnancement",
    type: "ciblee",
    role: ROLE_PROD,
    nom: "Ordonnancement",
    descriptionPrecise:
      "Séquencer les OF sur les machines pour maximiser les pièces qualité avant l'échéance contrat.",
    indicateurs: [
      "Séquence OF publiée pour la journée",
      "Contrainte machine / outillage prise en compte",
      "Priorité contrat AutoVolt respectée",
    ],
    erreursFrequentes: [
      "FIFO aveugle sans priorité client",
      "Changer de séquence à chaque alerte",
      "Surcharger une machine déjà en dérive rebut",
    ],
  },
];

export const ALL_COMPETENCES = [
  ...COMPETENCES_GENERALES,
  ...COMPETENCES_CIBLEES_PROD,
];

const BY_ID = Object.fromEntries(ALL_COMPETENCES.map((c) => [c.id, c]));

/** Legacy ids from older saves / trainings → canonical. */
export const LEGACY_SKILL_IDS: Record<string, string> = {
  crise: "gestion_crise",
  stock: "gestion_stocks",
  data: "decision_incertitude",
};

export function canonicalizeSkillId(id: string): string {
  return LEGACY_SKILL_IDS[id] ?? id;
}

export function getCompetenceDef(id: string) {
  return BY_ID[canonicalizeSkillId(id)];
}

export function isGenerale(id: string): boolean {
  const d = getCompetenceDef(id);
  return d?.type === "generale";
}

export function isCiblee(id: string): boolean {
  const d = getCompetenceDef(id);
  return d?.type === "ciblee";
}

export function skillLabel(id: string): string {
  return getCompetenceDef(id)?.nom ?? id;
}

export function skillTypeLabel(type: CompetenceType): string {
  return type === "generale" ? "Générale" : "Ciblée";
}

export function emptyGeneralesProgress(): Record<string, CompetenceProgress> {
  return Object.fromEntries(
    COMPETENCES_GENERALES.map((c) => [c.id, { niveau: 1, xp: 0 }])
  );
}

export function emptyCibleesProgress(
  role = ROLE_PROD
): Record<string, CompetenceProgress> {
  return Object.fromEntries(
    COMPETENCES_CIBLEES_PROD.filter((c) => c.role === role).map((c) => [
      c.id,
      { niveau: 1, xp: 0, indicateursValides: [false, false, false] },
    ])
  );
}

export function formatSkillDebriefLine(impact: CompetenceImpact): string {
  const def = getCompetenceDef(impact.competenceId);
  const nom = def?.nom ?? impact.competenceId;
  const prefix = `${skillTypeLabel(impact.type)} - ${nom} +${impact.xp}`;
  return `${prefix} : ${impact.feedback}`;
}

const VAGUE_FEEDBACK = /^(bien joué|bravo|ok|super|parfait|good job)[.!]?$/i;

export function isVagueFeedback(text: string): boolean {
  return VAGUE_FEEDBACK.test(text.trim());
}

export function assertPreciseDescription(descriptionPrecise: string | undefined): string | null {
  if (!descriptionPrecise || !descriptionPrecise.trim()) {
    return "Erreur : compétence sans description précise";
  }
  return null;
}
