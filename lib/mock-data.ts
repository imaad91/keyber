import type { Action, Decision, GameState, Personnage } from "./types";

export const initialGameState: GameState = {
  tresorerie: 120_000,
  production: 72,
  moral: 64,
};

export const exampleActions: Action[] = [
  {
    id: "act-module",
    type: "CONSULT_MODULE",
    titre: "Exemple Logistique",
    icone: "Package",
    description: "Consulter le module exemple.",
  },
  {
    id: "act-dashboard",
    type: "VIEW_DASHBOARD",
    titre: "Tableau de bord",
    icone: "LayoutDashboard",
    description: "Vue synthétique des indicateurs.",
  },
  {
    id: "act-analyze",
    type: "ANALYZE_DATA",
    titre: "Analyser les données",
    icone: "Table2",
    description: "Table et filtres d'exemple.",
  },
  {
    id: "act-interview",
    type: "INTERVIEW",
    titre: "Entretien",
    icone: "MessagesSquare",
    description: "Interroger un personnage.",
  },
  {
    id: "act-decide",
    type: "DECIDE",
    titre: "Décision exemple",
    icone: "Scale",
    description: "Valider une décision d'exemple.",
  },
];

export const examplePersonnage: Personnage = {
  id: "pers-marie",
  nom: "Marie",
  role: "Cheffe d'atelier",
  avatar: "M",
  dialogues: [
    "Bonjour. Que souhaitez-vous savoir sur l'atelier ?",
    "Les délais sont tenables si on priorise correctement.",
    "Je peux vous préparer un point demain matin.",
  ],
};

export const exampleDecision: Decision = {
  id: "dec-exemple",
  titre: "Décision exemple",
  impact: "Ajustement illustratif des indicateurs (stub).",
  deltas: {
    tresorerie: -5_000,
    production: 3,
    moral: 2,
  },
};
