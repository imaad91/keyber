/**
 * Admin CŒUR — single source of truth for scenario decisions & events.
 * Vue Graphique is a projection; player runtime is untouched by this module.
 */

import {
  dayTitles,
  ENTREPRISE_ID,
  novacierDecisions,
  SCENARIO_ID,
  SCENARIO_TITLE,
} from "@/data/scenarioNovacier";
import type {
  AdminDecision,
  AdminEvent,
  AdminEventType,
  AdminScenario,
  AdminState,
} from "@/lib/adminTypes";
import { ADMIN_EVENT_TYPES, uid } from "@/lib/adminTypes";

export type CoeurConsequence = {
  cible: string;
  valeur: number;
  mode?: "add" | "set";
  setValeur?: string;
};

export type CoeurChoix = {
  id: string;
  label: string;
  consequences: CoeurConsequence[];
  conditions?: unknown;
  feedbackTexte?: string;
};

export type CoeurDecision = {
  id: string;
  jour: number;
  titre: string;
  dilemme: string;
  heure?: string;
  choix: CoeurChoix[];
  xpGagne?: number;
};

export type CoeurEvenement = {
  id: string;
  jour: number;
  heure: string;
  type: string;
  titre: string;
  texte: string;
};

export type CoeurGameStateInitial = {
  tresorerie: number;
  stock: number;
  production: number;
  tauxRebut: number;
  moral: number;
  ethique: number;
  confiance: {
    marie: number;
    karim: number;
    laurent: number;
    henri: number;
  };
  visibilite: {
    erp: number;
    stock: number;
    production: number;
  };
};

export type ScenarioCoeur = {
  scenario: {
    id: string;
    titre: string;
    entrepriseId: string;
  };
  gameStateInitial: CoeurGameStateInitial;
  decisions: CoeurDecision[];
  evenements: CoeurEvenement[];
};

export type CoeurValidationError = {
  line: number;
  message: string;
};

export type CoeurValidationResult =
  | { ok: true; coeur: ScenarioCoeur }
  | { ok: false; errors: CoeurValidationError[] };

/** Human-facing list for error messages. */
export const VALID_CIBLES_HINT =
  "tresorerie, stock, production, tauxRebut, moral, ethique, confiance.xxx, visibilite.xxx, temps, xp, flags.*, badge.*, machine.*.etat";

const EXACT_CIBLES = new Set([
  "tresorerie",
  "stock",
  "stockKg",
  "production",
  "tauxRebut",
  "rebut",
  "moral",
  "moralEquipe",
  "ethique",
  "confianceClient",
  "autovolt",
  "temps",
  "xp",
  "niveau",
  "qualite",
  "piecesAujourdhui",
  "piecesBrutesSemaine",
]);

export function isValidCible(cible: string): boolean {
  if (!cible || typeof cible !== "string") return false;
  if (EXACT_CIBLES.has(cible)) return true;
  if (/^confiance\.(marie|karim|laurent|henri|pers-marie|pers-karim|pers-laurent|pers-henri)$/.test(cible))
    return true;
  if (/^visibilite\.(erp|stock|production)$/.test(cible)) return true;
  if (/^flags\.[a-zA-Z][a-zA-Z0-9_]*$/.test(cible)) {
    return true;
  }
  if (/^badge\.[a-zA-Z0-9_-]+$/.test(cible)) return true;
  if (/^machine\.[a-zA-Z0-9_-]+\.etat$/.test(cible)) return true;
  if (/^competence\.[a-zA-Z0-9_-]+$/.test(cible)) return true;
  if (
    cible.startsWith("finance.") ||
    cible.startsWith("humain.") ||
    cible.startsWith("relations.") ||
    cible.startsWith("progression.") ||
    cible.startsWith("meta.")
  ) {
    return true;
  }
  return false;
}

export function defaultGameStateInitial(): CoeurGameStateInitial {
  return {
    tresorerie: 420_000,
    stock: 850,
    production: 60,
    tauxRebut: 18,
    moral: 55,
    ethique: 80,
    confiance: { marie: 30, karim: 70, laurent: 50, henri: 65 },
    visibilite: { erp: 0, stock: 0, production: 0 },
  };
}

