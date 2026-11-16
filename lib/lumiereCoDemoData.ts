/**
 * Démo Studio — entreprise « Lumière & Co » (e-commerce lampes).
 * Contenu de démonstration uniquement — n'altère pas Novacier / AgriBio / Keyber OS.
 */

import {
  emptyContexteFields,
  type ContexteExcelFields,
} from "@/lib/atelierCreationExcel";
import {
  emptyEventFields,
  type EventExcelFields,
} from "@/lib/atelierEventsExcel";
import type { BookGraphView } from "@/lib/bookStore";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";

export const LUMIERE_NOM = "Lumière & Co";
export const LUMIERE_SECTEUR = "E-commerce / Éclairage";
export const LUMIERE_ROLE = "Logisticien";
export const LUMIERE_COMPETENCE = "Planification MRP";
export const LUMIERE_COURS = "Intro MRP";

export const LUMIERE_FAMILY_ID = "family-lumiere-co-demo";
export const LUMIERE_CREATION_ID = "crea-lumiere-co-demo";

export function lumiereContexteFields(): ContexteExcelFields {
  const f = emptyContexteFields();
  f["Nom de l'entreprise"] = LUMIERE_NOM;
  f["Secteur d'activité"] = LUMIERE_SECTEUR;
  f["Sous-secteur"] = "Vente en ligne de luminaires";
  f["Taille"] = "TPE";
  f["Nombre d'employés"] = "6";
  f["Chiffre d'affaires"] = "780 000 € / an";
  f["Année de création"] = "2019";
  f["Localisation"] = "Lyon (69), France — entrepôt 450 m² à Vénissieux";
  f["Nombre de sites"] = "2 (bureau centre-ville + entrepôt)";
  f["Organigramme détaillé"] =
    "Directrice (Claire Morel) → Logisticien (Samir) → 2 préparateurs ; Responsable e-commerce (Léa) → 1 SAV ; Achats partagés (Claire + Samir).";
  f["Qui décide quoi"] =
    "Claire : trésorerie, fournisseurs stratégiques, prix. Samir : priorités d'expédition, réappro courant. Léa : promos site, SAV crédit.";
  f["Qui travaille avec qui"] =
    "Samir ↔ préparateurs quotidien ; Samir ↔ Léa sur ruptures ; Claire ↔ fournisseurs Asie hebdo.";
  f["Horaires"] = "Entrepôt 8h–17h ; SAV 9h–18h ; pic samedi e-commerce.";
  f["Équipes"] = "1 équipe entrepôt (3) ; 1 équipe bureau (3).";
  f["Postes clés"] =
    "Logisticien, Préparateur, Responsable e-commerce, Directrice, SAV.";
  f[
    "Description de chaque service (Production, Logistique, Qualité, Maintenance, Achats, Ventes)"
  ] =
    "Pas de production : achat-revente. Logistique = réception, stockage, picking, expédition. Qualité = contrôle à réception + SAV. Achats = fournisseurs Chine/Vietnam. Ventes = site Shopify + marketplaces.";
  f[
    "Liste des machines (nom, âge, capacité, vitesse, pannes fréquentes, coût de maintenance)"
  ] =
    "1 gerbeur électrique (3 ans) ; 1 imprimante étiquettes Zebra ; 2 postes packing. Pas de ligne de production.";
  f["Processus de production étape par étape"] =
    "Commande site → validation stock → picking → packing → étiquette transporteur → enlèvement.";
  f["Temps de production"] =
    "Picking+packing moyen : 8 min / commande standard.";
  f["Goulots d'étranglement"] =
    "Réception containers Asie (douane) ; capacité packing en décembre ; SAV sur lampes LED défectueuses.";
  f[
    "Liste des produits (nom, description, prix, marge, temps de fabrication, composants, fournisseurs, clients)"
  ] =
    "Lampe bureau Luna (49€, marge 42%) ; Suspension Halo (129€, 38%) ; Guirlande festives (29€, 55%) ; Ampoules LED pack x4 (19€, 48%). Fournisseurs : MingLight (CN), VietGlow (VN).";
  f[
    "Liste des stocks (nom, quantité actuelle, stock minimum, stock maximum, stock de sécurité, délai de réapprovisionnement, coût de stockage, problèmes récurrents)"
  ] =
    "Luna : 420 / min 120 / max 800 / sécu 80 / délai 35 j ; Halo : 95 / min 40 / max 200 ; Guirlandes : 1100 (saison) ; LED : 2200. Problème : casse verre en rack haut.";
  f[
    "Liste des fournisseurs (nom, ce qu'il fournit, délai moyen, fiabilité, prix, problèmes, contrats)"
  ] =
    "MingLight — luminaires métal/verre, 35–45 j, fiabilité 85%, retards Q4. VietGlow — LED et guirlandes, 28 j, 90%. Contrat cadre annuel, paiement 30% acompte.";
  f[
    "Liste des clients (nom, ce qu'il achète, volume, fréquence, exigences, problèmes, contrats)"
  ] =
    "Particuliers FR via site (70% CA) ; décorateurs pro B2B (20%) ; marketplaces (10%). Exigence : livraison J+2 métropole. Problème : retours verre cassé.";
  f[
    "Liste des problèmes réels (qu'est-ce qui s'est passé, pourquoi, qu'est-ce qu'on a fait, qu'est-ce qu'on aurait dû faire)"
  ] =
    "Noël 2025 : rupture Halo — sous-estimation promo. Action : air freight cher. Aurait dû : buffer saisonnier + précommande.";
  f["Trésorerie actuelle"] = "92 000 € en banque ; 28 000 € créances clients.";
  f["Coûts fixes"] =
    "Loyer entrepôt 4 200 €/mois ; salaires 18 500 € ; Shopify+outils 890 €.";
  f["Coûts variables"] =
    "Achat marchandises, transport Colissimo/Chronopost, emballages, pubs Meta.";
  f["Objectifs quotidiens / hebdo / annuels"] =
    "Quotidien : 0 rupture SKU top 10, 100% commandes J+2. Hebdo : taux casse < 1,5%. Annuel : +15% CA sans dégrader marge.";
  return f;
}

