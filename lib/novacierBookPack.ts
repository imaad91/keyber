/**
 * Étape 41 — Pack Novacier (exemple only) pour Book / Keyber OS.
 * Extraction data/contextes/novacier + scenarioNovacier → ScenarioParamFile.
 * Aucune modification de lib/keyberOs/* (pas de métier dans le moteur).
 */

import { novacierComputer } from "@/data/contextes/novacier/computer";
import { novacierEvenements } from "@/data/contextes/novacier/evenements";
import { novacierRuntimeCopy } from "@/data/contextes/novacier/runtimeCopy";
import {
  emailsForDay,
  livreNovacier,
  messagesForDay,
  scenarioObjectives,
  scenarioPersonnages,
  TARGET_PIECES,
} from "@/data/contextes/novacier/scenarioContent";
import {
  dayTitles,
  NOVACIER_RULES,
  novacierDecisions,
  SCENARIO_TITLE,
} from "@/data/scenarioNovacier";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { buildParamFileName } from "@/lib/bookGenerationPrompt";
import type { BookGraphView } from "@/lib/bookStore";
import type { ScenarioParamFileExtended } from "@/lib/scenarioParamSchema";
import { normalizeScenarioParamFile } from "@/lib/scenarioParamSchema";

export const NOVACIER_NOM = "Novacier";
export const NOVACIER_SECTEUR = "Industrie / Automobile";
export const NOVACIER_ROLE = "Responsable de Production";
export const NOVACIER_COMPETENCE = "Pilotage production semaine critique";
export const NOVACIER_FAMILY_ID = "novacier-pack-v1";
export const NOVACIER_CREATION_ID = "creation-novacier-pack";

export function novacierParamFileName(): string {
  return buildParamFileName({
    entrepriseNom: NOVACIER_NOM,
    mode: "histoire",
    roleOrCompetence: NOVACIER_ROLE,
    version: 1,
  });
}

function contexteRecord(): Record<string, string> {
  return {
    "Nom de l'entreprise": NOVACIER_NOM,
    "Secteur d'activité": NOVACIER_SECTEUR,
    "Sous-secteur": "Pièces métalliques automobile",
    Taille: "PME",
    "Nombre d'employés": "120",
    "Chiffre d'affaires": "12 M€ / an",
    "Année de création": "1987",
    Localisation: "Saint-Étienne (42), France",
    "Nombre de sites": "1 atelier",
    "Organigramme détaillé":
      "Directeur (Laurent Perrin) → Responsable Production → Cheffe d'atelier (Marie) / Maintenance (Karim) ; Mentor (Henri Vallon).",
    "Qui décide quoi":
      "Laurent : client AutoVolt, cash. Production : arbitrages atelier/qualité. Marie : ligne. Karim : machines.",
    "Qui travaille avec qui":
      "Production ↔ Marie quotidien ; Production ↔ Karim pannes ; Laurent ↔ AutoVolt.",
    Horaires: "Atelier 08:00–18:00 (journée jouable).",
    "Postes clés":
      "Responsable Production, Cheffe d'atelier, Maintenance, Directeur, Mentor.",
    "Trésorerie actuelle": "180000",
    "Liste des stocks (nom, quantité actuelle, stock minimum, stock maximum, stock de sécurité, délai de réapprovisionnement, coût de stockage, problèmes récurrents)":
      "Support Moteur A-42 : 120 / seuil 200 — stock bas critique.",
    "Objectifs quotidiens / hebdo / annuels": `Hebdo : ${TARGET_PIECES} pièces qualité avant vendredi 16h (contrat AutoVolt).`,
  };
}

function mapEvents() {
  return novacierEvenements.map((ev) => ({
    id: ev.id,
    nom: ev.titre,
    type: ev.type,
    description: ev.texte,
    jour: ev.jour,
    heure: ev.heure,
    urgent: ev.urgent,
    deadlineHeure: ev.deadlineHeure,
    condition: ev.condition,
    consequences: ev.consequences,
    consequencesDeadline: ev.consequencesDeadline,
  }));
}

function mapDecisions() {
  return novacierDecisions.map((d) => ({
    id: d.id,
    titre: d.titre,
    dilemme: d.dilemme,
    jour: d.jour,
    xpGagne: d.xpGagne,
    categorie: d.categorie,
    options: (d.choix || []).map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      feedbackTexte: c.feedbackTexte,
      impacts: c.impacts,
      competenceImpacts: c.competencesImpactees,
      consequences: c.consequences,
    })),
  }));
}

