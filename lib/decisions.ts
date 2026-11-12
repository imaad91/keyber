/**
 * Declarative decision schema — data only, no business logic.
 */

export type Consequence = {
  /** Path cible: tresorerie, confiance.marie, visibilite.erp, temps, xp, flags.*, machine.<id>.etat (set string via setValeur) */
  cible: string;
  /** Numeric delta (add) or absolute when mode is "set" */
  valeur: number;
  mode?: "add" | "set";
  /** Optional string set (e.g. machine etat) — when present, overrides valeur */
  setValeur?: string;
};

export type DecisionCondition = {
  si: string;
  superieurA?: number;
  inferieurA?: number;
  egalA?: number;
  /** Optional AND clauses (all must pass with `si`) */
  et?: Omit<DecisionCondition, "alorsEffetSupplementaire" | "et">[];
  /** Extra consequences when the condition holds after the base choice is applied */
  alorsEffetSupplementaire?: Consequence[];
};

export type DecisionChoix = {
  id: string;
  label: string;
  description: string;
  consequences: Consequence[];
  /** Soft unlock / bonus conditions evaluated after base consequences */
  conditions?: DecisionCondition[];
  /** Hard gate: choice disabled unless all pass against current state */
  requis?: Omit<DecisionCondition, "alorsEffetSupplementaire">[];
  /** Shown when requis fail — e.g. skill gate copy */
  messageVerrouillage?: string;
  feedbackTexte: string;
  impacts?: { label: string; value: string; tone: "pos" | "neg" | "neu" }[];
};

export type Decision = {
  id: string;
  titre: string;
  jour: number;
  dilemme: string;
  choix: DecisionChoix[]; // max 3
  xpGagne: number;
  /** If true, engine banks daily production into weekly quality after the choice */
  bankProduction?: boolean;
  categorie?: string;
  /** When set, this decision is a Mode Compétence training drill */
  competenceId?: string;
};

export type ScenarioDecisions = Decision[];
