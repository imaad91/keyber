/**
 * Workflow > Glossaire — dictionnaire des données Keyber.
 * L'IA lit seulement ; elle ne doit jamais inventer de termes.
 */

import { uid } from "@/lib/adminTypes";

export type GlossaireUsage =
  | "Décisions"
  | "ERP"
  | "Dialogues"
  | "Cœur"
  | "Compétences"
  | "GameState"
  | "Workflow"
  | "Agents";

export type GlossaireTerme = {
  /** Technical id, immutable once created (URL slug). */
  terme: string;
  nomLisible: string;
  definitionCourte: string;
  definitionPrecise: string;
  exempleConcret: string;
  utilisations: GlossaireUsage[];
  synonymesInterdits: string[];
  updatedAt: string;
  /** Seed terms cannot be deleted if referenced in a published Cœur. */
  seed?: boolean;
};

export function slugifyTerme(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._-]/g, "");
}

const NOW = "2026-11-13T12:00:00.000Z";

const CONF_DEF =
  "Niveau de confiance qu'un personnage a envers le joueur, de 0 à 100. < 40 = Méfiant, il cache des infos. 40-70 = Neutre. > 70 = Allié, il donne des infos cachées.";

const VIS_DEF =
  "Niveau de visibilité sur un module, de 0 à 3. 0 = Inconnu, 1 = Estimé, 2 = Précis, 3 = Temps réel.";

function conf(terme: string, prenom: string): GlossaireTerme {
  return {
    terme,
    nomLisible: `Confiance — ${prenom}`,
    definitionCourte: CONF_DEF,
    definitionPrecise: CONF_DEF,
    exempleConcret: `Si ${terme} passe de 30 à 65, ${prenom} passe de Méfiant(e) à Neutre et peut donner une info cachée.`,
    utilisations: ["GameState", "Dialogues", "Décisions", "ERP"],
    synonymesInterdits: ["amitié", "affinité", "sympathie", "relation"],
    updatedAt: NOW,
    seed: true,
  };
}

function vis(terme: string, module: string): GlossaireTerme {
  return {
    terme,
    nomLisible: `Visibilité — ${module}`,
    definitionCourte: VIS_DEF,
    definitionPrecise: VIS_DEF,
    exempleConcret: `Quand ${terme} passe de 0 à 2, le module ${module} affiche des chiffres précis au lieu d'« Inconnu ».`,
    utilisations: ["GameState", "ERP", "Décisions"],
    synonymesInterdits: ["clairvoyance", "accès", "permission"],
    updatedAt: NOW,
    seed: true,
  };
}