export type LumiereEventPlay = {
  jour?: number;
  heure?: string;
  urgent?: boolean;
  deadlineHeure?: string;
  condition?: {
    si: string;
    superieurA?: number;
    inferieurA?: number;
    egalA?: number;
  };
  consequences?: { cible: string; valeur: number }[];
  consequencesDeadline?: { cible: string; valeur: number }[];
};

export type LumiereEventSeed = {
  nom: string;
  type: string;
  description: string;
  fields: EventExcelFields;
  /** Planification jouable Book OS (Étape 15). */
  play?: LumiereEventPlay;
};

function ev(
  nom: string,
  type: string,
  description: string,
  extra: Partial<EventExcelFields> = {},
  play?: LumiereEventPlay
): LumiereEventSeed {
  const fields = emptyEventFields();
  fields["Nom"] = nom;
  fields[
    "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)"
  ] = type;
  fields["Description complète"] = description;
  Object.assign(fields, extra);
  return { nom, type, description, fields, play };
}

export function lumiereEvents(): LumiereEventSeed[] {
  return [
    ev(
      "Colis perdu par le transporteur",
      "Logistique",
      "Un colis client disparaît chez le transporteur après enlèvement. Le client relance le SAV.",
      {
        "Conditions pour arriver": "Commande expédiée, tracking bloqué > 5 j",
        "Probabilité (Rare/Moyenne/Fréquente ou %)": "Moyenne",
        Fréquence: "2–4 / mois",
        "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)":
          "Satisfaction client, Trésorerie (renvoi)",
        "Gravité (Faible/Moyenne/Forte/Critique)": "Moyenne",
        "Durée de l'impact": "3–7 jours",
        "Ce que le joueur peut faire":
          "Rouvrir un litige transporteur, renvoyer le produit, proposer un avoir",
        "Cet événement influence quelle décision plus tard":
          "Choix du transporteur pour le Black Friday / Noël",
      },
      {
        jour: 1,
        heure: "11:00",
        consequences: [
          { cible: "confianceClient", valeur: -8 },
          { cible: "tresorerie", valeur: -400 },
        ],
      }
    ),
    ev(
      "Fournisseur en retard",
      "Fournisseur",
      "MingLight annonce +12 jours sur le container Halo. Stock bas déjà.",
      {
        "Conditions pour arriver": "Stock Halo < stock de sécurité",
        "Probabilité (Rare/Moyenne/Fréquente ou %)": "Fréquente (Q4)",
        Fréquence: "1–2 / trimestre",
        "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)":
          "Stock, Satisfaction client",
        "Gravité (Faible/Moyenne/Forte/Critique)": "Forte",
        "Durée de l'impact": "2–3 semaines",
        "Ce que le joueur peut faire":
          "Air freight, basculer promo sur Luna, précommander VietGlow",
        "Cet événement influence quelle décision plus tard":
          "Négociation contrat MingLight et buffer saisonnier",
      },
      {
        jour: 1,
        heure: "09:00",
        consequences: [{ cible: "stock", valeur: -15 }],
      }
    ),
    ev(
      "Pic de commandes à Noël",
      "Client",
      "Volume x3 sur 10 jours. Packing saturé, délais J+2 menacés.",
      {
        "Conditions pour arriver": "Semaine 48–52 + campagne promo active",
        "Probabilité (Rare/Moyenne/Fréquente ou %)": "Fréquente (saison)",
        Fréquence: "1 / an",
        "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)":
          "Production (packing), Confiance de l'équipe, Satisfaction client",
        "Gravité (Faible/Moyenne/Forte/Critique)": "Forte",
        "Durée de l'impact": "10–14 jours",
        "Ce que le joueur peut faire":
          "Heures sup, intérim packing, prioriser SKU top, couper pubs",
        "Cet événement influence quelle décision plus tard":
          "Dimensionnement entrepôt et calendrier promo N+1",
      },
      {
        jour: 2,
        heure: "08:30",
        consequences: [
          { cible: "commandes", valeur: 3 },
          { cible: "moral", valeur: -5 },
        ],
      }
    ),
    ev(
      "Lampe cassée dans l'entrepôt",
      "Technique",
      "Chute d'un carton Halo depuis le rack haut : 18 unités cassées + zone bloquée.",
      {
        "Conditions pour arriver": "Réassort rack haut sans gerbeur disponible",
        "Probabilité (Rare/Moyenne/Fréquente ou %)": "Rare",
        Fréquence: "1 / trimestre",
        "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)":
          "Stock, Trésorerie, Confiance de l'équipe",
        "Gravité (Faible/Moyenne/Forte/Critique)": "Moyenne",
        "Durée de l'impact": "1–2 jours (nettoyage + inventaire)",
        "Ce que le joueur peut faire":
          "Sécuriser zone, inventaire, former picking hauteur, commander rechange",
        "Cet événement influence quelle décision plus tard":
          "Investissement gerbeur / règles rack haut",
      },
      {
        jour: 1,
        heure: "10:00",
        urgent: true,
        deadlineHeure: "16:00",
        consequences: [
          { cible: "stock", valeur: -18 },
          { cible: "moral", valeur: -4 },
        ],
        consequencesDeadline: [
          { cible: "qualite", valeur: -20 },
          { cible: "confianceClient", valeur: -10 },
        ],
      }
    ),
  ];
}