export function emptyCoeur(scenario: AdminScenario): ScenarioCoeur {
  return {
    scenario: {
      id: scenario.id,
      titre: scenario.titre,
      entrepriseId: scenario.entrepriseId ?? "",
    },
    gameStateInitial: defaultGameStateInitial(),
    decisions: [],
    evenements: [],
  };
}

export function novacierCoeur(): ScenarioCoeur {
  return {
    scenario: {
      id: SCENARIO_ID,
      titre: SCENARIO_TITLE,
      entrepriseId: ENTREPRISE_ID,
    },
    gameStateInitial: defaultGameStateInitial(),
    decisions: novacierDecisions.map((d) => ({
      id: d.id,
      jour: d.jour,
      titre: d.titre,
      dilemme: d.dilemme,
      heure: d.jour === 1 ? "12:00" : d.jour === 3 ? "10:00" : "09:00",
      xpGagne: d.xpGagne ?? 0,
      choix: d.choix.map((c) => ({
        id: c.id,
        label: c.label,
        feedbackTexte: c.feedbackTexte,
        conditions: c.requis ?? c.conditions,
        consequences: c.consequences.map((x) => ({
          cible: x.cible,
          valeur: x.valeur,
          ...(x.mode ? { mode: x.mode } : {}),
          ...(typeof x.setValeur === "string" ? { setValeur: x.setValeur } : {}),
        })),
      })),
    })),
    evenements: [
      {
        id: "adm-ev-start",
        jour: 1,
        heure: "08:00",
        type: "Autre",
        titre: "Semaine critique AutoVolt",
        texte: "Objectif : 500 pièces qualité avant vendredi 16h.",
      },
      {
        id: "adm-ev-mail-laurent",
        jour: 1,
        heure: "08:15",
        type: "Email",
        titre: "Mail Laurent — Où en est le retard ?",
        texte: "AutoVolt appelle cet après-midi. Statut clair avant midi.",
      },
      {
        id: "adm-ev-rumor",
        jour: 2,
        heure: "09:00",
        type: "Rumeur",
        titre: "Rumeur AutoVolt / Pologne",
        texte: "AutoVolt aurait contacté un concurrent en Pologne.",
      },
      {
        id: "adm-ev-panne",
        jour: 3,
        heure: "10:00",
        type: "Panne",
        titre: "PANNE MACHINE 3",
        texte: "Alarme atelier — ouvrir l'Atelier Live.",
      },
      {
        id: "adm-ev-defaut",
        jour: 4,
        heure: "09:30",
        type: "Autre",
        titre: "40 pièces à micro-défaut",
        texte: "Décision éthique : livrer ou jeter.",
      },
      {
        id: "adm-ev-nego",
        jour: 5,
        heure: "14:00",
        type: "Nouveau client",
        titre: "Négociation AutoVolt",
        texte: "Point contrat + débrief 16h.",
      },
    ],
  };
}

export function formatCoeurJson(coeur: ScenarioCoeur): string {
  return JSON.stringify(coeur, null, 2);
}

export function dayTitleFor(jour: number, decisionTitre?: string): string {
  if (dayTitles[jour]) return dayTitles[jour]!;
  if (decisionTitre) return `Jour ${jour} — ${decisionTitre}`;
  return `Jour ${jour}`;
}

function lineOf(text: string, needle: string, occurrence = 0): number {
  let from = 0;
  let found = -1;
  for (let i = 0; i <= occurrence; i++) {
    found = text.indexOf(needle, from);
    if (found < 0) return 1;
    from = found + needle.length;
  }
  return text.slice(0, found).split("\n").length;
}

function err(line: number, message: string): CoeurValidationError {
  return { line: Math.max(1, line), message };
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

/** Validate raw JSON text; returns parsed CŒUR or line-precise errors. */
export function validateCoeurText(text: string): CoeurValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JSON invalide";
    const m = msg.match(/position\s+(\d+)/i);
    let line = 1;
    if (m) {
      const pos = Number(m[1]);
      line = text.slice(0, pos).split("\n").length;
    } else {
      const lm = msg.match(/line\s+(\d+)/i);
      if (lm) line = Number(lm[1]);
    }
    return {
      ok: false,
      errors: [err(line, `JSON invalide : ${msg}`)],
    };
  }

  return validateCoeurObject(parsed, text);
}

