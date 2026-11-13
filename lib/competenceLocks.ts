/**
 * AI locks for competences — Admin / Cœur validation only.
 * Player runtime keeps using CompetenceImpact { competenceId, type, xp, feedback, indicateurIndex }.
 */

import {
  ALL_COMPETENCES,
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
  canonicalizeSkillId,
  getCompetenceDef,
  isVagueFeedback,
  type CompetenceCibleeDef,
  type CompetenceType,
} from "@/lib/competences";

export type LockedCompetenceImpact = {
  competenceId: string;
  type: CompetenceType;
  xp: number;
  /** Observable indicator text — must match catalogue for ciblées. */
  indicateurTeste?: string;
  feedbackSiReussi?: string;
  feedbackSiEchoue?: string;
  /** Player-compatible fields (derived / legacy). */
  feedback?: string;
  indicateurIndex?: number;
};

export type CompetencePrecisionStatus = "precis" | "imprecis" | "incoherent";

export type CompetencePrecisionRow = {
  scenarioId: string;
  scenarioTitre: string;
  decisionId: string;
  decisionTitre: string;
  dilemme: string;
  choixId: string;
  choixLabel: string;
  competenceId: string;
  competenceNom: string;
  indicateurTeste: string;
  feedbackSiReussi: string;
  feedbackSiEchoue: string;
  statut: CompetencePrecisionStatus;
  erreurs: string[];
};

export function validCompetenceIds(): string[] {
  return ALL_COMPETENCES.map((c) => c.id);
}

export function formatValidCompetenceIds(): string {
  return validCompetenceIds().join(", ");
}

export function unknownCompetenceError(id: string): string {
  return `Erreur Cœur : competenceId '${id}' inconnue. Compétences valides : [${formatValidCompetenceIds()}]. Choisis parmi les compétences existantes, ou crée-la d'abord dans le module Compétences / Ciblées. Interdiction d'inventer une compétence.`;
}

export function unknownIndicateurError(
  competenceId: string,
  indicateur: string,
  valides: string[]
): string {
  return `Erreur Cœur : indicateur '${indicateur}' inconnu pour ${competenceId}. Indicateurs valides : [${valides.join(", ")}].`;
}

const EXTRA_VAGUE =
  /^(\+?\d+\s*xp|bien joué|bravo|ok|super|parfait|good job|nice|cool)[.!]?$/i;

export function isVagueOrEmptyFeedback(text: string | undefined): boolean {
  if (!text || !text.trim()) return true;
  const t = text.trim();
  if (isVagueFeedback(t)) return true;
  if (EXTRA_VAGUE.test(t)) return true;
  if (t.length < 20) return true;
  return false;
}

/** Resolve indicateur text from index or keep text. */
export function resolveIndicateurTeste(
  competenceId: string,
  impact: LockedCompetenceImpact
): string | undefined {
  if (impact.indicateurTeste?.trim()) return impact.indicateurTeste.trim();
  const def = getCompetenceDef(competenceId);
  if (
    def?.type === "ciblee" &&
    typeof impact.indicateurIndex === "number" &&
    impact.indicateurIndex >= 0 &&
    impact.indicateurIndex < def.indicateurs.length
  ) {
    return def.indicateurs[impact.indicateurIndex];
  }
  return undefined;
}

export function indicateurIndexFromText(
  competenceId: string,
  indicateurTeste: string | undefined
): number | undefined {
  if (!indicateurTeste) return undefined;
  const def = getCompetenceDef(competenceId);
  if (def?.type !== "ciblee") return undefined;
  const idx = def.indicateurs.findIndex((i) => i === indicateurTeste);
  return idx >= 0 ? idx : undefined;
}