export function seedGlossaire(): GlossaireTerme[] {
  return [
    conf("confiance.marie", "Marie"),
    conf("confiance.karim", "Karim"),
    conf("confiance.laurent", "Laurent"),
    conf("confiance.henri", "Henri"),
    vis("visibilite.erp", "ERP"),
    vis("visibilite.stock", "Stock"),
    {
      terme: "tresorerie",
      nomLisible: "Trésorerie",
      definitionCourte:
        "Argent disponible de l'entreprise, en euros. Diminue quand on investit, augmente quand on vend.",
      definitionPrecise:
        "Argent disponible de l'entreprise, en euros. Diminue quand on investit, augmente quand on vend.",
      exempleConcret:
        "Acheter le capteur Machine 3 à 5 000 € fait baisser tresorerie de 5 000.",
      utilisations: ["GameState", "Décisions", "ERP"],
      synonymesInterdits: ["cash flow", "budget", "solde vague"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "stock",
      nomLisible: "Stock",
      definitionCourte:
        "Quantité de pièces en stock, en kg ou en unités selon le scénario.",
      definitionPrecise:
        "Quantité de pièces en stock, en kg ou en unités selon le scénario.",
      exempleConcret:
        "Si stock = 850 et besoin brut = 500, le besoin net tient compte de ces 850.",
      utilisations: ["GameState", "ERP", "Décisions"],
      synonymesInterdits: ["inventaire flou", "réserve"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "besoin_net",
      nomLisible: "Besoin net",
      definitionCourte:
        "Besoin net = Besoin brut - Stock - En-cours. C'est ce qu'il faut vraiment produire / acheter.",
      definitionPrecise:
        "Besoin net = Besoin brut - Stock - En-cours. C'est ce qu'il faut vraiment produire / acheter.",
      exempleConcret:
        "Besoin brut 500, stock 200, en-cours 50 → besoin_net = 250.",
      utilisations: ["Décisions", "Compétences", "ERP"],
      synonymesInterdits: ["besoin approximatif", "quantité à faire"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "competence_generale",
      nomLisible: "Compétence générale",
      definitionCourte:
        "Compétence générale = transversale, pour tous les rôles.",
      definitionPrecise:
        "Compétence générale = transversale, pour tous les rôles. Compétence ciblée = technique métier, précise, liée à un rôle.",
      exempleConcret:
        "Priorisation et Communication sont des compétences générales.",
      utilisations: ["Compétences", "Cœur", "Décisions"],
      synonymesInterdits: ["soft skill vague", "savoir-être"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "competence_ciblee",
      nomLisible: "Compétence ciblée",
      definitionCourte:
        "Compétence ciblée = technique métier, précise, liée à un rôle.",
      definitionPrecise:
        "Compétence générale = transversale, pour tous les rôles. Compétence ciblée = technique métier, précise, liée à un rôle.",
      exempleConcret:
        "Planification MRP et Qualité sont des compétences ciblées Production.",
      utilisations: ["Compétences", "Cœur", "Décisions"],
      synonymesInterdits: ["hard skill vague", "techno"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "coeur",
      nomLisible: "Cœur",
      definitionCourte:
        "Source de vérité unique de Keyber, en JSON structuré, verrouillée, lecture seule, pas de copier / coller / exporter.",
      definitionPrecise:
        "Source de vérité unique de Keyber, en JSON structuré, verrouillée, lecture seule, pas de copier / coller / exporter.",
      exempleConcret:
        "Toute modification du scénario passe par Fiche ou Agents, jamais par édition libre du JSON Cœur.",
      utilisations: ["Cœur", "Workflow", "Agents"],
      synonymesInterdits: ["script", "brouillon IA", "prompt"],
      updatedAt: NOW,
      seed: true,
    },
    {
      terme: "agent",
      nomLisible: "Agent",
      definitionCourte:
        "Profil d'IA dans Contrôle qui relit (ne modifie pas le code). 6 agents : Testeur, Expert Métier, Pédagogue, Cohérence ERP, Orchestra, Ergonomie.",
      definitionPrecise:
        "Profil d'IA dans Contrôle qui relit (ne modifie pas le code ni le Cœur). 6 agents : Testeur Joueur, Expert Métier, Pédagogue, Cohérence ERP, Orchestra, Ergonomie. Cursor construit ; les agents relisent.",
      exempleConcret:
        "L'Agent Pédagogue refuse un feedback « Bien joué » et exige un feedback lié à l'indicateur.",
      utilisations: ["Agents", "Cœur"],
      synonymesInterdits: ["bot", "copilote générique", "ChatGPT"],
      updatedAt: NOW,
      seed: true,
    },
  ];
}

/** Merge saved terms with seed (seed fills gaps by terme id). */
export function mergeGlossaire(
  saved: GlossaireTerme[] | undefined,
  seed: GlossaireTerme[]
): GlossaireTerme[] {
  const byId = new Map<string, GlossaireTerme>();
  for (const t of seed) byId.set(t.terme, t);
  for (const t of saved ?? []) {
    if (!t?.terme) continue;
    byId.set(t.terme, { ...byId.get(t.terme), ...t, terme: t.terme });
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.terme.localeCompare(b.terme, "fr")
  );
}

export function unknownGlossaryTermError(terme: string): string {
  return `Terme inconnu, voir Glossaire. Terme manquant : ${terme} — À ajouter dans Système > Glossaire`;
}

export function missingGlossaryTermSignal(terme: string): string {
  return `Terme manquant : ${terme} - À ajouter dans Workflow > Glossaire`;
}

/** AI may only READ the glossary — never invent terms. */
export function assertGlossaryTermKnown(
  terme: string,
  glossaire: GlossaireTerme[]
): { ok: true } | { ok: false; message: string } {
  const id = slugifyTerme(terme);
  if (!id) {
    return { ok: false, message: unknownGlossaryTermError(terme || "(vide)") };
  }
  const found = glossaire.some((t) => t.terme === id);
  if (!found) {
    return { ok: false, message: unknownGlossaryTermError(id) };
  }
  return { ok: true };
}

export function isTermUsedInPublishedCoeur(
  terme: string,
  coeurTexts: string[]
): boolean {
  const needle = terme.toLowerCase();
  return coeurTexts.some((t) => t.toLowerCase().includes(needle));
}

export function emptyGlossaireTerme(partial?: Partial<GlossaireTerme>): GlossaireTerme {
  const terme = slugifyTerme(partial?.terme || `terme_${uid("g").slice(-5)}`);
  const now = new Date().toISOString();
  return {
    terme,
    nomLisible: partial?.nomLisible ?? terme,
    definitionCourte: partial?.definitionCourte ?? "",
    definitionPrecise: partial?.definitionPrecise ?? "",
    exempleConcret: partial?.exempleConcret ?? "",
    utilisations: partial?.utilisations ?? ["Décisions"],
    synonymesInterdits: partial?.synonymesInterdits ?? [],
    updatedAt: now,
    seed: false,
  };
}
