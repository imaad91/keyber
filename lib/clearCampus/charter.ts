/**
 * Clear Campus — charte UI & politique personnages (Phase 0).
 * Thème clair obligatoire. Aucun dark mode produit.
 */

/** Tokens light — référence produit Clear Campus / Suite corporate. */
export const CLEAR_CAMPUS_LIGHT_TOKENS = {
  bg: "#F8FAFC",
  bgWarm: "#F1F5F4",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#64748B",
  teal: "#0B3D3A",
  tealMid: "#14524D",
  accent: "#0D9488",
  accentSoft: "#CCFBF1",
  ok: "#059669",
  warn: "#D97706",
  danger: "#DC2626",
} as const;

/** Interdits produit (non négociables). */
export const CLEAR_CAMPUS_FORBIDDEN = [
  "dark-mode",
  "theme-dark",
  "photoreal-human-faces",
  "real-person-photos",
] as const;

/** Style personnages / opérateurs Vue Live Production. */
export type ClearCampusCharacterStyle = "vector" | "none";

/**
 * Défaut produit Phase 0 : personnages dessinés (vector).
 * `none` = immersion par lieux / icônes uniquement.
 */
export const CLEAR_CAMPUS_CHARACTER_STYLE_DEFAULT: ClearCampusCharacterStyle =
  "vector";

export type ClearCampusTheme = "light";

/** Seule valeur autorisée. */
export const CLEAR_CAMPUS_THEME: ClearCampusTheme = "light";

export function assertClearCampusTheme(
  value: unknown
): ClearCampusTheme {
  if (value === "light" || value === undefined || value === null) {
    return "light";
  }
  // Refuse dark / autres — force light
  return "light";
}

export function normalizeCharacterStyle(
  value: unknown
): ClearCampusCharacterStyle {
  return value === "none" ? "none" : "vector";
}

export const CLEAR_CAMPUS_GLOSSARY = [
  {
    id: "campus",
    label: "Campus",
    def: "Monde libre de l'entreprise (ailes, salles, plan) navigable en thème clair.",
  },
  {
    id: "hotspot",
    label: "Hotspot",
    def: "Point d'action dans un lieu : Suite, interview, décision, document ou Vue Live Production.",
  },
  {
    id: "suite",
    label: "Suite outils",
    def: "Outils corporate SaaS (ex-Ordinateur) ouverts depuis un hotspot poste.",
  },
  {
    id: "production-live",
    label: "Vue Live Production",
    def: "Sol opérationnel du contexte (flux, machines/postes, opérateurs, véhicules) — propre à chaque entreprise.",
  },
  {
    id: "atelier-studio",
    label: "Atelier Studio",
    def: "Chaîne de production Admin qui fabrique les contextes (pas la preview joueur).",
  },
] as const;
