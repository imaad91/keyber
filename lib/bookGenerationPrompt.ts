/**
 * Book — génération du Prompt IA (structure uniquement).
 * Aucun contenu métier inventé : crochets remplis depuis imports / coches Admin.
 */

import type { AtelierCreation } from "@/lib/atelierCreationStore";
import type { AtelierBibliothequeCompetence } from "@/lib/atelierCompetencesStore";
import type { AtelierBibliothequeCours } from "@/lib/atelierCompetencesStore";
import type { AtelierEntrepriseEvent } from "@/lib/atelierEventsStore";
import { eventsFileLabel } from "@/lib/atelierEventsStore";

export function contexteFileLabel(entrepriseNom: string): string {
  const nom = entrepriseNom.trim() || "Entreprise";
  const elision = /^[aeiouyhàâäéèêëïîôùûüç]/i.test(nom);
  return elision
    ? `Fichier Contexte d'${nom}`
    : `Fichier Contexte de ${nom}`;
}

export type BookGenerationInput = {
  creation: AtelierCreation;
  events: AtelierEntrepriseEvent[];
  eventsFileName: string;
  selectedRoleNames: string[];
  selectedCompetenceNames: string[];
  /** Cours liés aux compétences cochées (pour le prompt). */
  coursByCompetence: Record<string, string[]>;
};

export type BookGenerationBlocker =
  | {
      code:
        | "no_context"
        | "no_events"
        | "empty_roles_lib"
        | "empty_competences_lib"
        | "no_role_checked"
        | "no_competence_checked";
      message: string;
    }
  | null;

export type BookGenerationRecap = {
  contexteOk: boolean;
  evenementsOk: boolean;
  evenementsCount: number;
  rolesLibOk: boolean;
  competencesLibOk: boolean;
  rolesChecked: number;
  competencesChecked: number;
  rolesOk: boolean;
  competencesOk: boolean;
  allOk: boolean;
  readyMessage: string | null;
  blocker: BookGenerationBlocker;
};

export function evaluateBookGeneration(args: {
  creation: AtelierCreation | null;
  eventsCount: number;
  rolesLibCount: number;
  competencesLibCount: number;
  selectedRoleNames: string[];
  selectedCompetenceNames: string[];
}): BookGenerationRecap {
  const nom = args.creation?.nom?.trim() || "cette entreprise";
  const hasContext = Boolean(
    args.creation &&
      (args.creation.nom?.trim() ||
        Object.values(args.creation.fields || {}).some(
          (v) => String(v ?? "").trim().length > 0
        ))
  );
  const evenementsOk = args.eventsCount > 0;
  const rolesLibOk = args.rolesLibCount > 0;
  const competencesLibOk = args.competencesLibCount > 0;
  const rolesChecked = args.selectedRoleNames.length;
  const competencesChecked = args.selectedCompetenceNames.length;
  const rolesOk = rolesChecked >= 1;
  const competencesOk = competencesChecked >= 1;

  let blocker: BookGenerationBlocker = null;
  if (!hasContext || !args.creation) {
    blocker = {
      code: "no_context",
      message: `BLOQUÉ — Le fichier Contexte pour ${nom} n'a pas été importé. Va dans Création, importe ton Excel Contexte pour ${nom}, puis reviens générer.`,
    };
  } else if (!evenementsOk) {
    blocker = {
      code: "no_events",
      message: `BLOQUÉ — Le fichier Événements pour ${nom} n'a pas été importé. Va dans le sous-onglet Événements, importe ton Excel Événements pour ${nom}, puis reviens générer.`,
    };
  } else if (!rolesLibOk) {
    blocker = {
      code: "empty_roles_lib",
      message: "BLOQUÉ — Aucun rôle importé.",
    };
  } else if (!competencesLibOk) {
    blocker = {
      code: "empty_competences_lib",
      message: "BLOQUÉ — Aucune compétence importée.",
    };
  } else if (!rolesOk) {
    blocker = {
      code: "no_role_checked",
      message:
        "BLOQUÉ — Tu n'as coché aucun rôle. Coche au moins 1 rôle.",
    };
  } else if (!competencesOk) {
    blocker = {
      code: "no_competence_checked",
      message:
        "BLOQUÉ — Tu n'as coché aucune compétence. Coche au moins 1 compétence.",
    };
  }

  const allOk =
    hasContext &&
    evenementsOk &&
    rolesLibOk &&
    competencesLibOk &&
    rolesOk &&
    competencesOk &&
    blocker === null;

  const readyMessage = allOk
    ? `Tout est prêt — Contexte OK, Événements OK (${args.eventsCount} événements), Rôles OK (${rolesChecked} rôle(s) coché(s)), Compétences OK (${competencesChecked} compétence(s) cochée(s)). Tu peux générer.`
    : null;

  return {
    contexteOk: hasContext,
    evenementsOk,
    evenementsCount: args.eventsCount,
    rolesLibOk,
    competencesLibOk,
    rolesChecked,
    competencesChecked,
    rolesOk,
    competencesOk,
    allOk,
    readyMessage,
    blocker,
  };
}

/**
 * Phrase exacte demandée — crochets remplacés, jamais laissés vides
 * (à n'appeler que si evaluateBookGeneration().allOk).
 */