function mapInterviews() {
  return scenarioPersonnages.map((p) => ({
    id: p.id,
    nom: p.nom,
    role: p.role,
    phrase: p.phrase,
    bio: p.bio,
    relationConfiance: p.relationConfiance,
    lines: (p.questions || []).flatMap((q) =>
      (q.choices || []).map((ch) => ({
        q: q.texte,
        a: `${ch.texte} → ${ch.reponse}`,
      }))
    ),
    questions: (p.questions || []).map((q) => ({
      id: q.id,
      texte: q.texte,
      choices: (q.choices || []).map((ch) => ({
        id: ch.id,
        texte: ch.texte,
        reponse: ch.reponse,
        confianceDelta: ch.confianceDelta,
        unlockInfo: ch.unlockInfo,
        xp: ch.xp,
      })),
    })),
  }));
}

function mapObjectifs() {
  return scenarioObjectives.map((o) => ({
    id: o.id,
    titre: o.titre,
    type: o.type,
    status: o.status,
    cible: String(o.cible ?? ""),
    description: o.description,
    progression: o.progression,
    seuil: typeof o.cible === "number" ? o.cible : undefined,
  }));
}

function mapJours() {
  return Object.entries(dayTitles)
    .map(([j, label]) => {
      const jour = Number(j);
      const decision = novacierDecisions.find((d) => d.jour === jour);
      const eventIds = novacierEvenements
        .filter((e) => e.jour === jour)
        .map((e) => e.id);
      return {
        id: `jour-${jour}`,
        jour,
        label,
        phase: jour === 0 ? "INTRO" : "JOUR",
        decisionIds: decision ? [decision.id] : [],
        eventIds,
      };
    })
    .sort((a, b) => a.jour - b.jour);
}

function mapFins() {
  return [
    {
      id: "fin-victoire",
      label: novacierRuntimeCopy.endingFlash.victoire,
      kind: "VICTOIRE" as const,
      narration: novacierRuntimeCopy.endingNarration.victoire(
        TARGET_PIECES,
        60
      ),
      xp: NOVACIER_RULES.endingXp.VICTOIRE,
      priority: 30,
      conditions: [
        { metric: "qualite", op: "gte" as const, value: 480 },
        { metric: "ethique", op: "gte" as const, value: 51 },
      ],
    },
    {
      id: "fin-partielle",
      label: novacierRuntimeCopy.endingFlash.partielle,
      kind: "PARTIELLE" as const,
      narration: novacierRuntimeCopy.endingNarration.partielle(420, 40),
      xp: NOVACIER_RULES.endingXp.PARTIELLE,
      priority: 20,
      conditions: [
        { metric: "qualite", op: "gte" as const, value: 400 },
        { metric: "ethique", op: "gte" as const, value: 20 },
      ],
    },
    {
      id: "fin-echec",
      label: novacierRuntimeCopy.endingFlash.echec,
      kind: "ECHEC" as const,
      narration: novacierRuntimeCopy.endingNarration.echec(300, 15),
      xp: NOVACIER_RULES.endingXp.ECHEC,
      priority: 10,
      conditions: [{ metric: "qualite", op: "lte" as const, value: 399 }],
    },
  ];
}

function mapKpis() {
  return [
    {
      id: "kpi-pieces",
      label: "Pièces qualité",
      format: "number" as const,
      path: "qualite",
      unit: "pcs",
    },
    {
      id: "kpi-ethique",
      label: "Éthique",
      format: "percent" as const,
      path: "ethique",
      unit: "%",
    },
    {
      id: "kpi-stock",
      label: "Stock A-42",
      format: "number" as const,
      path: "stock",
      unit: "u",
    },
    {
      id: "kpi-cash",
      label: "Trésorerie",
      format: "currency" as const,
      path: "tresorerie",
      unit: "€",
    },
  ];
}

function flattenEmails() {
  const all: {
    id: string;
    from: string;
    subject: string;
    body: string;
    day: number;
    read: boolean;
    preview?: string;
    time?: string;
    urgent?: boolean;
  }[] = [];
  for (let d = 0; d <= 5; d++) {
    for (const e of emailsForDay(d)) {
      all.push({
        id: e.id,
        from: e.from,
        subject: e.subject,
        body: e.body,
        day: d,
        read: e.read,
        preview: e.preview,
        time: e.time,
        urgent: e.urgent,
      });
    }
  }
  return all;
}

