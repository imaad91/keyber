/**
 * Étape 26 — Gouvernance Live (léger).
 * Droit « publier Live » visible sur Équipe + note Book.
 * V1 : affichage seulement — ne bloque pas setStatus Live.
 */

import type { EquipeRole, EquipeUser } from "@/lib/equipeStore";

/** Défaut par rôle à la création / migration. */
export function defaultPeutPublierLive(role: EquipeRole): boolean {
  return role === "admin";
}

export function resolvePeutPublierLive(
  user: Pick<EquipeUser, "role" | "peutPublierLive" | "id">
): boolean {
  if (user.id === "user-admin-me") return true;
  if (typeof user.peutPublierLive === "boolean") return user.peutPublierLive;
  return defaultPeutPublierLive(user.role);
}

export function usersWhoCanPublishLive(users: EquipeUser[]): EquipeUser[] {
  return users.filter(
    (u) => u.actif && resolvePeutPublierLive(u)
  );
}

export function formatLivePublishersLabel(users: EquipeUser[]): string {
  const list = usersWhoCanPublishLive(users);
  if (list.length === 0) return "Personne (aucun droit coché — V1 n’empêche pas)";
  return list
    .map((u) => `${u.prenom} ${u.nom} (${u.role})`)
    .join(" · ");
}
