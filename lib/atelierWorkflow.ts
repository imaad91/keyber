/**
 * Atelier Workflow — génération BPMN 2.0 depuis les données scénario.
 * Logique métier uniquement (pas de code / fichiers). Générique pour tout contexte.
 */

import type {
  AtelierCompetence,
  AtelierScenario,
} from "@/lib/atelierStore";

export type BpmnTone = "success" | "fail" | "neutral" | "partial";

export type BpmnNodeKind =
  | "start"
  | "task"
  | "exclusiveGateway"
  | "parallelGateway"
  | "end";

export type BpmnNode = {
  id: string;
  kind: BpmnNodeKind;
  label: string;
  /** Swimlane actor (optional) */
  lane?: string;
  /** Extra métier lines shown on the shape */
  meta?: string[];
  competenceNom?: string;
  jour?: string;
  /** For detail panel */
  detail?: {
    question?: string;
    feedbackBon?: string;
    feedbackMauvais?: string;
    requires?: string;
    actor?: string;
  };
  endKind?: "success" | "fail" | "partial";
  /** Layout */
  x: number;
  y: number;
};

export type BpmnEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  tone: BpmnTone;
  impactSuite?: string;
};

export type BpmnDiagram = {
  scenarioId: string;
  titre: string;
  contexteNom: string;
  competenceNoms: string[];
  nodes: BpmnNode[];
  edges: BpmnEdge[];
  lanes: string[];
  summary: {
    portes: number;
    taches: number;
    fins: number;
    competencePlusTravaillee: string;
    pointCritique: string;
  };
};

export type WorkflowChoiceSpec = {
  label: string;
  tasks?: { name: string; requires?: string; competenceId?: string; actor?: string }[];
  impact?: string;
  impactSuite?: string;
  tone?: BpmnTone;
  nextGateId?: string;
  endId?: string;
};

export type WorkflowGateSpec = {
  id: string;
  question: string;
  jour?: string;
  competenceId?: string;
  choices: WorkflowChoiceSpec[];
};

export type WorkflowEndSpec = {
  id: string;
  kind: "success" | "fail" | "partial";
  label: string;
  competenceNote?: string;
};

/** Spec structurée optionnelle sur un scénario (données atelier, pas OS). */
export type AtelierWorkflowSpec = {
  start: { label: string; lane?: string };
  lanes?: string[];
  gates: WorkflowGateSpec[];
  ends: WorkflowEndSpec[];
};

const COL_W = 220;
const ROW_H = 130;
const NODE_W = 168;
const NODE_H = 72;

function competenceName(
  id: string | undefined,
  comps: AtelierCompetence[]
): string | undefined {
  if (!id) return undefined;
  return comps.find((c) => c.id === id)?.nom ?? id;
}

function mostFrequentCompetence(noms: string[]): string {
  if (!noms.length) return "—";
  const counts = new Map<string, number>();
  for (const n of noms) counts.set(n, (counts.get(n) ?? 0) + 1);
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]![0];
}