export function lumiereCompetenceGraph(): BookGraphView {
  return {
    nodes: [
      { id: "debut", label: "Brief MRP", x: 40, y: 160, w: 130, h: 52 },
      { id: "cours", label: "Cours Intro MRP", x: 220, y: 80, w: 160, h: 56 },
      {
        id: "cas",
        label: "Cas stock Halo",
        x: 220,
        y: 200,
        w: 160,
        h: 56,
      },
      {
        id: "choix",
        label: "Décision réappro",
        x: 440,
        y: 140,
        w: 160,
        h: 64,
      },
      { id: "fin", label: "Debrief", x: 660, y: 150, w: 120, h: 52 },
    ],
    edges: [
      { from: "debut", to: "cours", label: "" },
      { from: "debut", to: "cas", label: "" },
      { from: "cours", to: "choix", label: "" },
      { from: "cas", to: "choix", label: "" },
      { from: "choix", to: "fin", label: "" },
    ],
  };
}

export function lumiereHistoireGraph(): BookGraphView {
  return {
    nodes: [
      { id: "j1", label: "J1 — Retard MingLight", x: 40, y: 140, w: 170, h: 56 },
      { id: "j2", label: "J2 — Colis perdu", x: 250, y: 60, w: 160, h: 56 },
      { id: "j3", label: "J3 — Casse rack", x: 250, y: 200, w: 160, h: 56 },
      {
        id: "j4",
        label: "J4 — Pic Noël",
        x: 460,
        y: 140,
        w: 150,
        h: 56,
      },
      { id: "fin", label: "Fin de semaine", x: 660, y: 140, w: 140, h: 56 },
    ],
    edges: [
      { from: "j1", to: "j2", label: "" },
      { from: "j1", to: "j3", label: "" },
      { from: "j2", to: "j4", label: "" },
      { from: "j3", to: "j4", label: "" },
      { from: "j4", to: "fin", label: "" },
    ],
  };
}

