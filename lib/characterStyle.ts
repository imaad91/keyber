/**
 * KEYBER character visual charter
 * Flat vector — Duolingo / Notion / Pennylane.
 * Use for all current and future cast (commercial, RH, DG…).
 * Display names come from the active contexte (chatContacts), not hardcoded cast.
 */

/**
 * Noms d'affichage : CHARACTER_META (rôles génériques) + overrides appelant.
 * Plus de lookup registry Novacier — Book OS passe les noms via session.
 */

export const CHARACTER_PALETTE = {
  navy: "#0C3B38",
  mint: "#2FD67E",
  blue: "#3B6FB5",
  beige: "#F5F1E8",
  gray: "#6B7280",
  ink: "#1A2E2C",
  skinLight: "#E8C4A8",
  skinMid: "#C9956C",
  skinDeep: "#8D5A3C",
  white: "#FFFFFF",
  dangerSoft: "#D4C4B8",
} as const;

export type CharacterExpression = "MEFIANT" | "NEUTRE" | "ALLIE";

export type CharacterVisualId =
  | "pers-marie"
  | "pers-karim"
  | "pers-laurent"
  | "pers-henri"
  /** Lumière & Co (Étape 38 — feeling portraits, pas PNG). */
  | "pers-samir"
  | "pers-lea"
  | "pers-claire";

/** Alias id/nom → slot visuel (Book OS / Lumière, hors registry Novacier). */
const VISUAL_ALIASES: Record<string, CharacterVisualId> = {
  "pers-samir": "pers-samir",
  "iv-samir": "pers-samir",
  samir: "pers-samir",
  "pers-lea": "pers-lea",
  "iv-lea": "pers-lea",
  lea: "pers-lea",
  léa: "pers-lea",
  "pers-claire": "pers-claire",
  claire: "pers-claire",
  "claire morel": "pers-claire",
};

export type PortraitSize = "sm" | "md" | "lg" | "xl";

export const PORTRAIT_SIZES: Record<PortraitSize, number> = {
  sm: 40,
  md: 72,
  lg: 160,
  xl: 280,
};

export const EXPRESSION_RULES = {
  MEFIANT: {
    maxTrustExclusive: 40,
    label: "Méfiant",
    bg: CHARACTER_PALETTE.dangerSoft,
    description: "Furrowed brows, downturned mouth, slightly darker BG",
  },
  NEUTRE: {
    minTrustInclusive: 40,
    maxTrustInclusive: 70,
    label: "Neutre",
    bg: CHARACTER_PALETTE.beige,
    description: "Relaxed face, neutral mouth, normal BG",
  },
  ALLIE: {
    minTrustExclusive: 70,
    label: "Allié",
    bg: "#E7F8EE",
    description: "Slight smile, raised brows, brighter BG with mint touch",
  },
} as const;

export const STROKE = {
  width: 2.25,
  color: CHARACTER_PALETTE.ink,
} as const;

/** Visual slots only — display names come from getCharacterMeta() / contexte. */
export const CHARACTER_META: Record<
  CharacterVisualId,
  {
    displayName: string;
    shortName: string;
    role: string;
    accent: string;
    jacketOrTop: string;
    hair: string;
    notes: string;
  }
