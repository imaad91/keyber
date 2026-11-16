/**
 * Étape 22 — Checklist « Parité feeling » Book.
 * Cases rouge/vert selon présence de blocs / contenu dans le param.
 * Aucun contenu métier inventé — lecture seule du ScenarioParamFile.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import {
  normalizeScenarioParamFile,
  type ScenarioParamFileExtended,
  type ScenarioParamOrdinateur,
} from "@/lib/scenarioParamSchema";

export type BookParityItemId =
  | "intro"
  | "mail"
  | "chat"
  | "erp10"
  | "documents"
  | "browser"
  | "dashboard"
  | "interviews"
  | "objectifs"
  | "kpis"
  | "capteurs"
  | "jours"
  | "decisions"
  | "consequences"
  | "evenements"
  | "fins"
  | "dayend";

export type BookParityItem = {
  id: BookParityItemId;
  label: string;
  /** Ce qu'il faut pour passer au vert. */
  hint: string;
  ok: boolean;
  detail: string;
};

export type BookParityReport = {
  items: BookParityItem[];
  okCount: number;
  total: number;
  /** 0–100 */
  scorePct: number;
  allOk: boolean;
};

const ERP10_KEYS: (keyof ScenarioParamOrdinateur)[] = [
  "stock",
  "commandes",
  "production",
  "employes",
  "factures",
  "machines",
  "clients",
  "fournisseurs",
  "maintenance",
  "dashboardCards",
];

