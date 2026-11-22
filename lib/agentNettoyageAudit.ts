/**
 * Agent Nettoyage — identifie ce qu'il faut nettoyer dans l'OS Keyber.
 * Propose uniquement : ne supprime rien, ne modifie pas le Cœur, ne patch pas.
 */

import type { AgentReportIssue, AgentRunReport } from "@/lib/agents";

type Gravite = "Critique" | "Majeure" | "Mineure";

type Finding = {
  gravite: Gravite;
  fichier: string;
  ligne: string;
  extrait: string;
  pourquoi: string;
  proposition: string;
};

/** Catalogue d'audit OS (scan Studio) — propositions seulement. */
const FINDINGS: Finding[] = [
  {
    gravite: "Critique",
    fichier: "lib/playContent.ts",
    ligne: "6–19",
    extrait: 'import { decisionForDay } from "@/data/scenarioNovacier"',
    pourquoi:
      "Le bridge joueur est câblé en dur sur Novacier — l'OS ne peut pas charger un 2ᵉ scénario.",
    proposition:
      "Remplacer par getScenario(id).decisions / data/scenarios/<id>/ — déplacer le bridge Novacier vers data/scenarios/novacier/.",
  },
  {
    gravite: "Critique",
    fichier: "lib/computerData.ts",
    ligne: "1–450+",
    extrait: "/** Novacier seed data for Accès Ordinateur apps */",
    pourquoi:
      "Ordinateur / ERP seed = données d'exemple dans un module consommé comme OS.",
    proposition:
      "Déplacer ce bloc vers data/scenarios/novacier/computerData.ts et charger via getScenario(id).computer.",
  },
  {
    gravite: "Critique",
    fichier: "lib/runtime.ts",
    ligne: "38, 149, 154, 184+",
    extrait: "Victoire — contrat AutoVolt tenu / Novacier tient",
    pourquoi:
      "Textes de fin et Jour 0 hardcodés Novacier/AutoVolt/Marie dans le runtime OS.",
    proposition:
      "Déplacer ces strings vers data/scenarios/novacier/runtimeCopy.ts ; runtime lit getScenario(id).",
  },
  {
    gravite: "Critique",
    fichier: "lib/gameState.ts",
    ligne: "65, 168, 429",
    extrait: 'confianceClient // AutoVolt-like ; "Novacier Jour 3"',
    pourquoi:
      "Commentaires et labels de meta encore collés à Novacier/AutoVolt dans le modèle OS.",
    proposition:
      "Garder des noms génériques (confianceClient, meta.titreJour) ; labels scénario dans data/scenarios/novacier/.",
  },
  {
    gravite: "Majeure",
    fichier: "app/admin/fiches/",
    ligne: "module entier",
    extrait: "Ancien module Fiches hors des 4 espaces Studio",
    pourquoi:
      "Code Admin mort / doublon : Fiches isolées vs Atelier Contextes → Compétences → Scénarios.",
    proposition:
      "Supprimer ou rediriger définitivement ; ne plus maintenir l'UI Fiches isolée.",
  },
  {
    gravite: "Majeure",
    fichier: "app/admin/workflow/",
    ligne: "module entier",
    extrait: "Ancien Workflow (scenarios, glossaire, journal…)",
    pourquoi:
      "Doublon avec Système + Atelier — confusion navigation et maintenance.",
    proposition:
      "Laisser redirects next.config ; supprimer pages mortes quand safe.",
  },
  {
    gravite: "Majeure",
    fichier: "app/admin/coeur/",
    ligne: "module entier",
    extrait: "Ancien Cœur / Agents / Rapport sous /admin/coeur",
    pourquoi:
      "Doublon Contrôle + Système/Cœur — anciens boutons et kanbans possibles.",
    proposition:
      "Supprimer après confirmation redirects ; agents uniquement sous /admin/controle/agents.",
  },
  {
    gravite: "Majeure",
    fichier: "lib/agentAppAudits.ts",
    ligne: "~108",
    extrait: "historique mentions keyber-admin-v1 (corrigé studio)",
    pourquoi:
      "Ancienne clé localStorage keyber-admin-v1 = mélange Studio/jeu à bannir définitivement.",
    proposition:
      "Garantir zéro écriture keyber-admin-v1 ; documenter dans KEYBER_OS_RULES.md.",
  },
  {
    gravite: "Majeure",
    fichier: "app/admin/systeme/architecture/page.tsx",
    ligne: "10",
    extrait: 'Atelier (Briefs)" — libellé obsolète',
    pourquoi:
      "Architecture encore wordée Briefs alors que Atelier = Contextes → Compétences → Scénarios.",
    proposition:
      "Remplacer le libellé par Atelier (Contextes → Compétences → Scénarios).",
  },
  {
    gravite: "Mineure",
    fichier: "lib/atelierBriefs.ts",
    ligne: "fichier",
    extrait: "Ancien modèle Briefs markdown",
    pourquoi:
      "Code mort potentiel si plus aucune page Briefs ne l'importe (redirects).",
    proposition:
      "Supprimer si unused ; sinon archiver sous content/legacy/.",
  },
  {
    gravite: "Mineure",
    fichier: "content/fiches/*.md",
    ligne: "fiches",
    extrait: "Briefs markdown Novacier / Atelier Nord",
    pourquoi:
      "Contenu exemple OK en data, mais à clarifier vs Contextes Atelier seed.",
    proposition:
      "Déplacer vers data/scenarios/novacier/briefs/ ou fusionner dans Atelier Contextes.",
  },
  {
    gravite: "Mineure",
    fichier: "app/admin/competences/",
    ligne: "module",
    extrait: "Ancien module Compétences isolé",
    pourquoi:
      "Doublon avec /admin/atelier/competences (couche 2).",
    proposition:
      "Supprimer UI isolée ; redirects déjà vers Atelier.",
  },
  {
    gravite: "Mineure",
    fichier: "app/admin/bibliotheque|entreprises|personnages|consultants",
    ligne: "modules",
    extrait: "Anciens modules hors 4 espaces",
    pourquoi:
      "Navigation morte / confusion Studio.",
    proposition:
      "Supprimer pages après redirects stables.",
  },
  {
    gravite: "Critique",
    fichier: "data/scenarioNovacier.ts (via play)",
    ligne: "décisions J1–J5",
    extrait: "500 pièces, Machine 3, personnages démo",
    pourquoi:
      "Normal en data scénario — problème si réimporté dans lib/engine ou components génériques.",
    proposition:
      "Garder sous data/scenarios/novacier/ ; OS appelle getScenario('novacier') uniquement.",
  },
  {
    gravite: "Majeure",
    fichier: "components/computer/* + components/erp/*",
    ligne: "UI",
    extrait: "Consommation probable de computerData Novacier",
    pourquoi:
      "Si les composants Ordinateur/ERP importent computerData directement, l'OS dépend de l'exemple.",
    proposition:
      "Injecter les données via props / getScenario(id).computer — déplacer seeds Novacier.",
  },
];