export function validateCoeurObject(
  parsed: unknown,
  sourceText?: string
): CoeurValidationResult {
  const text = sourceText ?? JSON.stringify(parsed, null, 2);
  const errors: CoeurValidationError[] = [];

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      errors: [err(1, "Le CŒUR doit être un objet JSON")],
    };
  }

  const root = parsed as Record<string, unknown>;

  if (!root.scenario || typeof root.scenario !== "object") {
    errors.push(
      err(lineOf(text, '"scenario"'), "Champ obligatoire manquant : scenario")
    );
  } else {
    const s = root.scenario as Record<string, unknown>;
    if (!isString(s.id) || !s.id.trim()) {
      errors.push(
        err(lineOf(text, '"id"'), "scenario.id doit être une chaîne non vide")
      );
    }
    if (!isString(s.titre)) {
      errors.push(
        err(lineOf(text, '"titre"'), "scenario.titre doit être une chaîne")
      );
    }
    if (!isString(s.entrepriseId)) {
      errors.push(
        err(
          lineOf(text, '"entrepriseId"'),
          "scenario.entrepriseId doit être une chaîne"
        )
      );
    }
  }

  if (!root.gameStateInitial || typeof root.gameStateInitial !== "object") {
    errors.push(
      err(
        lineOf(text, '"gameStateInitial"'),
        "Champ obligatoire manquant : gameStateInitial"
      )
    );
  } else {
    const g = root.gameStateInitial as Record<string, unknown>;
    for (const key of [
      "tresorerie",
      "stock",
      "production",
      "tauxRebut",
      "moral",
      "ethique",
    ] as const) {
      if (!isNumber(g[key])) {
        errors.push(
          err(
            lineOf(text, `"${key}"`),
            `Erreur : gameStateInitial.${key} doit être un nombre (reçu ${typeof g[key]})`
          )
        );
      }
    }
    const conf = g.confiance;
    if (!conf || typeof conf !== "object") {
      errors.push(
        err(
          lineOf(text, '"confiance"'),
          "gameStateInitial.confiance est obligatoire"
        )
      );
    } else {
      const c = conf as Record<string, unknown>;
      for (const who of ["marie", "karim", "laurent", "henri"] as const) {
        if (!isNumber(c[who])) {
          errors.push(
            err(
              lineOf(text, `"${who}"`),
              `Erreur : confiance.${who} doit être un nombre`
            )
          );
        }
      }
    }
    const vis = g.visibilite;
    if (!vis || typeof vis !== "object") {
      errors.push(
        err(
          lineOf(text, '"visibilite"'),
          "gameStateInitial.visibilite est obligatoire"
        )
      );
    } else {
      const v = vis as Record<string, unknown>;
      for (const k of ["erp", "stock", "production"] as const) {
        if (!isNumber(v[k])) {
          errors.push(
            err(
              lineOf(text, `"${k}"`, k === "stock" ? 1 : 0),
              `Erreur : visibilite.${k} doit être un nombre`
            )
          );
        }
      }
    }
  }

  if (!Array.isArray(root.decisions)) {
    errors.push(
      err(
        lineOf(text, '"decisions"'),
        "Champ obligatoire manquant : decisions (tableau)"
      )
    );
  } else {
    (root.decisions as unknown[]).forEach((d, di) => {
      if (!d || typeof d !== "object") {
        errors.push(err(1, `decisions[${di}] doit être un objet`));
        return;
      }
      const dec = d as Record<string, unknown>;
      const idNeedle = isString(dec.id) ? `"id": "${dec.id}"` : `"decisions"`;
      if (!isString(dec.id) || !dec.id) {
        errors.push(
          err(lineOf(text, idNeedle), `decisions[${di}].id obligatoire`)
        );
      }
      if (!isNumber(dec.jour)) {
        errors.push(
          err(
            lineOf(text, idNeedle),
            `Erreur : decisions[${di}].jour doit être un nombre`
          )
        );
      }
      if (!isString(dec.titre)) {
        errors.push(
          err(lineOf(text, idNeedle), `decisions[${di}].titre obligatoire`)
        );
      }
      if (!isString(dec.dilemme)) {
        errors.push(
          err(lineOf(text, idNeedle), `decisions[${di}].dilemme obligatoire`)
        );
      }
      if (dec.xpGagne !== undefined && !isNumber(dec.xpGagne)) {
        errors.push(
          err(
            lineOf(text, idNeedle),
            `decisions[${di}].xpGagne doit être un nombre`
          )
        );
      }
      if (!Array.isArray(dec.choix)) {
        errors.push(
          err(
            lineOf(text, idNeedle),
            `decisions[${di}].choix doit être un tableau`
          )
        );
      } else {
        (dec.choix as unknown[]).forEach((ch, ci) => {
          if (!ch || typeof ch !== "object") {
            errors.push(
              err(1, `decisions[${di}].choix[${ci}] doit être un objet`)
            );
            return;
          }
          const choice = ch as Record<string, unknown>;
          if (!isString(choice.id)) {
            errors.push(
              err(
                lineOf(text, idNeedle),
                `decisions[${di}].choix[${ci}].id obligatoire`
              )
            );
          }
          if (!isString(choice.label)) {
            errors.push(
              err(
                lineOf(text, idNeedle),
                `decisions[${di}].choix[${ci}].label obligatoire`
              )
            );
          }
          if (!Array.isArray(choice.consequences)) {
            errors.push(
              err(
                lineOf(text, idNeedle),
                `decisions[${di}].choix[${ci}].consequences doit être un tableau`
              )
            );
          } else {
            (choice.consequences as unknown[]).forEach((cons, ki) => {
              if (!cons || typeof cons !== "object") {
                errors.push(
                  err(
                    1,
                    `decisions[${di}].choix[${ci}].consequences[${ki}] invalide`
                  )
                );
                return;
              }
              const c = cons as Record<string, unknown>;
              if (!isString(c.cible)) {
                errors.push(
                  err(
                    lineOf(text, idNeedle),
                    `consequences[${ki}].cible doit être une chaîne`
                  )
                );
              } else if (!isValidCible(c.cible)) {
                errors.push(
                  err(
                    lineOf(text, `"cible": "${c.cible}"`),
                    `Erreur ligne : cible '${c.cible}' inconnue, cibles valides : ${VALID_CIBLES_HINT}`
                  )
                );
              }
              if (!isNumber(c.valeur)) {
                const line = isString(c.cible)
                  ? lineOf(text, `"cible": "${c.cible}"`)
                  : lineOf(text, idNeedle);
                errors.push(
                  err(
                    line,
                    `Erreur : valeur de la cible '${String(c.cible)}' doit être un nombre (reçu ${typeof c.valeur})`
                  )
                );
              }
            });
          }
        });
      }
    });
  }

  if (!Array.isArray(root.evenements)) {
    errors.push(
      err(
        lineOf(text, '"evenements"'),
        "Champ obligatoire manquant : evenements (tableau)"
      )
    );
  } else {
    (root.evenements as unknown[]).forEach((ev, ei) => {
      if (!ev || typeof ev !== "object") {
        errors.push(err(1, `evenements[${ei}] doit être un objet`));
        return;
      }
      const e = ev as Record<string, unknown>;
      for (const key of ["id", "heure", "type", "titre", "texte"] as const) {
        if (!isString(e[key])) {
          errors.push(
            err(
              lineOf(text, '"evenements"'),
              `evenements[${ei}].${key} doit être une chaîne`
            )
          );
        }
      }
      if (!isNumber(e.jour)) {
        errors.push(
          err(
            lineOf(text, '"evenements"'),
            `evenements[${ei}].jour doit être un nombre`
          )
        );
      }
    });
  }

  if (errors.length) return { ok: false, errors };

  return { ok: true, coeur: parsed as ScenarioCoeur };
}