export function lumiereCompetenceText(): string {
  return [
    `# Entraînement — ${LUMIERE_COMPETENCE}`,
    ``,
    `Entreprise : ${LUMIERE_NOM}`,
    `Mode : Compétence`,
    `Cours lié : ${LUMIERE_COURS}`,
    ``,
    `## Objectif`,
    `Entraîner le calcul de besoin et le choix de réapprovisionnement sur le SKU Halo,`,
    `sans inventer d'événements hors catalogue Lumière & Co.`,
    ``,
    `## Cours — ${LUMIERE_COURS}`,
    `1. Lire le stock actuel / min / sécu de Halo.`,
    `2. Intégrer le délai MingLight (35–45 j) et le risque de retard.`,
    `3. Proposer une quantité de commande et une option de secours (VietGlow / air freight).`,
    ``,
    `## Scénario précis`,
    `Tu es Logisticien chez Lumière & Co. Le stock Halo est à 95 (min 40, sécu 80).`,
    `Une alerte interne signale un risque de « Fournisseur en retard ».`,
    `Tu dois décider : commander tôt chez MingLight, basculer une partie chez VietGlow,`,
    `ou réduire la promo site pour protéger le stock.`,
    ``,
    `## Événements utilisables (uniquement Lumière & Co)`,
    `- Fournisseur en retard`,
    `- Pic de commandes à Noël`,
    `- Lampe cassée dans l'entrepôt`,
    `- Colis perdu par le transporteur`,
  ].join("\n");
}

