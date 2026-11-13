/**
 * Time-driven + conditional event engine for Mode Histoire.
 */

import type { Consequence } from "./decisions";
import type { GameState } from "./gameState";
import { getPath, setPath, syncMetaClock } from "./gameState";

export type EvenementType = "message" | "panne" | "alerte" | "visite";

export type EvenementCondition = {
  si: string;
  superieurA?: number;
  inferieurA?: number;
  egalA?: number;
};

export type Evenement = {
  id: string;
  jour: number;
  /** Clock "HH:MM" for programmed events; omit for pure conditionals */
  heure?: string;
  type: EvenementType;
  titre: string;
  texte: string;
  condition?: EvenementCondition;
  consequences?: Consequence[];
  urgent?: boolean;
  /** Deadline clock for urgent decision (e.g. "16:00") */
  deadlineHeure?: string;
  /** Consequences if urgent not handled before deadline */
  consequencesDeadline?: Consequence[];
};

export type EventNotification = {
  id: string;
  titre: string;
  type: EvenementType;
  at: string;
};

export type UrgentBanner = {
  eventId: string;
  message: string;
  deadlineHeure: string;
};

function parseClockToMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes since 08:00 start. */
export function clockToOffset(heure: string): number {
  return Math.max(0, parseClockToMinutes(heure) - 8 * 60);
}

function conditionOk(state: GameState, cond?: EvenementCondition): boolean {
  if (!cond) return true;
  const raw = getPath(state, cond.si);
  const n = typeof raw === "number" ? raw : Number(raw);
  if (Number.isNaN(n)) return false;
  if (cond.superieurA !== undefined && !(n > cond.superieurA)) return false;
  if (cond.inferieurA !== undefined && !(n < cond.inferieurA)) return false;
  if (cond.egalA !== undefined && n !== cond.egalA) return false;
  return true;
}

function applySimpleConsequence(state: GameState, c: Consequence): GameState {
  if (c.mode === "set" || c.setValeur !== undefined) {
    const value = c.setValeur !== undefined ? c.setValeur : c.valeur;
    return setPath(state, c.cible, value as number | string);
  }
  const cur = getPath(state, c.cible);
  const curNum = typeof cur === "number" ? cur : 0;
  return setPath(state, c.cible, curNum + c.valeur);
}

/** Canonical Novacier event catalog (player runtime). */
export const NOVACIER_EVENEMENTS: Evenement[] = [
  {
    id: "ev-mail-laurent-j2",
    jour: 2,
    heure: "10:00",
    type: "message",
    titre: "Email de Laurent",
    texte:
      "Laurent : AutoVolt insiste pour un point statut aujourd'hui. Réponds avant midi.",
    consequences: [
      { cible: "flags.mailLaurentJ2", valeur: 1, mode: "set" },
    ],
  },
  {
    id: "ev-rumor-j2",
    jour: 2,
    heure: "09:00",
    type: "message",
    titre: "Rumeur AutoVolt / Pologne",
    texte: "On parle d'un concurrent polonais contacté par AutoVolt.",
  },
  {
    id: "ev-alerte-stock",
    jour: 0,
    type: "alerte",
    titre: "Alerte stock",
    texte: "Stock sous le seuil de sécurité (200 kg).",
    condition: { si: "stock", inferieurA: 200 },
    consequences: [{ cible: "flags.alerteStock", valeur: 1, mode: "set" }],
  },
  {
    id: "ev-marie-mefiante",
    jour: 0,
    type: "visite",
    titre: "Marie méfiante",
    texte: "Marie évite ton regard. La confiance est trop basse.",
    condition: { si: "confiance.marie", inferieurA: 40 },
  },
  {
    id: "ev-panne-m3",
    jour: 3,
    heure: "10:00",
    type: "panne",
    titre: "Panne Machine 3",
    texte: "Alarme atelier — tu dois décider avant 16:00.",
    urgent: true,
    deadlineHeure: "16:00",
    consequences: [
      { cible: "flags.alarmActive", valeur: 1, mode: "set" },
      { cible: "machine.m3.etat", valeur: 0, setValeur: "PANNE" },
    ],
    consequencesDeadline: [
      { cible: "qualite", valeur: -40 },
      { cible: "moral", valeur: -10 },
      { cible: "confianceClient", valeur: -8 },
    ],
  },
  {
    id: "ev-mail-laurent-j1",
    jour: 1,
    heure: "08:15",
    type: "message",
    titre: "Email de Laurent",
    texte: "Où en est le retard ? AutoVolt appelle cet après-midi.",
  },
  {
    id: "ev-defaut-j4",
    jour: 4,
    heure: "09:30",
    type: "alerte",
    titre: "40 pièces à micro-défaut",
    texte: "Contrôle qualité : décisions éthiques à venir.",
  },
];

export function evenementsForScenario(scenarioId: string): Evenement[] {
  void scenarioId;
  return NOVACIER_EVENEMENTS;
}

