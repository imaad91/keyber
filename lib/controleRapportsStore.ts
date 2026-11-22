/**
 * Contrôle > Rapports — stockage par agent (Studio only).
 * Append-only après création : lecture seule, suppression possible.
 */

"use client";

import { useSyncExternalStore } from "react";
import {
  CONTROLE_AGENT_IDS,
  DEFAULT_AGENTS,
  resolveAgentId,
  type ControleAgentId,
} from "@/lib/agents";
import { uid } from "@/lib/adminTypes";

const STORAGE_KEY = "keyber-studio-rapports-v1";

export type ControleRapport = {
  id: string;
  agentId: ControleAgentId | string;
  titre: string;
  date: string; // ISO
  score: number | null;
  texte: string;
  locked: true;
};

type State = {
  rapports: ControleRapport[];
  toast: string | null;
};

function empty(): State {
  return { rapports: [], toast: null };
}

function load(): State {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      rapports: (parsed.rapports ?? []).map((r) => ({
        ...r,
        agentId: resolveAgentId(String(r.agentId)),
        locked: true as const,
      })),
      toast: null,
    };
  } catch {
    return empty();
  }
}

let state: State = empty();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist(next: State) {
  state = next;
  if (typeof window !== "undefined") {
    const { toast, ...rest } = next;
    void toast;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }
  emit();
}

function ensure() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  ensure();
  return state;
}

function getServerSnapshot() {
  return empty();
}

export function agentLabel(agentId: string): string {
  const id = resolveAgentId(agentId);
  return (
    DEFAULT_AGENTS.find((a) => a.id === id)?.nom_affiche ?? id.toUpperCase()
  );
}

export function useControleRapportsStore() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    ...current,
    agentIds: CONTROLE_AGENT_IDS,
    agentLabel,
    rapportsForAgent(agentId: string) {
      const id = resolveAgentId(agentId);
      return [...current.rapports]
        .filter((r) => resolveAgentId(r.agentId) === id)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    },
    getRapport(id: string) {
      return state.rapports.find((r) => r.id === id);
    },
    addRapport(input: {
      agentId: string;
      titre: string;
      score: number | null;
      texte: string;
    }): ControleRapport | { error: string } {
      ensure();
      const agentId = resolveAgentId(input.agentId);
      if (!CONTROLE_AGENT_IDS.includes(agentId as ControleAgentId)) {
        return { error: "Agent concerné obligatoire (parmi les 7)" };
      }
      if (!input.titre.trim()) return { error: "Titre obligatoire" };
      if (!input.texte.trim()) return { error: "Texte du rapport obligatoire" };
      const r: ControleRapport = {
        id: uid("rapport"),
        agentId,
        titre: input.titre.trim(),
        date: new Date().toISOString(),
        score: input.score,
        texte: input.texte.trim(),
        locked: true,
      };
      persist({
        ...state,
        rapports: [r, ...state.rapports],
        toast: "Rapport enregistré (lecture seule)",
      });
      return r;
    },
    deleteRapport(id: string) {
      ensure();
      persist({
        ...state,
        rapports: state.rapports.filter((r) => r.id !== id),
        toast: "Rapport supprimé",
      });
    },
    clearToast() {
      ensure();
      if (!state.toast) return;
      persist({ ...state, toast: null });
    },
  };
}