function asObj(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function filledArr(v: unknown): boolean {
  return arr(v).length > 0;
}

function ordinateur(param: ScenarioParamFileExtended): ScenarioParamOrdinateur {
  const o = asObj(param.Ordinateur);
  return (o || {}) as ScenarioParamOrdinateur;
}

function decisionHasRichOptions(decisions: unknown[]): boolean {
  for (const d of decisions) {
    const row = asObj(d);
    if (!row) continue;
    const options = arr(row.options);
    for (const opt of options) {
      if (typeof opt === "string") continue;
      const o = asObj(opt);
      if (!o) continue;
      if (
        filledArr(o.consequences) ||
        filledArr(o.impacts) ||
        filledArr(o.competenceImpacts) ||
        typeof o.feedbackTexte === "string"
      ) {
        return true;
      }
    }
  }
  return false;
}

function decisionsHaveJour(decisions: unknown[]): boolean {
  return decisions.some((d) => {
    const row = asObj(d);
    return row != null && typeof row.jour === "number";
  });
}

function eventsHaveSchedule(events: unknown[]): boolean {
  return events.some((e) => {
    const row = asObj(e);
    if (!row) return false;
    return (
      typeof row.jour === "number" ||
      typeof row.heure === "string" ||
      typeof row.deadlineHeure === "string" ||
      filledArr(row.consequences)
    );
  });
}

function joursSuggestDayEnd(jours: unknown[]): boolean {
  return jours.some((j) => {
    const row = asObj(j);
    if (!row) return false;
    const phase = String(row.phase || "").toUpperCase();
    const label = String(row.label || "").toLowerCase();
    return (
      phase.includes("DAY_END") ||
      phase.includes("FIN") ||
      label.includes("fin de jour") ||
      label.includes("day end") ||
      label.includes("bilan")
    );
  });
}

/**
 * Évalue la parité feeling d'un fichier de paramétrage Book.
 * Vert = contenu présent ; rouge = absent ou coquille vide.
 */
export function evaluateBookParityChecklist(
  raw: ScenarioParamFile | ScenarioParamFileExtended | null | undefined
): BookParityReport {
  const param = normalizeScenarioParamFile(raw || {});
  const o = ordinateur(param);
  const decisions = arr(param.Décisions);
  const events = arr(param["Événements entreprise"]);
  const fins = arr(param.Fins);
  const jours = arr(param.Jours);
  const intro = arr(param.Intro);
  const interviewsTop = arr(param.Interviews);
  const interviewsNested = arr(o.interviews);
  const interviews =
    interviewsTop.length > 0 ? interviewsTop : interviewsNested;
  const objectifsTop = arr(param.Objectifs);
  const objectifsNested = arr(o.objectifs);
  const objectifs = objectifsTop.length > 0 ? objectifsTop : objectifsNested;
  const kpis = arr(param.Kpis);
  const consequences = arr(param.Conséquences);
  const sensors = arr(o.sensors);

  const erpFilled = ERP10_KEYS.filter((k) => filledArr(o[k]));
  const erpOk = erpFilled.length >= 10;
  const hasInlineConsequences =
    decisionHasRichOptions(decisions) ||
    events.some((e) => filledArr(asObj(e)?.consequences));

  const items: BookParityItem[] = [
    {
      id: "intro",
      label: "Intro / onboarding",
      hint: "Bloc `Intro` (lignes texte) non vide",
      ok: intro.length > 0,
      detail:
        intro.length > 0
          ? `${intro.length} ligne${intro.length > 1 ? "s" : ""}`
          : "Intro vide",
    },
    {
      id: "mail",
      label: "Boîte mail",
      hint: "`Ordinateur.emails` avec au moins 1 mail",
      ok: filledArr(o.emails),
      detail: filledArr(o.emails)
        ? `${arr(o.emails).length} mail(s)`
        : "Aucun mail paramétré",
    },
    {
      id: "chat",
      label: "Chat interne",
      hint: "`Ordinateur.chatContacts` ou `chatThreads`",
      ok: filledArr(o.chatContacts) || filledArr(o.chatThreads),
      detail: filledArr(o.chatContacts)
        ? `${arr(o.chatContacts).length} contact(s)`
        : filledArr(o.chatThreads)
          ? `${arr(o.chatThreads).length} thread(s)`
          : "Chat vide",
    },
    {
      id: "erp10",
      label: "ERP — 10 modules",
      hint: "stock, commandes, production, employés, factures, machines, clients, fournisseurs, maintenance, dashboardCards",
      ok: erpOk,
      detail: `${erpFilled.length}/10 modules remplis${
        erpFilled.length
          ? ` (${erpFilled.join(", ")})`
          : ""
      }`,
    },
    {
      id: "documents",
      label: "Documents",
      hint: "`Ordinateur.documents` non vide",
      ok: filledArr(o.documents),
      detail: filledArr(o.documents)
        ? `${arr(o.documents).length} doc(s)`
        : "Documents vides",
    },
    {
      id: "browser",
      label: "Browser",
      hint: "`Ordinateur.browser` non vide",
      ok: filledArr(o.browser),
      detail: filledArr(o.browser)
        ? `${arr(o.browser).length} page(s)`
        : "Browser vide",
    },
    {
      id: "dashboard",
      label: "Dashboard live",
      hint: "`Ordinateur.dashboardCards` ou `dashboardSeries`",
      ok: filledArr(o.dashboardCards) || filledArr(o.dashboardSeries),
      detail: filledArr(o.dashboardCards)
        ? `${arr(o.dashboardCards).length} carte(s)`
        : filledArr(o.dashboardSeries)
          ? `${arr(o.dashboardSeries).length} série(s)`
          : "Dashboard vide",
    },
    {
      id: "interviews",
      label: "Interviews / PNJ",
      hint: "`Interviews` top-level ou `Ordinateur.interviews`",
      ok: interviews.length > 0,
      detail:
        interviews.length > 0
          ? `${interviews.length} interview(s)`
          : "Aucune interview",
    },
    {
      id: "objectifs",
      label: "Objectifs",
      hint: "`Objectifs` top-level ou `Ordinateur.objectifs`",
      ok: objectifs.length > 0,
      detail:
        objectifs.length > 0
          ? `${objectifs.length} objectif(s)`
          : "Aucun objectif",
    },
    {
      id: "kpis",
      label: "Kpis",
      hint: "Bloc `Kpis` non vide (sinon défauts OS)",
      ok: kpis.length > 0,
      detail:
        kpis.length > 0 ? `${kpis.length} kpi(s)` : "Kpis vides (défauts OS)",
    },
    {
      id: "capteurs",
      label: "Capteurs / Visibilité",
      hint: "`Ordinateur.sensors` non vide",
      ok: sensors.length > 0,
      detail:
        sensors.length > 0
          ? `${sensors.length} capteur(s)`
          : "Aucun capteur",
    },
    {
      id: "jours",
      label: "Jours / timeline",
      hint: "Bloc `Jours` non vide",
      ok: jours.length > 0,
      detail:
        jours.length > 0 ? `${jours.length} jour(s)` : "Timeline Jours vide",
    },
    {
      id: "decisions",
      label: "Décisions riches",
      hint: "Décisions avec options objets (conséquences / feedback)",
      ok: decisions.length > 0 && decisionHasRichOptions(decisions),
      detail:
        decisions.length === 0
          ? "Aucune décision"
          : decisionHasRichOptions(decisions)
            ? `${decisions.length} décision(s) riches`
            : `${decisions.length} décision(s) — options texte seules`,
    },
    {
      id: "consequences",
      label: "Conséquences",
      hint: "Catalogue `Conséquences` ou conséquences inline choix/events",
      ok: consequences.length > 0 || hasInlineConsequences,
      detail:
        consequences.length > 0
          ? `${consequences.length} pack(s) catalogue`
          : hasInlineConsequences
            ? "Conséquences inline OK"
            : "Pas de conséquences",
    },
    {
      id: "evenements",
      label: "Événements planifiés",
      hint: "Events avec jour/heure/deadline ou conséquences",
      ok: events.length > 0 && eventsHaveSchedule(events),
      detail:
        events.length === 0
          ? "Aucun événement"
          : eventsHaveSchedule(events)
            ? `${events.length} event(s) enrichis`
            : `${events.length} event(s) — description seule`,
    },
    {
      id: "fins",
      label: "Fins",
      hint: "Bloc `Fins` non vide",
      ok: fins.length > 0,
      detail: fins.length > 0 ? `${fins.length} fin(s)` : "Fins vides",
    },
    {
      id: "dayend",
      label: "DayEnd / cycle jour",
      hint: "Jours avec phase fin de jour, ou décisions datées (`jour`)",
      ok: joursSuggestDayEnd(jours) || decisionsHaveJour(decisions),
      detail: joursSuggestDayEnd(jours)
        ? "Phase fin de jour dans Jours"
        : decisionsHaveJour(decisions)
          ? "Décisions datées (jour)"
          : "Pas de signal DayEnd",
    },
  ];

  const okCount = items.filter((i) => i.ok).length;
  const total = items.length;
  const scorePct = total === 0 ? 0 : Math.round((okCount / total) * 100);

  return {
    items,
    okCount,
    total,
    scorePct,
    allOk: okCount === total,
  };
}
