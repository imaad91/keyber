/**
 * Défauts vides des blocs riches OS — aucun contenu métier.
 */

import type {
  OsFinance,
  OsHistorique,
  OsHumain,
  OsKpiDef,
  OsMeta,
  OsProgressionBlock,
  OsVisibiliteBlock,
  OsWorld,
} from "@/lib/keyberOs/types";

export function createEmptyOsMeta(partial?: Partial<OsMeta>): OsMeta {
  return {
    scenarioId: "",
    roleId: null,
    jourActuel: 1,
    heureActuelle: "08:00",
    tempsRestantMinutes: 600,
    week: 1,
    /** 0 = début journée (08:00) — même sémantique POC. */
    minutesSinceStart: 0,
    dayLengthMinutes: 600,
    ...partial,
  };
}

export function createEmptyOsFinance(partial?: Partial<OsFinance>): OsFinance {
  return {
    tresorerie: 50_000,
    stockKg: 100,
    productionParJour: 60,
    tauxRebut: 0.02,
    qualite: 0,
    piecesBrutesSemaine: 0,
    piecesAujourdhui: 0,
    commandes: 12,
    ...partial,
  };
}

export function createEmptyOsHumain(partial?: Partial<OsHumain>): OsHumain {
  return {
    moralEquipe: 70,
    ethique: 70,
    confianceClient: 70,
    ...partial,
  };
}

export function createEmptyOsProgression(
  partial?: Partial<OsProgressionBlock>
): OsProgressionBlock {
  return {
    xp: 0,
    niveau: 1,
    score: 0,
    competencesGenerales: {},
    competencesCiblees: {},
    ...partial,
  };
}

export function createEmptyOsVisibilite(
  partial?: Partial<OsVisibiliteBlock>
): OsVisibiliteBlock {
  return {
    level: 1,
    sensorInstalled: false,
    parModule: {},
    ...partial,
  };
}

export function createEmptyOsHistorique(): OsHistorique {
  return {
    decisionsPrises: [],
    evenementsDeclenches: [],
  };
}

export function createEmptyOsWorld(partial?: Partial<OsWorld>): OsWorld {
  return {
    phase: "JOUR",
    ending: null,
    showDayEnd: false,
    showDebrief: false,
    alarmActive: false,
    introSeen: false,
    onboardingStep: 0,
    onboardingDone: true,
    unlockedActions: ["computer", "decide", "interview", "atelier-live"],
    dayDecisionId: null,
    chapterId: "",
    chapters: [],
    journal: [],
    badges: [],
    messages: [],
    eventNotifications: [],
    urgentBanner: null,
    lastSkillDebrief: [],
    ...partial,
  };
}

/** KPI génériques par défaut (pas de noms d'entreprise). */
export function createDefaultOsKpis(): OsKpiDef[] {
  return [
    {
      id: "tresorerie",
      label: "Trésorerie",
      format: "currency",
      path: "finance.tresorerie",
      unit: "€",
    },
    {
      id: "stock",
      label: "Stock",
      format: "number",
      path: "finance.stockKg",
    },
    {
      id: "production",
      label: "Production",
      format: "number",
      path: "finance.productionParJour",
    },
    {
      id: "rebut",
      label: "Rebut",
      format: "percent",
      path: "finance.tauxRebut",
    },
    {
      id: "moral",
      label: "Moral",
      format: "number",
      path: "humain.moralEquipe",
      unit: "/100",
    },
    {
      id: "ethique",
      label: "Éthique",
      format: "number",
      path: "humain.ethique",
      unit: "/100",
    },
    {
      id: "confiance",
      label: "Confiance client",
      format: "number",
      path: "humain.confianceClient",
      unit: "/100",
    },
  ];
}

