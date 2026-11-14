/**
 * CŒUR versioning, audit trail, and Logique highlight diffs.
 * Admin-only — does not touch player runtime.
 */

import type { ScenarioCoeur } from "@/lib/adminCoeur";
import { formatCoeurJson } from "@/lib/adminCoeur";

export type CoeurOrigin =
  | "agent"
  | "fiche"
  | "systeme"
  | "seed";

export type CoeurVersion = {
  id: string;
  version: number;
  createdAt: string;
  origin: CoeurOrigin;
  originLabel: string;
  summary: string;
  snapshot: ScenarioCoeur;
  hash: string;
};

export type CoeurAuditEntry = {
  id: string;
  at: string;
  origin: CoeurOrigin;
  originLabel: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  validatedBy?: string;
};

export type HighlightKind = "nouveau" | "modifie" | "supprime";

export type CoeurHighlight = {
  id: string;
  kind: HighlightKind;
  nodeKind: "decision" | "event" | "choix" | "impact" | "scenario";
  nodeId: string;
  label: string;
  before?: string;
  after?: string;
  createdAt: string;
  expiresAt?: string;
  seen: boolean;
};

export type ScenarioCoeurMeta = {
  versions: CoeurVersion[];
  audit: CoeurAuditEntry[];
  highlights: CoeurHighlight[];
  lastOriginLabel?: string;
};

export type CoeurMetaMap = Record<string, ScenarioCoeurMeta>;

export function emptyCoeurMeta(): ScenarioCoeurMeta {
  return { versions: [], audit: [], highlights: [] };
}

export async function hashCoeur(coeur: ScenarioCoeur): Promise<string> {
  const text = formatCoeurJson(coeur);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 12);
  }
  // Fallback sync-ish hash
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `h${Math.abs(h).toString(16)}`;
}

