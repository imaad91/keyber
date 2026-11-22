/**
 * Keyber OS — Moteur d'Événements (Étape 15)
 * Déclenche le catalogue param selon heure + conditions (feeling POC).
 * Toasts / bannière urgente via world.eventNotifications + world.urgentBanner.
 * Aucun événement inventé : uniquement le fichier de paramétrage.
 */

import { clockToOffset } from "@/lib/evenements";
import { osApplyConsequences } from "@/lib/keyberOs/consequences";
import type { OsConsequence, OsPlayState } from "@/lib/keyberOs/types";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";

export type OsParamEvent = {
  nom: string;
  type: string;
  description: string;
  id?: string;
  jour?: number;
  heure?: string;
  urgent?: boolean;
  deadlineHeure?: string;
  condition?: {
    si: string;
    superieurA?: number;
    inferieurA?: number;
    egalA?: number;
  };
  consequences?: OsConsequence[];
  consequencesDeadline?: OsConsequence[];
};

function slugId(nom: string, index: number): string {
  const base = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `ev-${base || "item"}-${index}`;
}

/** Mappe le type métier param → type UI toast (message / panne / alerte / visite). */
export function osMapEventUiType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("panne") || t.includes("technique")) return "panne";
  if (t.includes("visite") || t.includes("humain")) return "visite";
  if (
    t.includes("message") ||
    t.includes("mail") ||
    t.includes("fournisseur") ||
    t.includes("client") ||
    t.includes("logistique")
  ) {
    return "message";
  }
  return "alerte";
}

function readNumeric(state: OsPlayState, path: string): number | null {
  const p = path.trim().toLowerCase();
  if (p === "stock" || p === "finance.stockkg" || p === "stockkg") {
    return state.stock;
  }
  if (
    p === "tresorerie" ||
    p === "finance.tresorerie" ||
    p === "tresoreriebrute"
  ) {
    return state.tresorerieBrute;
  }
  if (p === "production" || p === "finance.productionparjour") {
    return state.production;
  }
  if (p === "commandes" || p === "finance.commandes") {
    return state.commandes;
  }
  if (p === "moral" || p === "moralequipe" || p === "humain.moralequipe") {
    return state.humain?.moralEquipe ?? null;
  }
  if (p === "ethique" || p === "humain.ethique") {
    return state.humain?.ethique ?? null;
  }
  if (
    p === "confianceclient" ||
    p === "humain.confianceclient"
  ) {
    return state.humain?.confianceClient ?? null;
  }
  if (p.startsWith("flags.")) {
    const key = path.slice("flags.".length);
    return state.flags?.[key] ?? 0;
  }
  if (p.startsWith("relations.") || p.startsWith("confiance.")) {
    const key = path.split(".")[1]!;
    return state.relations?.[key] ?? 50;
  }
  return null;
}

function conditionOk(
  state: OsPlayState,
  cond?: OsParamEvent["condition"]
): boolean {
  if (!cond) return true;
  const n = readNumeric(state, cond.si);
  if (n === null || Number.isNaN(n)) return false;
  if (cond.superieurA !== undefined && !(n > cond.superieurA)) return false;
  if (cond.inferieurA !== undefined && !(n < cond.inferieurA)) return false;
  if (cond.egalA !== undefined && n !== cond.egalA) return false;
  return true;
}

function catalogFromParam(state: OsPlayState): OsParamEvent[] {
  const raw = state.param["Événements entreprise"] || [];
  const fallbackHeures =
    getOsRuntimeConfig().moteurEvenements.fallbackHeures ??
    ["09:00", "10:00", "11:00", "14:00"];

  return raw.map((e, i) => {
    const ev = e as OsParamEvent;
    const heure =
      ev.heure ||
      (fallbackHeures[i % Math.max(1, fallbackHeures.length)] as string);
    return {
      ...ev,
      id: ev.id || slugId(ev.nom, i),
      jour: ev.jour ?? 0,
      heure,
      type: ev.type || "alerte",
      description: ev.description || "",
    };
  });
}

