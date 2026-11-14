import { novacierDecisions } from "@/data/scenarioNovacier";
import { cloneDefaultAgents } from "./agents";
import { novacierCoeur } from "./adminCoeur";
import { appendVersion, emptyCoeurMeta } from "./coeurHistory";
import {
  livreNovacier,
  scenarioPersonnages,
} from "@/data/contextes/novacier/scenarioContent";
import { SCENARIO_ID, SCENARIO_TITLE } from "@/data/scenarioNovacier";
import {
  seedAtelierNordFiche,
  seedNouveauProjetFiche,
  seedNovacierFiche,
} from "./adminFiches";
import { emptyCoeur } from "./adminCoeur";
import { seedGlossaire } from "./adminGlossaire";
import { seedJournalDecisions } from "./adminJournalDecisions";
import type {
  AdminDecision,
  AdminEntreprise,
  AdminEvent,
  AdminPersonnage,
  AdminScenario,
  AdminState,
} from "./adminTypes";
import { uid } from "./adminTypes";

const ENTREPRISE_ID = "ent-novacier";
const ENTREPRISE_ATELIER_ID = "ent-atelier-nord";
const SCENARIO_ATELIER_ID = "scn-atelier-nord";
const SCENARIO_NOUVEAU_ID = "scn-nouveau-projet";

function seedEntreprise(): AdminEntreprise {
  return {
    id: ENTREPRISE_ID,
    nom: livreNovacier.nom,
    ville: "Saint-Étienne",
    secteur: "Industrie",
    histoire: livreNovacier.histoire.narratif,
    activite: livreNovacier.activite.ceQuOnFabrique,
    produitsPhares: [
      livreNovacier.activite.produitsPhares[0]?.nom ?? "Produit A",
      livreNovacier.activite.produitsPhares[1]?.nom ?? "Produit B",
      livreNovacier.activite.produitsPhares[2]?.nom ?? "Produit C",
    ],
    chiffresCles: {
      ca: livreNovacier.chiffresCles.ca,
      employes: livreNovacier.chiffresCles.employes,
      machines: livreNovacier.chiffresCles.machines,
      satisfaction: livreNovacier.chiffresCles.satisfaction,
    },
    valeurs: livreNovacier.valeurs.map((v) => v.titre),
    glossaire: livreNovacier.glossaire.map((g) => ({
      terme: g.terme,
      definition: g.definition,
    })),
    scenarioIds: [SCENARIO_ID],
  };
}

function seedScenario(): AdminScenario {
  return {
    id: SCENARIO_ID,
    titre: SCENARIO_TITLE,
    secteur: "Industrie",
    competence: "Pilotage de production",
    niveau: "intermediaire",
    dureeJours: 5,
    description:
      "Cinq jours pour sauver le contrat AutoVolt chez Novacier. Brouillard de données, panne Machine 3, dilemmes éthiques.",
    entrepriseId: ENTREPRISE_ID,
    statut: "publie",
    statutWorkflow: "retenu_publie",
    provisoire: false,
    order: 1,
  };
}

function seedAtelierNordScenario(): AdminScenario {
  return {
    id: SCENARIO_ATELIER_ID,
    titre: "Atelier Nord — Lot aéronautique",
    secteur: "Industrie",
    competence: "Pilotage d'atelier",
    niveau: "intermediaire",
    dureeJours: 4,
    description: "Scénario provisoire Atelier Nord — en test Agents.",
    entrepriseId: ENTREPRISE_ATELIER_ID,
    statut: "en_attente",
    statutWorkflow: "en_test",
    provisoire: true,
    order: 2,
  };
}

function seedNouveauProjetScenario(): AdminScenario {
  return {
    id: SCENARIO_NOUVEAU_ID,
    titre: "Nouveau Projet",
    secteur: "Industrie",
    competence: "Responsable de Production",
    niveau: "debutant",
    dureeJours: 5,
    description: "Scénario lié à une fiche encore en brouillon.",
    entrepriseId: null,
    statut: "brouillon",
    statutWorkflow: "brouillon",
    provisoire: false,
    order: 3,
  };
}

function seedAtelierNordEntreprise(): AdminEntreprise {
  return {
    id: ENTREPRISE_ATELIER_ID,
    nom: "Atelier Nord",
    ville: "Lille",
    secteur: "Industrie",
    histoire: "Sous-traitant usinage aéronautique.",
    activite: "Usinage de précision",
    produitsPhares: ["Lot A", "Lot B", "Outillage"],
    chiffresCles: {
      ca: "18 M€",
      employes: 80,
      machines: 12,
      satisfaction: "82 %",
    },
    valeurs: ["Qualité", "Délai", "Sécurité"],
    glossaire: [],
    scenarioIds: [SCENARIO_ATELIER_ID],
  };
}