> = {
  "pers-marie": {
    displayName: "Cheffe d'atelier",
    shortName: "Atelier",
    role: "Cheffe d'Atelier",
    accent: CHARACTER_PALETTE.blue,
    jacketOrTop: CHARACTER_PALETTE.blue,
    hair: "#9CA3AF",
    notes: "work jacket · arms crossed",
  },
  "pers-karim": {
    displayName: "Technicien maintenance",
    shortName: "Maintenance",
    role: "Technicien Maintenance",
    accent: CHARACTER_PALETTE.gray,
    jacketOrTop: "#4B5563",
    hair: "#5C4033",
    notes: "dark gray polo",
  },
  "pers-laurent": {
    displayName: "Directeur",
    shortName: "Direction",
    role: "Directeur",
    accent: CHARACTER_PALETTE.navy,
    jacketOrTop: "#1F2937",
    hair: "#A8A29E",
    notes: "dark suit · white shirt",
  },
  "pers-henri": {
    displayName: "Mentor",
    shortName: "Mentor",
    role: "Mentor · Ancien Responsable",
    accent: CHARACTER_PALETTE.mint,
    jacketOrTop: "#5B6E6C",
    hair: "#F3F4F6",
    notes: "worn work jacket · glasses",
  },
  "pers-samir": {
    displayName: "Samir",
    shortName: "Samir",
    role: "Logisticien mentor",
    accent: CHARACTER_PALETTE.mint,
    jacketOrTop: "#1F7A55",
    hair: "#3B2F2F",
    notes: "warehouse polo · stopwatch vibe",
  },
  "pers-lea": {
    displayName: "Léa",
    shortName: "Léa",
    role: "E-commerce",
    accent: CHARACTER_PALETTE.blue,
    jacketOrTop: "#5B8DEF",
    hair: "#2C1810",
    notes: "bright sweater · bob",
  },
  "pers-claire": {
    displayName: "Claire Morel",
    shortName: "Claire",
    role: "Directrice",
    accent: CHARACTER_PALETTE.navy,
    jacketOrTop: "#0C3B38",
    hair: "#1F2937",
    notes: "navy blazer · bun",
  },
};

export function expressionFromTrust(trust: number): CharacterExpression {
  if (trust < 40) return "MEFIANT";
  if (trust <= 70) return "NEUTRE";
  return "ALLIE";
}

export function expressionLabel(expression: CharacterExpression): string {
  return EXPRESSION_RULES[expression].label;
}

export function expressionBg(expression: CharacterExpression): string {
  return EXPRESSION_RULES[expression].bg;
}

/** Map free-text names / ids (emails, chat, interviews) → character visual id */
export function resolveCharacterId(
  nameOrId: string | null | undefined
): CharacterVisualId | null {
  if (!nameOrId) return null;
  const raw = nameOrId.trim();
  const n = raw.toLowerCase();
  if (n in CHARACTER_META) return n as CharacterVisualId;
  if (n.includes("pers-marie")) return "pers-marie";
  if (n.includes("pers-karim")) return "pers-karim";
  if (n.includes("pers-laurent")) return "pers-laurent";
  if (n.includes("pers-henri")) return "pers-henri";
  if (n.includes("pers-samir")) return "pers-samir";
  if (n.includes("pers-lea")) return "pers-lea";
  if (n.includes("pers-claire")) return "pers-claire";

  // Book OS / Lumière — ids & prénoms.
  if (n in VISUAL_ALIASES) return VISUAL_ALIASES[n]!;
  const firstToken = n.split(/[\s,—\-]+/)[0] ?? "";
  if (firstToken && firstToken in VISUAL_ALIASES) {
    return VISUAL_ALIASES[firstToken]!;
  }
  for (const [alias, visual] of Object.entries(VISUAL_ALIASES)) {
    if (alias.length >= 4 && n.includes(alias)) return visual;
  }

  if (n.includes("mentor") || n.includes("ancien")) return "pers-henri";
  if (n.includes("maintenance")) return "pers-karim";
  if (n.includes("directeur") || n.includes("direction")) return "pers-laurent";
  if (n.includes("atelier") || n.includes("cheffe")) return "pers-marie";
  if (n.includes("logisticien")) return "pers-samir";
  if (n.includes("e-commerce") || n.includes("ecommerce")) return "pers-lea";
  return null;
}

export function getCharacterMeta(id: CharacterVisualId) {
  return CHARACTER_META[id];
}

export function firstNameFromId(id: CharacterVisualId): string {
  return getCharacterMeta(id).shortName;
}

export const TRUST_CROSSFADE_MS = 400;

export const CHARTER_SUMMARY = `
Flat vector portraits only. Geometric shapes, flat fills, thin ${STROKE.width}px ink strokes.
Backgrounds: navy ${CHARACTER_PALETTE.navy} or beige ${CHARACTER_PALETTE.beige} (or expression variants) — never photos.
Bust crop, slightly oversized head. Palette locked to navy/mint/blue/beige/gray.
Forbidden: photorealism, Pixar 3D, detailed comic inking, busy workshop scenes.
Expressions: MEFIANT <40 · NEUTRE 40–70 · ALLIÉ >70.
Max one large portrait per screen; everyone else uses round small avatars.
`;
