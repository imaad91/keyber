/**
 * Play content resolver: Admin Studio overrides beat static scenario files.
 * So a value changed in /admin/decisions is what Décider applies in-game.
 */

import { decisionForDay, SCENARIO_ID } from "@/data/scenarioNovacier";
import type { Consequence, Decision } from "@/lib/decisions";
import type { AdminDecision, AdminState } from "@/lib/adminTypes";
import { createAdminSeed } from "@/lib/adminSeed";
import { normalizeCible } from "@/lib/gameState";

const STORAGE_KEY = "keyber-admin-v1";

const METRIC_ALIASES: Record<string, string> = {
  tresorerie: "tresorerie",
  cash: "tresorerie",
  moral: "moral",
  moralequipe: "moral",
  ethique: "ethique",
  stock: "stockKg",
  stockkg: "stockKg",
  production: "production",
  rebut: "tauxRebut",
  tauxrebut: "tauxRebut",
  xp: "xp",
  temps: "temps",
  time: "temps",
  confianceclient: "confianceClient",
  autovolt: "confianceClient",
};

function foldKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapMetricToCible(metric: string): string {
  const raw = metric.trim();
  if (!raw) return "flags.unknown";

  if (raw.includes(".")) {
    return raw;
  }

  const key = foldKey(raw);
  if (METRIC_ALIASES[key]) return METRIC_ALIASES[key]!;

  const conf = raw.match(/^confiance\s+(\w+)/i);
  if (conf?.[1]) return `confiance.${conf[1].toLowerCase()}`;

  return raw;
}

function readAdminState(): AdminState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    const seed = createAdminSeed();
    return {
      scenarios: parsed.scenarios ?? seed.scenarios,
      entreprises: parsed.entreprises ?? seed.entreprises,
      personnages: parsed.personnages ?? seed.personnages,
      decisions: parsed.decisions ?? seed.decisions,
      events: parsed.events ?? seed.events,
      fiches: parsed.fiches ?? seed.fiches,
      coeurs: parsed.coeurs ?? seed.coeurs,
      coeurMeta: parsed.coeurMeta ?? seed.coeurMeta,
      agents: parsed.agents ?? seed.agents,
      agentReports: parsed.agentReports ?? [],
      consultants: parsed.consultants ?? [],
      glossaire: parsed.glossaire ?? seed.glossaire,
      journalDecisions: parsed.journalDecisions ?? seed.journalDecisions,
      toast: null,
    };
  } catch {
    return null;
  }
}

function adminDecisionForDay(day: number): AdminDecision | undefined {
  const admin = readAdminState();
  if (!admin) return undefined;
  const list = admin.decisions
    .filter(
      (d) =>
        d.jour === day &&
        (!d.scenarioId ||
          d.scenarioId === SCENARIO_ID ||
          d.scenarioId.includes("novacier"))
    )
    .sort((a, b) => a.order - b.order);
  return list[0];
}

export function adminOverridesActive(): boolean {
  return Boolean(readAdminState()?.decisions?.length);
}

function findBaseConsequence(
  base: Consequence[] | undefined,
  cible: string
): Consequence | undefined {
  if (!base?.length) return undefined;
  const norm = normalizeCible(cible);
  return (
    base.find((b) => b.cible === cible) ??
    base.find((b) => normalizeCible(b.cible) === norm)
  );
}

function toPlayConsequence(
  metric: string,
  delta: number,
  mode: "add" | "set" | undefined,
  setValeur: string | undefined,
  baseChoixConsequences: Consequence[] | undefined
): Consequence {
  const cible = mapMetricToCible(metric);
  const baseCons = findBaseConsequence(baseChoixConsequences, cible);
  const resolvedMode = mode ?? baseCons?.mode;
  const resolvedSet =
    setValeur ??
    (typeof baseCons?.setValeur === "string" ? baseCons.setValeur : undefined);

  const out: Consequence = {
    cible,
    valeur: delta,
  };
  if (resolvedMode) out.mode = resolvedMode;
  if (resolvedSet) out.setValeur = resolvedSet;
  return out;
}

export function adminDecisionToPlayDecision(
  admin: AdminDecision,
  base?: Decision
): Decision {
  return {
    id: base?.id ?? admin.id,
    titre: admin.titre || base?.titre || `Jour ${admin.jour}`,
    jour: admin.jour,
    dilemme: admin.dilemme || base?.dilemme || "",
    categorie: base?.categorie,
    xpGagne: base?.xpGagne ?? 0,
    bankProduction: base?.bankProduction ?? true,
    choix: admin.choix.slice(0, 3).map((c, i) => {
      const baseChoix =
        base?.choix.find((b) => b.id === c.id) ?? base?.choix[i];
      const consequences: Consequence[] =
        c.consequences.length > 0
          ? c.consequences.map((cons) =>
              toPlayConsequence(
                cons.metric,
                cons.delta,
                cons.mode,
                cons.setValeur,
                baseChoix?.consequences
              )
            )
          : baseChoix?.consequences ?? [];

      // Ensure time/xp from base remain if admin wiped them accidentally
      const hasTemps = consequences.some(
        (x) => x.cible === "temps" || normalizeCible(x.cible) === "meta.minutesSinceStart"
      );
      const hasXp = consequences.some(
        (x) =>
          x.cible === "xp" ||
          x.cible === "progression.xp" ||
          normalizeCible(x.cible) === "progression.xp"
      );
      const merged = [...consequences];
      if (!hasTemps && baseChoix) {
        const t = baseChoix.consequences.find((x) => x.cible === "temps");
        if (t) merged.push(t);
      }
      if (!hasXp && baseChoix) {
        const x = baseChoix.consequences.find(
          (c0) => c0.cible === "xp" || c0.cible === "progression.xp"
        );
        if (x) merged.push(x);
      }

      return {
        id: c.id,
        label: c.texte || baseChoix?.label || `Choix ${i + 1}`,
        description: baseChoix?.description || "",
        feedbackTexte: baseChoix?.feedbackTexte || c.texte || "Choix validé",
        impacts: baseChoix?.impacts,
        requis: baseChoix?.requis,
        conditions: baseChoix?.conditions,
        consequences: merged,
      };
    }),
  };
}

/**
 * Decision used by the player Décider screen & engine.
 * Prefers Admin Studio localStorage when present.
 */
export function getPlayDecisionForDay(day: number): Decision | undefined {
  const base = decisionForDay(day);
  const admin = adminDecisionForDay(day);
  if (!admin || admin.choix.length === 0) return base;
  return adminDecisionToPlayDecision(admin, base);
}

export function getPlayDecisionByChoixId(
  choixId: string
): { decision: Decision; day: number } | undefined {
  for (let day = 1; day <= 5; day++) {
    const d = getPlayDecisionForDay(day);
    if (d?.choix.some((c) => c.id === choixId)) {
      return { decision: d, day };
    }
  }
  return undefined;
}
