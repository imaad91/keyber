/**
 * Workflow > Journal des décisions — mémoire du « pourquoi ».
 * Append-only : une fois enregistrée, une décision n'est plus modifiable ni supprimable.
 */

import { uid } from "@/lib/adminTypes";

export type JournalModuleLie =
  | "Cœur"
  | "Workflow"
  | "Compétences"
  | "Fiches"
  | "Agents"
  | "Architecture"
  | "Glossaire"
  | "Système";

export type JournalDecision = {
  id: string;
  date: string; // ISO
  titre: string;
  decision: string;
  pourquoi: string;
  consequenceSiChange: string;
  moduleLie: JournalModuleLie;
  moduleHref?: string;
  locked: true;
  seed?: boolean;
};

const D = "2026-11-13T10:00:00.000Z";

export function seedJournalDecisions(): JournalDecision[] {
  return [
    {
      id: "jd-coeur-verrouille",
      date: D,
      titre: "Le Cœur est verrouillé",
      decision:
        "Le Cœur est en lecture seule, pas de copier / coller / exporter.",
      pourquoi:
        "Parce que c'est l'essence de Keyber, si on peut le copier, on peut copier Keyber.",
      consequenceSiChange:
        "Si on déverrouille, l'IA peut corrompre le Cœur.",
      moduleLie: "Cœur",
      moduleHref: "/admin/systeme/coeur",
      locked: true,
      seed: true,
    },
    {
      id: "jd-workflow-lecture",
      date: "2026-11-13T11:00:00.000Z",
      titre: "Workflow en lecture seule",
      decision:
        "Dans Système, je suis en lecture seule — aucune modification de l'OS.",
      pourquoi:
        "Parce que Système, c'est pour comprendre KEYBER, pas pour toucher. Je paramètre uniquement dans Équipe.",
      consequenceSiChange:
        "Si on autorise l'édition dans Système, on casse la séparation Studio / jeu et on risque des edits hors process.",
      moduleLie: "Architecture",
      moduleHref: "/admin/systeme/architecture",
      locked: true,
      seed: true,
    },
    {
      id: "jd-rester-local",
      date: "2026-11-13T12:00:00.000Z",
      titre: "On reste en local",
      decision: "On reste en localStorage, pas de Supabase pour le POC.",
      pourquoi:
        "Pour tester plus vite, sans dépendance cloud. On branchera Supabase plus tard pour les testeurs.",
      consequenceSiChange:
        "Passer trop tôt au cloud ralentit le POC et ajoute des dépendances avant que le modèle métier soit stable.",
      moduleLie: "Système",
      moduleHref: "/admin/systeme/architecture",
      locked: true,
      seed: true,
    },
    {
      id: "jd-competences-split",
      date: "2026-11-13T13:00:00.000Z",
      titre: "Compétences Générales vs Ciblées",
      decision:
        "On distingue Générales (transversales) et Ciblées (techniques, précises, liées à un rôle).",
      pourquoi:
        "Parce que le public est très compétent, il faut de la précision, pas du vague.",
      consequenceSiChange:
        "Fusionner les deux types ramène du feedback vague et casse la traçabilité indicateur.",
      moduleLie: "Compétences",
      moduleHref: "/admin/systeme/competences",
      locked: true,
      seed: true,
    },
    {
      id: "jd-fiche-riche",
      date: "2026-11-13T14:00:00.000Z",
      titre: "Fiche riche et complète",
      decision: "La Fiche doit être riche et complète, pas courte.",
      pourquoi:
        "Parce que la valeur de Keyber, c'est le réel. Si la Fiche est pauvre, le scénario sonne faux.",
      consequenceSiChange:
        "Des fiches courtes produisent des Cœurs génériques et des décisions peu crédibles.",
      moduleLie: "Fiches",
      moduleHref: "/admin/atelier/briefs",
      locked: true,
      seed: true,
    },
  ];
}

export function mergeJournalDecisions(
  saved: JournalDecision[] | undefined,
  seed: JournalDecision[]
): JournalDecision[] {
  const byId = new Map<string, JournalDecision>();
  for (const d of seed) byId.set(d.id, d);
  for (const d of saved ?? []) {
    if (!d?.id) continue;
    // Never unlock or rewrite a locked decision's core fields from a corrupted save
    const prev = byId.get(d.id);
    if (prev?.locked) {
      byId.set(d.id, { ...prev, ...d, locked: true, id: prev.id });
    } else {
      byId.set(d.id, { ...d, locked: true });
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function createLockedJournalDecision(input: {
  titre: string;
  decision: string;
  pourquoi: string;
  consequenceSiChange: string;
  moduleLie: JournalModuleLie;
  moduleHref?: string;
}): JournalDecision {
  return {
    id: uid("jd"),
    date: new Date().toISOString(),
    titre: input.titre.trim(),
    decision: input.decision.trim(),
    pourquoi: input.pourquoi.trim(),
    consequenceSiChange: input.consequenceSiChange.trim(),
    moduleLie: input.moduleLie,
    moduleHref: input.moduleHref,
    locked: true,
    seed: false,
  };
}

export const JOURNAL_MODULE_HREFS: Record<JournalModuleLie, string> = {
  Cœur: "/admin/systeme/coeur",
  Workflow: "/admin/atelier/scenarios",
  Compétences: "/admin/systeme/competences",
  Fiches: "/admin/atelier/briefs",
  Agents: "/admin/controle/agents",
  Architecture: "/admin/systeme/architecture",
  Glossaire: "/admin/systeme/glossaire",
  Système: "/admin/systeme/architecture",
};