function splitName(full: string): { prenom: string; nom: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { prenom: parts[0], nom: "" };
  return { prenom: parts[0], nom: parts.slice(1).join(" ") };
}

function ageFromRole(role: string): number {
  const m = role.match(/(\d+)\s*ans?/i);
  return m ? Number(m[1]) : 40;
}

function seedPersonnages(): AdminPersonnage[] {
  return scenarioPersonnages.map((p) => {
    const { prenom, nom } = splitName(p.nom);
    return {
      id: p.id,
      prenom,
      nom,
      age: ageFromRole(p.role),
      poste: p.role.replace(/\s*·\s*\d+\s*ans?/i, "").trim(),
      entrepriseId: ENTREPRISE_ID,
      scenarioIds: [SCENARIO_ID],
      caractere: p.phrase,
      confianceDepart: p.relationConfiance,
      avatarStyle: p.id,
      description: p.bio,
      dialogues: p.questions.map((q) => ({
        id: q.id,
        question: q.texte,
        choices: q.choices.map((c) => ({
          id: c.id,
          texte: c.texte,
          reponse: c.reponse,
          consequences: [
            { metric: `Confiance ${prenom}`, delta: c.confianceDelta },
            ...(c.xp ? [{ metric: "XP", delta: c.xp }] : []),
          ],
        })),
      })),
    };
  });
}

/** Seed admin CMS from declarative Novacier decisions. */
function seedDecisions(): AdminDecision[] {
  return novacierDecisions.map((d, idx) => ({
    id: d.id,
    scenarioId: SCENARIO_ID,
    titre: d.titre,
    jour: d.jour,
    heure: d.jour === 3 ? "10:00" : d.jour === 1 ? "12:00" : "09:00",
    dilemme: d.dilemme,
    choix: d.choix.slice(0, 3).map((c) => ({
      id: c.id,
      texte: c.label,
      consequences: c.consequences.map((x) => ({
        metric: x.cible,
        delta: x.valeur,
        ...(x.mode ? { mode: x.mode } : {}),
        ...(typeof x.setValeur === "string" ? { setValeur: x.setValeur } : {}),
      })),
      ...(c.competencesImpactees?.length
        ? { competencesImpactees: c.competencesImpactees.map((i) => ({ ...i })) }
        : {}),
    })),
    order: idx + 1,
  }));
}

function seedEvents(): AdminEvent[] {
  const base: AdminEvent[] = [
    {
      id: "adm-ev-start",
      scenarioId: SCENARIO_ID,
      titre: "Semaine critique AutoVolt",
      jour: 1,
      heure: "08:00",
      type: "Autre",
      texte: "Objectif : 500 pièces qualité avant vendredi 16h.",
      order: 1,
    },
    {
      id: "adm-ev-mail-laurent",
      scenarioId: SCENARIO_ID,
      titre: "Mail Laurent — Où en est le retard ?",
      jour: 1,
      heure: "08:15",
      type: "Email",
      texte: "AutoVolt appelle cet après-midi. Statut clair avant midi.",
      order: 2,
    },
    {
      id: "adm-ev-rumor",
      scenarioId: SCENARIO_ID,
      titre: "Rumeur AutoVolt / Pologne",
      jour: 2,
      heure: "09:00",
      type: "Rumeur",
      texte: "AutoVolt aurait contacté un concurrent en Pologne.",
      order: 3,
    },
    {
      id: "adm-ev-panne",
      scenarioId: SCENARIO_ID,
      titre: "PANNE MACHINE 3",
      jour: 3,
      heure: "10:00",
      type: "Panne",
      texte: "Alarme atelier — ouvrir l'Atelier Live.",
      order: 4,
    },
    {
      id: "adm-ev-defaut",
      scenarioId: SCENARIO_ID,
      titre: "40 pièces à micro-défaut",
      jour: 4,
      heure: "09:30",
      type: "Autre",
      texte: "Décision éthique : livrer ou jeter.",
      order: 5,
    },
    {
      id: "adm-ev-nego",
      scenarioId: SCENARIO_ID,
      titre: "Négociation AutoVolt",
      jour: 5,
      heure: "14:00",
      type: "Nouveau client",
      texte: "Point contrat + débrief 16h.",
      order: 6,
    },
  ];
  return base;
}