export function lumiereHistoireText(): string {
  return [
    `# Histoire — ${LUMIERE_ROLE}`,
    ``,
    `Entreprise : ${LUMIERE_NOM}`,
    `Mode : Histoire`,
    `Rôle : ${LUMIERE_ROLE}`,
    ``,
    `## Pitch`,
    `Une semaine tendue avant les fêtes dans l'entrepôt de Vénissieux.`,
    `Tu es Logisticien : tu enchaînes réceptions, picking et arbitrages SAV.`,
    ``,
    `## Déroulé (événements catalogue uniquement)`,
    `1. MingLight annonce un retard (événement « Fournisseur en retard »).`,
    `2. Un colis client disparaît (événement « Colis perdu par le transporteur »).`,
    `3. Une chute en rack casse des Halo (événement « Lampe cassée dans l'entrepôt »).`,
    `4. Le trafic site explose (événement « Pic de commandes à Noël »).`,
    ``,
    `## Règle`,
    `N'utilise aucun événement d'une autre entreprise. Pas de Novacier, pas d'AgriBio.`,
  ].join("\n");
}

export type LumiereParamEvent = {
  nom: string;
  type: string;
  description: string;
  jour?: number;
  heure?: string;
  urgent?: boolean;
  deadlineHeure?: string;
  condition?: LumiereEventPlay["condition"];
  consequences?: LumiereEventPlay["consequences"];
  consequencesDeadline?: LumiereEventPlay["consequencesDeadline"];
};

/** Interviews Book OS — preuves Lumière (Étape 16). */
export function lumiereInterviews() {
  return [
    {
      id: "iv-samir",
      nom: "Samir",
      role: "Logisticien (mentor)",
      phrase: "Le quai ne ment jamais.",
      bio: "Tu es Logisticien junior. Samir te coache sur les priorités d'expédition et le réappro MingLight.",
      relationConfiance: 60,
      lines: [
        {
          q: "Par où je commence ?",
          a: "ERP stock Halo, puis le mail MingLight. Ensuite tu tranches.",
        },
      ],
      questions: [
        {
          id: "samir-q1",
          texte: "Par où je commence ce matin ?",
          choices: [
            {
              id: "samir-q1-a",
              texte: "Je croise stock ERP et mail fournisseur.",
              reponse:
                "Bien. Le stock Halo est tendu — note le seuil avant de décider.",
              confianceDelta: 6,
              xp: 8,
              unlockInfo: "PRIORITE_ERP",
            },
            {
              id: "samir-q1-b",
              texte: "Je file direct au packing.",
              reponse:
                "Le packing attend une décision, pas un corps de plus. Passe par l'ERP.",
              confianceDelta: -4,
            },
          ],
        },
        {
          id: "samir-q2",
          texte: "MingLight annonce un retard — je fais quoi ?",
          choices: [
            {
              id: "samir-q2-a",
              texte: "Je prépare un plan B VietGlow + air freight.",
              reponse:
                "Solide. Claire voudra les chiffres cash avant de signer l'air.",
              confianceDelta: 5,
              xp: 10,
              consequences: [{ cible: "moral", valeur: 2 }],
            },
            {
              id: "samir-q2-b",
              texte: "On attend, ça se débloquera.",
              reponse: "Risqué en Q4. Le pic Noël n'attendra pas MingLight.",
              confianceDelta: -6,
              consequences: [{ cible: "confianceClient", valeur: -3 }],
            },
          ],
        },
      ],
    },
    {
      id: "iv-lea",
      nom: "Léa",
      role: "Responsable e-commerce",
      phrase: "Le site vend — l'entrepôt doit suivre.",
      bio: "Léa gère promos et SAV. Elle pousse le volume ; toi, tu tiens les délais J+2.",
      relationConfiance: 50,
      lines: [
        {
          q: "La promo Halo tient ?",
          a: "Oui, mais le SAV flambe si on rate une expé.",
        },
      ],
      questions: [
        {
          id: "lea-q1",
          texte: "La promo Halo — on coupe ou on tient ?",
          choices: [
            {
              id: "lea-q1-a",
              texte: "On tient, mais je priorise les SKU top.",
              reponse:
                "OK pour moi si tu me confirms le stock demain matin.",
              confianceDelta: 4,
              xp: 6,
            },
            {
              id: "lea-q1-b",
              texte: "Coupe la promo, on sauve le service.",
              reponse:
                "Dur à digérer côté CA… mais le SAV te remerciera.",
              confianceDelta: -2,
              consequences: [{ cible: "commandes", valeur: -1 }],
            },
          ],
        },
      ],
    },
  ];
}

