/**
 * Read-only Keyber architecture model — generated from live Admin structure.
 * Never edited by hand in the Workflow > Architecture UI.
 */

import {
  COMPETENCES_CIBLEES_PROD,
  COMPETENCES_GENERALES,
} from "@/lib/competences";
import type { AgentProfile } from "@/lib/agents";
import type { AdminState } from "@/lib/adminTypes";

export type ArchBlockId =
  | "fiches"
  | "scenarios"
  | "competences"
  | "coeur"
  | "agents"
  | "moteur"
  | "gamestate"
  | "temps"
  | "sauvegarde"
  | "mode_histoire"
  | "mode_competence"
  | "ordinateur"
  | "profil"
  | "journal";

export type ArchLinkKind = "solid" | "dashed";

export type ArchBlock = {
  id: ArchBlockId;
  label: string;
  role: string;
  files: string[];
  links: string[];
  meta?: string;
};

export type ArchLink = {
  id: string;
  from: ArchBlockId;
  to: ArchBlockId;
  label: string;
  kind: ArchLinkKind;
};

export type ArchJournalEntry = {
  id: string;
  at: string;
  modification: string;
  origine: "Fiches" | "Agents" | "Compétences" | "Cœur" | "Système" | "Manuel";
};

export type ArchitectureModel = {
  blocks: ArchBlock[];
  links: ArchLink[];
  journal: ArchJournalEntry[];
  generatedAt: string;
};

const CORE_BLOCKS: ArchBlock[] = [
  {
    id: "fiches",
    label: "Fiches",
    role: "Porte d'entrée du réel — génère le Cœur",
    files: ["app/admin/fiches", "lib/adminFiches.ts", "lib/adminWorkflow.ts"],
    links: ["génère → Cœur", "référence → Compétences"],
  },
  {
    id: "scenarios",
    label: "Scénarios",
    role: "Conteneurs publiés (Histoire / Compétence)",
    files: ["app/admin/scenarios", "lib/adminSeed.ts"],
    links: ["lié à → Fiches", "projeté en → Workflow BPMN"],
  },
  {
    id: "competences",
    label: "Compétences",
    role: "Catalogue verrouillé (générales / ciblées)",
    files: ["lib/competences.ts", "app/admin/competences", "lib/competenceLocks.ts"],
    links: ["référencées par → Cœur, Fiches, Décisions"],
  },
  {
    id: "coeur",
    label: "Cœur",
    role: "Source de vérité, verrouillé (Langage Cœur)",
    files: ["lib/adminCoeur.ts", "app/admin/coeur/langage"],
    links: ["traduit en → Workflow Scénarios (BPMN)"],
  },
  {
    id: "agents",
    label: "Agents",
    role: "Testent et proposent des corrections",
    files: ["lib/agents.ts", "app/admin/coeur/agents"],
    links: ["testent → Cœur"],
  },
  {
    id: "moteur",
    label: "Moteur",
    role: "applyDecision — applique les choix",
    files: ["lib/engine.ts", "lib/decisions.ts"],
    links: ["lit / écrit → GameState"],
  },
  {
    id: "gamestate",
    label: "GameState",
    role: "État unique de la partie",
    files: ["lib/store.ts", "lib/viewModel.ts", "lib/migrateGameState.ts"],
    links: ["lu par → ERP, Dashboard, Profil, Journal"],
  },
  {
    id: "temps",
    label: "Temps & Évènements",
    role: "Horloge, urgences, pannes, messages",
    files: ["lib/evenements.ts"],
    links: ["déclenche → Messages, Alertes, Pannes"],
  },
  {
    id: "sauvegarde",
    label: "Sauvegarde Locale",
    role: "Persistance navigateur (localStorage)",
    files: ["lib/store.ts", "components/SaveIndicator.tsx"],
    links: ["sauvegarde → GameState"],
  },
  {
    id: "mode_histoire",
    label: "Mode Histoire",
    role: "Parcours scénario narratif",
    files: ["app/jouer/histoire", "app/play"],
    links: ["partage progression ↔ Mode Compétence"],
  },
  {
    id: "mode_competence",
    label: "Mode Compétence",
    role: "Entraînement ciblé par skill",
    files: ["app/jouer/competence"],
    links: ["partage progression ↔ Mode Histoire"],
  },
  {
    id: "ordinateur",
    label: "Ordinateur",
    role: "ERP, Messagerie, Dashboard, Documents, Chat, Navigateur",
    files: ["components/computer", "app/erp"],
    links: ["lit → GameState"],
  },
  {
    id: "profil",
    label: "Profil",
    role: "Progression compétences & XP",
    files: ["app/profil", "lib/progression.ts"],
    links: ["lit → GameState"],
  },
  {
    id: "journal",
    label: "Journal de bord",
    role: "Historique des décisions joueur",
    files: ["app/journal"],
    links: ["lit → GameState"],
  },
];