/** Normalize for player engine + admin display. */
export function normalizeLockedImpact(
  raw: LockedCompetenceImpact
): LockedCompetenceImpact {
  const competenceId = canonicalizeSkillId(raw.competenceId);
  const def = getCompetenceDef(competenceId);
  const type: CompetenceType =
    raw.type ?? (def?.type === "ciblee" ? "ciblee" : "generale");
  const indicateurTeste = resolveIndicateurTeste(competenceId, raw);
  const feedbackSiReussi =
    raw.feedbackSiReussi?.trim() || raw.feedback?.trim() || "";
  const feedbackSiEchoue =
    raw.feedbackSiEchoue?.trim() ||
    (raw.feedback && !raw.feedbackSiReussi ? "" : raw.feedbackSiEchoue) ||
    "";
  const feedback = feedbackSiReussi || raw.feedback?.trim() || "";
  const indicateurIndex =
    typeof raw.indicateurIndex === "number"
      ? raw.indicateurIndex
      : indicateurIndexFromText(competenceId, indicateurTeste);

  return {
    competenceId,
    type,
    xp: Number(raw.xp) || 0,
    indicateurTeste,
    feedbackSiReussi: feedbackSiReussi || undefined,
    feedbackSiEchoue: feedbackSiEchoue || undefined,
    feedback,
    ...(typeof indicateurIndex === "number" ? { indicateurIndex } : {}),
  };
}

export type ImpactValidationError = { message: string };

/** Strict Admin Cœur validation for one impact. */
export function validateLockedImpact(
  raw: LockedCompetenceImpact,
  path: string
): ImpactValidationError[] {
  const errors: ImpactValidationError[] = [];
  if (!raw || typeof raw !== "object") {
    return [{ message: `${path} : impact invalide` }];
  }
  if (!raw.competenceId || typeof raw.competenceId !== "string") {
    errors.push({ message: `${path} : competenceId obligatoire` });
    return errors;
  }
  const id = canonicalizeSkillId(raw.competenceId);
  const def = getCompetenceDef(id);
  if (!def) {
    errors.push({ message: unknownCompetenceError(raw.competenceId) });
    return errors;
  }
  if (raw.type && raw.type !== def.type) {
    errors.push({
      message: `${path} : type '${raw.type}' incompatible avec ${id} (${def.type})`,
    });
  }

  const indicateurTeste = resolveIndicateurTeste(id, raw);
  if (def.type === "ciblee") {
    const ciblee = def as CompetenceCibleeDef;
    if (!indicateurTeste) {
      errors.push({
        message: `${path} : indicateurTeste obligatoire pour ${id}. Indicateurs valides : [${ciblee.indicateurs.join(", ")}]`,
      });
    } else if (!ciblee.indicateurs.includes(indicateurTeste)) {
      errors.push({
        message: unknownIndicateurError(
          id,
          indicateurTeste,
          [...ciblee.indicateurs]
        ),
      });
    }
  }

  const ok =
    raw.feedbackSiReussi?.trim() ||
    raw.feedback?.trim() ||
    "";
  const ko = raw.feedbackSiEchoue?.trim() || "";
  // Require success feedback; fail feedback required when using new schema
  if (isVagueOrEmptyFeedback(ok)) {
    errors.push({
      message: `${path} : feedbackSiReussi obligatoire et précis (lié à l'indicateur), interdiction de « Bien joué » / « +30 XP »`,
    });
  }
  if (raw.feedbackSiReussi !== undefined || raw.feedbackSiEchoue !== undefined) {
    if (isVagueOrEmptyFeedback(ko)) {
      errors.push({
        message: `${path} : feedbackSiEchoue obligatoire et précis (lié à l'indicateur)`,
      });
    }
  } else if (def.type === "ciblee") {
    // Legacy single feedback: still must be precise; encourage dual feedback
    if (isVagueOrEmptyFeedback(ok)) {
      errors.push({
        message: `${path} : feedback précis obligatoire`,
      });
    }
  }

  return errors;
}

/** Does dilemme text relate to the announced indicator? */
export function dilemmeMatchesIndicateur(
  dilemme: string,
  indicateur: string
): boolean {
  const d = dilemme.toLowerCase();
  const tokens = indicateur
    .toLowerCase()
    .split(/[^a-zàâäéèêëïîôùûüç0-9]+/i)
    .filter((t) => t.length >= 4);
  if (tokens.length === 0) return true;
  const hits = tokens.filter((t) => d.includes(t)).length;
  return hits >= Math.min(2, tokens.length);
}

