/**
 * Mode Compétence — mini-scénarios (1 décision, ~10-15 min).
 * Same Decision schema as Mode Histoire.
 */

import type { Decision } from "@/lib/decisions";

export type TrainingDef = {
  competenceId: string;
  titre: string;
  dureeMin: number;
  decision: Decision;
};

export const COMPETENCE_TRAININGS: TrainingDef[] = [
  {
    competenceId: "negociation",
    titre: "Négociation sous pression",
    dureeMin: 12,
    decision: {
      id: "train-negociation-1",
      titre: "Appel client tendu",
      jour: 0,
      competenceId: "negociation",
      categorie: "Entraînement — Négociation",
      dilemme:
        "Un acheteur exige −8 % sur le prochain lot. Tu as 12 minutes pour cadrer l'échange.",
      xpGagne: 40,
      choix: [
        {
          id: "tn-dur",
          label: "Tenir le prix, offrir un délai",
          description: "Pas de rabais. Contrepartie logistique.",
          feedbackTexte:
            "Tu as tenu le cadre prix. L'acheteur râle puis accepte le délai.",
          impacts: [
            { label: "Cadre", value: "Prix tenu", tone: "pos" },
            { label: "Relation", value: "Froide", tone: "neu" },
          ],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 20 },
          ],
        },
        {
          id: "tn-echange",
          label: "Échanger volume contre marge",
          description: "−3 % si commande +20 %.",
          feedbackTexte:
            "Compromis volume/marge. Tu gagnes de la pratique de négociation.",
          impacts: [
            { label: "Volume", value: "+20 %", tone: "pos" },
            { label: "Marge", value: "−3 %", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 45 },
          ],
        },
        {
          id: "tn-ceder",
          label: "Céder pour calmer",
          description: "Accepter −8 % sans contrepartie.",
          feedbackTexte:
            "Le feu est éteint, mais tu as cédé trop vite — leçon utile.",
          impacts: [
            { label: "Pression", value: "Dissipée", tone: "pos" },
            { label: "Marge", value: "Sacrifiée", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 10 },
            { cible: "xp", valeur: 15 },
          ],
        },
      ],
    },
  },
  {
    competenceId: "crise",
    titre: "Panne express",
    dureeMin: 10,
    decision: {
      id: "train-crise-1",
      titre: "Alarme atelier",
      jour: 0,
      competenceId: "crise",
      categorie: "Entraînement — Crise",
      dilemme:
        "Une ligne s'arrête. Qualité ou redémarrage rapide ? 10 minutes.",
      xpGagne: 35,
      choix: [
        {
          id: "tc-diag",
          label: "Diagnostiquer avant de relancer",
          description: "Perdre 10 min, éviter un rebut massif.",
          feedbackTexte:
            "Diagnostic propre. Tu as évité une cascade de défauts.",
          impacts: [{ label: "Risque", value: "Maîtrisé", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 10 },
            { cible: "xp", valeur: 40 },
          ],
        },
        {
          id: "tc-bypass",
          label: "Bypass pour tenir le volume",
          description: "Relancer vite, accepter le doute qualité.",
          feedbackTexte: "Volume sauvé, mais la crise n'est que repoussée.",
          impacts: [
            { label: "Volume", value: "Sauvé", tone: "pos" },
            { label: "Qualité", value: "Risquée", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 8 },
            { cible: "xp", valeur: 18 },
          ],
        },
        {
          id: "tc-stop",
          label: "Stop total + appel maintenance",
          description: "Sécuriser, attendre l'équipe.",
          feedbackTexte: "Procédure respectée. Tu gagnes en méthode de crise.",
          impacts: [{ label: "Sécurité", value: "Prioritaire", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 25 },
          ],
        },
      ],
    },
  },
  {
    competenceId: "leadership",
    titre: "Brief d'équipe",
    dureeMin: 12,
    decision: {
      id: "train-leadership-1",
      titre: "Moral en berne",
      jour: 0,
      competenceId: "leadership",
      categorie: "Entraînement — Leadership",
      dilemme:
        "L'équipe doute de la semaine. Comment cadrer le brief en 12 minutes ?",
      xpGagne: 35,
      choix: [
        {
          id: "tl-clarte",
          label: "Clarifier les priorités à voix haute",
          description: "3 objectifs, owners, check-in 16h.",
          feedbackTexte: "Le groupe repart aligné. Leadership concret.",
          impacts: [{ label: "Alignement", value: "Fort", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 40 },
          ],
        },
        {
          id: "tl-ecoute",
          label: "Laisser parler d'abord",
          description: "Écouter 8 min, décider en 4.",
          feedbackTexte: "Tu as capté les frictions cachées. Bon réflexe.",
          impacts: [{ label: "Confiance", value: "+", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 28 },
          ],
        },
        {
          id: "tl-press",
          label: "Pousser le rythme sans débat",
          description: "Ordres nets, pas de questions.",
          feedbackTexte: "Exécution rapide, mais le moral en pâtit.",
          impacts: [
            { label: "Vitesse", value: "Haute", tone: "pos" },
            { label: "Moral", value: "Fragile", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 8 },
            { cible: "xp", valeur: 15 },
          ],
        },
      ],
    },
  },
  {
    competenceId: "stock",
    titre: "Arbitrage acier",
    dureeMin: 11,
    decision: {
      id: "train-stock-1",
      titre: "Stock de sécurité",
      jour: 0,
      competenceId: "stock",
      categorie: "Entraînement — Stock",
      dilemme:
        "Fournisseur propose un lot urgent +15 %. Tu as 11 minutes pour décider.",
      xpGagne: 30,
      choix: [
        {
          id: "ts-acheter",
          label: "Acheter le lot de sécurité",
          description: "Cash −, rupture évitée.",
          feedbackTexte:
            "Couverture stock OK. Tu as privilégié la continuité.",
          impacts: [
            { label: "Stock", value: "Sécurisé", tone: "pos" },
            { label: "Cash", value: "−", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 11 },
            { cible: "xp", valeur: 28 },
          ],
        },
        {
          id: "ts-attendre",
          label: "Attendre le prix catalogue",
          description: "Économiser, risquer le manque.",
          feedbackTexte:
            "Paris sur le délai. Exercice de gestion de risque.",
          impacts: [
            { label: "Risque", value: "Rupture possible", tone: "neg" },
          ],
          consequences: [
            { cible: "temps", valeur: 9 },
            { cible: "xp", valeur: 18 },
          ],
        },
        {
          id: "ts-negocier",
          label: "Négocier −5 % sur le rush",
          description: "Gagner un peu sur le premium.",
          feedbackTexte: "Petit gain sur le rush. Bon réflexe stock/achat.",
          impacts: [{ label: "Premium", value: "Réduit", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 12 },
            { cible: "xp", valeur: 35 },
          ],
        },
      ],
    },
  },
  {
    competenceId: "data",
    titre: "Lire le brouillard",
    dureeMin: 10,
    decision: {
      id: "train-data-1",
      titre: "KPI douteux",
      jour: 0,
      competenceId: "data",
      categorie: "Entraînement — Data",
      dilemme:
        "Le dashboard affiche −12 % rebut… sans capteur. Que fais-tu en 10 min ?",
      xpGagne: 30,
      choix: [
        {
          id: "td-verifier",
          label: "Croiser 3 sources avant d'agir",
          description: "ERP, atelier, mail qualité.",
          feedbackTexte:
            "Tu as invalidé le faux signal. Réflexe data solide.",
          impacts: [{ label: "Décision", value: "Fondée", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 10 },
            { cible: "xp", valeur: 40 },
          ],
        },
        {
          id: "td-croire",
          label: "Suivre le KPI tel quel",
          description: "Agir vite sur le chiffre.",
          feedbackTexte:
            "Action rapide sur une donnée floue — leçon retenue.",
          impacts: [{ label: "Risque", value: "Fausse piste", tone: "neg" }],
          consequences: [
            { cible: "temps", valeur: 6 },
            { cible: "xp", valeur: 12 },
          ],
        },
        {
          id: "td-capteur",
          label: "Demander un check capteur",
          description: "Investir 10 min pour fiabiliser.",
          feedbackTexte: "Tu priorises la visibilité. Bon muscle data.",
          impacts: [{ label: "Visibilité", value: "↑", tone: "pos" }],
          consequences: [
            { cible: "temps", valeur: 10 },
            { cible: "xp", valeur: 28 },
          ],
        },
      ],
    },
  },
];

export function trainingForCompetence(
  competenceId: string
): TrainingDef | undefined {
  return COMPETENCE_TRAININGS.find((t) => t.competenceId === competenceId);
}
