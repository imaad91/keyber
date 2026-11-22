/**
 * Prompt à copier pour l'IA (Création) — structure uniquement.
 * Aucun contenu métier inventé : uniquement ce que l'Admin a importé / sélectionné.
 */

import type { AtelierCreation } from "@/lib/atelierCreationStore";
import type { AtelierEntrepriseEvent } from "@/lib/atelierEventsStore";
import { eventsPromptRule } from "@/lib/atelierEventsStore";

export function buildScenarioGenerationPrompt(
  creation: AtelierCreation,
  events: AtelierEntrepriseEvent[]
): string {
  const nom = creation.nom || "cette entreprise";
  const eventLines =
    events.length === 0
      ? ["(aucun événement importé pour cette entreprise)"]
      : events.map((e) => {
          const bits = [
            e.nom,
            e.type ? `Type: ${e.type}` : "",
            e.description ? `Description: ${e.description}` : "",
          ].filter(Boolean);
          return `- ${bits.join(" · ")}`;
        });

  return [
    `Tu génères des scénarios provisoires pour KEYBER — entreprise « ${nom} ».`,
    ``,
    `RÈGLE ÉVÉNEMENTS (obligatoire) :`,
    eventsPromptRule(nom),
    ``,
    `Contexte (Excel importé) :`,
    `- Entreprise : ${creation.nom || "—"}`,
    `- Secteur : ${creation.secteur || "—"}`,
    ``,
    `Rôles sélectionnés :`,
    creation.roleNames.length
      ? creation.roleNames.map((r) => `- ${r}`).join("\n")
      : "- (aucun)",
    ``,
    `Compétences sélectionnées :`,
    creation.competenceNames.length
      ? creation.competenceNames.map((c) => `- ${c}`).join("\n")
      : "- (aucune)",
    ``,
    `Événements importés pour cette entreprise uniquement :`,
    ...eventLines,
    ``,
    `Consignes :`,
    `- Utilise uniquement les données ci-dessus (Excel Contexte, rôles, compétences, événements de cette entreprise).`,
    `- N'invente aucun contenu métier.`,
    `- Chaque scénario a UN seul Mode : Compétence XOR Histoire.`,
    `- Ne les implémente pas encore — propositions provisoires seulement.`,
  ].join("\n");
}
