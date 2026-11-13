/**
 * Mode Compétence — mini-scénarios (1 décision, ~10-15 min).
 */

import type { Decision } from "@/lib/decisions";
import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
  getCompetenceDef,
  type CompetenceType,
} from "@/lib/competences";

export type TrainingDef = {
  competenceId: string;
  type: CompetenceType;
  titre: string;
  dureeMin: number;
  decision: Decision;
};

function trainingTitle(competenceId: string, niveau: number): string {
  const def = getCompetenceDef(competenceId);
  const typeLabel = def?.type === "ciblee" ? "Ciblée" : "Générale";
  return `Entraînement ${typeLabel} - ${def?.nom ?? competenceId} - Niveau ${niveau}`;
}

export const COMPETENCE_TRAININGS: TrainingDef[] = [
  {
    competenceId: "negociation",
    type: "generale",
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
          description: "Pas de rabais. Contrepartie logistique mesurable.",
          feedbackTexte:
            "Tu as tenu le cadre prix contre une contrepartie délai explicite.",
          competencesImpactees: [
            {
              competenceId: "negociation",
              type: "generale",
              xp: 25,
              feedback:
                "Tu as obtenu une contrepartie mesurable (délai) sans céder le prix.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 25 }],
        },
        {
          id: "tn-echange",
          label: "Échanger volume contre marge",
          description: "−3 % si commande +20 %.",
          feedbackTexte: "Compromis volume/marge chiffré.",
          competencesImpactees: [
            {
              competenceId: "negociation",
              type: "generale",
              xp: 45,
              feedback:
                "Tu as échangé −3 % de marge contre +20 % de volume contractuel.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 45 }],
        },
        {
          id: "tn-ceder",
          label: "Céder pour calmer",
          description: "Accepter −8 % sans contrepartie.",
          feedbackTexte: "Cession sans contrepartie — leçon utile.",
          competencesImpactees: [
            {
              competenceId: "negociation",
              type: "generale",
              xp: 10,
              feedback:
                "Tu as cédé −8 % sans contrepartie mesurable : le cadre commercial a sauté.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 10 }],
        },
      ],
    },
  },
  {
    competenceId: "gestion_crise",
    type: "generale",
    titre: "Panne express",
    dureeMin: 10,
    decision: {
      id: "train-crise-1",
      titre: "Alarme atelier",
      jour: 0,
      competenceId: "gestion_crise",
      categorie: "Entraînement — Gestion de crise",
      dilemme:
        "Une ligne s'arrête. Qualité ou redémarrage rapide ? 10 minutes.",
      xpGagne: 35,
      choix: [
        {
          id: "tc-diag",
          label: "Diagnostiquer avant de relancer",
          description: "Perdre 10 min, éviter un rebut massif.",
          feedbackTexte: "Diagnostic propre avant relance.",
          competencesImpactees: [
            {
              competenceId: "gestion_crise",
              type: "generale",
              xp: 40,
              feedback:
                "Tu as isolé la cause et contenu le risque qualité en moins de 30 minutes.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 40 }],
        },
        {
          id: "tc-fast",
          label: "Relancer immédiatement",
          description: "Remettre la ligne sans check qualité.",
          feedbackTexte: "Relance rapide, risque rebut ouvert.",
          competencesImpactees: [
            {
              competenceId: "gestion_crise",
              type: "generale",
              xp: 15,
              feedback:
                "Tu as relancé sans isoler la cause : le plan de confinement qualité manque.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 15 }],
        },
      ],
    },
  },
  {
    competenceId: "leadership",
    type: "generale",
    titre: "Brief atelier",
    dureeMin: 10,
    decision: {
      id: "train-lead-1",
      titre: "Priorité unique",
      jour: 0,
      competenceId: "leadership",
      categorie: "Entraînement — Leadership",
      dilemme: "Deux urgences concurrentes. Une seule priorité pour l'équipe.",
      xpGagne: 35,
      choix: [
        {
          id: "tl-one",
          label: "Fixer une priorité contrat AutoVolt",
          description: "Reporter le reste explicitement.",
          feedbackTexte: "Priorité unique publiée.",
          competencesImpactees: [
            {
              competenceId: "leadership",
              type: "generale",
              xp: 35,
              feedback:
                "Tu as aligné l'atelier sur une priorité unique et reporté le reste sans ambiguïté.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 35 }],
        },
        {
          id: "tl-all",
          label: "Tout traiter en parallèle",
          description: "Demander aux équipes de tout faire.",
          feedbackTexte: "Dispersion — confiance érodée.",
          competencesImpactees: [
            {
              competenceId: "leadership",
              type: "generale",
              xp: 10,
              feedback:
                "Tu as multiplié les priorités : l'exécution s'est dispersée.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 10 }],
        },
      ],
    },
  },
  {
    competenceId: "decision_incertitude",
    type: "generale",
    titre: "Décider sans KPI",
    dureeMin: 12,
    decision: {
      id: "train-incert-1",
      titre: "Brouillard données",
      jour: 0,
      competenceId: "decision_incertitude",
      categorie: "Entraînement — Décision sous incertitude",
      dilemme: "Les compteurs sont morts. Tu dois choisir une action aujourd'hui.",
      xpGagne: 35,
      choix: [
        {
          id: "ti-hyp",
          label: "Poser une hypothèse + critère d'arrêt",
          description: "Agir 2 h puis mesurer un proxy.",
          feedbackTexte: "Hypothèse et critère d'arrêt explicites.",
          competencesImpactees: [
            {
              competenceId: "decision_incertitude",
              type: "generale",
              xp: 40,
              feedback:
                "Tu as choisi avec données partielles en nommant l'hypothèse et le critère d'arrêt.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 40 }],
        },
        {
          id: "ti-wait",
          label: "Attendre les vrais chiffres",
          description: "Ne rien faire jusqu'au capteur.",
          feedbackTexte: "Attente sans critère.",
          competencesImpactees: [
            {
              competenceId: "decision_incertitude",
              type: "generale",
              xp: 10,
              feedback:
                "Tu as reporté sans hypothèse ni critère d'arrêt : l'incertitude reste totale.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 10 }],
        },
      ],
    },
  },
  {
    competenceId: "communication",
    type: "generale",
    titre: "Statut 60 secondes",
    dureeMin: 8,
    decision: {
      id: "train-com-1",
      titre: "Point Laurent",
      jour: 0,
      competenceId: "communication",
      categorie: "Entraînement — Communication",
      dilemme: "Laurent veut un statut AutoVolt maintenant.",
      xpGagne: 30,
      choix: [
        {
          id: "tco-fait",
          label: "Chiffres + écart + prochaine action",
          description: "Format factuel en 60 s.",
          feedbackTexte: "Statut factuel reçu.",
          competencesImpactees: [
            {
              competenceId: "communication",
              type: "generale",
              xp: 35,
              feedback:
                "Tu as formulé un statut (chiffres, écart, prochaine action) compréhensible en 60 secondes.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 35 }],
        },
        {
          id: "tco-flou",
          label: "Rassurer sans chiffres",
          description: "« On gère ».",
          feedbackTexte: "Message flou.",
          competencesImpactees: [
            {
              competenceId: "communication",
              type: "generale",
              xp: 8,
              feedback:
                "Tu as rassuré sans chiffres ni prochaine action : le statut reste inutilisable.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
        },
      ],
    },
  },
  {
    competenceId: "priorisation",
    type: "generale",
    titre: "Tri des urgences",
    dureeMin: 10,
    decision: {
      id: "train-prio-1",
      titre: "Trois alertes",
      jour: 0,
      competenceId: "priorisation",
      categorie: "Entraînement — Priorisation",
      dilemme: "Stock bas, mail client, panne mineure — une seule priorité.",
      xpGagne: 30,
      choix: [
        {
          id: "tp-contrat",
          label: "Prioriser risque contrat / rebut",
          description: "Reporter le reste explicitement.",
          feedbackTexte: "Ordre d'impact clair.",
          competencesImpactees: [
            {
              competenceId: "priorisation",
              type: "generale",
              xp: 35,
              feedback:
                "Tu as ordonné les tâches sur impact contrat / rebut et reporté le reste sans ambiguïté.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 35 }],
        },
        {
          id: "tp-fifo",
          label: "Traiter dans l'ordre d'arrivée",
          description: "FIFO des alertes.",
          feedbackTexte: "FIFO sans impact.",
          competencesImpactees: [
            {
              competenceId: "priorisation",
              type: "generale",
              xp: 8,
              feedback:
                "Tu as suivi l'ordre d'arrivée sans pondérer contrat, rebut ou cash.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
        },
      ],
    },
  },
  {
    competenceId: "planification_mrp",
    type: "ciblee",
    titre: "Besoin net A-42",
    dureeMin: 15,
    decision: {
      id: "train-mrp-1",
      titre: "Calcul besoin net",
      jour: 0,
      competenceId: "planification_mrp",
      categorie: "Entraînement — Planification MRP",
      dilemme:
        "Besoin brut 500, stock 120, en-cours 80. Que lances-tu ?",
      xpGagne: 40,
      choix: [
        {
          id: "tm-net",
          label: "Lancer 300 (besoin net) + geler J+2",
          description: "500 − 120 − 80 = 300.",
          feedbackTexte: "Besoin net correct.",
          competencesImpactees: [
            {
              competenceId: "planification_mrp",
              type: "ciblee",
              xp: 40,
              indicateurIndex: 0,
              feedback:
                "Tu as bien recalculé le besoin net (500 − 120 − 80 = 300) avant lancement.",
            },
            {
              competenceId: "planification_mrp",
              type: "ciblee",
              xp: 15,
              indicateurIndex: 1,
              feedback: "Tu as figé un horizon de lancement J+2.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 55 }],
        },
        {
          id: "tm-brut",
          label: "Lancer 500 (besoin brut)",
          description: "Ignorer stock et en-cours.",
          feedbackTexte: "Sur-lancement.",
          competencesImpactees: [
            {
              competenceId: "planification_mrp",
              type: "ciblee",
              xp: 8,
              indicateurIndex: 0,
              feedback:
                "Tu as lancé le besoin brut sans retrancher stock et en-cours.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
        },
      ],
    },
  },
  {
    competenceId: "gestion_stocks",
    type: "ciblee",
    titre: "Stock de sécurité coil",
    dureeMin: 12,
    decision: {
      id: "train-stock-1",
      titre: "Seuil coil 2 mm",
      jour: 0,
      competenceId: "gestion_stocks",
      categorie: "Entraînement — Gestion des stocks",
      dilemme:
        "Demande 40 kg/j, délai 5 j, facteur service 1.5. Stock actuel 150 kg.",
      xpGagne: 40,
      choix: [
        {
          id: "ts-ss",
          label: "SS = 300 kg ; réappro maintenant",
          description: "40 × 5 × 1.5 = 300 ; 150 < 300.",
          feedbackTexte: "Formule SS appliquée.",
          competencesImpactees: [
            {
              competenceId: "gestion_stocks",
              type: "ciblee",
              xp: 35,
              indicateurIndex: 0,
              feedback:
                "Tu as calculé le stock de sécurité (40 × 5 × 1.5 = 300 kg) pour l'article critique.",
            },
            {
              competenceId: "gestion_stocks",
              type: "ciblee",
              xp: 20,
              indicateurIndex: 1,
              feedback:
                "Tu as déclenché le réappro car le stock (150) est sous le seuil (300).",
            },
          ],
          consequences: [{ cible: "xp", valeur: 55 }],
        },
        {
          id: "ts-feel",
          label: "Attendre : 150 kg suffisent",
          description: "Décision au feeling.",
          feedbackTexte: "Sous-seuil ignoré.",
          competencesImpactees: [
            {
              competenceId: "gestion_stocks",
              type: "ciblee",
              xp: 8,
              indicateurIndex: 1,
              feedback:
                "Tu as laissé le stock sous le seuil de sécurité sans déclencher le réappro.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
        },
      ],
    },
  },
  {
    competenceId: "maintenance",
    type: "ciblee",
    titre: "Arbitrage panne",
    dureeMin: 12,
    decision: {
      id: "train-maint-1",
      titre: "Machine 3 alarme",
      jour: 0,
      competenceId: "maintenance",
      categorie: "Entraînement — Maintenance",
      dilemme: "Bruit anormal. Produire encore 2 h ou arrêter pour diagnostic ?",
      xpGagne: 40,
      choix: [
        {
          id: "tma-diag",
          label: "Arrêt + diagnostic MTTR 3 h",
          description: "Nommer la cause avant relance.",
          feedbackTexte: "Diagnostic avant production.",
          competencesImpactees: [
            {
              competenceId: "maintenance",
              type: "ciblee",
              xp: 30,
              indicateurIndex: 0,
              feedback: "Tu as nommé une cause probable avant toute relance.",
            },
            {
              competenceId: "maintenance",
              type: "ciblee",
              xp: 20,
              indicateurIndex: 1,
              feedback: "Tu as estimé une fenêtre MTTR de 3 h.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 50 }],
        },
        {
          id: "tma-run",
          label: "Continuer 2 h puis voir",
          description: "Pas de diagnostic.",
          feedbackTexte: "Risque rebut ouvert.",
          competencesImpactees: [
            {
              competenceId: "maintenance",
              type: "ciblee",
              xp: 8,
              indicateurIndex: 2,
              feedback:
                "Tu as prolongé la production sans diagnostic ni bypass documenté.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
        },
      ],
    },
  },
  {
    competenceId: "qualite",
    type: "ciblee",
    titre: "Lot micro-défaut",
    dureeMin: 12,
    decision: {
      id: "train-qual-1",
      titre: "40 pièces douteuses",
      jour: 0,
      competenceId: "qualite",
      categorie: "Entraînement — Qualité",
      dilemme: "Échantillonnage : 12 % hors tolérance. Tri, reprise ou rebut ?",
      xpGagne: 40,
      choix: [
        {
          id: "tq-tri",
          label: "Trier 100 % puis reprise ciblée",
          description: "Mesurer puis décider lot par lot.",
          feedbackTexte: "Tri argumenté.",
          competencesImpactees: [
            {
              competenceId: "qualite",
              type: "ciblee",
              xp: 25,
              indicateurIndex: 0,
              feedback: "Tu as mesuré le taux de défaut du lot (12 %).",
            },
            {
              competenceId: "qualite",
              type: "ciblee",
              xp: 25,
              indicateurIndex: 1,
              feedback:
                "Tu as décidé un tri/reprise argumenté plutôt qu'une livraison aveugle.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 50 }],
        },
        {
          id: "tq-ship",
          label: "Livrer pour tenir le délai",
          description: "Pas de tri.",
          feedbackTexte: "Livraison risquée.",
          competencesImpactees: [
            {
              competenceId: "qualite",
              type: "ciblee",
              xp: 5,
              indicateurIndex: 2,
              feedback:
                "Tu as livré sans contrôle pour tenir le délai — risque client non chiffré.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 5 }],
        },
      ],
    },
  },
  {
    competenceId: "ordonnancement",
    type: "ciblee",
    titre: "Séquence OF du jour",
    dureeMin: 12,
    decision: {
      id: "train-ord-1",
      titre: "Trois OF, une contrainte",
      jour: 0,
      competenceId: "ordonnancement",
      categorie: "Entraînement — Ordonnancement",
      dilemme: "OF-AutoVolt, OF-NordMéca, OF-interne. Machine 2 limitée.",
      xpGagne: 40,
      choix: [
        {
          id: "to-av",
          label: "Séquence : AutoVolt → NordMéca → interne",
          description: "Priorité contrat publiée.",
          feedbackTexte: "Séquence publiée.",
          competencesImpactees: [
            {
              competenceId: "ordonnancement",
              type: "ciblee",
              xp: 30,
              indicateurIndex: 0,
              feedback: "Tu as publié une séquence OF pour la journée.",
            },
            {
              competenceId: "ordonnancement",
              type: "ciblee",
              xp: 20,
              indicateurIndex: 2,
              feedback: "Tu as respecté la priorité contrat AutoVolt.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 50 }],
        },
        {
          id: "to-fifo",
          label: "FIFO atelier",
          description: "Ordre d'arrivée des OF.",
          feedbackTexte: "FIFO sans priorité client.",
          competencesImpactees: [
            {
              competenceId: "ordonnancement",
              type: "ciblee",
              xp: 8,
              indicateurIndex: 2,
              feedback:
                "Tu as appliqué un FIFO aveugle sans priorité client AutoVolt.",
            },
          ],
          consequences: [{ cible: "xp", valeur: 8 }],
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

export function trainingHeadline(
  competenceId: string,
  niveau: number
): string {
  return trainingTitle(competenceId, niveau);
}

export const TRAINING_SKILL_IDS = COMPETENCE_TRAININGS.map((t) => t.competenceId);

export { COMPETENCES_GENERALES, COMPETENCES_CIBLEES_PROD };
