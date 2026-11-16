/**
 * Étape 28 — Livre de l'entreprise (param → vue joueur).
 * Structure visible même vide ; aucun contenu métier inventé.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type { LivreEntreprise } from "@/lib/types";

export type ScenarioParamLivre = {
  nom: string;
  slogan: string;
  histoire: {
    fondation: string;
    datesCles: { annee: string; fait: string }[];
    anecdotes: string[];
    crisesPassees: string[];
    narratif: string;
  };
  activite: {
    ceQuOnFabrique: string;
    pourQui: string;
    produitsPhares: { nom: string; description: string }[];
    clientsPrincipaux: string[];
  };
  organigramme: { personnageId: string; label?: string }[];
  chiffresCles: {
    ca: string;
    employes: number;
    machines: number;
    clients: number;
    satisfaction: string;
  };
  valeurs: { titre: string; description: string }[];
  glossaire: { terme: string; definition: string }[];
};

export function emptyLivreStructure(
  entrepriseNom = ""
): ScenarioParamLivre {
  return {
    nom: entrepriseNom,
    slogan: "",
    histoire: {
      fondation: "",
      datesCles: [],
      anecdotes: [],
      crisesPassees: [],
      narratif: "",
    },
    activite: {
      ceQuOnFabrique: "",
      pourQui: "",
      produitsPhares: [],
      clientsPrincipaux: [],
    },
    organigramme: [],
    chiffresCles: {
      ca: "",
      employes: 0,
      machines: 0,
      clients: 0,
      satisfaction: "",
    },
    valeurs: [],
    glossaire: [],
  };
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}

/** Normalise un bloc Livre brut (param) → structure complète. */
export function normalizeParamLivre(
  raw: unknown,
  entrepriseFallback = ""
): ScenarioParamLivre {
  const base = emptyLivreStructure(entrepriseFallback);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const histoire =
    o.histoire && typeof o.histoire === "object"
      ? (o.histoire as Record<string, unknown>)
      : {};
  const activite =
    o.activite && typeof o.activite === "object"
      ? (o.activite as Record<string, unknown>)
      : {};
  const chiffres =
    o.chiffresCles && typeof o.chiffresCles === "object"
      ? (o.chiffresCles as Record<string, unknown>)
      : {};

  const datesCles = Array.isArray(histoire.datesCles)
    ? histoire.datesCles.map((d) => {
        const row = (d ?? {}) as Record<string, unknown>;
        return {
          annee: asString(row.annee),
          fait: asString(row.fait),
        };
      })
    : [];

  const produitsPhares = Array.isArray(activite.produitsPhares)
    ? activite.produitsPhares.map((p) => {
        const row = (p ?? {}) as Record<string, unknown>;
        return {
          nom: asString(row.nom),
          description: asString(row.description),
        };
      })
    : [];

  const organigramme = Array.isArray(o.organigramme)
    ? o.organigramme.map((p) => {
        const row = (p ?? {}) as Record<string, unknown>;
        return {
          personnageId: asString(row.personnageId || row.id),
          label: asString(row.label || row.nom),
        };
      })
    : [];

  const valeurs = Array.isArray(o.valeurs)
    ? o.valeurs.map((v) => {
        const row = (v ?? {}) as Record<string, unknown>;
        return {
          titre: asString(row.titre),
          description: asString(row.description),
        };
      })
    : [];

  const glossaire = Array.isArray(o.glossaire)
    ? o.glossaire.map((g) => {
        const row = (g ?? {}) as Record<string, unknown>;
        return {
          terme: asString(row.terme),
          definition: asString(row.definition),
        };
      })
    : [];

  return {
    nom: asString(o.nom, entrepriseFallback || base.nom),
    slogan: asString(o.slogan),
    histoire: {
      fondation: asString(histoire.fondation),
      datesCles,
      anecdotes: asStringArray(histoire.anecdotes),
      crisesPassees: asStringArray(histoire.crisesPassees),
      narratif: asString(histoire.narratif),
    },
    activite: {
      ceQuOnFabrique: asString(activite.ceQuOnFabrique),
      pourQui: asString(activite.pourQui),
      produitsPhares,
      clientsPrincipaux: asStringArray(activite.clientsPrincipaux),
    },
    organigramme,
    chiffresCles: {
      ca: asString(chiffres.ca),
      employes: asNumber(chiffres.employes),
      machines: asNumber(chiffres.machines),
      clients: asNumber(chiffres.clients),
      satisfaction: asString(chiffres.satisfaction),
    },
    valeurs,
    glossaire,
  };
}

export function livreFromParam(
  param: ScenarioParamFile | null | undefined
): ScenarioParamLivre {
  const entreprise =
    param && typeof param.Entreprise === "string" ? param.Entreprise : "";
  const raw =
    param && "Livre" in param
      ? (param as ScenarioParamFile & { Livre?: unknown }).Livre
      : undefined;
  return normalizeParamLivre(raw, entreprise);
}

export function toLivreEntreprise(livre: ScenarioParamLivre): LivreEntreprise {
  return {
    nom: livre.nom,
    slogan: livre.slogan,
    histoire: livre.histoire,
    activite: livre.activite,
    organigramme: livre.organigramme.map((o) => ({
      personnageId: o.personnageId,
    })),
    chiffresCles: livre.chiffresCles,
    valeurs: livre.valeurs,
    glossaire: livre.glossaire,
  };
}

/** true si au moins un champ lore non vide. */
export function livreHasContent(livre: ScenarioParamLivre): boolean {
  if (livre.slogan.trim()) return true;
  if (livre.histoire.narratif.trim() || livre.histoire.fondation.trim())
    return true;
  if (livre.histoire.datesCles.length) return true;
  if (livre.activite.ceQuOnFabrique.trim()) return true;
  if (livre.activite.produitsPhares.length) return true;
  if (livre.valeurs.length || livre.glossaire.length) return true;
  if (livre.organigramme.length) return true;
  if (
    livre.chiffresCles.ca ||
    livre.chiffresCles.employes ||
    livre.chiffresCles.machines
  )
    return true;
  return false;
}

/** Résumé court pour Book Vue Texte. */
export function summarizeLivreLore(livre: ScenarioParamLivre): string[] {
  const lines: string[] = [];
  if (livre.nom) lines.push(`Entreprise : ${livre.nom}`);
  if (livre.slogan) lines.push(`Slogan : ${livre.slogan}`);
  if (livre.histoire.narratif)
    lines.push(
      `Histoire : ${livre.histoire.narratif.slice(0, 220)}${
        livre.histoire.narratif.length > 220 ? "…" : ""
      }`
    );
  if (livre.activite.ceQuOnFabrique)
    lines.push(`Activité : ${livre.activite.ceQuOnFabrique.slice(0, 180)}`);
  lines.push(
    `Blocs : dates ${livre.histoire.datesCles.length} · produits ${livre.activite.produitsPhares.length} · valeurs ${livre.valeurs.length} · glossaire ${livre.glossaire.length} · orga ${livre.organigramme.length}`
  );
  if (!livreHasContent(livre)) {
    lines.push(
      "Structure Livre présente mais vide — contenu Lumière en Phase E."
    );
  }
  return lines;
}