/** Build CŒUR from legacy admin slices (migration / fallback). */
export function buildCoeurFromAdminState(
  state: AdminState,
  scenarioId: string
): ScenarioCoeur {
  const scenario = state.scenarios.find((s) => s.id === scenarioId);
  if (scenarioId === SCENARIO_ID && !state.coeurs?.[scenarioId]) {
    // Prefer rich seed for Novacier when no stored CŒUR yet
    const base = novacierCoeur();
    if (scenario) {
      base.scenario.titre = scenario.titre || base.scenario.titre;
      base.scenario.entrepriseId =
        scenario.entrepriseId || base.scenario.entrepriseId;
    }
    return base;
  }

  if (!scenario) {
    return {
      scenario: { id: scenarioId, titre: "Inconnu", entrepriseId: "" },
      gameStateInitial: defaultGameStateInitial(),
      decisions: [],
      evenements: [],
    };
  }

  const decisions = state.decisions
    .filter((d) => d.scenarioId === scenarioId)
    .sort((a, b) => a.jour - b.jour || a.order - b.order)
    .map((d) => adminDecisionToCoeur(d));

  const evenements = state.events
    .filter((e) => e.scenarioId === scenarioId)
    .sort(
      (a, b) =>
        a.jour - b.jour || a.heure.localeCompare(b.heure) || a.order - b.order
    )
    .map((e) => ({
      id: e.id,
      jour: e.jour,
      heure: e.heure,
      type: e.type,
      titre: e.titre,
      texte: e.texte,
    }));

  return {
    scenario: {
      id: scenario.id,
      titre: scenario.titre,
      entrepriseId: scenario.entrepriseId ?? "",
    },
    gameStateInitial: defaultGameStateInitial(),
    decisions,
    evenements,
  };
}