export function hashCoeurSync(coeur: ScenarioCoeur): string {
  const text = formatCoeurJson(coeur);
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `h${Math.abs(h).toString(16).padStart(8, "0")}`;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Diff two CŒUR snapshots → highlights for Logique. */
export function diffCoeurHighlights(
  before: ScenarioCoeur | null,
  after: ScenarioCoeur,
  at = new Date().toISOString()
): CoeurHighlight[] {
  if (!before) {
    return [
      {
        id: uid("hl"),
        kind: "nouveau",
        nodeKind: "scenario",
        nodeId: after.scenario.id,
        label: "Scénario initial",
        after: after.scenario.titre,
        createdAt: at,
        seen: false,
      },
      ...after.decisions.map((d) => ({
        id: uid("hl"),
        kind: "nouveau" as const,
        nodeKind: "decision" as const,
        nodeId: d.id,
        label: `J${d.jour} - ${d.titre}`,
        after: d.titre,
        createdAt: at,
        seen: false,
      })),
      ...after.evenements.map((e) => ({
        id: uid("hl"),
        kind: "nouveau" as const,
        nodeKind: "event" as const,
        nodeId: e.id,
        label: e.titre,
        after: e.titre,
        createdAt: at,
        seen: false,
      })),
    ];
  }

  const out: CoeurHighlight[] = [];
  const expire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const beforeDec = new Map(before.decisions.map((d) => [d.id, d]));
  const afterDec = new Map(after.decisions.map((d) => [d.id, d]));

  for (const [id, d] of Array.from(afterDec.entries())) {
    const prev = beforeDec.get(id);
    if (!prev) {
      out.push({
        id: uid("hl"),
        kind: "nouveau",
        nodeKind: "decision",
        nodeId: id,
        label: `J${d.jour} - ${d.titre}`,
        after: d.dilemme,
        createdAt: at,
        seen: false,
      });
      continue;
    }
    if (JSON.stringify(prev) !== JSON.stringify(d)) {
      // Check choix consequences for impact-level diffs
      for (const c of d.choix) {
        const pc = prev.choix.find((x) => x.id === c.id);
        if (!pc) {
          out.push({
            id: uid("hl"),
            kind: "nouveau",
            nodeKind: "choix",
            nodeId: c.id,
            label: c.label,
            after: c.label,
            createdAt: at,
            seen: false,
          });
          continue;
        }
        for (const cons of c.consequences) {
          const pcons = pc.consequences.find((x) => x.cible === cons.cible);
          if (!pcons) {
            out.push({
              id: uid("hl"),
              kind: "nouveau",
              nodeKind: "impact",
              nodeId: `${c.id}:${cons.cible}`,
              label: `${cons.cible} ${cons.valeur}`,
              after: `${cons.cible} ${cons.valeur > 0 ? "+" : ""}${cons.valeur}`,
              createdAt: at,
              seen: false,
            });
          } else if (pcons.valeur !== cons.valeur || pcons.mode !== cons.mode) {
            out.push({
              id: uid("hl"),
              kind: "modifie",
              nodeKind: "impact",
              nodeId: `${c.id}:${cons.cible}`,
              label: cons.cible,
              before: `${cons.cible} ${pcons.valeur > 0 ? "+" : ""}${pcons.valeur}`,
              after: `${cons.cible} ${cons.valeur > 0 ? "+" : ""}${cons.valeur}`,
              createdAt: at,
              seen: false,
            });
          }
        }
        for (const pcons of pc.consequences) {
          if (!c.consequences.some((x) => x.cible === pcons.cible)) {
            out.push({
              id: uid("hl"),
              kind: "supprime",
              nodeKind: "impact",
              nodeId: `${c.id}:${pcons.cible}`,
              label: pcons.cible,
              before: `${pcons.cible} ${pcons.valeur}`,
              createdAt: at,
              expiresAt: expire,
              seen: false,
            });
          }
        }
        if (
          pc.label !== c.label ||
          JSON.stringify(pc.consequences) !== JSON.stringify(c.consequences)
        ) {
          out.push({
            id: uid("hl"),
            kind: "modifie",
            nodeKind: "choix",
            nodeId: c.id,
            label: c.label,
            before: pc.label,
            after: c.label,
            createdAt: at,
            seen: false,
          });
        }
      }
      if (prev.dilemme !== d.dilemme || prev.titre !== d.titre) {
        out.push({
          id: uid("hl"),
          kind: "modifie",
          nodeKind: "decision",
          nodeId: id,
          label: `J${d.jour} - ${d.titre}`,
          before: prev.dilemme,
          after: d.dilemme,
          createdAt: at,
          seen: false,
        });
      }
    }
  }

  for (const [id, d] of Array.from(beforeDec.entries())) {
    if (!afterDec.has(id)) {
      out.push({
        id: uid("hl"),
        kind: "supprime",
        nodeKind: "decision",
        nodeId: id,
        label: `J${d.jour} - ${d.titre}`,
        before: d.titre,
        createdAt: at,
        expiresAt: expire,
        seen: false,
      });
    }
  }

  const beforeEv = new Map(before.evenements.map((e) => [e.id, e]));
  const afterEv = new Map(after.evenements.map((e) => [e.id, e]));
  for (const [id, e] of Array.from(afterEv.entries())) {
    const prev = beforeEv.get(id);
    if (!prev) {
      out.push({
        id: uid("hl"),
        kind: "nouveau",
        nodeKind: "event",
        nodeId: id,
        label: e.titre,
        after: e.texte,
        createdAt: at,
        seen: false,
      });
    } else if (JSON.stringify(prev) !== JSON.stringify(e)) {
      out.push({
        id: uid("hl"),
        kind: "modifie",
        nodeKind: "event",
        nodeId: id,
        label: e.titre,
        before: prev.texte,
        after: e.texte,
        createdAt: at,
        seen: false,
      });
    }
  }
  for (const [id, e] of Array.from(beforeEv.entries())) {
    if (!afterEv.has(id)) {
      out.push({
        id: uid("hl"),
        kind: "supprime",
        nodeKind: "event",
        nodeId: id,
        label: e.titre,
        before: e.texte,
        createdAt: at,
        expiresAt: expire,
        seen: false,
      });
    }
  }

  return out;
}

export function appendVersion(
  meta: ScenarioCoeurMeta,
  coeur: ScenarioCoeur,
  origin: CoeurOrigin,
  originLabel: string,
  summary: string
): ScenarioCoeurMeta {
  const version = (meta.versions[0]?.version ?? 0) + 1;
  const createdAt = new Date().toISOString();
  const prev = meta.versions[0]?.snapshot ?? null;
  const highlights = [
    ...diffCoeurHighlights(prev, coeur, createdAt),
    ...meta.highlights.filter((h) => {
      if (h.kind === "supprime" && h.expiresAt) {
        return new Date(h.expiresAt).getTime() > Date.now();
      }
      return !h.seen || h.kind === "supprime";
    }),
  ].slice(0, 80);

  const entry: CoeurVersion = {
    id: uid("ver"),
    version,
    createdAt,
    origin,
    originLabel,
    summary,
    snapshot: clone(coeur),
    hash: hashCoeurSync(coeur),
  };

  const audit: CoeurAuditEntry = {
    id: uid("aud"),
    at: createdAt,
    origin,
    originLabel,
    description: summary,
    oldValue: prev ? `v${version - 1} (${hashCoeurSync(prev)})` : undefined,
    newValue: `v${version} (${entry.hash})`,
    validatedBy: originLabel,
  };

  return {
    versions: [entry, ...meta.versions].slice(0, 30),
    audit: [audit, ...meta.audit].slice(0, 200),
    highlights,
    lastOriginLabel: originLabel,
  };
}

export function markHighlightsSeen(meta: ScenarioCoeurMeta): ScenarioCoeurMeta {
  return {
    ...meta,
    highlights: meta.highlights
      .map((h) => ({ ...h, seen: true }))
      .filter((h) => {
        if (h.kind === "supprime" && h.expiresAt) {
          return new Date(h.expiresAt).getTime() > Date.now();
        }
        // Keep seen deletes for 24h; drop other seen
        return h.kind === "supprime";
      }),
  };
}

export function relativeTimeFr(iso: string): string {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = Math.round(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "Hier";
  return `Il y a ${d} j`;
}