/** Spec riche pour Rupture stock — données scénario, pas hardcodées dans le composant UI. */
export function ruptureStockWorkflowSpec(): AtelierWorkflowSpec {
  return {
    start: {
      label: "Début — Jour 1, 8h00 — Stock en rupture",
      lane: "Joueur",
    },
    lanes: ["Joueur", "Fournisseur"],
    gates: [
      {
        id: "g1",
        question: "Stock en rupture, que fais-tu ?",
        jour: "Jour 1",
        competenceId: "planification_mrp",
        choices: [
          {
            label: "Je calcule le besoin net",
            tone: "success",
            impact: "Visibilité stock ↑",
            impactSuite: "Passe au calcul MRP",
            tasks: [
              {
                name: "Consulter l'ERP",
                requires: "Accès Ordinateur",
                actor: "Joueur",
                competenceId: "planification_mrp",
              },
              {
                name: "Calculer le besoin net",
                requires: "Besoin brut, stock, en-cours",
                actor: "Joueur",
                competenceId: "planification_mrp",
              },
              {
                name: "Lancer l'OF juste",
                requires: "Besoin net calculé",
                actor: "Joueur",
                competenceId: "planification_mrp",
              },
            ],
            nextGateId: "g2",
          },
          {
            label: "Je lance un OF au hasard",
            tone: "fail",
            impact: "Surproduction · Trésorerie − trop",
            impactSuite: "Passe à la fin échec",
            tasks: [
              {
                name: "Lancer OF sans calculer",
                requires: "Aucune (erreur)",
                actor: "Joueur",
                competenceId: "planification_mrp",
              },
            ],
            endId: "end-fail-surprod",
          },
          {
            label: "J'attends",
            tone: "fail",
            impact: "Délai client ↑",
            impactSuite: "Passe à la fin échec",
            endId: "end-fail-client",
          },
        ],
      },
      {
        id: "g2",
        question: "Fournisseur en retard, que fais-tu ?",
        jour: "Jour 2",
        competenceId: "planification_mrp",
        choices: [
          {
            label: "Je renégocie le délai",
            tone: "success",
            impact: "Délai fournisseur ajusté",
            impactSuite: "Passe à la fin réussite",
            tasks: [
              {
                name: "Négocier avec le fournisseur",
                requires: "Plan de charge crédible",
                actor: "Joueur",
                competenceId: "planification_mrp",
              },
            ],
            endId: "end-ok",
          },
          {
            label: "Je force la livraison",
            tone: "fail",
            impact: "Confiance fournisseur −15",
            impactSuite: "Passe à la fin échec",
            endId: "end-fail-surprod",
          },
        ],
      },
    ],
    ends: [
      {
        id: "end-ok",
        kind: "success",
        label:
          "Fin Réussite — Client livré à temps, besoin net calculé juste.",
        competenceNote: "Planification MRP validée",
      },
      {
        id: "end-fail-surprod",
        kind: "fail",
        label: "Fin Échec — Surproduction, trésorerie à 0, client perdu.",
        competenceNote: "Planification MRP ratée",
      },
      {
        id: "end-fail-client",
        kind: "fail",
        label: "Fin Échec — Client perdu (attente sans action).",
        competenceNote: "Planification MRP ratée",
      },
    ],
  };
}

function inferSpecFromText(
  scenario: AtelierScenario,
  comps: AtelierCompetence[]
): AtelierWorkflowSpec {
  const primary = scenario.competenceIds[0];
  const primaryNom = competenceName(primary, comps) ?? "Compétence";
  const actions = scenario.decisions
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const actionList =
    actions.length > 0
      ? actions
      : ["Analyser la situation", "Décider d'une action"];

  const ends: WorkflowEndSpec[] = [
    {
      id: "end-ok",
      kind: "success",
      label: `Fin Réussite — ${scenario.reglesFin || "Objectifs atteints."}`,
      competenceNote: `${primaryNom} validée`,
    },
    {
      id: "end-fail",
      kind: "fail",
      label: "Fin Échec — Objectifs non atteints.",
      competenceNote: `${primaryNom} ratée`,
    },
  ];

  const choices: WorkflowChoiceSpec[] = actionList.slice(0, 3).map((a, i) => {
    const isLastFail = i === actionList.length - 1 && actionList.length > 1;
    if (i === 0) {
      return {
        label: a,
        tone: "success",
        impact: "Avance dans le scénario",
        impactSuite: "Passe à l'étape suivante",
        tasks: [
          {
            name: a,
            actor: "Joueur",
            competenceId: primary,
            requires: "Données du contexte",
          },
        ],
        endId: "end-ok",
      };
    }
    return {
      label: a,
      tone: isLastFail ? "fail" : "neutral",
      impact: isLastFail ? "Risque d'échec" : "Impact neutre",
      impactSuite: isLastFail ? "Passe à la fin échec" : "Passe à la suite",
      tasks: [
        {
          name: a,
          actor: "Joueur",
          competenceId: primary,
        },
      ],
      endId: isLastFail ? "end-fail" : "end-ok",
    };
  });

  return {
    start: {
      label: `Début — ${scenario.situation.slice(0, 120) || scenario.titre}`,
      lane: "Joueur",
    },
    lanes: ["Joueur"],
    gates: [
      {
        id: "g1",
        question: scenario.situation.slice(0, 140) || "Que fais-tu ?",
        jour: "Jour 1",
        competenceId: primary,
        choices,
      },
    ],
    ends,
  };
}

export function resolveWorkflowSpec(
  scenario: AtelierScenario,
  comps: AtelierCompetence[]
): AtelierWorkflowSpec {
  if (scenario.workflow) return scenario.workflow;
  if (scenario.id === "sc-rupture-stock") return ruptureStockWorkflowSpec();
  return inferSpecFromText(scenario, comps);
}

/**
 * Construit le diagramme BPMN 2.0 (positions incluses) depuis le scénario atelier.
 */