function adminDecisionToCoeur(d: AdminDecision): CoeurDecision {
  const fromFile = novacierDecisions.find((x) => x.id === d.id);
  return {
    id: d.id,
    jour: d.jour,
    titre: d.titre,
    dilemme: d.dilemme,
    heure: d.heure,
    xpGagne: fromFile?.xpGagne ?? 0,
    choix: d.choix.map((c, i) => {
      const base = fromFile?.choix.find((b) => b.id === c.id) ?? fromFile?.choix[i];
      return {
        id: c.id,
        label: c.texte,
        feedbackTexte: base?.feedbackTexte,
        conditions: base?.requis ?? base?.conditions,
        consequences: c.consequences.map((cons) => ({
          cible: cons.metric,
          valeur: cons.delta,
          ...(cons.mode ? { mode: cons.mode } : {}),
          ...(cons.setValeur ? { setValeur: cons.setValeur } : {}),
        })),
      };
    }),
  };
}

/** Project CŒUR → admin decisions/events for legacy Studio pages & play bridge. */
export function coeurToAdminSlices(coeur: ScenarioCoeur): {
  scenarioPatch: Partial<AdminScenario>;
  decisions: AdminDecision[];
  events: AdminEvent[];
} {
  const scenarioId = coeur.scenario.id;
  const decisions: AdminDecision[] = coeur.decisions.map((d, idx) => ({
    id: d.id || uid("dec"),
    scenarioId,
    titre: d.titre,
    jour: d.jour,
    heure: d.heure ?? "09:00",
    dilemme: d.dilemme,
    order: idx + 1,
    choix: d.choix.map((c) => ({
      id: c.id || uid("ch"),
      texte: c.label,
      consequences: c.consequences.map((cons) => ({
        metric: cons.cible,
        delta: cons.valeur,
        ...(cons.mode ? { mode: cons.mode } : {}),
        ...(cons.setValeur ? { setValeur: cons.setValeur } : {}),
      })),
    })),
  }));

  const events: AdminEvent[] = coeur.evenements.map((e, idx) => ({
    id: e.id || uid("evt"),
    scenarioId,
    titre: e.titre,
    jour: e.jour,
    heure: e.heure,
    type: (ADMIN_EVENT_TYPES.includes(e.type as AdminEventType)
      ? e.type
      : "Autre") as AdminEventType,
    texte: e.texte,
    order: idx + 1,
  }));

  return {
    scenarioPatch: {
      titre: coeur.scenario.titre,
      entrepriseId: coeur.scenario.entrepriseId || null,
    },
    decisions,
    events,
  };
}

