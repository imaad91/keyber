/**
 * Atelier — modes de scénario (règle non négociable).
 *
 * Chaque scénario a obligatoirement UN Mode :
 *   Mode Compétence  XOR  Mode Histoire
 * Jamais les deux, jamais aucun.
 *
 * Mode Compétence = entraînement intensif :
 *   - PAS de rôle à choisir
 *   - exactement 1 compétence précise
 *   - avec Cours
 *
 * Mode Histoire = mise en pratique :
 *   - Rôle → Secteur → Entreprise
 *   - événements aléatoires
 *   - décisions qui influencent d'autres décisions
 *
 * Studio only (keyber-studio-*). Pas de contenu métier ici — structure uniquement.
 */

/** Discriminant exclusif — un scénario = un seul mode. */
export type AtelierScenarioMode = "competence" | "histoire";

export const ATELIER_SCENARIO_MODE_LABELS: Record<AtelierScenarioMode, string> = {
  competence: "Mode Compétence",
  histoire: "Mode Histoire",
};

/**
 * Garde-fou type-level : un scénario porte exactement un mode.
 * Les champs spécifiques à l'autre mode n'existent pas sur le même objet.
 */
export type AtelierScenarioShell =
  | {
      mode: "competence";
      /** Interdit en Mode Compétence — ne jamais ajouter roleId ici. */
      roleId?: never;
      competenceId: string;
    }
  | {
      mode: "histoire";
      roleId: string;
      /** Mode Histoire ne cible pas une seule compétence d'entraînement. */
      competenceId?: never;
    };

export function assertExclusiveScenarioMode(
  mode: AtelierScenarioMode | null | undefined
): mode is AtelierScenarioMode {
  return mode === "competence" || mode === "histoire";
}
