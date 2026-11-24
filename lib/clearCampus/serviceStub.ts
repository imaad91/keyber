/**
 * Clear Campus Phase 5.3 — stub minimal Vue Live « service »
 * (file d'attente / tickets). Structure seule, pas de scénario Book.
 */

import type { ScenarioParamProductionLive } from "@/lib/clearCampus/types";

/** Exemple de shape service — pour auteurs / templates, hors inventaire métier. */
export const SERVICE_PRODUCTION_LIVE_STUB: ScenarioParamProductionLive = {
  valueType: "service",
  label: "File de tickets — stub service",
  zones: [
    { id: "z-intake", label: "Prise en charge", kind: "intake" },
    { id: "z-queue", label: "File d'attente", kind: "queue" },
    { id: "z-resolve", label: "Résolution", kind: "desk" },
  ],
  nodes: [
    {
      id: "n-intake",
      zoneId: "z-intake",
      label: "Guichet",
      kind: "desk",
      status: "OK",
    },
    {
      id: "n-q1",
      zoneId: "z-queue",
      label: "File P1",
      kind: "queue",
      status: "OK",
    },
    {
      id: "n-desk",
      zoneId: "z-resolve",
      label: "Poste agent",
      kind: "desk",
      status: "OK",
    },
  ],
  flows: [
    {
      id: "f1",
      fromNodeId: "n-intake",
      toNodeId: "n-q1",
      label: "Intake → File",
    },
    {
      id: "f2",
      fromNodeId: "n-q1",
      toNodeId: "n-desk",
      label: "File → Résolution",
    },
  ],
  vehicles: [],
  operators: [
    {
      id: "op-agent",
      label: "Agent",
      zoneId: "z-resolve",
      role: "support",
    },
  ],
  kpis: [
    { id: "kpi-sla", label: "SLA", path: "kpis.sla", unit: "%" },
    {
      id: "kpi-wip",
      label: "Tickets ouverts",
      path: "kpis.openTickets",
      unit: "",
    },
  ],
};
