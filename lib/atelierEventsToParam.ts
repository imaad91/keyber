/**
 * Étape 24 — Pont Événements Atelier (Excel) → fichier de paramétrage → OS.
 * Mappe les colonnes riches vers OsParamEvent (heure, condition, conséquences).
 * Aucune donnée inventée : uniquement ce qui est dans l'Excel / fields Atelier.
 */

import type { AtelierEntrepriseEvent } from "@/lib/atelierEventsStore";
import type { EventExcelFields } from "@/lib/atelierEventsExcel";
import type { OsParamEvent } from "@/lib/keyberOs/moteurEvenements";
import type { OsConsequence } from "@/lib/keyberOs/types";

/** Colonnes Excel dédiées au moteur OS (Étape 24). */
export const EVENTS_OS_EXCEL_COLUMNS = [
  "Jour (1, 2…)",
  "Heure (HH:MM)",
  "Urgent (oui/non)",
  "Deadline heure (HH:MM)",
  "Condition métrique (stock/tresorerie/moral/…)",
  "Condition opérateur (>/</=)",
  "Condition seuil",
  "Conséquence cible",
  "Conséquence valeur",
  "Conséquence deadline cible",
  "Conséquence deadline valeur",
] as const;

export type EventOsExcelColumn = (typeof EVENTS_OS_EXCEL_COLUMNS)[number];

const IMPACT_CIBLE_MAP: Record<string, string> = {
  stock: "stock",
  trésorerie: "tresorerie",
  tresorerie: "tresorerie",
  "satisfaction client": "confianceClient",
  "confiance client": "confianceClient",
  "confiance de l'équipe": "moral",
  "confiance de l equipe": "moral",
  moral: "moral",
  production: "production",
  packing: "production",
  commandes: "commandes",
  qualité: "qualite",
  qualite: "qualite",
};

function graviteDelta(raw: string): number {
  const g = raw.trim().toLowerCase();
  if (g.includes("critique")) return -25;
  if (g.includes("forte")) return -15;
  if (g.includes("faible")) return -3;
  if (g.includes("moyenne") || g.includes("moyen")) return -8;
  return -5;
}

function parseOuiNon(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  return t === "oui" || t === "yes" || t === "true" || t === "1" || t === "x";
}

