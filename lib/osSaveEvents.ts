/**
 * Événements sauvegarde Keyber OS (toast chrome sans store legacy).
 */

export const OS_SAVE_EVENT = "keyber-os-saved";

export type OsSaveEventDetail = {
  at: string;
  sessionId: string;
};

export function emitOsSaveEvent(sessionId: string, at = new Date().toISOString()) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OsSaveEventDetail>(OS_SAVE_EVENT, {
      detail: { at, sessionId },
    })
  );
}
