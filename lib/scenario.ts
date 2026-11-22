/**
 * OS accessors for narrative / livre / personnages / machines.
 * Data lives in data/contextes/[id]/ — never hardcode an entreprise here.
 */

import { getContexteActif } from "@/data/registry";
import type {
  Chapitre,
  ChatMessage,
  CompanyEvent,
  Email,
  LivreEntreprise,
  Machine,
  Objective,
  Personnage,
  Rumor,
  VisibilityLevel,
} from "./types";

export function getLivreActif(): LivreEntreprise {
  return getContexteActif().livre;
}

export function getPersonnagesActifs(): Personnage[] {
  return getContexteActif().personnages;
}

export function getMachinesActives(): Machine[] {
  return getContexteActif().machines;
}

export function getChaptersActifs(): Chapitre[] {
  return getContexteActif().chapters;
}

export function getObjectivesActifs(): Objective[] {
  return getContexteActif().objectives;
}

export function getRumorActif(): Rumor {
  return getContexteActif().rumor;
}

export function emailsForDay(day: number): Email[] {
  return getContexteActif().emailsForDay(day);
}

export function messagesForDay(day: number): ChatMessage[] {
  return getContexteActif().messagesForDay(day);
}

export function eventsForDay(day: number): CompanyEvent[] {
  return getContexteActif().eventsForDay(day);
}

/** Generic calendar length — not entreprise-specific. */
export const DAY_LENGTH = 8 * 60;

/** Default fog map — numeric tiers only. */
export const initialKpiVisibility: Record<string, VisibilityLevel> = {
  tresorerie: "INCONNU",
  production: "INCONNU",
  rebut: "INCONNU",
  pieces: "ESTIME",
  moral: "ESTIME",
  ethique: "ESTIME",
};

/** @deprecated Prefer getScenarioActif().targetPieces */
export function getTargetPieces(): number {
  return getContexteActif().scenarios[
    getContexteActif().defaultScenarioId
  ]!.targetPieces ?? 500;
}

/** @deprecated Prefer getScenarioActif().dayTitles */
export function getDayTitles(): Record<number, string> {
  return (
    getContexteActif().scenarios[getContexteActif().defaultScenarioId]
      ?.dayTitles ?? {}
  );
}
