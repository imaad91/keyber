/**
 * Seed Studio localStorage — démo Lumière & Co (sans toucher AgriBio / Novacier).
 * À appeler côté client uniquement.
 */

import { uid } from "@/lib/adminTypes";
import { emptyCompetenceFields, emptyCoursFields } from "@/lib/atelierCompetencesExcel";
import { emptyRoleFields } from "@/lib/atelierRolesExcel";
import { buildParamFileName } from "@/lib/bookGenerationPrompt";
import {
  LUMIERE_COMPETENCE,
  LUMIERE_COURS,
  LUMIERE_CREATION_ID,
  LUMIERE_FAMILY_ID,
  LUMIERE_NOM,
  LUMIERE_ROLE,
  LUMIERE_SECTEUR,
  lumiereCompetenceGraph,
  lumiereCompetenceParam,
  lumiereCompetenceText,
  lumiereContexteFields,
  lumiereEvents,
  lumiereHistoireGraph,
  lumiereHistoireParam,
  lumiereHistoireText,
} from "@/lib/lumiereCoDemoData";

const KEY_CREATION = "keyber-studio-creation-v1";
const KEY_EVENTS = "keyber-studio-evenements-v1";
const KEY_ROLES = "keyber-studio-roles-v1";
const KEY_COMPETENCES = "keyber-studio-competences-v1";
const KEY_BOOK = "keyber-studio-book-v1";

