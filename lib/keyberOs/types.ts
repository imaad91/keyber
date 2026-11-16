/**
 * Types partagés Keyber OS — aucun nom d'entreprise.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";

export type OsChoice = {
  id: string;
  label: string;
};

export type OsDecision = {
  id: string;
  titre: string;
  options: OsChoice[];
};

/** État générique de session OS (alimenté par les fichiers de paramétrage). */
export type OsPlayState = {
  sessionId: string;
  param: ScenarioParamFile;
  stepIndex: number;
  decisions: OsDecision[];
  eventsFired: string[];
  tresorerieBrute: number;
  stock: number;
  production: number;
  commandes: number;
  xp: number;
  niveau: number;
  score: number;
  log: string[];
  finished: boolean;
  feedback: string | null;
};

export type OsErpSnapshot = {
  tresorerie: number;
  tresorerieBrute: number;
  facteur: number;
  formule: string;
  stock: number;
  production: number;
  commandes: number;
  fournisseurs: number;
  clients: number;
  equipe: number;
};

export type OsModuleId =
  | "donnees-sauvegarde"
  | "moteur-scenarios"
  | "moteur-decisions"
  | "moteur-evenements"
  | "erp"
  | "progression"
  | "interface-joueur";