export function humanizeCible(cible: string): string {
  const map: Record<string, string> = {
    tresorerie: "Trésorerie",
    stock: "Stock",
    stockKg: "Stock",
    production: "Production",
    tauxRebut: "Taux de rebut",
    rebut: "Taux de rebut",
    moral: "Moral",
    moralEquipe: "Moral",
    ethique: "Éthique",
    confianceClient: "Confiance client",
    temps: "Temps",
    xp: "XP",
    "confiance.marie": "Confiance Marie",
    "confiance.karim": "Confiance Karim",
    "confiance.laurent": "Confiance Laurent",
    "confiance.henri": "Confiance Henri",
    "visibilite.erp": "Visibilité ERP",
    "visibilite.stock": "Visibilité stock",
    "visibilite.production": "Visibilité production",
    "flags.sensorInstalled": "Capteur installé",
    "flags.overtimeBonus": "Bonus heures sup",
    "flags.marieReorgBonus": "Bonus réorga Marie",
    "flags.machine3DownDays": "Machine 3 à l'arrêt",
    "flags.machine3Bypass": "Contournement Machine 3",
    "flags.alarmActive": "Alarme",
  };
  if (map[cible]) return map[cible]!;
  if (cible.startsWith("confiance.")) {
    const n = cible.slice("confiance.".length);
    return `Confiance ${n.charAt(0).toUpperCase()}${n.slice(1)}`;
  }
  if (cible.startsWith("visibilite.")) {
    return `Visibilité ${cible.slice("visibilite.".length)}`;
  }
  if (cible.startsWith("flags.")) return cible.slice("flags.".length);
  if (cible.startsWith("badge.")) return `Badge ${cible.slice("badge.".length)}`;
  if (cible.startsWith("machine.")) return `Machine ${cible.split(".")[1]}`;
  return cible;
}

export function humanizeConsequence(c: CoeurConsequence): string {
  const label = humanizeCible(c.cible);
  if (c.mode === "set" || c.setValeur !== undefined) {
    if (c.setValeur) return `${label} → ${c.setValeur}`;
    if (
      c.cible.startsWith("visibilite.") ||
      c.cible === "flags.sensorInstalled"
    ) {
      return c.valeur >= 1
        ? `${label} débloquée`
        : `${label} = ${c.valeur}`;
    }
    return `${label} = ${c.valeur.toLocaleString("fr-FR")}`;
  }
  if (c.cible === "tresorerie" || c.cible === "stock" || c.cible === "stockKg") {
    const sign = c.valeur > 0 ? "+" : "";
    return `${label} ${sign}${c.valeur.toLocaleString("fr-FR")}€`;
  }
  if (c.valeur === 0) return `${label} inchangé`;
  const sign = c.valeur > 0 ? "+" : "";
  return `${label} ${sign}${c.valeur.toLocaleString("fr-FR")}`;
}

export function humanizeChoixSummary(choix: CoeurChoix): string {
  const meaningful = choix.consequences.filter(
    (c) => c.cible !== "temps" && c.cible !== "xp"
  );
  if (meaningful.length === 0) {
    return "Rien ne change";
  }
  return meaningful.map(humanizeConsequence).join(", ");
}

/** Lightweight JSON syntax coloring for the CŒUR editor preview. */
export function highlightJson(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (match, str: string | undefined, colon: string | undefined, lit: string | undefined) => {
      if (str !== undefined) {
        if (colon) {
          return `<span class="json-key">${str}</span>${colon}`;
        }
        return `<span class="json-string">${str}</span>`;
      }
      if (lit !== undefined) {
        return `<span class="json-lit">${lit}</span>`;
      }
      return `<span class="json-number">${match}</span>`;
    }
  );
}

export function patchConsequenceValeur(
  coeur: ScenarioCoeur,
  decisionId: string,
  choixId: string,
  cible: string,
  valeur: number
): ScenarioCoeur {
  return {
    ...coeur,
    decisions: coeur.decisions.map((d) => {
      if (d.id !== decisionId) return d;
      return {
        ...d,
        choix: d.choix.map((c) => {
          if (c.id !== choixId) return c;
          return {
            ...c,
            consequences: c.consequences.map((cons) =>
              cons.cible === cible ? { ...cons, valeur } : cons
            ),
          };
        }),
      };
    }),
  };
}

export function patchDecisionField(
  coeur: ScenarioCoeur,
  decisionId: string,
  field: "dilemme" | "titre",
  value: string
): ScenarioCoeur {
  return {
    ...coeur,
    decisions: coeur.decisions.map((d) =>
      d.id === decisionId ? { ...d, [field]: value } : d
    ),
  };
}