function now() {
  return new Date().toISOString();
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function isProtectedEntreprise(nom: string) {
  const n = nom.trim().toLowerCase();
  return n === "novacier" || n === "agribio";
}

export type LumiereSeedResult = {
  ok: true;
  created: {
    creation: boolean;
    events: number;
    roles: boolean;
    competences: boolean;
    bookEntries: number;
  };
};

/**
 * Injecte Lumière & Co dans Création, Événements, bibliothèques (si besoin) et Book
 * (En cours de test + Live). Ne modifie / ne supprime jamais Novacier ni AgriBio.
 */
export function seedLumiereCoDemo(): LumiereSeedResult {
  if (typeof window === "undefined") {
    throw new Error("seedLumiereCoDemo côté client uniquement");
  }

  const at = now();
  const fields = lumiereContexteFields();
  const eventSeeds = lumiereEvents();
  const eventSummaries = eventSeeds.map((e) => ({
    nom: e.nom,
    type: e.type,
    description: e.description,
  }));
  const contexteRecord: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (String(v).trim()) contexteRecord[k] = String(v);
  }

  // —— Création ——
  const creationState = readJson<{ creations: Record<string, unknown>[] }>(
    KEY_CREATION,
    { creations: [] }
  );
  const creations = Array.isArray(creationState.creations)
    ? creationState.creations
    : [];
  const alreadyCreation = creations.some(
    (c) =>
      String((c as { id?: string }).id) === LUMIERE_CREATION_ID ||
      String((c as { familyId?: string }).familyId) === LUMIERE_FAMILY_ID
  );
  if (!alreadyCreation) {
    creations.unshift({
      id: LUMIERE_CREATION_ID,
      familyId: LUMIERE_FAMILY_ID,
      version: 1,
      nom: LUMIERE_NOM,
      secteur: LUMIERE_SECTEUR,
      fields,
      roleNames: [LUMIERE_ROLE],
      competenceNames: [LUMIERE_COMPETENCE],
      scenarios: [],
      dansBook: true,
      bookEntryId: null,
      timeline: [
        {
          id: uid("tl"),
          milestoneId: "excel_valide",
          label: "Excel Contexte importé, validé.",
          at,
        },
        {
          id: uid("tl"),
          milestoneId: "roles_selectionnes",
          label: "Rôles sélectionnés.",
          at,
        },
        {
          id: uid("tl"),
          milestoneId: "competences_selectionnees",
          label: "Compétences sélectionnées.",
          at,
        },
        {
          id: uid("tl"),
          milestoneId: "prototype_book",
          label: "Prototype validé, envoyé dans le Book.",
          at,
        },
      ],
      createdAt: at,
      updatedAt: at,
    });
    writeJson(KEY_CREATION, { creations });
  }

  // —— Événements (purge seulement les events Lumière, pas AgriBio/Novacier) ——
  const eventsState = readJson<{ events: Record<string, unknown>[] }>(
    KEY_EVENTS,
    { events: [] }
  );
  let events = Array.isArray(eventsState.events) ? eventsState.events : [];
  events = events.filter((e) => {
    const nom = String((e as { entrepriseNom?: string }).entrepriseNom ?? "");
    const fam = String((e as { familyId?: string }).familyId ?? "");
    if (fam === LUMIERE_FAMILY_ID) return false;
    if (nom.trim().toLowerCase() === LUMIERE_NOM.toLowerCase()) return false;
    return true;
  });
  const newEvents = eventSeeds.map((seed) => ({
    id: uid("evtlib"),
    familyId: LUMIERE_FAMILY_ID,
    entrepriseNom: LUMIERE_NOM,
    nom: seed.nom,
    type: seed.type,
    description: seed.description,
    fields: seed.fields,
    createdAt: at,
    updatedAt: at,
  }));
  events = [...newEvents, ...events];
  writeJson(KEY_EVENTS, { events });

  // —— Rôles (ajoute Logisticien si absent) ——
  const rolesState = readJson<{ roles: Record<string, unknown>[] }>(KEY_ROLES, {
    roles: [],
  });
  const roles = Array.isArray(rolesState.roles) ? rolesState.roles : [];
  let rolesAdded = false;
  if (
    !roles.some(
      (r) =>
        String((r as { nom?: string }).nom ?? "")
          .trim()
          .toLowerCase() === LUMIERE_ROLE.toLowerCase()
    )
  ) {
    const rf = emptyRoleFields();
    rf["Nom du rôle"] = LUMIERE_ROLE;
    rf["Description complète"] =
      "Pilote stocks, picking et expéditions chez un e-commerçant luminaires.";
    rf["Mission principale"] =
      "Garantir les délais J+2 et la disponibilité des SKU top.";
    roles.unshift({
      id: uid("role"),
      nom: LUMIERE_ROLE,
      description: rf["Description complète"],
      mission: rf["Mission principale"],
      fields: rf,
      createdAt: at,
      updatedAt: at,
    });
    rolesAdded = true;
    writeJson(KEY_ROLES, { roles });
  }

  // —— Compétences + Cours ——
  const compState = readJson<{
    competences: Record<string, unknown>[];
    cours: Record<string, unknown>[];
  }>(KEY_COMPETENCES, { competences: [], cours: [] });
  const competences = Array.isArray(compState.competences)
    ? compState.competences
    : [];
  const cours = Array.isArray(compState.cours) ? compState.cours : [];
  let competencesAdded = false;
  let competenceId = String(
    (
      competences.find(
        (c) =>
          String((c as { nom?: string }).nom ?? "")
            .trim()
            .toLowerCase() === LUMIERE_COMPETENCE.toLowerCase()
      ) as { id?: string } | undefined
    )?.id ?? ""
  );
  if (!competenceId) {
    competenceId = uid("comp");
    const cf = emptyCompetenceFields();
    cf["Nom de la compétence"] = LUMIERE_COMPETENCE;
    cf["Catégorie"] = "Supply Chain";
    cf["Type (Transverse ou Ciblée)"] = "Ciblée";
    cf["Description complète"] =
      "Calculer les besoins et décider un réapprovisionnement fiable.";
    competences.unshift({
      id: competenceId,
      nom: LUMIERE_COMPETENCE,
      categorie: "Supply Chain",
      type: "Ciblée",
      description: cf["Description complète"],
      fields: cf,
      createdAt: at,
      updatedAt: at,
    });
    const courseFields = emptyCoursFields();
    courseFields["Nom de la compétence liée"] = LUMIERE_COMPETENCE;
    courseFields["Titre du cours"] = LUMIERE_COURS;
    courseFields["Description en 1 phrase"] =
      "Bases du MRP appliquées aux stocks e-commerce.";
    courseFields["Niveau (Débutant / Intermédiaire / Expert)"] = "Débutant";
    courseFields["Ordre dans la compétence"] = "1";
    cours.unshift({
      id: uid("cours"),
      competenceId,
      titre: LUMIERE_COURS,
      description: courseFields["Description en 1 phrase"],
      niveau: "Débutant",
      ordre: 1,
      fields: courseFields,
      createdAt: at,
      updatedAt: at,
    });
    competencesAdded = true;
    writeJson(KEY_COMPETENCES, { competences, cours });
  }

  // —— Book : 4 cartes (test + live × compétence + histoire) ——
  const bookState = readJson<{ entries: Record<string, unknown>[] }>(KEY_BOOK, {
    entries: [],
  });
  let bookEntries = Array.isArray(bookState.entries) ? bookState.entries : [];
  // Retirer uniquement les anciennes cartes Lumière (pas AgriBio / Novacier)
  bookEntries = bookEntries.filter((e) => {
    const ent = String((e as { entrepriseNom?: string }).entrepriseNom ?? "");
    const fam = String((e as { creationFamilyId?: string }).creationFamilyId ?? "");
    if (fam === LUMIERE_FAMILY_ID) return false;
    if (ent.trim().toLowerCase() === LUMIERE_NOM.toLowerCase()) return false;
    if (isProtectedEntreprise(ent)) return true;
    return true;
  });

  const fileComp = buildParamFileName({
    entrepriseNom: LUMIERE_NOM,
    mode: "competence",
    roleOrCompetence: LUMIERE_COMPETENCE,
    version: 1,
  });
  const fileHist = buildParamFileName({
    entrepriseNom: LUMIERE_NOM,
    mode: "histoire",
    roleOrCompetence: LUMIERE_ROLE,
    version: 1,
  });

  const paramComp = lumiereCompetenceParam(
    eventSummaries,
    contexteRecord,
    fileComp
  );
  const paramHist = lumiereHistoireParam(
    eventSummaries,
    contexteRecord,
    fileHist
  );

  function makeEntry(args: {
    itemKey: string;
    mode: "competence" | "histoire";
    nom: string;
    status: "en_test" | "live";
    textContent: string;
    graph: ReturnType<typeof lumiereCompetenceGraph>;
    paramFile: typeof paramComp;
    paramFileName: string;
  }) {
    return {
      id: uid("book"),
      familyId: `${LUMIERE_FAMILY_ID}:gen:${args.itemKey}`,
      creationFamilyId: LUMIERE_FAMILY_ID,
      version: 1,
      mode: args.mode,
      nom: args.nom,
      entrepriseNom: LUMIERE_NOM,
      secteur: LUMIERE_SECTEUR,
      competenceName:
        args.mode === "competence" ? LUMIERE_COMPETENCE : "",
      roleName: args.mode === "histoire" ? LUMIERE_ROLE : "",
      roleNames: [LUMIERE_ROLE],
      competenceNames: [LUMIERE_COMPETENCE],
      status: args.status,
      fields,
      sourceCreationId: LUMIERE_CREATION_ID,
      sourceScenarioId: args.itemKey,
      textContent: args.textContent,
      graph: args.graph,
      paramFile: args.paramFile,
      paramFileName: args.paramFileName,
      validatedAt: at,
      createdAt: at,
      updatedAt: at,
    };
  }

  const createdBook = [
    makeEntry({
      itemKey: "comp:planification-mrp:test",
      mode: "competence",
      nom: `Entraînement — ${LUMIERE_COMPETENCE}`,
      status: "en_test",
      textContent: lumiereCompetenceText(),
      graph: lumiereCompetenceGraph(),
      paramFile: paramComp,
      paramFileName: fileComp,
    }),
    makeEntry({
      itemKey: "hist:logisticien:test",
      mode: "histoire",
      nom: `Histoire — ${LUMIERE_ROLE}`,
      status: "en_test",
      textContent: lumiereHistoireText(),
      graph: lumiereHistoireGraph(),
      paramFile: paramHist,
      paramFileName: fileHist,
    }),
    makeEntry({
      itemKey: "comp:planification-mrp:live",
      mode: "competence",
      nom: `Entraînement — ${LUMIERE_COMPETENCE}`,
      status: "live",
      textContent: lumiereCompetenceText(),
      graph: lumiereCompetenceGraph(),
      paramFile: { ...paramComp, fichier: fileComp },
      paramFileName: fileComp,
    }),
    makeEntry({
      itemKey: "hist:logisticien:live",
      mode: "histoire",
      nom: `Histoire — ${LUMIERE_ROLE}`,
      status: "live",
      textContent: lumiereHistoireText(),
      graph: lumiereHistoireGraph(),
      paramFile: { ...paramHist, fichier: fileHist },
      paramFileName: fileHist,
    }),
  ];

  bookEntries = [...createdBook, ...bookEntries];
  writeJson(KEY_BOOK, { entries: bookEntries });

  // Catalogue joueur (hors studio) — uniquement Live
  const liveOnly = createdBook.filter((e) => e.status === "live");
  writeJson("keyber-play-catalog-v1", {
    entries: liveOnly.map((e) => ({
      id: e.id,
      familyId: e.familyId,
      version: e.version,
      mode: e.mode,
      nom: e.nom,
      entrepriseNom: e.entrepriseNom,
      secteur: e.secteur,
      competenceName: e.competenceName,
      roleName: e.roleName,
      paramFileName: e.paramFileName,
      paramFile: e.paramFile,
      textContent: e.textContent,
      status: e.status,
      updatedAt: e.updatedAt,
    })),
  });

  // Invalider les singletons in-memory (prochain chargement reprend le LS)
  const w = window as unknown as {
    __keyberBookStoreV1?: unknown;
    __keyberEventsStoreV1?: unknown;
  };
  delete w.__keyberBookStoreV1;
  delete w.__keyberEventsStoreV1;

  return {
    ok: true,
    created: {
      creation: !alreadyCreation,
      events: newEvents.length,
      roles: rolesAdded,
      competences: competencesAdded,
      bookEntries: createdBook.length,
    },
  };
}

export function lumiereDemoAlreadySeeded(): boolean {
  if (typeof window === "undefined") return false;
  const creationState = readJson<{ creations: { familyId?: string }[] }>(
    KEY_CREATION,
    { creations: [] }
  );
  const bookState = readJson<{ entries: { entrepriseNom?: string }[] }>(
    KEY_BOOK,
    { entries: [] }
  );
  const hasCreation = (creationState.creations || []).some(
    (c) => c.familyId === LUMIERE_FAMILY_ID
  );
  const hasBook = (bookState.entries || []).some(
    (e) =>
      String(e.entrepriseNom ?? "").trim().toLowerCase() ===
      LUMIERE_NOM.toLowerCase()
  );
  return hasCreation && hasBook;
}
