/** Contexte test-entreprise — clone minimal pour vérifier l'indépendance OS. */
import type { ContexteComputerData } from "@/lib/computerTypes";
import { novacierComputer } from "@/data/contextes/novacier/computer";

/** Deep-rename display strings for independence test. */
function renameDeep(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/Novacier/g, "TestEntreprise")
      .replace(/AutoVolt/g, "ClientAlpha")
      .replace(/Marie Dubois/g, "Anna Morel")
      .replace(/Marie/g, "Anna")
      .replace(/Karim Benali/g, "Samir Haddad")
      .replace(/Karim/g, "Samir")
      .replace(/Laurent Perrin/g, "Paul Girard")
      .replace(/Laurent/g, "Paul")
      .replace(/Henri Vallon/g, "Mentor")
      .replace(/Henri/g, "Mentor")
      .replace(/Machine 3/g, "Ligne critique")
      .replace(/500 pièces/g, "400 unités");
  }
  if (Array.isArray(value)) return value.map(renameDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = renameDeep(v);
    return out;
  }
  return value;
}

export const testEntrepriseComputer = renameDeep(
  novacierComputer
) as ContexteComputerData;

testEntrepriseComputer.desktop = {
  ...testEntrepriseComputer.desktop,
  erpTitle: "ERP",
  sessionLabel: "Session — {role} — TestEntreprise",
  bureauLabel: "Bureau TestEntreprise — double-cliquez une application",
  docsTitle: "Documents TestEntreprise",
  fogHint:
    "Données indisponibles — Visibilité : Aucune. Installez le capteur de la ligne critique ou interrogez l'atelier.",
};

testEntrepriseComputer.chatContacts = [
  { id: "pers-marie", name: "Anna Morel", role: "Cheffe d'atelier" },
  { id: "pers-karim", name: "Samir Haddad", role: "Maintenance" },
  { id: "pers-laurent", name: "Paul Girard", role: "Directeur" },
];
