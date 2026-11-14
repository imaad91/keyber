/**
 * Normalize GameState from older localStorage saves so the UI never crashes.
 */

import {
  emptyCibleesProgress,
  emptyGeneralesProgress,
  canonicalizeSkillId,
  getCompetenceDef,
} from "./competences";
import type { GameState } from "./gameState";
import { syncMetaClock } from "./gameState";

export function migrateGameState(raw: GameState | null | undefined): GameState {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid game state");
  }

  const generales = {
    ...emptyGeneralesProgress(),
    ...(raw.progression?.competencesGenerales ?? {}),
  };
  const ciblees = {
    ...emptyCibleesProgress("prod"),
    ...(raw.progression?.competencesCiblees ?? {}),
  };

  // Migrate legacy flat competences / skillProgress into the split maps
  const legacyFlat = {
    ...(raw.progression?.competences ?? {}),
  };
  for (const [id, prog] of Object.entries(raw.world?.skillProgress ?? {})) {
    if (typeof prog?.niveau === "number") legacyFlat[id] = prog.niveau;
  }
  for (const [rawId, niveau] of Object.entries(legacyFlat)) {
    const id = canonicalizeSkillId(rawId);
    const def = getCompetenceDef(id);
    if (!def) continue;
    const xp = raw.world?.skillProgress?.[rawId]?.xp ?? 0;
    if (def.type === "generale") {
      generales[id] = {
        niveau: typeof niveau === "number" ? niveau : 1,
        xp: generales[id]?.xp ?? xp,
      };
    } else {
      ciblees[id] = {
        niveau: typeof niveau === "number" ? niveau : 1,
        xp: ciblees[id]?.xp ?? xp,
        indicateursValides:
          ciblees[id]?.indicateursValides ?? [false, false, false],
      };
    }
  }

  const skillProgress: Record<string, { niveau: number; xp: number }> = {};
  for (const [id, p] of Object.entries(generales)) {
    skillProgress[id] = { niveau: p.niveau, xp: p.xp };
  }
  for (const [id, p] of Object.entries(ciblees)) {
    skillProgress[id] = { niveau: p.niveau, xp: p.xp };
  }

  const world = raw.world ?? ({} as GameState["world"]);
  const meta = raw.meta ?? ({} as GameState["meta"]);

  const migrated: GameState = {
    ...raw,
    modeActuel: raw.modeActuel ?? null,
    scenarioCompetenceId: raw.scenarioCompetenceId ?? null,
    scenarioHistoireId: raw.scenarioHistoireId ?? meta.scenarioId ?? null,
    meta: {
      ...meta,
      jourActuel: meta.jourActuel ?? 0,
      minutesSinceStart: meta.minutesSinceStart ?? 0,
      dayLengthMinutes: meta.dayLengthMinutes ?? 600,
      heureActuelle: meta.heureActuelle ?? "08:00",
      tempsRestantMinutes:
        meta.tempsRestantMinutes ??
        Math.max(0, (meta.dayLengthMinutes ?? 600) - (meta.minutesSinceStart ?? 0)),
      week: meta.week ?? 1,
      scenarioId: meta.scenarioId ?? "novacier-semaine-qui-decide",
      entrepriseId: meta.entrepriseId ?? "ent-novacier",
      roleId: meta.roleId ?? null,
      rules: meta.rules ?? {
        dayLengthMinutes: 600,
        machineDownProductionFactor: 0.55,
        bypassProductionFactor: 0.95,
        endingBands: [],
        endingXp: { VICTOIRE: 500, PARTIELLE: 200, ECHEC: 50 },
      },
    },
    finance: {
      tresorerie: raw.finance?.tresorerie ?? 420_000,
      stockKg: raw.finance?.stockKg ?? 850,
      productionParJour: raw.finance?.productionParJour ?? 60,
      tauxRebut: raw.finance?.tauxRebut ?? 18,
      qualite: raw.finance?.qualite ?? 0,
      piecesBrutesSemaine: raw.finance?.piecesBrutesSemaine ?? 0,
      piecesAujourdhui: raw.finance?.piecesAujourdhui ?? 0,
    },
    humain: {
      moralEquipe: raw.humain?.moralEquipe ?? 55,
      ethique: raw.humain?.ethique ?? 80,
      confianceClient: raw.humain?.confianceClient ?? 60,
    },
    relations: raw.relations ?? {},
    progression: {
      xp: raw.progression?.xp ?? 0,
      niveau: raw.progression?.niveau ?? 1,
      competencesGenerales: generales,
      competencesCiblees: ciblees,
    },
    visibilite: raw.visibilite ?? { erp: 0, stock: 0, production: 0 },
    historique: {
      decisionsPrises: raw.historique?.decisionsPrises ?? [],
      evenementsDeclenches: raw.historique?.evenementsDeclenches ?? [],
    },
    flags: raw.flags ?? {},
    world: {
      ...world,
      mode: world.mode ?? null,
      ending: world.ending ?? null,
      showDebrief: Boolean(world.showDebrief),
      alarmActive: Boolean(world.alarmActive),
      scenarioActive: world.scenarioActive ?? true,
      dayDecisionId: world.dayDecisionId ?? null,
      feedbackFlash: world.feedbackFlash ?? null,
      introSeen: Boolean(world.introSeen),
      onboardingStep: world.onboardingStep ?? 1,
      onboardingDone: Boolean(world.onboardingDone),
      unlockedActions: world.unlockedActions ?? [
        "ACCESS_COMPUTER",
        "VIEW_ATELIER_LIVE",
      ],
      chapterId: world.chapterId ?? "ch-semaine",
      chapters: world.chapters ?? [],
      journal: world.journal ?? [],
      badges: world.badges ?? [],
      objectives: world.objectives ?? [],
      machines: world.machines ?? [],
      emails: world.emails ?? [],
      messages: world.messages ?? [],
      events: world.events ?? [],
      rumors: world.rumors ?? [],
      unlockedInfos: world.unlockedInfos ?? [],
      skillProgress,
      trainingsCompleted: world.trainingsCompleted ?? [],
      histoiresCompleted: world.histoiresCompleted ?? [],
      trainingPrompt: world.trainingPrompt ?? null,
      lastSkillDebrief: world.lastSkillDebrief ?? [],
      eventNotifications: world.eventNotifications ?? [],
      urgentBanner: world.urgentBanner ?? null,
      showDayEnd: Boolean(world.showDayEnd),
    },
  };

  return syncMetaClock(migrated);
}