function lumiereObjectifs() {
  return [
    {
      id: "obj-lumiere-stock",
      titre: "Tenir le stock Halo",
      type: "JOURNALIER" as const,
      status: "EN_COURS" as const,
      description: "Éviter la rupture avant le pic — stock ≥ 80.",
      cible: "Stock ≥ 80",
      cibleNombre: 80,
      metric: "stock",
      op: "gte" as const,
      progression: 0,
      xp: 25,
      failOnDayEnd: true,
    },
    {
      id: "obj-lumiere-decide",
      titre: "Trancher la priorité du jour",
      type: "JOURNALIER" as const,
      status: "EN_COURS" as const,
      description: "Valider au moins une décision scénario.",
      cible: "1 décision",
      cibleNombre: 1,
      metric: "stepIndex",
      op: "gte" as const,
      progression: 0,
      xp: 20,
      failOnDayEnd: true,
    },
    {
      id: "obj-lumiere-mail",
      titre: "Lire les mails urgents",
      type: "JOURNALIER" as const,
      status: "EN_COURS" as const,
      description: "Ouvrir au moins un mail urgent (ops / events).",
      cible: "1 mail urgent lu",
      cibleNombre: 1,
      metric: "emailsReadUrgent",
      op: "gte" as const,
      progression: 0,
      xp: 15,
      failOnDayEnd: true,
    },
    {
      id: "obj-lumiere-hebdo",
      titre: "Qualité semaine Noël",
      type: "HEBDOMADAIRE" as const,
      status: "EN_COURS" as const,
      description: "Accumuler la qualité / pièces sur la semaine.",
      cible: "Qualité ≥ 150",
      cibleNombre: 150,
      metric: "piecesBrutesSemaine",
      op: "gte" as const,
      progression: 0,
      xp: 40,
      failOnDayEnd: false,
    },
  ];
}

function lumiereSensors() {
  return [
    {
      id: "sensor-quai",
      label: "Capteur quai / gerbeur",
      description:
        "Mesure flux picking hauteur — lève le brouillard stock / prod.",
      cost: 18_000,
      unlockLevel: 2,
      modules: ["stock", "production", "rebut"],
      installed: false,
    },
    {
      id: "sensor-wms-live",
      label: "Passerelle WMS live",
      description: "Temps réel entrepôt + trésorerie ops.",
      cost: 42_000,
      unlockLevel: 3,
      modules: ["stock", "production", "tresorerie", "rebut", "moral"],
      installed: false,
    },
  ];
}

function withLumiereOrdinateur(
  param: ScenarioParamFile
): ScenarioParamFile {
  const interviews = lumiereInterviews();
  const objectifs = lumiereObjectifs();
  return {
    ...param,
    Ordinateur: {
      interviews,
      chatContacts: [
        { id: "iv-samir", name: "Samir", role: "Logisticien" },
        { id: "iv-lea", name: "Léa", role: "E-commerce" },
      ],
      objectifs,
      sensors: lumiereSensors(),
    },
    /** Étape 21 — blocs top-level visibles (miroir + coquilles). */
    Interviews: interviews,
    Objectifs: objectifs,
    Jours: [],
    Kpis: [],
    Conséquences: [],
    Intro: [],
  } as ScenarioParamFile;
}

