/** Événements du contexte test-entreprise. */
import type { Evenement } from "@/lib/evenements";

export const testEntrepriseEvenements: Evenement[] = [
  {
    id: "ev-mail-direction-j1",
    jour: 1,
    heure: "08:15",
    type: "message",
    titre: "Email de direction",
    texte: "Où en est le retard ? ClientAlpha appelle cet après-midi.",
  },
  {
    id: "ev-alerte-stock",
    jour: 0,
    type: "alerte",
    titre: "Alerte stock",
    texte: "Stock sous le seuil de sécurité.",
    condition: { si: "stock", inferieurA: 200 },
    consequences: [{ cible: "flags.alerteStock", valeur: 1, mode: "set" }],
  },
];
