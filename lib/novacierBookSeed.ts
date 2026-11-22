/**
 * Seed Studio — pack Novacier Book (Étape 41).
 * localStorage uniquement ; n'écrit pas dans lib/keyberOs.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  NOVACIER_COMPETENCE,
  NOVACIER_CREATION_ID,
  NOVACIER_FAMILY_ID,
  NOVACIER_NOM,
  NOVACIER_ROLE,
  NOVACIER_SECTEUR,
  buildNovacierHistoireParam,
  novacierHistoireGraph,
  novacierHistoireText,
  novacierParamFileName,
} from "@/lib/novacierBookPack";

const KEY_BOOK = "keyber-studio-book-v1";
const KEY_ROLES = "keyber-studio-roles-v1";
const KEY_CREATION = "keyber-studio-creation-v1";
const KEY_CATALOG = "keyber-play-catalog-v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
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

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function isNovacierEntry(e: Record<string, unknown>): boolean {
  const ent = String(e.entrepriseNom ?? "").trim().toLowerCase();
  const fam = String(e.creationFamilyId ?? "");
  return fam === NOVACIER_FAMILY_ID || ent === NOVACIER_NOM.toLowerCase();
}

export function novacierPackAlreadySeeded(): boolean {
  const book = readJson<{ entries: Record<string, unknown>[] }>(KEY_BOOK, {
    entries: [],
  });
  return (book.entries || []).some(isNovacierEntry);
}

/**
 * Injecte rôle + création minimale + cartes Book test/Live Novacier Histoire.
 */
export function seedNovacierBookPack(): {
  created: { bookEntries: number };
} {
  const at = new Date().toISOString();
  const fichier = novacierParamFileName();
  const param = buildNovacierHistoireParam(fichier) as ScenarioParamFile;
  const textContent = novacierHistoireText(param);
  const graph = novacierHistoireGraph();

  // Rôles biblio
  const rolesState = readJson<{ roles: Record<string, unknown>[] }>(KEY_ROLES, {
    roles: [],
  });
  let roles = Array.isArray(rolesState.roles) ? rolesState.roles : [];
  if (
    !roles.some(
      (r) =>
        String((r as { nom?: string }).nom || "").toLowerCase() ===
        NOVACIER_ROLE.toLowerCase()
    )
  ) {
    roles = [
      {
        id: uid("role"),
        nom: NOVACIER_ROLE,
        description:
          "Pilotage atelier + qualité + client AutoVolt — semaine critique.",
        mission: "Livrer 500 pièces qualité avant vendredi 16h.",
        createdAt: at,
      },
      ...roles,
    ];
    writeJson(KEY_ROLES, { roles });
  }

  // Création minimale (secteur obligatoire Live funnel)
  const creation = readJson<{ creations: Record<string, unknown>[] }>(
    KEY_CREATION,
    { creations: [] }
  );
  let creations = Array.isArray(creation.creations) ? creation.creations : [];
  creations = creations.filter(
    (c) =>
      String((c as { entrepriseNom?: string }).entrepriseNom || "")
        .trim()
        .toLowerCase() !== NOVACIER_NOM.toLowerCase() &&
      String((c as { id?: string }).id || "") !== NOVACIER_CREATION_ID
  );
  creations.unshift({
    id: NOVACIER_CREATION_ID,
    familyId: NOVACIER_FAMILY_ID,
    entrepriseNom: NOVACIER_NOM,
    secteur: NOVACIER_SECTEUR,
    status: "envoyee_book",
    fields: {
      "Nom de l'entreprise": NOVACIER_NOM,
      "Secteur d'activité": NOVACIER_SECTEUR,
    },
    updatedAt: at,
    createdAt: at,
  });
  writeJson(KEY_CREATION, { creations });

  // Book — retirer anciennes cartes Novacier pack uniquement
  const bookState = readJson<{ entries: Record<string, unknown>[] }>(KEY_BOOK, {
    entries: [],
  });
  let bookEntries = (bookState.entries || []).filter((e) => !isNovacierEntry(e));

  function makeEntry(status: "en_test" | "live", itemKey: string) {
    return {
      id: uid("book"),
      familyId: `${NOVACIER_FAMILY_ID}:gen:hist`,
      creationFamilyId: NOVACIER_FAMILY_ID,
      version: 1,
      mode: "histoire" as const,
      nom: param.Nom,
      entrepriseNom: NOVACIER_NOM,
      secteur: NOVACIER_SECTEUR,
      competenceName: "",
      roleName: NOVACIER_ROLE,
      roleNames: [NOVACIER_ROLE],
      competenceNames: [NOVACIER_COMPETENCE],
      status,
      fields: {
        "Nom de l'entreprise": NOVACIER_NOM,
        "Secteur d'activité": NOVACIER_SECTEUR,
      },
      sourceCreationId: NOVACIER_CREATION_ID,
      sourceScenarioId: itemKey,
      textContent,
      graph,
      paramFile: param,
      paramFileName: fichier,
      validatedAt: at,
      createdAt: at,
      updatedAt: at,
    };
  }

  const createdBook = [
    makeEntry("en_test", "hist:prod:test"),
    makeEntry("live", "hist:prod:live"),
  ];
  bookEntries = [...createdBook, ...bookEntries];
  writeJson(KEY_BOOK, { entries: bookEntries });

  // Catalogue joueur — merge Live Novacier (ne wipe pas Lumière)
  const catalog = readJson<{ entries: Record<string, unknown>[] }>(KEY_CATALOG, {
    entries: [],
  });
  let catEntries = (catalog.entries || []).filter((e) => !isNovacierEntry(e));
  const live = createdBook.filter((e) => e.status === "live");
  catEntries = [
    ...live.map((e) => ({
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
      status: "live",
    })),
    ...catEntries,
  ];
  writeJson(KEY_CATALOG, { entries: catEntries });

  return { created: { bookEntries: createdBook.length } };
}