export function createAdminSeed(): AdminState {
  const coeur = novacierCoeur();
  coeur.scenario.statutWorkflow = "retenu_publie";
  coeur.scenario.provisoire = false;
  const meta = appendVersion(
    emptyCoeurMeta(),
    coeur,
    "seed",
    "Système",
    "CŒUR Novacier initial"
  );
  // Seed highlights as already seen so Logique starts clean
  meta.highlights = meta.highlights.map((h) => ({ ...h, seen: true }));

  const atelierScn = seedAtelierNordScenario();
  const nouveauScn = seedNouveauProjetScenario();
  const atelierCoeur = emptyCoeur(atelierScn);
  atelierCoeur.scenario.statutWorkflow = "en_test";
  atelierCoeur.scenario.provisoire = true;
  const atelierMeta = appendVersion(
    emptyCoeurMeta(),
    atelierCoeur,
    "seed",
    "Système",
    "CŒUR Atelier Nord provisoire"
  );
  atelierMeta.highlights = atelierMeta.highlights.map((h) => ({
    ...h,
    seen: true,
  }));

  const nouveauCoeur = emptyCoeur(nouveauScn);
  nouveauCoeur.scenario.statutWorkflow = "brouillon";
  const nouveauMeta = appendVersion(
    emptyCoeurMeta(),
    nouveauCoeur,
    "seed",
    "Système",
    "CŒUR Nouveau Projet"
  );
  nouveauMeta.highlights = nouveauMeta.highlights.map((h) => ({
    ...h,
    seen: true,
  }));

  return {
    scenarios: [seedScenario(), atelierScn, nouveauScn],
    entreprises: [seedEntreprise(), seedAtelierNordEntreprise()],
    personnages: seedPersonnages(),
    decisions: seedDecisions(),
    events: seedEvents(),
    fiches: [
      seedNovacierFiche(),
      seedAtelierNordFiche(SCENARIO_ATELIER_ID),
      seedNouveauProjetFiche(SCENARIO_NOUVEAU_ID),
    ],
    coeurs: {
      [SCENARIO_ID]: coeur,
      [SCENARIO_ATELIER_ID]: atelierCoeur,
      [SCENARIO_NOUVEAU_ID]: nouveauCoeur,
    },
    coeurMeta: {
      [SCENARIO_ID]: meta,
      [SCENARIO_ATELIER_ID]: atelierMeta,
      [SCENARIO_NOUVEAU_ID]: nouveauMeta,
    },
    agents: cloneDefaultAgents(),
    agentReports: [],
    consultants: [],
    glossaire: seedGlossaire(),
    journalDecisions: seedJournalDecisions(),
    toast: null,
  };
}

export function emptyScenario(order: number): AdminScenario {
  return {
    id: uid("scn"),
    titre: "Nouveau scénario",
    secteur: "Industrie",
    competence: "",
    niveau: "debutant",
    dureeJours: 5,
    description: "",
    entrepriseId: null,
    statut: "brouillon",
    statutWorkflow: "brouillon",
    provisoire: false,
    order,
  };
}

export function emptyEntreprise(): AdminEntreprise {
  return {
    id: uid("ent"),
    nom: "Nouvelle entreprise",
    ville: "",
    secteur: "Industrie",
    histoire: "",
    activite: "",
    produitsPhares: ["", "", ""],
    chiffresCles: { ca: "", employes: 0, machines: 0, satisfaction: "" },
    valeurs: ["", "", ""],
    glossaire: [],
    scenarioIds: [],
  };
}

export function emptyPersonnage(): AdminPersonnage {
  return {
    id: uid("pers"),
    prenom: "",
    nom: "",
    age: 35,
    poste: "",
    entrepriseId: null,
    scenarioIds: [],
    caractere: "",
    confianceDepart: 50,
    avatarStyle: "custom",
    description: "",
    dialogues: [],
  };
}

export function emptyDecision(scenarioId: string, order: number): AdminDecision {
  return {
    id: uid("dec"),
    scenarioId,
    titre: "Nouvelle décision",
    jour: 1,
    heure: "09:00",
    dilemme: "",
    choix: [
      { id: uid("ch"), texte: "Choix 1", consequences: [] },
      { id: uid("ch"), texte: "Choix 2", consequences: [] },
      { id: uid("ch"), texte: "Choix 3", consequences: [] },
    ],
    order,
  };
}

export function emptyEvent(scenarioId: string, order: number): AdminEvent {
  return {
    id: uid("evt"),
    scenarioId,
    titre: "Nouvel événement",
    jour: 1,
    heure: "09:00",
    type: "Autre",
    texte: "",
    order,
  };
}