function prioriteOf(g: Gravite): AgentReportIssue["priorite"] {
  if (g === "Critique") return "haute";
  if (g === "Majeure") return "moyenne";
  return "basse";
}

function planSteps(issues: AgentReportIssue[]): string {
  const c = issues.filter((i) => i.priorite === "haute").length;
  const m = issues.filter((i) => i.priorite === "moyenne").length;
  const n = issues.filter((i) => i.priorite === "basse").length;
  return [
    `Étape 1 — Critique (${c}) : détacher playContent / computerData / runtime copy de Novacier vers data/scenarios/novacier/.`,
    `Étape 2 — Majeure (${m}) : retirer modules Admin morts (fiches, workflow, coeur legacy) et clarifier Architecture.`,
    `Étape 3 — Mineure (${n}) : purger leftovers briefs/bibliothèque et documenter KEYBER_OS_RULES.md.`,
    `Estimation démo : si on DÉPLACE (pas delete) les données Novacier vers data/scenarios/novacier/, la démo Novacier continue de fonctionner.`,
  ].join(" ");
}

/** Scan OS — propositions de nettoyage uniquement. */
export function runNettoyageAudit(): AgentRunReport {
  const ordered = [...FINDINGS].sort((a, b) => {
    const rank = { Critique: 0, Majeure: 1, Mineure: 2 };
    return rank[a.gravite] - rank[b.gravite];
  });

  const issues: AgentReportIssue[] = ordered.map((f) => ({
    priorite: prioriteOf(f.gravite),
    titre: `[${f.gravite}] ${f.fichier}:${f.ligne}`,
    detail: `${f.extrait} — ${f.pourquoi}`,
    solution: f.proposition,
    nodeId: f.fichier,
  }));

  issues.unshift({
    priorite: "basse",
    titre: "Plan de nettoyage (3 étapes)",
    detail: planSteps(issues),
    solution:
      "Exécuter Étape 1 → 2 → 3 manuellement / via Cursor. L'agent Nettoyage ne supprime rien.",
  });

  const critiques = issues.filter((i) => i.priorite === "haute").length;
  const majeures = issues.filter((i) => i.priorite === "moyenne").length;
  const mineures = issues.filter(
    (i) => i.priorite === "basse" && !i.titre.startsWith("Plan")
  ).length;
  const penalty = critiques * 12 + majeures * 6 + mineures * 2;
  const score = Math.max(0, Math.min(100, 100 - penalty));

  issues.push({
    priorite: "basse",
    titre: `Score propreté OS ${score}/100 — ${ordered.length} éléments à nettoyer`,
    detail: `Critique ${critiques} · Majeure ${majeures} · Mineure ${mineures}. Réf. KEYBER_OS_RULES.md`,
    solution:
      "Après nettoyage Critique, relancer cet agent pour mesurer le nouveau score.",
  });

  return {
    agentId: "nettoyage", // CLEO
    score,
    issues,
    ranAt: new Date().toISOString(),
  };
}