export function buildBookGenerationPrompt(input: BookGenerationInput): string {
  const nom = input.creation.nom.trim();
  const fichierContexte = contexteFileLabel(nom);
  const fichierEvents =
    input.eventsFileName.trim() || eventsFileLabel(nom);
  const roles = input.selectedRoleNames.map((r) => r.trim()).filter(Boolean);
  const comps = input.selectedCompetenceNames
    .map((c) => c.trim())
    .filter(Boolean);
  const eventNoms = input.events.map((e) => e.nom.trim()).filter(Boolean);
  const n = eventNoms.length;
  const rolePrincipal = roles[0]!;

  const rolesListe = roles.join(", ");
  const compsListe = comps
    .map((c) => {
      const cours = input.coursByCompetence[c] ?? [];
      return cours.length
        ? `${c} (Cours : ${cours.join(", ")})`
        : c;
    })
    .join(", ");
  const eventsListe = eventNoms.join(", ");

  return [
    `Tu es dans le contexte ${nom}. Utilise uniquement le fichier de contexte ${fichierContexte}, avec toutes ses données. N'utilise aucun autre contexte. Utilise uniquement les rôles sélectionnés : ${rolesListe}. N'utilise aucun autre rôle. Utilise uniquement les compétences sélectionnées : ${compsListe}, avec leurs Cours. N'utilise aucune autre compétence. Utilise automatiquement tous les événements de cette entreprise, qui sont dans le fichier ${fichierEvents}, dans le sous-onglet Événements, ligne ${nom}. C'est ${n} événements : ${eventsListe}. N'invente aucun nouvel événement. N'utilise pas les événements d'une autre entreprise. Génère-moi, en provisoire, pas encore en Live : 1 scénario d'entraînement par compétence cochée, en Mode Compétence, avec Cours + Scénario très précis, et 1 histoire, en Mode Histoire, avec le rôle ${rolePrincipal}, avec les événements de cette entreprise. Pour chaque scénario, crée aussi son fichier de paramétrage, 1 scénario = 1 fichier, avec tout concaténé dedans. Mets les scénarios dans le Book, en En cours de test, dans la bonne section.`,
  ].join("");
}

export function slugForParamFile(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item";
}

export function buildParamFileName(args: {
  entrepriseNom: string;
  mode: "competence" | "histoire";
  roleOrCompetence: string;
  version: number;
}): string {
  const ent = slugForParamFile(args.entrepriseNom);
  const item = slugForParamFile(args.roleOrCompetence);
  const modePart = args.mode === "histoire" ? "histoire" : "competence";
  return `${ent}_${item}-${modePart}_v${args.version}.json`;
}

export type ScenarioParamFile = {
  Nom: string;
  Version: number;
  Type: string;
  Mode: "Compétence" | "Histoire";
  Rôle: string;
  Compétence: string;
  Secteur: string;
  Entreprise: string;
  Contexte: Record<string, string>;
  "Événements entreprise": {
    nom: string;
    type: string;
    description: string;
    /** Planification jouable (optionnel — Étape 15). */
    id?: string;
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
    consequences?: {
      cible: string;
      valeur: number;
      mode?: "add" | "set";
      setValeur?: string;
    }[];
    consequencesDeadline?: {
      cible: string;
      valeur: number;
      mode?: "add" | "set";
      setValeur?: string;
    }[];
  }[];
  "Rôles sélectionnés": string[];
  "Compétences sélectionnées": {
    nom: string;
    cours: string[];
  }[];
  Décisions: unknown[];
  Fins: unknown[];
  fichier: string;
};

export function buildSkeletonParamFile(args: {
  nom: string;
  version: number;
  mode: "competence" | "histoire";
  roleName: string;
  competenceName: string;
  secteur: string;
  entrepriseNom: string;
  contexte: Record<string, string>;
  events: AtelierEntrepriseEvent[];
  roleNames: string[];
  competences: { nom: string; cours: string[] }[];
  fichier: string;
}): ScenarioParamFile {
  return {
    Nom: args.nom,
    Version: args.version,
    Type: args.mode === "competence" ? "Scénario" : "Histoire",
    Mode: args.mode === "competence" ? "Compétence" : "Histoire",
    Rôle: args.mode === "histoire" ? args.roleName : "",
    Compétence: args.mode === "competence" ? args.competenceName : "",
    Secteur: args.secteur,
    Entreprise: args.entrepriseNom,
    Contexte: args.contexte,
    "Événements entreprise": args.events.map((e) => ({
      nom: e.nom,
      type: e.type,
      description: e.description,
      ...((e as { jour?: number }).jour != null
        ? { jour: (e as { jour?: number }).jour }
        : {}),
      ...((e as { heure?: string }).heure
        ? { heure: (e as { heure?: string }).heure }
        : {}),
      ...((e as { urgent?: boolean }).urgent
        ? { urgent: true }
        : {}),
      ...((e as { deadlineHeure?: string }).deadlineHeure
        ? {
            deadlineHeure: (e as { deadlineHeure?: string }).deadlineHeure,
          }
        : {}),
    })),
    "Rôles sélectionnés": [...args.roleNames],
    "Compétences sélectionnées": args.competences.map((c) => ({
      nom: c.nom,
      cours: [...c.cours],
    })),
    Décisions: [],
    Fins: [],
    fichier: args.fichier,
  };
}

export function filledContexteRecord(
  fields: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    const t = String(v ?? "").trim();
    if (t) out[k] = t;
  }
  return out;
}

export function coursTitlesForCompetences(
  competences: AtelierBibliothequeCompetence[],
  cours: AtelierBibliothequeCours[],
  selectedNames: string[]
): Record<string, string[]> {
  const byNom = new Map(
    competences.map((c) => [c.nom.trim().toLowerCase(), c] as const)
  );
  const out: Record<string, string[]> = {};
  for (const name of selectedNames) {
    const c = byNom.get(name.trim().toLowerCase());
    if (!c) {
      out[name] = [];
      continue;
    }
    out[name] = cours
      .filter((x) => x.competenceId === c.id)
      .slice()
      .sort((a, b) => a.ordre - b.ordre || a.titre.localeCompare(b.titre))
      .map((x) => x.titre)
      .filter(Boolean);
  }
  return out;
}
