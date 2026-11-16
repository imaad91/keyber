/**
 * Keyber OS — application de conséquences param (Étape 14).
 * Mappe des cibles génériques vers OsPlayState. Aucun scénario hardcodé.
 */

import type { OsConsequence, OsPlayState } from "@/lib/keyberOs/types";
import { osTempsAdvance } from "@/lib/keyberOs/temps";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function applyNumeric(
  current: number,
  c: OsConsequence,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
): number {
  if (c.mode === "set") return clamp(c.valeur, min, max);
  return clamp(current + c.valeur, min, max);
}

/**
 * Applique une conséquence sur l'état OS.
 * Cibles supportées (aliases inclus) : tresorerie, stock, production,
 * commandes, moral, ethique, confianceClient, xp, score, pieces,
 * rebut, temps, flags.*, relations.*, visibilite, machine.<i>.etat
 */
export function osApplyConsequence(
  state: OsPlayState,
  c: OsConsequence
): OsPlayState {
  const cible = c.cible.trim().toLowerCase();

  if (cible === "temps" || cible === "meta.minutessincestart") {
    const minutes = c.mode === "set" ? 0 : Math.max(0, c.valeur);
    return minutes > 0 ? osTempsAdvance(state, minutes) : state;
  }

  if (cible.startsWith("flags.")) {
    const key = c.cible.slice("flags.".length);
    const prev = state.flags?.[key] ?? 0;
    return {
      ...state,
      flags: {
        ...state.flags,
        [key]: applyNumeric(prev, c),
      },
    };
  }

  if (
    cible.startsWith("relations.") ||
    cible.startsWith("confiance.")
  ) {
    const key = c.cible.split(".")[1]!;
    const prev = state.relations?.[key] ?? 50;
    return {
      ...state,
      relations: {
        ...state.relations,
        [key]: applyNumeric(prev, c, 0, 100),
      },
    };
  }

  if (cible.startsWith("machine.") && cible.endsWith(".etat") && c.setValeur) {
    const parts = c.cible.split(".");
    const idOrIndex = parts[1]!;
    const etat = c.setValeur;
    return {
      ...state,
      computer: {
        ...state.computer,
        machines: state.computer.machines.map((m, i) => {
          const match =
            m.nom === idOrIndex ||
            String(i) === idOrIndex ||
            `m${i}` === idOrIndex;
          if (!match) return m;
          return { ...m, etat };
        }),
      },
    };
  }

  let next = { ...state };

  const patchFinance = (fn: (f: NonNullable<OsPlayState["finance"]>) => void) => {
    if (!next.finance) return;
    const finance = { ...next.finance };
    fn(finance);
    next = { ...next, finance };
  };

  const patchHumain = (fn: (h: NonNullable<OsPlayState["humain"]>) => void) => {
    if (!next.humain) return;
    const humain = { ...next.humain };
    fn(humain);
    next = { ...next, humain };
  };

  switch (cible) {
    case "tresorerie":
    case "finance.tresorerie":
    case "tresoreriebute":
    case "tresoreriebrute": {
      const v = applyNumeric(next.tresorerieBrute, c, 0);
      next.tresorerieBrute = v;
      patchFinance((f) => {
        f.tresorerie = v;
      });
      break;
    }
    case "stock":
    case "finance.stockkg":
    case "stockkg": {
      const v = applyNumeric(next.stock, c, 0);
      next.stock = v;
      patchFinance((f) => {
        f.stockKg = v;
      });
      break;
    }
    case "production":
    case "finance.productionparjour": {
      const v = applyNumeric(next.production, c, 0);
      next.production = v;
      patchFinance((f) => {
        f.productionParJour = v;
      });
      break;
    }
    case "commandes":
    case "finance.commandes": {
      const v = applyNumeric(next.commandes, c, 0);
      next.commandes = v;
      patchFinance((f) => {
        f.commandes = v;
      });
      break;
    }
    case "pieces":
    case "piecesaujourdhui":
    case "finance.piecesaujourdhui": {
      patchFinance((f) => {
        f.piecesAujourdhui = applyNumeric(f.piecesAujourdhui, c, 0);
      });
      break;
    }
    case "piecesbrutessemaine":
    case "qualite":
    case "finance.piecesbrutessemaine":
    case "finance.qualite": {
      patchFinance((f) => {
        if (cible.includes("qualite") && !cible.includes("pieces")) {
          f.qualite = applyNumeric(f.qualite, c, 0);
        } else {
          f.piecesBrutesSemaine = applyNumeric(f.piecesBrutesSemaine, c, 0);
          f.qualite = f.piecesBrutesSemaine;
        }
      });
      break;
    }
    case "rebut":
    case "tauxrebut":
    case "finance.tauxrebut": {
      patchFinance((f) => {
        f.tauxRebut = applyNumeric(f.tauxRebut, c, 0, 1);
      });
      break;
    }
    case "moral":
    case "moralequipe":
    case "humain.moralequipe": {
      patchHumain((h) => {
        h.moralEquipe = applyNumeric(h.moralEquipe, c, 0, 100);
      });
      break;
    }
    case "ethique":
    case "humain.ethique": {
      patchHumain((h) => {
        h.ethique = applyNumeric(h.ethique, c, 0, 100);
      });
      break;
    }
    case "confianceclient":
    case "humain.confianceclient": {
      patchHumain((h) => {
        h.confianceClient = applyNumeric(h.confianceClient, c, 0, 100);
      });
      break;
    }
    case "xp":
    case "progression.xp": {
      const v = applyNumeric(next.xp, c, 0);
      next.xp = v;
      if (next.progression) {
        next.progression = { ...next.progression, xp: v };
      }
      break;
    }
    case "score":
    case "progression.score": {
      const v = applyNumeric(next.score, c, 0);
      next.score = v;
      if (next.progression) {
        next.progression = { ...next.progression, score: v };
      }
      break;
    }
    case "visibilite":
    case "visibilitylevel":
    case "visibilite.level": {
      const v = Math.round(applyNumeric(next.visibilityLevel, c, 0, 3));
      next.visibilityLevel = v;
      if (next.visibilite) {
        next.visibilite = { ...next.visibilite, level: v };
      }
      break;
    }
    default:
      next.log = [
        ...next.log,
        `Conséquence → cible inconnue « ${c.cible} » (ignorée)`,
      ];
  }

  return next;
}

export function osApplyConsequences(
  state: OsPlayState,
  list: OsConsequence[] | undefined
): OsPlayState {
  if (!list?.length) return state;
  return list.reduce((s, c) => osApplyConsequence(s, c), state);
}