function injectSideEffects(
  state: OsPlayState,
  ev: OsParamEvent,
  uiType: string
): OsPlayState {
  let next = state;
  const heure = next.meta?.heureActuelle ?? "08:00";
  const day = next.meta?.jourActuel ?? next.day;

  if (uiType === "message") {
    const mailId = `mail-${ev.id}`;
    if (!next.computer.emails.some((m) => m.id === mailId)) {
      const from =
        next.param.Entreprise || next.param.Nom || "Direction";
      next = {
        ...next,
        computer: {
          ...next.computer,
          emails: [
            {
              id: mailId,
              from,
              subject: ev.nom,
              preview: (ev.description || "").slice(0, 80),
              body: ev.description || ev.nom,
              day: Math.max(1, day),
              time: heure,
              read: false,
              urgent: Boolean(ev.urgent),
            },
            ...next.computer.emails,
          ],
        },
      };
    }
  }

  if (uiType === "panne" || uiType === "alerte") {
    next = {
      ...next,
      world: {
        ...next.world,
        alarmActive: uiType === "panne" ? true : next.world.alarmActive,
        journal: [
          {
            id: `j-ev-${ev.id}`,
            day: Math.max(1, day),
            titre: ev.nom,
            narration: ev.description || ev.nom,
            xp: 0,
            at: heure,
          },
          ...next.world.journal,
        ],
      },
      flags: {
        ...next.flags,
        alarmActive: uiType === "panne" ? 1 : next.flags?.alarmActive ?? 0,
        dashboardAlert: 1,
      },
    };
  } else {
    next = {
      ...next,
      world: {
        ...next.world,
        journal: [
          {
            id: `j-ev-${ev.id}`,
            day: Math.max(1, day),
            titre: ev.nom,
            narration: ev.description || ev.nom,
            xp: 0,
            at: heure,
          },
          ...next.world.journal,
        ],
      },
    };
  }

  return next;
}

function fireEvent(
  state: OsPlayState,
  ev: OsParamEvent,
  opts: { notify: boolean }
): OsPlayState {
  const cfg = getOsRuntimeConfig().moteurEvenements;
  const notifCfg = getOsRuntimeConfig().notifications;
  const uiType = osMapEventUiType(ev.type);
  let next = state;

  next = {
    ...next,
    eventsFired: [...next.eventsFired, ev.nom],
    historique: {
      ...next.historique,
      evenementsDeclenches: [
        ...(next.historique?.evenementsDeclenches ?? []),
        ev.nom,
      ],
      decisionsPrises: next.historique?.decisionsPrises ?? [],
    },
    stock: Math.max(0, next.stock + cfg.stockImpact),
  };
  if (next.finance) {
    next = {
      ...next,
      finance: { ...next.finance, stockKg: next.stock },
    };
  }

  if (ev.consequences?.length) {
    next = osApplyConsequences(next, ev.consequences);
  }

  next = injectSideEffects(next, ev, uiType);

  const heure = next.meta?.heureActuelle ?? "08:00";
  let notifications = [...(next.world.eventNotifications ?? [])];
  let urgentBanner = next.world.urgentBanner;

  if (opts.notify && notifCfg?.enabled !== false) {
    notifications = [
      {
        id: ev.id || ev.nom,
        titre: ev.nom,
        type: uiType,
        at: heure,
      },
      ...notifications,
    ].slice(0, 8);

    if (ev.urgent && ev.deadlineHeure && notifCfg?.showUrgentBanner !== false) {
      urgentBanner = {
        eventId: ev.id || ev.nom,
        message: `URGENT — ${ev.nom} — Tu dois décider avant ${ev.deadlineHeure}`,
        deadlineHeure: ev.deadlineHeure,
      };
    }
  }

  next = {
    ...next,
    world: {
      ...next.world,
      eventNotifications: notifications,
      urgentBanner,
    },
    log: [
      ...next.log,
      `Moteur d'Événements → « ${ev.nom} » (${ev.type}${ev.heure ? ` @ ${ev.heure}` : ""}) → toast${ev.urgent ? " + bannière" : ""}`,
    ],
  };

  return next;
}