function parseNumber(raw: string): number | undefined {
  const t = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function parseHeure(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return undefined;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function field(
  fields: Record<string, string>,
  ...keys: string[]
): string {
  for (const k of keys) {
    const v = fields[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function consequencesFromImpactNarrative(
  fields: Record<string, string>
): OsConsequence[] {
  const impactCol =
    field(
      fields,
      "Impact sur (Stock, Trésorerie, Satisfaction client, Confiance de l'équipe, Production)"
    ) || "";
  if (!impactCol) return [];
  const gravite = field(
    fields,
    "Gravité (Faible/Moyenne/Forte/Critique)"
  );
  const delta = graviteDelta(gravite);
  const parts = impactCol
    .split(/[,;/]/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const out: OsConsequence[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    let cible: string | undefined;
    for (const [label, path] of Object.entries(IMPACT_CIBLE_MAP)) {
      if (part.includes(label)) {
        cible = path;
        break;
      }
    }
    if (!cible || seen.has(cible)) continue;
    seen.add(cible);
    out.push({ cible, valeur: delta });
  }
  return out;
}

function parseCondition(
  fields: Record<string, string>
): OsParamEvent["condition"] | undefined {
  const metric = field(
    fields,
    "Condition métrique (stock/tresorerie/moral/…)",
    "Condition métrique"
  );
  const op = field(
    fields,
    "Condition opérateur (>/</=)",
    "Condition opérateur"
  );
  const seuil = parseNumber(
    field(fields, "Condition seuil", "Seuil condition")
  );
  if (!metric || seuil === undefined) return undefined;
  const o = op.trim();
  if (o === ">" || o === "gt" || o.includes("superieur") || o.includes("supérieur")) {
    return { si: metric, superieurA: seuil };
  }
  if (o === "<" || o === "lt" || o.includes("inferieur") || o.includes("inférieur")) {
    return { si: metric, inferieurA: seuil };
  }
  if (o === "=" || o === "==" || o === "eq" || o.includes("egal") || o.includes("égal")) {
    return { si: metric, egalA: seuil };
  }
  // Défaut : inférieur à (stock bas, etc.)
  return { si: metric, inferieurA: seuil };
}

/**
 * Écrit les champs play OS dans les colonnes Excel (seed Lumière / export).
 */
export function applyOsPlayToEventFields(
  fields: EventExcelFields | Record<string, string>,
  play: {
    jour?: number;
    heure?: string;
    urgent?: boolean;
    deadlineHeure?: string;
    condition?: OsParamEvent["condition"];
    consequences?: OsConsequence[];
    consequencesDeadline?: OsConsequence[];
  }
): Record<string, string> {
  const out: Record<string, string> = { ...fields };
  if (play.jour != null) out["Jour (1, 2…)"] = String(play.jour);
  if (play.heure) out["Heure (HH:MM)"] = play.heure;
  if (play.urgent) out["Urgent (oui/non)"] = "oui";
  if (play.deadlineHeure) out["Deadline heure (HH:MM)"] = play.deadlineHeure;
  if (play.condition?.si) {
    out["Condition métrique (stock/tresorerie/moral/…)"] = play.condition.si;
    if (play.condition.superieurA != null) {
      out["Condition opérateur (>/</=)"] = ">";
      out["Condition seuil"] = String(play.condition.superieurA);
    } else if (play.condition.inferieurA != null) {
      out["Condition opérateur (>/</=)"] = "<";
      out["Condition seuil"] = String(play.condition.inferieurA);
    } else if (play.condition.egalA != null) {
      out["Condition opérateur (>/</=)"] = "=";
      out["Condition seuil"] = String(play.condition.egalA);
    }
  }
  if (play.consequences?.length) {
    out["Conséquence cible"] = play.consequences.map((c) => c.cible).join(";");
    out["Conséquence valeur"] = play.consequences
      .map((c) => String(c.valeur))
      .join(";");
  }
  if (play.consequencesDeadline?.length) {
    out["Conséquence deadline cible"] = play.consequencesDeadline
      .map((c) => c.cible)
      .join(";");
    out["Conséquence deadline valeur"] = play.consequencesDeadline
      .map((c) => String(c.valeur))
      .join(";");
  }
  return out;
}

/**
 * Mappe un événement Atelier (fields Excel) → entrée param OS.
 */
export function mapAtelierEventFieldsToParamEvent(args: {
  id: string;
  nom: string;
  type: string;
  description: string;
  fields: Record<string, string>;
}): OsParamEvent {
  const f = args.fields || {};
  const jour = parseNumber(field(f, "Jour (1, 2…)", "Jour", "jour"));
  const heure = parseHeure(field(f, "Heure (HH:MM)", "Heure", "heure"));
  const urgent = parseOuiNon(field(f, "Urgent (oui/non)", "Urgent", "urgent"));
  const deadlineHeure = parseHeure(
    field(f, "Deadline heure (HH:MM)", "Deadline heure", "deadlineHeure")
  );

  const condition = parseCondition(f);

  function parseConsequencePairs(
    ciblesRaw: string,
    valeursRaw: string
  ): OsConsequence[] {
    const cibles = ciblesRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    const valeurs = valeursRaw.split(";").map((s) => s.trim());
    const out: OsConsequence[] = [];
    for (let i = 0; i < cibles.length; i++) {
      const v = parseNumber(valeurs[i] ?? "");
      if (v === undefined) continue;
      out.push({ cible: cibles[i]!, valeur: v });
    }
    return out;
  }

  const consCible = field(f, "Conséquence cible");
  const consValRaw = field(f, "Conséquence valeur");
  let consequences: OsConsequence[] | undefined;
  if (consCible && consValRaw) {
    const parsed = parseConsequencePairs(consCible, consValRaw);
    if (parsed.length) consequences = parsed;
  }
  if (!consequences?.length) {
    const fromImpact = consequencesFromImpactNarrative(f);
    if (fromImpact.length) consequences = fromImpact;
  }

  const dlCible = field(f, "Conséquence deadline cible");
  const dlValRaw = field(f, "Conséquence deadline valeur");
  const consequencesDeadline =
    dlCible && dlValRaw
      ? parseConsequencePairs(dlCible, dlValRaw)
      : undefined;

  return {
    id: args.id,
    nom: args.nom,
    type: args.type,
    description: args.description,
    ...(jour !== undefined ? { jour } : {}),
    ...(heure ? { heure } : {}),
    ...(urgent ? { urgent: true } : {}),
    ...(deadlineHeure ? { deadlineHeure } : {}),
    ...(condition ? { condition } : {}),
    ...(consequences?.length ? { consequences } : {}),
    ...(consequencesDeadline?.length
      ? { consequencesDeadline }
      : {}),
  };
}

export function mapAtelierEventToParamEventRich(
  e: AtelierEntrepriseEvent
): OsParamEvent {
  return mapAtelierEventFieldsToParamEvent({
    id: e.id,
    nom: e.nom,
    type: e.type,
    description: e.description,
    fields: (e.fields || {}) as Record<string, string>,
  });
}
