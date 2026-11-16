/**
 * Aperçu PNJ Lumière pour Admin → Interviews / PNJ (Étape 38).
 * Source stable (pas de dépendance Book store / JSON géant).
 */

import type { CharacterVisualId } from "@/lib/characterStyle";

export type LumierePnjPreview = {
  id: string;
  visualId: CharacterVisualId;
  nom: string;
  role: string;
  questions: number;
};

/** Cast jouable histoire Logisticien — portraits SVG associés. */
export const LUMIERE_PNJ_PREVIEW: LumierePnjPreview[] = [
  {
    id: "iv-samir",
    visualId: "pers-samir",
    nom: "Samir",
    role: "Logisticien (mentor)",
    questions: 2,
  },
  {
    id: "iv-lea",
    visualId: "pers-lea",
    nom: "Léa",
    role: "Responsable e-commerce",
    questions: 1,
  },
  {
    id: "claire",
    visualId: "pers-claire",
    nom: "Claire Morel",
    role: "Directrice",
    questions: 0,
  },
];