export function evaluateImpactPrecision(
  dilemme: string,
  impact: LockedCompetenceImpact
): { statut: CompetencePrecisionStatus; erreurs: string[] } {
  const erreurs: string[] = [];
  const norm = normalizeLockedImpact(impact);
  const def = getCompetenceDef(norm.competenceId);
  if (!def) {
    return {
      statut: "incoherent",
      erreurs: [unknownCompetenceError(norm.competenceId)],
    };
  }
  if (def.type === "ciblee") {
    const vals = (def as CompetenceCibleeDef).indicateurs;
    if (
      !norm.indicateurTeste ||
      !vals.includes(norm.indicateurTeste)
    ) {
      erreurs.push(
        unknownIndicateurError(
          norm.competenceId,
          norm.indicateurTeste ?? "(manquant)",
          [...vals]
        )
      );
    } else if (!dilemmeMatchesIndicateur(dilemme, norm.indicateurTeste)) {
      erreurs.push(
        "Incohérence : décision ne teste pas l'indicateur annoncé"
      );
    }
  }
  const ok = norm.feedbackSiReussi || norm.feedback || "";
  const ko = norm.feedbackSiEchoue || "";
  if (isVagueOrEmptyFeedback(ok)) {
    erreurs.push("Utilisation imprécise : feedbackSiReussi vague ou manquant");
  }
  if (
    (norm.feedbackSiReussi || norm.feedbackSiEchoue) &&
    isVagueOrEmptyFeedback(ko)
  ) {
    erreurs.push("Utilisation imprécise : feedbackSiEchoue vague ou manquant");
  }

  if (erreurs.some((e) => e.startsWith("Erreur Cœur") || e.startsWith("Incohérence"))) {
    return {
      statut: erreurs.some((e) => e.startsWith("Incohérence"))
        ? "incoherent"
        : "incoherent",
      erreurs,
    };
  }
  if (erreurs.length) return { statut: "imprecis", erreurs };
  return { statut: "precis", erreurs: [] };
}

export type CoeurLikeForScan = {
  scenario: { id: string; titre: string };
  decisions: {
    id: string;
    titre: string;
    dilemme: string;
    choix: {
      id: string;
      label: string;
      competencesImpactees?: LockedCompetenceImpact[];
    }[];
  }[];
};

export function scanCoeurCompetencePrecision(
  coeur: CoeurLikeForScan
): CompetencePrecisionRow[] {
  const rows: CompetencePrecisionRow[] = [];
  for (const d of coeur.decisions) {
    for (const c of d.choix) {
      for (const imp of c.competencesImpactees ?? []) {
        const norm = normalizeLockedImpact(imp);
        const def = getCompetenceDef(norm.competenceId);
        const { statut, erreurs } = evaluateImpactPrecision(d.dilemme, norm);
        rows.push({
          scenarioId: coeur.scenario.id,
          scenarioTitre: coeur.scenario.titre,
          decisionId: d.id,
          decisionTitre: d.titre,
          dilemme: d.dilemme,
          choixId: c.id,
          choixLabel: c.label,
          competenceId: norm.competenceId,
          competenceNom: def?.nom ?? norm.competenceId,
          indicateurTeste: norm.indicateurTeste ?? "—",
          feedbackSiReussi: norm.feedbackSiReussi || norm.feedback || "—",
          feedbackSiEchoue: norm.feedbackSiEchoue || "—",
          statut,
          erreurs,
        });
      }
    }
  }
  return rows;
}

export function allCompetenceImpactsPrecise(
  rows: CompetencePrecisionRow[]
): boolean {
  if (rows.length === 0) return true;
  return rows.every((r) => r.statut === "precis");
}

export function usagesOfCompetence(
  competenceId: string,
  coeurs: CoeurLikeForScan[]
): CompetencePrecisionRow[] {
  const id = canonicalizeSkillId(competenceId);
  return coeurs
    .flatMap((c) => scanCoeurCompetencePrecision(c))
    .filter((r) => r.competenceId === id);
}

export { COMPETENCES_GENERALES, COMPETENCES_CIBLEES_PROD, ALL_COMPETENCES };