function flattenChatThreads() {
  const byContact = new Map<
    string,
    {
      contactId: string;
      messages: {
        from: "me" | "them";
        text: string;
        time?: string;
        alert?: boolean;
      }[];
    }
  >();
  const contactByName = new Map(
    (novacierComputer.chatContacts || []).map((c) => [
      c.name.toLowerCase(),
      c.id,
    ])
  );
  for (let d = 0; d <= 5; d++) {
    for (const m of messagesForDay(d)) {
      const contactId =
        contactByName.get(String(m.from || "").toLowerCase()) ||
        String(m.from || "chat")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      const prev = byContact.get(contactId) || {
        contactId,
        messages: [],
      };
      prev.messages.push({
        from: m.mentor ? "them" : "them",
        text: m.text,
        time: m.time,
        alert: m.alert,
      });
      byContact.set(contactId, prev);
    }
  }
  return Array.from(byContact.values());
}

function mapOrdinateur() {
  const c = novacierComputer;
  return {
    stock: c.erpStockRows,
    commandes: c.erpCommandes,
    production: c.erpProduction,
    employes: c.erpEmployes,
    factures: c.erpFactures,
    machines: c.erpMachines,
    clients: c.erpClients,
    fournisseurs: c.erpFournisseurs,
    maintenance: [],
    emails: flattenEmails(),
    chatContacts: c.chatContacts,
    chatThreads: flattenChatThreads(),
    documents: c.computerDocuments,
    browser: c.browserCorpus,
    dashboardCards: c.erpDashboardCards,
    dashboardSeries: [],
  };
}

function mapLivre() {
  return {
    ...livreNovacier,
    organigramme: (livreNovacier.organigramme || []).map((o) => ({
      personnageId: o.personnageId,
    })),
  };
}

/** Param Histoire Book — contenu extrait du POC Novacier. */
export function buildNovacierHistoireParam(
  fichier = novacierParamFileName()
): ScenarioParamFileExtended {
  const raw: ScenarioParamFileExtended = {
    Nom: SCENARIO_TITLE,
    Version: 1,
    Type: "Histoire",
    Mode: "Histoire",
    Rôle: NOVACIER_ROLE,
    Compétence: "",
    Secteur: NOVACIER_SECTEUR,
    Entreprise: NOVACIER_NOM,
    Contexte: contexteRecord(),
    "Événements entreprise": mapEvents(),
    "Rôles sélectionnés": [NOVACIER_ROLE],
    "Compétences sélectionnées": [
      { nom: NOVACIER_COMPETENCE, cours: [] },
    ],
    Décisions: mapDecisions(),
    Fins: mapFins(),
    fichier,
    Ordinateur: mapOrdinateur(),
    Interviews: mapInterviews(),
    Objectifs: mapObjectifs(),
    Jours: mapJours(),
    Kpis: mapKpis(),
    Conséquences: [],
    Intro: [...novacierRuntimeCopy.roleIntroLines],
    Livre: mapLivre(),
  };
  return normalizeScenarioParamFile(raw) as ScenarioParamFileExtended;
}

export function novacierHistoireText(param: ScenarioParamFile): string {
  return [
    `# ${param.Nom}`,
    "",
    `Entreprise : ${param.Entreprise}`,
    `Mode : ${param.Mode}`,
    `Rôle : ${param.Rôle}`,
    `Secteur : ${param.Secteur}`,
    "",
    "## Intro",
    ...(param as ScenarioParamFileExtended).Intro?.map((l) => `- ${l}`) || [],
    "",
    "## Décisions",
    ...((param.Décisions as { titre?: string }[]) || []).map(
      (d, i) => `${i + 1}. ${d.titre || "Décision"}`
    ),
    "",
    "## Source",
    "Pack Étape 41 — extraction data/contextes/novacier (exemple only).",
  ].join("\n");
}

export function novacierHistoireGraph(): BookGraphView {
  return {
    nodes: [
      { id: "n-ent", label: NOVACIER_NOM, x: 40, y: 40, w: 160, h: 48 },
      { id: "n-role", label: NOVACIER_ROLE, x: 240, y: 40, w: 200, h: 48 },
      {
        id: "n-hist",
        label: "Histoire semaine",
        x: 40,
        y: 120,
        w: 180,
        h: 48,
      },
      { id: "n-dec", label: "5 décisions", x: 240, y: 120, w: 140, h: 48 },
    ],
    edges: [
      { from: "n-ent", to: "n-role" },
      { from: "n-role", to: "n-hist" },
      { from: "n-hist", to: "n-dec" },
    ],
  };
}
