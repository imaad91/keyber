/**
 * Session de jeu Book → Keyber OS (Front-End).
 * Charge le fichier de paramétrage, enchaîne les composantes OS :
 * Données → Scénarios → Décisions / Événements → ERP → Progression → Interface.
 * Aucun nom d'entreprise hardcodé dans la logique.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { applyOsTresorerie, getOsRuntimeConfig } from "@/lib/keyberOsRuntime";

export type OsBookPlayChoice = {
  id: string;
  label: string;
};

export type OsBookPlayDecision = {
  id: string;
  titre: string;
  options: OsBookPlayChoice[];
};

export type OsBookPlayState = {
  param: ScenarioParamFile;
  stepIndex: number;
  decisions: OsBookPlayDecision[];
  eventsFired: string[];
  /** Finance brute (avant facteur OS). */
  tresorerieBrute: number;
  stock: number;
  production: number;
  commandes: number;
  xp: number;
  niveau: number;
  score: number;
  log: string[];
  finished: boolean;
  feedback: string | null;
};

function parseTresorerie(param: ScenarioParamFile): number {
  const raw =
    param.Contexte["Trésorerie actuelle"] ||
    param.Contexte["Tresorerie actuelle"] ||
    "";
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 50_000;
}

function parseStock(param: ScenarioParamFile): number {
  const raw = param.Contexte["Liste des stocks (nom, quantité actuelle, stock minimum, stock maximum, stock de sécurité, délai de réapprovisionnement, coût de stockage, problèmes récurrents)"] || "";
  const m = raw.match(/:\s*(\d+)/);
  return m ? Number(m[1]) : 100;
}

export function createOsBookPlayState(param: ScenarioParamFile): OsBookPlayState {
  const decisions: OsBookPlayDecision[] = (param.Décisions || []).map(
    (d, i) => {
      const row = d as {
        id?: string;
        titre?: string;
        options?: string[];
      };
      const opts = Array.isArray(row.options) ? row.options : [];
      return {
        id: row.id || `d${i + 1}`,
        titre: row.titre || `Décision ${i + 1}`,
        options: opts.map((label, j) => ({
          id: `${row.id || `d${i + 1}`}-opt${j}`,
          label: String(label),
        })),
      };
    }
  );

  return {
    param,
    stepIndex: 0,
    decisions,
    eventsFired: [],
    tresorerieBrute: parseTresorerie(param),
    stock: parseStock(param),
    production: 60,
    commandes: 12,
    xp: 0,
    niveau: 1,
    score: 0,
    log: [
      `Données & Sauvegarde → fichier ${param.fichier || param.Nom}`,
      `Moteur de Scénarios → ${param.Mode} — ${param.Nom}`,
    ],
    finished: decisions.length === 0,
    feedback: null,
  };
}

export function osBookErpSnapshot(state: OsBookPlayState) {
  const cfg = getOsRuntimeConfig();
  return {
    tresorerie: applyOsTresorerie(state.tresorerieBrute),
    tresorerieBrute: state.tresorerieBrute,
    facteur: cfg.tresorerieFacteur,
    formule: cfg.tresorerieFormuleLabel,
    stock: state.stock,
    production: state.production,
    commandes: state.commandes,
    fournisseurs: state.param["Événements entreprise"].filter((e) =>
      /fournisseur/i.test(e.type)
    ).length,
    clients: state.param["Événements entreprise"].filter((e) =>
      /client/i.test(e.type)
    ).length,
    equipe: 6,
  };
}

/**
 * Choix joueur → Moteur de Décisions → ERP → Progression → évent. Événement.
 */
export function applyOsBookChoice(
  state: OsBookPlayState,
  choiceId: string
): OsBookPlayState {
  if (state.finished) return state;
  const decision = state.decisions[state.stepIndex];
  if (!decision) {
    return { ...state, finished: true };
  }
  const choice = decision.options.find((o) => o.id === choiceId);
  if (!choice) return state;

  const next = { ...state, log: [...state.log], eventsFired: [...state.eventsFired] };
  next.log.push(
    `Moteur de Décisions & Branches → choix « ${choice.label} »`
  );

  // Effets génériques (pas de métier inventé hors deltas structurels)
  next.tresorerieBrute = Math.max(
    0,
    next.tresorerieBrute + (choiceId.endsWith("opt0") ? -2000 : choiceId.endsWith("opt1") ? -800 : 500)
  );
  next.stock = Math.max(
    0,
    next.stock + (choiceId.endsWith("opt0") ? 40 : choiceId.endsWith("opt1") ? 15 : -10)
  );
  next.production = Math.max(
    10,
    next.production + (choiceId.endsWith("opt2") ? -5 : 5)
  );
  next.commandes = Math.max(0, next.commandes + 1);
  next.log.push(
    `ERP → chiffres mis à jour (Trésorerie brute ${next.tresorerieBrute}, facteur OS ${getOsRuntimeConfig().tresorerieFacteur})`
  );

  // Moteur d'Événements : déclenche un événement catalogue selon l'étape
  const catalog = next.param["Événements entreprise"] || [];
  if (catalog.length) {
    const ev = catalog[next.stepIndex % catalog.length]!;
    if (!next.eventsFired.includes(ev.nom)) {
      next.eventsFired.push(ev.nom);
      next.log.push(`Moteur d'Événements → « ${ev.nom} » (${ev.type}) → ERP`);
      next.stock = Math.max(0, next.stock - 5);
    }
  }

  // Progression
  next.xp += 25;
  next.score += 10;
  if (next.xp >= next.niveau * 100) {
    next.niveau += 1;
    next.log.push(
      `Progression, Scores & Niveaux → niveau ${next.niveau} (XP ${next.xp})`
    );
  } else {
    next.log.push(
      `Progression, Scores & Niveaux → +25 XP (total ${next.xp})`
    );
  }

  next.feedback = `Choix enregistré : ${choice.label}`;
  next.stepIndex += 1;
  if (next.stepIndex >= next.decisions.length) {
    next.finished = true;
    next.log.push("Données & Sauvegarde → progression enregistrée (fin de scénario)");
  } else {
    next.log.push(
      `Interface Joueur → étape ${next.stepIndex + 1}/${next.decisions.length}`
    );
    next.log.push("Données & Sauvegarde → progression sauvegardée");
  }

  return next;
}
