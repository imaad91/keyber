/**
 * Admin module « Fiches » — rich real-world intake linked to a scenario.
 * Independent from player GameState.
 */

import { SCENARIO_ID, SCENARIO_TITLE } from "@/data/scenarioNovacier";
import { uid } from "./adminTypes";

export type AdminFicheStatus =
  | "brouillon"
  | "en_cours"
  | "complete"
  | "validee";

export const ADMIN_FICHE_STATUTS: {
  value: AdminFicheStatus;
  label: string;
}[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "en_cours", label: "En cours" },
  { value: "complete", label: "Complète" },
  { value: "validee", label: "Validée" },
];

export type AdminFicheSections = {
  contexteEntreprise: string;
  personnagesRiches: string;
  decisionsRiches: string;
  donneesReelles: string;
};

export type AdminFiche = {
  id: string;
  titre: string;
  scenarioId: string;
  entrepriseNom: string;
  role: string;
  statut: AdminFicheStatus;
  updatedAt: string;
  sections: AdminFicheSections;
  /** Set after « Générer le Cœur à partir de cette Fiche » */
  coeurGenere: boolean;
};

export const FICHE_SECTION_META: {
  key: keyof AdminFicheSections;
  titre: string;
  shortMissing: string;
}[] = [
  {
    key: "contexteEntreprise",
    titre: "Contexte Entreprise Riche",
    shortMissing: "Contexte Entreprise",
  },
  {
    key: "personnagesRiches",
    titre: "Personnages Riches",
    shortMissing: "Personnages Riches",
  },
  {
    key: "decisionsRiches",
    titre: "Décisions Riches",
    shortMissing: "Décisions Riches",
  },
  {
    key: "donneesReelles",
    titre: "Données Réelles",
    shortMissing: "Données Réelles",
  },
];

export const FICHE_SECTION_HINT =
  "Raconte le réel, avec des anecdotes, des chiffres, des exemples vrais. Plus c'est riche, plus le scénario sera réel.";

export function ficheStatusLabel(s: AdminFicheStatus) {
  return ADMIN_FICHE_STATUTS.find((x) => x.value === s)?.label ?? s;
}

export function emptyFicheSections(): AdminFicheSections {
  return {
    contexteEntreprise: "",
    personnagesRiches: "",
    decisionsRiches: "",
    donneesReelles: "",
  };
}

export function emptyFiche(scenarioId = ""): AdminFiche {
  return {
    id: uid("fiche"),
    titre: "Nouvelle fiche",
    scenarioId,
    entrepriseNom: "",
    role: "Responsable de Production",
    statut: "brouillon",
    updatedAt: new Date().toISOString(),
    sections: emptyFicheSections(),
    coeurGenere: false,
  };
}

export function ficheFillPercent(fiche: AdminFiche): number {
  const filled = FICHE_SECTION_META.filter((s) =>
    fiche.sections[s.key]?.trim()
  ).length;
  return Math.round((filled / FICHE_SECTION_META.length) * 100);
}

export function ficheMissingSections(fiche: AdminFiche): string[] {
  return FICHE_SECTION_META.filter((s) => !fiche.sections[s.key]?.trim()).map(
    (s) => s.shortMissing
  );
}

export function seedNovacierFiche(): AdminFiche {
  return {
    id: "fiche-novacier",
    titre: "Fiche Novacier",
    scenarioId: SCENARIO_ID,
    entrepriseNom: "Novacier Industrie",
    role: "Responsable de Production",
    statut: "validee",
    updatedAt: new Date().toISOString(),
    sections: {
      contexteEntreprise: `Novacier Industrie — Saint-Étienne. PME métallurgique (~120 employés), 4 machines, AutoVolt = 45 % du CA. Quasi-faillite 2022. Cette semaine : 500 pièces qualité avant vendredi 16h. ${SCENARIO_TITLE}`,
      personnagesRiches:
        "Marie Dubois (chef d'atelier) jauge le nouveau RP. Karim (maintenance) sait qu'un capteur est mort. Laurent Moreau (direction) presse pour un statut AutoVolt. Henri (mentor) guide l'arrivée.",
      decisionsRiches:
        "J1 cause du retard (capteur vs machine vs rien). J2 heures sup vs réorg Marie. J3 panne Machine 3. J4 éthique micro-défauts. J5 négociation AutoVolt.",
      donneesReelles:
        "Trésorerie ~420 k€, stock acier ~850 kg, prod ~60/j, rebut réel ~18 % une fois le brouillard levé. Objectif : 500 pièces qualité.",
    },
    coeurGenere: false,
  };
}