const CORE_LINKS: ArchLink[] = [
  {
    id: "l-fiche-coeur",
    from: "fiches",
    to: "coeur",
    label: "Fiche → génère → Cœur",
    kind: "solid",
  },
  {
    id: "l-agents-coeur",
    from: "agents",
    to: "coeur",
    label: "Agents → testent → Cœur",
    kind: "dashed",
  },
  {
    id: "l-coeur-workflow",
    from: "coeur",
    to: "scenarios",
    label: "Cœur → traduit en → Workflow Scénarios (BPMN)",
    kind: "solid",
  },
  {
    id: "l-moteur-gs",
    from: "moteur",
    to: "gamestate",
    label: "Moteur → lit / écrit → GameState",
    kind: "solid",
  },
  {
    id: "l-gs-ordi",
    from: "gamestate",
    to: "ordinateur",
    label: "GameState → lu par → ERP, Dashboard, Profil, Journal",
    kind: "solid",
  },
  {
    id: "l-modes",
    from: "mode_competence",
    to: "mode_histoire",
    label: "Mode Compétence ↔ partage progression ↔ Mode Histoire",
    kind: "solid",
  },
  {
    id: "l-temps",
    from: "temps",
    to: "ordinateur",
    label: "Temps & Évènements → déclenche → Messages, Alertes, Pannes",
    kind: "solid",
  },
  {
    id: "l-comp-coeur",
    from: "competences",
    to: "coeur",
    label: "Compétences → référencées par → Cœur, Fiches, Décisions",
    kind: "solid",
  },
  {
    id: "l-save",
    from: "sauvegarde",
    to: "gamestate",
    label: "Sauvegarde → sauvegarde → GameState",
    kind: "solid",
  },
];

export function buildArchitectureModel(state: AdminState): ArchitectureModel {
  const agents = state.agents ?? [];
  const agentNames = agents.map((a) => a.nom).join(", ") || "—";

  const blocks = CORE_BLOCKS.map((b) => {
    if (b.id === "agents") {
      return {
        ...b,
        meta: `${agents.length} agent(s) : ${agentNames}`,
        links: [
          ...b.links,
          ...agents.map((a) => `${a.nom} (${a.role})`),
        ],
      };
    }
    if (b.id === "competences") {
      return {
        ...b,
        meta: `${COMPETENCES_GENERALES.length} générales · ${COMPETENCES_CIBLEES_PROD.length} ciblées`,
        label: "Compétences (Générales / Ciblées)",
      };
    }
    if (b.id === "scenarios") {
      return {
        ...b,
        meta: `${state.scenarios.length} scénario(s)`,
      };
    }
    if (b.id === "fiches") {
      return {
        ...b,
        meta: `${state.fiches.length} fiche(s)`,
      };
    }
    if (b.id === "coeur") {
      return {
        ...b,
        meta: `${Object.keys(state.coeurs).length} Cœur(s)`,
      };
    }
    return b;
  });

  const journal = buildArchitectureJournal(state, agents);

  return {
    blocks,
    links: CORE_LINKS,
    journal,
    generatedAt: new Date().toISOString(),
  };
}

function buildArchitectureJournal(
  state: AdminState,
  agents: AgentProfile[]
): ArchJournalEntry[] {
  const entries: ArchJournalEntry[] = [];

  entries.push({
    id: "arch-seed-competences",
    at: "2026-11-08T10:00:00.000Z",
    modification: `Module Compétences — ${COMPETENCES_GENERALES.length} générales, ${COMPETENCES_CIBLEES_PROD.length} ciblées`,
    origine: "Compétences",
  });
  entries.push({
    id: "arch-seed-fiches",
    at: "2026-11-13T08:00:00.000Z",
    modification: "Ajout du module Fiches (+ Suivi Validation)",
    origine: "Fiches",
  });
  entries.push({
    id: "arch-seed-locks",
    at: "2026-11-13T20:00:00.000Z",
    modification: "Verrous IA compétences (id + indicateur + feedbacks)",
    origine: "Compétences",
  });

  for (const a of agents) {
    entries.push({
      id: `arch-agent-${a.id}`,
      at: "2026-11-10T12:00:00.000Z",
      modification: `Agent actif : ${a.nom} — ${a.role}`,
      origine: "Agents",
    });
  }

  // Recent Cœur audits as architecture-adjacent evolutions
  for (const meta of Object.values(state.coeurMeta ?? {})) {
    for (const a of (meta.audit ?? []).slice(0, 5)) {
      entries.push({
        id: `arch-coeur-${a.id}`,
        at: a.at,
        modification: a.description,
        origine:
          a.origin === "fiche"
            ? "Fiches"
            : a.origin === "agent"
              ? "Agents"
              : a.origin === "seed"
                ? "Système"
                : "Cœur",
      });
    }
  }

  return entries
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 20);
}