export function lumiereCompetenceParam(
  events: LumiereParamEvent[],
  contexte: Record<string, string>,
  fichier: string
): ScenarioParamFile {
  return withLumiereOrdinateur({
    Nom: `Entraînement — ${LUMIERE_COMPETENCE}`,
    Version: 1,
    Type: "Scénario",
    Mode: "Compétence",
    Rôle: "",
    Compétence: LUMIERE_COMPETENCE,
    Secteur: LUMIERE_SECTEUR,
    Entreprise: LUMIERE_NOM,
    Contexte: contexte,
    "Événements entreprise": events,
    "Rôles sélectionnés": [LUMIERE_ROLE],
    "Compétences sélectionnées": [
      { nom: LUMIERE_COMPETENCE, cours: [LUMIERE_COURS] },
    ],
    Décisions: [
      {
        id: "d1",
        titre: "Réappro Halo",
        dilemme: "Le stock Halo fond — quelle manœuvre ?",
        xpGagne: 20,
        competenceId: LUMIERE_COMPETENCE,
        options: [
          {
            id: "d1-opt0",
            label: "Commander MingLight maintenant",
            feedbackTexte: "Commande passée. Stock remonte, cash en baisse.",
            consequences: [
              { cible: "stock", valeur: 40 },
              { cible: "tresorerie", valeur: -3000 },
            ],
            impacts: [
              { label: "Stock", value: "+40", tone: "pos" },
              { label: "Cash", value: "−3 k€", tone: "neg" },
            ],
            competenceImpacts: [
              {
                competenceId: LUMIERE_COMPETENCE,
                type: "ciblee" as const,
                xp: 20,
                feedback: "Plan MRP : réappro immédiat chiffré.",
                indicateurIndex: 0,
              },
            ],
          },
          {
            id: "d1-opt1",
            label: "Partager MingLight + VietGlow",
            feedbackTexte: "Tu diversifies. Moins de risque, prod un peu plus complexe.",
            consequences: [
              { cible: "stock", valeur: 20 },
              { cible: "production", valeur: -3 },
              { cible: "moral", valeur: 3 },
            ],
            impacts: [
              { label: "Stock", value: "+20", tone: "pos" },
              { label: "Prod", value: "−3", tone: "neg" },
            ],
            competenceImpacts: [
              {
                competenceId: LUMIERE_COMPETENCE,
                type: "ciblee" as const,
                xp: 25,
                feedback: "Plan MRP : multi-sources + buffer.",
                indicateurIndex: 1,
              },
            ],
          },
          {
            id: "d1-opt2",
            label: "Couper la promo Halo",
            feedbackTexte: "Pression allégée. Commandes baissent, trésorerie préservée.",
            consequences: [
              { cible: "tresorerie", valeur: 1500 },
              { cible: "commandes", valeur: -2 },
              { cible: "confianceClient", valeur: -5 },
            ],
            impacts: [
              { label: "Cash", value: "+1,5 k€", tone: "pos" },
              { label: "Confiance", value: "−5", tone: "neg" },
            ],
            competenceImpacts: [
              {
                competenceId: LUMIERE_COMPETENCE,
                type: "ciblee" as const,
                xp: 12,
                feedback: "Plan MRP : demande révisée (promo coupée).",
                indicateurIndex: 2,
              },
            ],
          },
        ],
      },
    ],
    Fins: [
      { id: "fin-ok", label: "Stock tenu jusqu'à Noël" },
      { id: "fin-rupture", label: "Rupture Halo en pic" },
    ],
    fichier,
  });
}