function injectWorldSideEffects(state: GameState, ev: Evenement): GameState {
  let next = state;
  if (ev.type === "message") {
    const already = next.world.emails.some((e) => e.id === `mail-${ev.id}`);
    if (!already) {
      next = {
        ...next,
        world: {
          ...next.world,
          emails: [
            {
              id: `mail-${ev.id}`,
              from: "Laurent Moreau <laurent@novacier.fr>",
              subject: ev.titre,
              preview: ev.texte.slice(0, 80),
              body: ev.texte,
              time: next.meta.heureActuelle,
              read: false,
              urgent: Boolean(ev.urgent),
            },
            ...next.world.emails,
          ],
        },
      };
    }
  }
  if (ev.type === "panne" || ev.type === "alerte") {
    const already = next.world.events.some((e) => e.id === ev.id);
    if (!already) {
      next = {
        ...next,
        world: {
          ...next.world,
          events: [
            {
              id: ev.id,
              kind: ev.type === "panne" ? "MACHINE" : "AUTRE",
              titre: ev.titre,
              description: ev.texte,
              timestamp: next.meta.heureActuelle,
            },
            ...next.world.events,
          ],
          alarmActive: ev.type === "panne" ? true : next.world.alarmActive,
        },
        flags: {
          ...next.flags,
          alarmActive:
            ev.type === "panne" ? 1 : next.flags.alarmActive,
          dashboardAlert: 1,
        },
      };
    }
  }
  return next;
}

/**
 * Called whenever time advances. Triggers due programmed/conditional events once.
 */
export function checkEvenements(
  state: GameState,
  catalog: Evenement[] = NOVACIER_EVENEMENTS
): GameState {
  const jour = state.meta.jourActuel;
  const fired = new Set(state.historique.evenementsDeclenches);
  let next = state;
  const notifications: EventNotification[] = (
    state.world.eventNotifications ?? []
  ).map((n) => ({
    id: n.id,
    titre: n.titre,
    type: n.type as EvenementType,
    at: n.at,
  }));
  let urgentBanner = state.world.urgentBanner ?? null;

  for (const ev of catalog) {
    if (fired.has(ev.id)) continue;
    const jourMatch = ev.jour === 0 || ev.jour === jour;
    if (!jourMatch) continue;

    const timeOk =
      !ev.heure ||
      state.meta.minutesSinceStart >= clockToOffset(ev.heure);
    const condOk = conditionOk(state, ev.condition);
    // Programmed: need time; conditional-only (no heure): need condition
    const shouldFire = ev.heure
      ? timeOk && condOk
      : condOk && Boolean(ev.condition);

    if (!shouldFire) continue;

    fired.add(ev.id);
    for (const c of ev.consequences ?? []) {
      next = applySimpleConsequence(next, c);
    }
    next = injectWorldSideEffects(next, ev);

    next = {
      ...next,
      historique: {
        ...next.historique,
        evenementsDeclenches: Array.from(fired),
      },
      world: {
        ...next.world,
        journal: [
          {
            id: `j-ev-${ev.id}`,
            day: Math.max(1, jour),
            titre: ev.titre,
            narration: ev.texte,
            xp: 0,
            at: next.meta.heureActuelle,
            mode: "histoire",
            modeLabel: `Novacier Jour ${Math.max(1, jour)}`,
          },
          ...next.world.journal,
        ],
      },
    };

    notifications.unshift({
      id: ev.id,
      titre: ev.titre,
      type: ev.type,
      at: next.meta.heureActuelle,
    });

    if (ev.urgent && ev.deadlineHeure) {
      urgentBanner = {
        eventId: ev.id,
        message: `URGENT — ${ev.titre} — Tu dois décider avant ${ev.deadlineHeure}`,
        deadlineHeure: ev.deadlineHeure,
      };
    }
  }

  // Urgent deadline expiry
  if (urgentBanner) {
    const deadline = clockToOffset(urgentBanner.deadlineHeure);
    if (next.meta.minutesSinceStart >= deadline) {
      const src = catalog.find((e) => e.id === urgentBanner!.eventId);
      if (src?.consequencesDeadline) {
        for (const c of src.consequencesDeadline) {
          next = applySimpleConsequence(next, c);
        }
      }
      next = {
        ...next,
        world: {
          ...next.world,
          feedbackFlash: `Délai dépassé : ${urgentBanner.message}`,
          journal: [
            {
              id: `j-deadline-${urgentBanner.eventId}`,
              day: Math.max(1, jour),
              titre: "Délai urgent dépassé",
              narration: urgentBanner.message,
              xp: 0,
              at: next.meta.heureActuelle,
              mode: "histoire",
            },
            ...next.world.journal,
          ],
        },
      };
      urgentBanner = null;
    }
  }

  next = {
    ...next,
    world: {
      ...next.world,
      eventNotifications: notifications.slice(0, 8),
      urgentBanner,
    },
  };

  return syncMetaClock(next);
}

/** Missed day decision — apply soft negative fallout. */
export function applyMissedDecision(state: GameState): GameState {
  if (state.world.dayDecisionId) return state;
  let next = state;
  next = applySimpleConsequence(next, { cible: "moral", valeur: -5 });
  next = applySimpleConsequence(next, { cible: "confianceClient", valeur: -5 });
  return {
    ...next,
    world: {
      ...next.world,
      dayDecisionId: "non-prise",
      journal: [
        {
          id: `j-missed-${state.meta.jourActuel}`,
          day: state.meta.jourActuel,
          titre: "Décision non prise",
          narration:
            "La journée s'est terminée sans décision. Conséquences : moral et confiance client en baisse.",
          xp: 0,
          at: "18:00",
          mode: "histoire",
          modeLabel: `Novacier Jour ${state.meta.jourActuel}`,
        },
        ...next.world.journal,
      ],
      feedbackFlash: "Décision du jour : Non prise.",
    },
    historique: {
      ...next.historique,
      decisionsPrises: [
        ...next.historique.decisionsPrises,
        {
          decisionId: `missed-j${state.meta.jourActuel}`,
          jour: state.meta.jourActuel,
          choixId: "non-prise",
          heure: "18:00",
          mode: "histoire",
          label: "Non prise",
        },
      ],
    },
  };
}

export function formatRemainingLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
