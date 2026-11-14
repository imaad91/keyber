/** Événements du contexte Novacier — données uniquement, pas de logique OS. */
import type { Evenement } from "@/lib/evenements";

export const novacierEvenements: Evenement[] = [
  {
    id: "ev-mail-laurent-j2",
    jour: 2,
    heure: "10:00",
    type: "message",
    titre: "Email de Laurent",
    texte:
      "Laurent : AutoVolt insiste pour un point statut aujourd'hui. Réponds avant midi.",
    consequences: [
      { cible: "flags.mailLaurentJ2", valeur: 1, mode: "set" },
    ],
  },
  {
    id: "ev-rumor-j2",
    jour: 2,
    heure: "09:00",
    type: "message",
    titre: "Rumeur AutoVolt / Pologne",
    texte: "On parle d'un concurrent polonais contacté par AutoVolt.",
  },
  {
    id: "ev-alerte-stock",
    jour: 0,
    type: "alerte",
    titre: "Alerte stock",
    texte: "Stock sous le seuil de sécurité (200 kg).",
    condition: { si: "stock", inferieurA: 200 },
    consequences: [{ cible: "flags.alerteStock", valeur: 1, mode: "set" }],
  },
  {
    id: "ev-marie-mefiante",
    jour: 0,
    type: "visite",
    titre: "Marie méfiante",
    texte: "Marie évite ton regard. La confiance est trop basse.",
    condition: { si: "confiance.marie", inferieurA: 40 },
  },
  {
    id: "ev-panne-m3",
    jour: 3,
    heure: "10:00",
    type: "panne",
    titre: "Panne Machine 3",
    texte: "Alarme atelier — tu dois décider avant 16:00.",
    urgent: true,
    deadlineHeure: "16:00",
    consequences: [
      { cible: "flags.alarmActive", valeur: 1, mode: "set" },
      { cible: "machine.m3.etat", valeur: 0, setValeur: "PANNE" },
    ],
    consequencesDeadline: [
      { cible: "qualite", valeur: -40 },
      { cible: "moral", valeur: -10 },
      { cible: "confianceClient", valeur: -8 },
    ],
  },
  {
    id: "ev-mail-laurent-j1",
    jour: 1,
    heure: "08:15",
    type: "message",
    titre: "Email de Laurent",
    texte: "Où en est le retard ? AutoVolt appelle cet après-midi.",
  },
  {
    id: "ev-defaut-j4",
    jour: 4,
    heure: "09:30",
    type: "alerte",
    titre: "40 pièces à micro-défaut",
    texte: "Contrôle qualité : décisions éthiques à venir.",
  },
];