export function buildAtelierBpmn(
  scenario: AtelierScenario,
  contexteNom: string,
  competences: AtelierCompetence[]
): BpmnDiagram {
  const comps = competences.filter((c) =>
    scenario.competenceIds.includes(c.id)
  );
  const spec = resolveWorkflowSpec(scenario, competences);
  const lanes = spec.lanes?.length ? spec.lanes : ["Joueur"];
  const laneIndex = (name?: string) => {
    const n = name ?? "Joueur";
    const i = lanes.indexOf(n);
    return i >= 0 ? i : 0;
  };

  const nodes: BpmnNode[] = [];
  const edges: BpmnEdge[] = [];
  const competenceHits: string[] = [];

  let col = 0;
  const startId = "start";
  nodes.push({
    id: startId,
    kind: "start",
    label: spec.start.label,
    lane: spec.start.lane ?? "Joueur",
    x: 40 + col * COL_W,
    y: 40 + laneIndex(spec.start.lane) * ROW_H,
  });
  col = 1;

  // First task before first gate if start connects via "Consulter" pattern:
  // For each gate, lay out: [optional tasks before] gate [choice branches]
  let prevId = startId;
  const gateCols = new Map<string, number>();

  // Connect start → first gate (or first task of first choice)
  const firstGate = spec.gates[0];
  if (firstGate) {
    // Optional: add "Consulter l'ERP" as first task if present in first choice tasks[0]
    const firstTasks = firstGate.choices[0]?.tasks ?? [];
    if (firstTasks[0] && /consulter|erp/i.test(firstTasks[0].name)) {
      const t0 = firstTasks[0];
      const tid = `task-pre-${firstGate.id}`;
      const cn = competenceName(t0.competenceId, competences);
      if (cn) competenceHits.push(cn);
      nodes.push({
        id: tid,
        kind: "task",
        label: t0.name,
        lane: t0.actor ?? "Joueur",
        competenceNom: cn,
        meta: [
          `Qui : ${t0.actor ?? "Joueur"}`,
          t0.requires ? `Nécessite : ${t0.requires}` : "",
          cn ? `Compétence : ${cn}` : "",
        ].filter(Boolean),
        detail: {
          actor: t0.actor ?? "Joueur",
          requires: t0.requires,
        },
        x: 40 + col * COL_W,
        y: 40 + laneIndex(t0.actor) * ROW_H,
      });
      edges.push({
        id: `e-${prevId}-${tid}`,
        from: prevId,
        to: tid,
        label: "Ouvre le diagnostic",
        tone: "neutral",
        impactSuite: "Arrive à la décision",
      });
      prevId = tid;
      col += 1;
    }

    // Place gates left-to-right
    for (let gi = 0; gi < spec.gates.length; gi++) {
      const gate = spec.gates[gi]!;
      gateCols.set(gate.id, col);
      const cn = competenceName(gate.competenceId, competences);
      if (cn) competenceHits.push(cn);
      const gid = `gate-${gate.id}`;
      nodes.push({
        id: gid,
        kind: "exclusiveGateway",
        label: gate.question,
        lane: "Joueur",
        jour: gate.jour,
        competenceNom: cn,
        meta: [
          gate.jour ?? "",
          cn ? `Compétence : ${cn}` : "",
        ].filter(Boolean),
        detail: {
          question: gate.question,
          feedbackBon: "Choix qui avance vers la réussite",
          feedbackMauvais: "Choix qui mène à l'échec",
        },
        x: 40 + col * COL_W,
        y: 40 + laneIndex("Joueur") * ROW_H,
      });

      if (gi === 0) {
        edges.push({
          id: `e-${prevId}-${gid}`,
          from: prevId,
          to: gid,
          label: "Décision",
          tone: "neutral",
        });
      }
      col += 1;

      // Layout choices as vertical branches
      gate.choices.forEach((choice, ci) => {
        const branchY = 40 + ci * ROW_H;
        let fromId = gid;
        let localCol = (gateCols.get(gate.id) ?? col) + 1;

        const tasks =
          gi === 0 && ci === 0 && firstTasks[0] && /consulter|erp/i.test(firstTasks[0].name)
            ? (choice.tasks ?? []).slice(1)
            : choice.tasks ?? [];

        tasks.forEach((t, ti) => {
          const tid = `task-${gate.id}-${ci}-${ti}`;
          const tcn = competenceName(t.competenceId, competences);
          if (tcn) competenceHits.push(tcn);
          nodes.push({
            id: tid,
            kind: "task",
            label: t.name,
            lane: t.actor ?? "Joueur",
            competenceNom: tcn,
            meta: [
              `Qui : ${t.actor ?? "Joueur"}`,
              t.requires ? `Nécessite : ${t.requires}` : "",
              tcn ? `Compétence : ${tcn}` : "",
            ].filter(Boolean),
            detail: {
              actor: t.actor ?? "Joueur",
              requires: t.requires,
            },
            x: 40 + localCol * COL_W,
            y: branchY,
          });
          edges.push({
            id: `e-${fromId}-${tid}`,
            from: fromId,
            to: tid,
            label:
              ti === 0
                ? `${choice.label}${choice.impact ? ` · ${choice.impact}` : ""}`
                : choice.impact ?? "Suite",
            tone: choice.tone ?? "neutral",
            impactSuite: choice.impactSuite,
          });
          fromId = tid;
          localCol += 1;
        });

        if (tasks.length === 0) {
          // direct edge from gate with choice label
          if (choice.endId) {
            const eid = `end-${choice.endId}`;
            edges.push({
              id: `e-${fromId}-${eid}`,
              from: fromId,
              to: eid,
              label: `${choice.label}${choice.impact ? ` · ${choice.impact}` : ""}`,
              tone: choice.tone ?? "neutral",
              impactSuite: choice.impactSuite,
            });
          } else if (choice.nextGateId) {
            const ng = `gate-${choice.nextGateId}`;
            edges.push({
              id: `e-${fromId}-${ng}`,
              from: fromId,
              to: ng,
              label: `${choice.label}${choice.impact ? ` · ${choice.impact}` : ""}`,
              tone: choice.tone ?? "neutral",
              impactSuite: choice.impactSuite,
            });
          }
        } else if (choice.nextGateId) {
          const ng = `gate-${choice.nextGateId}`;
          edges.push({
            id: `e-${fromId}-${ng}`,
            from: fromId,
            to: ng,
            label: choice.impact ?? "Passe à la décision suivante",
            tone: choice.tone ?? "success",
            impactSuite: choice.impactSuite,
          });
        } else if (choice.endId) {
          const eid = `end-${choice.endId}`;
          edges.push({
            id: `e-${fromId}-${eid}`,
            from: fromId,
            to: eid,
            label: choice.impact ?? "Arrive à la fin",
            tone: choice.tone ?? "neutral",
            impactSuite: choice.impactSuite,
          });
        }

        col = Math.max(col, localCol);
      });
      col += 1;
    }
  }

  // Ends column
  const endCol = col;
  spec.ends.forEach((end, i) => {
    nodes.push({
      id: `end-${end.id}`,
      kind: "end",
      label: end.label,
      endKind: end.kind,
      lane: "Joueur",
      meta: end.competenceNote ? [end.competenceNote] : [],
      detail: {
        question: end.label,
        feedbackBon: end.kind === "success" ? end.competenceNote : undefined,
        feedbackMauvais: end.kind === "fail" ? end.competenceNote : undefined,
      },
      x: 40 + endCol * COL_W,
      y: 40 + i * ROW_H,
    });
  });

  // Ensure dangling nextGate edges resolve — already using gate- ids
  // Deduplicate nodes by id (keep first)
  const seen = new Set<string>();
  const uniqNodes = nodes.filter((n) => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  // Filter edges that reference existing nodes
  const ids = new Set(uniqNodes.map((n) => n.id));
  const uniqEdges = edges.filter((e) => ids.has(e.from) && ids.has(e.to));

  const portes = uniqNodes.filter((n) => n.kind === "exclusiveGateway").length;
  const taches = uniqNodes.filter((n) => n.kind === "task").length;
  const fins = uniqNodes.filter((n) => n.kind === "end").length;
  const pointCritique =
    uniqNodes.find((n) => n.kind === "exclusiveGateway")?.label ?? "—";

  return {
    scenarioId: scenario.id,
    titre: scenario.titre,
    contexteNom,
    competenceNoms: comps.map((c) => c.nom),
    nodes: uniqNodes,
    edges: uniqEdges,
    lanes,
    summary: {
      portes,
      taches,
      fins,
      competencePlusTravaillee: mostFrequentCompetence([
        ...comps.map((c) => c.nom),
        ...competenceHits,
      ]),
      pointCritique,
    },
  };
}

export function countDecisionPoints(scenario: AtelierScenario): number {
  const spec = resolveWorkflowSpec(scenario, []);
  return spec.gates.length;
}

export { NODE_W, NODE_H, COL_W, ROW_H };
