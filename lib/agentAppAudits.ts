/**
 * App-level agent audits (Orchestra = architecture, Ergonomie = UX).
 * Admin-only simulated scans — does not touch player runtime.
 */

import type { AgentReportIssue, AgentRunReport } from "@/lib/agents";
import type { ScenarioCoeur } from "@/lib/adminCoeur";
import type { AdminState } from "@/lib/adminTypes";
import {
  evaluateImpactPrecision,
  normalizeLockedImpact,
} from "@/lib/competenceLocks";

function scoreFromIssues(issues: AgentReportIssue[]): number {
  const penalty = issues.reduce(
    (s, i) =>
      s +
      (i.priorite === "haute" ? 18 : i.priorite === "moyenne" ? 10 : 4),
    0
  );
  return Math.max(0, Math.min(100, 100 - penalty));
}

/** Orchestra — architecture & coherence of the whole application. */
export function runOrchestraAudit(
  state: AdminState,
  coeur: ScenarioCoeur
): AgentRunReport {
  const issues: AgentReportIssue[] = [];

  // Cœur as single source of truth
  const sliceDecs = state.decisions.filter(
    (d) => d.scenarioId === coeur.scenario.id
  );
  if (sliceDecs.length > 0 && sliceDecs.length !== coeur.decisions.length) {
    issues.push({
      priorite: "haute",
      titre: "Divergence Cœur ↔ slices décisions",
      detail: `Cœur ${coeur.scenario.id} : ${coeur.decisions.length} décisions vs ${sliceDecs.length} dans AdminDecision. Violation « Une seule vérité = Cœur ».`,
      solution:
        "Fichier lib/adminStore.ts — resynchroniser via syncSlicesFromCoeur ; ne plus éditer les slices hors commit Cœur.",
      nodeId: coeur.scenario.id,
    });
  }

  // Hardcoded / dual sources
  issues.push({
    priorite: "moyenne",
    titre: "Données en dur : scénario joueur parallèle au Cœur Admin",
    detail:
      "data/scenarioNovacier.ts duplique décisions / compétencesImpactees à côté de lib/adminCoeur.ts (novacierCoeur). Risque de dérive.",
    solution:
      "Fichier data/scenarioNovacier.ts — faire du Cœur Admin la source unique et projeter le runtime joueur depuis ce Cœur.",
  });

  issues.push({
    priorite: "basse",
    titre: "GameState initial figé dans emptyCoeur / defaultGameStateInitial",
    detail:
      "lib/adminCoeur.ts — tresorerie: 420_000, stock: 850, etc. en dur dans defaultGameStateInitial().",
    solution:
      "lib/adminCoeur.ts — dériver gameStateInitial depuis la Fiche / entreprise quand possible.",
  });

  // Competences precision
  let imprecise = 0;
  for (const d of coeur.decisions) {
    for (const c of d.choix) {
      for (const imp of c.competencesImpactees ?? []) {
        const { statut, erreurs } = evaluateImpactPrecision(
          d.dilemme,
          normalizeLockedImpact(imp)
        );
        if (statut !== "precis") {
          imprecise++;
          if (imprecise <= 4) {
            issues.push({
              priorite: statut === "incoherent" ? "haute" : "moyenne",
              titre: "Compétence non verrouillée précisément",
              detail: `${d.titre} / ${c.label} — ${erreurs.join(" ; ") || statut}`,
              solution:
                "Cœur — renseigner competenceId catalogue + indicateurTeste + feedbackSiReussi/Echoue.",
              nodeId: d.id,
            });
          }
        }
      }
      if (!c.competencesImpactees?.length) {
        // only flag a sample
      }
    }
  }
  if (imprecise > 4) {
    issues.push({
      priorite: "moyenne",
      titre: `${imprecise} impacts compétences imprécis au total`,
      detail:
        "Plusieurs choix du Cœur n'ont pas le couple indicateur + feedbacks duals exigé.",
      solution: "Passer tous les impacts par validateLockedImpact avant retenir_publie.",
    });
  }

  // Save local vs cloud
  issues.push({
    priorite: "basse",
    titre: "Sauvegarde : localStorage seul (POC)",
    detail:
      "lib/adminStore.ts STORAGE_KEY keyber-admin-v1 + lib/store.ts joueur — pas de couche cloud. Conforme Journal « Rester en local », mais le mélange futur Supabase doit rester séparé.",
    solution:
      "Prévoir un adaptateur SaveAdapter (local | cloud) sans mélanger les clés dans un même namespace.",
  });

  // Read/write separation
  issues.push({
    priorite: "moyenne",
    titre: "Workflow Glossaire éditable vs principe lecture seule Workflow",
    detail:
      "Journal des décisions affirme « Workflow = lecture seule », mais /admin/workflow/glossaire autorise Enregistrer / Ajouter / Supprimer.",
    solution:
      "Soit documenter une exception Glossaire dans le Journal, soit déplacer l'édition hors Workflow.",
  });

  // Engine / GameState
  issues.push({
    priorite: "basse",
    titre: "Moteur applyDecision → GameState : OK (contrat)",
    detail:
      "lib/engine.ts + lib/store.ts — le joueur lit GameState via viewModel ; ERP/Dashboard/Profil/Journal consomment le store. Aucune écriture UI directe détectée dans le contrat Admin.",
    solution: "Maintenir l'interdiction d'écrire le GameState depuis les composants UI.",
  });

  // Agents dependency
  if ((state.agents?.length ?? 0) < 6) {
    issues.push({
      priorite: "haute",
      titre: "Agents seed incomplets dans localStorage",
      detail: `Seulement ${state.agents?.length ?? 0} agent(s) chargés — Orchestra/Ergonomie peuvent manquer si merge seed absente.`,
      solution: "lib/adminStore.ts loadState — fusionner DEFAULT_AGENTS manquants par id.",
    });
  }

  // Circular / rebuild stripping (known past bug)
  issues.push({
    priorite: "moyenne",
    titre: "Dépendance rebuildCoeurFromSlices ↔ AdminChoice",
    detail:
      "Historique : adminDecisionToCoeur omettait competencesImpactees → Cœur appauvri. Mitigé, mais la dépendance slices↔Cœur reste fragile.",
    solution:
      "lib/adminCoeur.ts — garder competencesImpactees obligatoires sur AdminChoice ; tests de non-régression.",
  });

  // Fiche → Cœur loss
  const fiche = state.fiches.find((f) => f.scenarioId === coeur.scenario.id);
  if (fiche && coeur.decisions.length === 0) {
    issues.push({
      priorite: "haute",
      titre: "Fiche sans Cœur peuplé",
      detail: `Fiche ${fiche.id} liée au scénario ${coeur.scenario.id} mais Cœur.decisions = [].`,
      solution:
        "Générer le Cœur depuis la Fiche (generateCoeurFromFiche) avant tests.",
    });
  }

  return {
    agentId: "agent-orchestra",
    score: scoreFromIssues(issues),
    issues,
    ranAt: new Date().toISOString(),
  };
}