export function lumiereHistoireParam(
  events: LumiereParamEvent[],
  contexte: Record<string, string>,
  fichier: string
): ScenarioParamFile {
  return withLumiereOrdinateur({
    Nom: `Histoire — ${LUMIERE_ROLE}`,
    Version: 1,
    Type: "Histoire",
    Mode: "Histoire",
    Rôle: LUMIERE_ROLE,
    Compétence: "",
    Secteur: LUMIERE_SECTEUR,
    Entreprise: LUMIERE_NOM,
    Contexte: contexte,
    "Événements entreprise": events,
    "Rôles sélectionnés": [LUMIERE_ROLE],
    "Compétences sélectionnées": [
      { nom: LUMIERE_COMPETENCE, cours: [LUMIERE_COURS] },
    ],
    Décisions: [
      {
        id: "h1",
        titre: "Priorité du jour",
        dilemme: "Trois urgences en même temps — que traites-tu d'abord ?",
        xpGagne: 25,
        options: [
          {
            id: "h1-opt0",
            label: "Traiter le retard fournisseur",
            feedbackTexte:
              "Tu sécurises le réappro. Stock remonte, trésorerie un peu sous tension.",
            consequences: [
              { cible: "stock", valeur: 25 },
              { cible: "tresorerie", valeur: -1500 },
              { cible: "moral", valeur: 2 },
            ],
            impacts: [
              { label: "Stock", value: "+25", tone: "pos" },
              { label: "Trésorerie", value: "−1,5 k€", tone: "neg" },
            ],
          },
          {
            id: "h1-opt1",
            label: "Sauver le colis perdu",
            feedbackTexte:
              "Le client respire. Confiance en hausse, production un peu ralentie.",
            consequences: [
              { cible: "confianceClient", valeur: 8 },
              { cible: "production", valeur: -5 },
              { cible: "xp", valeur: 15 },
            ],
            impacts: [
              { label: "Confiance", value: "+8", tone: "pos" },
              { label: "Prod", value: "−5", tone: "neg" },
            ],
          },
          {
            id: "h1-opt2",
            label: "Sécuriser le rack",
            feedbackTexte:
              "Sécurité d'abord. Éthique et moral montent ; le temps file.",
            consequences: [
              { cible: "ethique", valeur: 5 },
              { cible: "moral", valeur: 4 },
              { cible: "temps", valeur: 30 },
            ],
            impacts: [
              { label: "Éthique", value: "+5", tone: "pos" },
              { label: "Temps", value: "+30 min", tone: "neu" },
            ],
          },
        ],
      },
      {
        id: "h2",
        titre: "Pic Noël",
        dilemme: "Le volume explose — comment tiens-tu la semaine ?",
        xpGagne: 30,
        options: [
          {
            id: "h2-opt0",
            label: "Heures sup packing",
            feedbackTexte:
              "Les colis sortent. Production et pièces montent ; le moral fatigue.",
            consequences: [
              { cible: "production", valeur: 15 },
              { cible: "pieces", valeur: 40 },
              { cible: "moral", valeur: -6 },
              { cible: "tresorerie", valeur: -800 },
            ],
            impacts: [
              { label: "Prod", value: "+15", tone: "pos" },
              { label: "Moral", value: "−6", tone: "neg" },
            ],
          },
          {
            id: "h2-opt1",
            label: "Couper pubs",
            feedbackTexte:
              "Tu réduis la pression commerciale. Trésorerie préservée, commandes en baisse.",
            consequences: [
              { cible: "tresorerie", valeur: 2000 },
              { cible: "commandes", valeur: -3 },
              { cible: "confianceClient", valeur: -4 },
            ],
            impacts: [
              { label: "Cash", value: "+2 k€", tone: "pos" },
              { label: "Commandes", value: "−3", tone: "neg" },
            ],
          },
          {
            id: "h2-opt2",
            label: "Prioriser top SKU",
            feedbackTexte:
              "Focus SKU rentables. Qualité semaine et score progressent.",
            consequences: [
              { cible: "piecesBrutesSemaine", valeur: 60 },
              { cible: "score", valeur: 20 },
              { cible: "stock", valeur: -10 },
            ],
            impacts: [
              { label: "Qualité", value: "+60", tone: "pos" },
              { label: "Stock", value: "−10", tone: "neg" },
            ],
          },
        ],
      },
    ],
    Fins: [
      { id: "fin-semaine", label: "Semaine tenue, clients livrés" },
      { id: "fin-chaos", label: "Retards massifs J+2" },
    ],
    fichier,
  });
}
