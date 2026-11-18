/**
 * Entonnoir catalogue Live joueur — Mode Histoire / Compétence.
 * Aucun rôle ni secteur hardcodé : dérivés du catalogue Live + biblio Admin.
 */

import type { AtelierBibliothequeRole } from "@/lib/atelierRolesStore";
import type { PlayCatalogEntry } from "@/lib/playCatalog";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  const set = new Set<string>();
  for (const v of values) {
    const t = v.trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
}

export function liveHistoires(entries: PlayCatalogEntry[]): PlayCatalogEntry[] {
  return entries.filter((e) => e.mode === "histoire");
}

export function liveCompetences(
  entries: PlayCatalogEntry[]
): PlayCatalogEntry[] {
  return entries.filter((e) => e.mode === "competence");
}

export type LiveHistoireRoleOption = {
  nom: string;
  description: string;
  mission: string;
  /** Trouvé dans Atelier → Rôles (pas inventé). */
  fromAdminLibrary: boolean;
  histoiresCount: number;
};

/**
 * Rôles proposés = noms présents sur les histoires Live,
 * enrichis via la bibliothèque Admin Rôles (match par nom).
 */
export function rolesForLiveHistoires(
  entries: PlayCatalogEntry[],
  adminRoles: AtelierBibliothequeRole[]
): LiveHistoireRoleOption[] {
  const hist = liveHistoires(entries);
  const names = uniqueSorted(hist.map((e) => e.roleName));
  return names.map((nom) => {
    const lib = adminRoles.find((r) => norm(r.nom) === norm(nom));
    return {
      nom,
      description: lib?.description?.trim() || "",
      mission: lib?.mission?.trim() || "",
      fromAdminLibrary: Boolean(lib),
      histoiresCount: hist.filter((e) => norm(e.roleName) === norm(nom)).length,
    };
  });
}

/** Secteurs = ceux désignés sur les créations / Book des histoires Live filtrées. */
export function secteursForRole(
  entries: PlayCatalogEntry[],
  roleName: string
): string[] {
  const hist = liveHistoires(entries).filter(
    (e) => norm(e.roleName) === norm(roleName)
  );
  return uniqueSorted(hist.map((e) => e.secteur));
}

export function entreprisesForRoleSecteur(
  entries: PlayCatalogEntry[],
  roleName: string,
  secteur: string
): string[] {
  const hist = liveHistoires(entries).filter(
    (e) =>
      norm(e.roleName) === norm(roleName) && norm(e.secteur) === norm(secteur)
  );
  return uniqueSorted(hist.map((e) => e.entrepriseNom));
}

export function histoiresForSelection(
  entries: PlayCatalogEntry[],
  roleName: string,
  secteur: string,
  entrepriseNom: string
): PlayCatalogEntry[] {
  return liveHistoires(entries)
    .filter(
      (e) =>
        norm(e.roleName) === norm(roleName) &&
        norm(e.secteur) === norm(secteur) &&
        norm(e.entrepriseNom) === norm(entrepriseNom)
    )
    .slice()
    .sort((a, b) => b.version - a.version || a.nom.localeCompare(b.nom, "fr"));
}

/** Compétences Live uniques (libellés catalogue). */
export function competenceNamesFromLive(
  entries: PlayCatalogEntry[]
): string[] {
  return uniqueSorted(liveCompetences(entries).map((e) => e.competenceName));
}

export function scenariosForCompetence(
  entries: PlayCatalogEntry[],
  competenceName: string
): PlayCatalogEntry[] {
  return liveCompetences(entries)
    .filter((e) => norm(e.competenceName) === norm(competenceName))
    .slice()
    .sort((a, b) => b.version - a.version || a.nom.localeCompare(b.nom, "fr"));
}