function expireUrgentDeadline(
  state: OsPlayState,
  catalog: OsParamEvent[]
): OsPlayState {
  const banner = state.world.urgentBanner;
  if (!banner) return state;

  const elapsed = state.meta?.minutesSinceStart ?? state.minutesSinceStart ?? 0;
  if (elapsed < clockToOffset(banner.deadlineHeure)) return state;

  const src = catalog.find(
    (e) => (e.id || e.nom) === banner.eventId || e.nom === banner.eventId
  );
  let next = state;
  if (src?.consequencesDeadline?.length) {
    next = osApplyConsequences(next, src.consequencesDeadline);
  }
  const day = next.meta?.jourActuel ?? next.day;
  const heure = next.meta?.heureActuelle ?? "08:00";
  return {
    ...next,
    world: {
      ...next.world,
      urgentBanner: null,
      journal: [
        {
          id: `j-deadline-${banner.eventId}`,
          day: Math.max(1, day),
          titre: "Délai urgent dépassé",
          narration: banner.message,
          xp: 0,
          at: heure,
        },
        ...next.world.journal,
      ],
    },
    feedback: `Délai dépassé : ${banner.message}`,
    log: [
      ...next.log,
      `Moteur d'Événements → délai urgent « ${banner.eventId} » dépassé`,
    ],
  };
}

/**
 * Appelé après chaque avancée de temps (et après décision).
 */
export function osEvenementsTrigger(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("moteur-evenements")) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur d'Événements → module désactivé (Admin)",
      ],
    };
  }

  const catalog = catalogFromParam(state);
  if (!catalog.length) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur d'Événements → aucun événement dans le paramétrage",
      ],
    };
  }

  const fired = new Set(state.eventsFired);
  const jour = state.meta?.jourActuel ?? state.day;
  const elapsed = state.meta?.minutesSinceStart ?? state.minutesSinceStart ?? 0;
  let next = state;

  for (const ev of catalog) {
    if (fired.has(ev.nom)) continue;
    const jourMatch = !ev.jour || ev.jour === 0 || ev.jour === jour;
    if (!jourMatch) continue;

    const timeOk = !ev.heure || elapsed >= clockToOffset(ev.heure);
    const condOk = conditionOk(next, ev.condition);
    const shouldFire = ev.heure
      ? timeOk && condOk
      : condOk && Boolean(ev.condition);

    if (!shouldFire) continue;

    fired.add(ev.nom);
    next = fireEvent(next, ev, { notify: true });
  }

  next = expireUrgentDeadline(next, catalog);
  return next;
}

/** Force le prochain événement non tiré (Admin Notifications). */
export function osEvenementsForceNext(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("moteur-evenements")) return state;
  const catalog = catalogFromParam(state);
  const nextEv = catalog.find((e) => !state.eventsFired.includes(e.nom));
  if (!nextEv) {
    return {
      ...state,
      log: [
        ...state.log,
        "Moteur d'Événements → force : plus aucun événement restant",
      ],
    };
  }
  return fireEvent(state, nextEv, { notify: true });
}

export function osDismissEventNotification(
  state: OsPlayState,
  id?: string
): OsPlayState {
  const list = state.world.eventNotifications ?? [];
  return {
    ...state,
    world: {
      ...state.world,
      eventNotifications: id
        ? list.filter((n) => n.id !== id)
        : list.slice(1),
    },
  };
}

export function osClearUrgentBanner(state: OsPlayState): OsPlayState {
  return {
    ...state,
    world: { ...state.world, urgentBanner: null },
  };
}
