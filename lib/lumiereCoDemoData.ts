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

export type LumiereEventSeed = {
  nom: string;
  type: string;
  description: string;
  fields: EventExcelFields;
};

function ev(
  nom: string,
  type: string,
  description: string,
  extra: Partial<EventExcelFields> = {}
): LumiereEventSeed {
  const fields = emptyEventFields();
  fields["Nom"] = nom;
  fields[
    "Type (Logistique/Technique/Humain/Client/Fournisseur/Météo/Réglementation)"
  ] = type;
  fields["Description complète"] = description;
  Object.assign(fields, extra);
  return { nom, type, description, fields };
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

export function lumiereCompetenceParam(
  events: { nom: string; type: string; description: string }[],
  contexte: Record<string, string>,
  fichier: string
): ScenarioParamFile {
  return {
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
        options: [
          "Commander MingLight maintenant",
          "Partager MingLight + VietGlow",
          "Couper la promo Halo",
        ],
      },
    ],
    Fins: [
      { id: "fin-ok", label: "Stock tenu jusqu'à Noël" },
      { id: "fin-rupture", label: "Rupture Halo en pic" },
    ],
    fichier,
  };
}

export function lumiereHistoireParam(
  events: { nom: string; type: string; description: string }[],
  contexte: Record<string, string>,
  fichier: string
): ScenarioParamFile {
  return {
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
        options: ["Traiter le retard fournisseur", "Sauver le colis perdu", "Sécuriser le rack"],
      },
      {
        id: "h2",
        titre: "Pic Noël",
        options: ["Heures sup packing", "Couper pubs", "Prioriser top SKU"],
      },
    ],
    Fins: [
      { id: "fin-semaine", label: "Semaine tenue, clients livrés" },
      { id: "fin-chaos", label: "Retards massifs J+2" },
    ],
    fichier,
  };
}