/** Ergonomie — UX / prise en main joueur + admin. */
export function runErgonomieAudit(state: AdminState): AgentRunReport {
  const issues: AgentReportIssue[] = [];

  issues.push({
    priorite: "moyenne",
    titre: "Page Fiche détail : charge cognitive élevée",
    detail:
      "app/admin/fiches/[id] — 4 sections riches empilées, scroll long. Contredit « 1 écran = 1 question ».",
    solution:
      "Découper en étapes (onglets verticaux ou wizard) ; réduire les textes de 30–50 % ; un CTA primaire unique par section.",
  });

  issues.push({
    priorite: "moyenne",
    titre: "Workflow Scénarios BPMN : densité visuelle",
    detail:
      "app/admin/workflow/scenarios/[id] + LogiqueBpmnView — schéma dense, difficile sur mobile / petit laptop.",
    solution:
      "Zoom + pan par défaut ; masquer les nœuds hors highlight ; légende sticky plus compacte.",
  });

  issues.push({
    priorite: "basse",
    titre: "Glossaire & Journal trouvables",
    detail:
      "Sous Workflow (4 sous-onglets) — trouvables si on ouvre Workflow, mais invisibles depuis le Dashboard.",
    solution:
      "Ajouter 2 raccourcis Dashboard « Glossaire » / « Journal des décisions », ou un bandeau « Mémoire Keyber ».",
  });

  issues.push({
    priorite: "haute",
    titre: "Onboarding joueur : premier clic ambigu",
    detail:
      "app/jouer + Ordinateur — un novice peut ne pas comprendre qu'il doit ouvrir l'Ordinateur / ERP pour décider.",
    solution:
      "Intro en 1 phrase + spotlight sur l'icône Ordinateur ; bouton primaire « Ouvrir mon poste de travail ».",
  });

  issues.push({
    priorite: "moyenne",
    titre: "ERP : risque de surcharge",
    detail:
      "app/erp + modules Ordinateur — plusieurs panneaux (stock, prod, messages). Sur mobile, empilement dense.",
    solution:
      "Une fenêtre active à la fois ; masquer les KPIs secondaires derrière « Voir plus ».",
  });

  issues.push({
    priorite: "basse",
    titre: "Boutons Admin : hiérarchie OK mais trop de secondaires",
    detail:
      "Pages Agents / Fiches — nombreux AdminButton secondary côte à côte (Lancer, Sauvegarder, Tout marquer…). ",
    solution:
      "1 primaire max par bandeau ; regrouper les actions rares dans un menu « … ».",
  });

  issues.push({
    priorite: "basse",
    titre: "Suggestion test utilisateurs",
    detail: `Avec ${state.scenarios.length} scénario(s) et ${state.agents.length} agent(s) : faire passer 3 novices sur /jouer (5 min) et 2 admins sur Fiche → Workflow Glossaire.`,
    solution:
      "Mesurer : temps jusqu'à 1ère décision joueur ; nb de clics pour ouvrir Glossaire ; erreurs de compréhension verbalisées.",
  });

  if ((state.glossaire?.length ?? 0) === 0) {
    issues.push({
      priorite: "haute",
      titre: "Glossaire vide",
      detail: "Aucun terme — l'utilisateur et l'IA n'ont pas de dictionnaire.",
      solution: "Vérifier seedGlossaire / merge au chargement Admin.",
    });
  }

  return {
    agentId: "agent-ergonomie",
    score: scoreFromIssues(issues),
    issues,
    ranAt: new Date().toISOString(),
  };
}
