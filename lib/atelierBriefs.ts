/**
 * Atelier Briefs — markdown fiches under content/fiches/.
 * Import only — no Cœur generation, no publish kanban.
 */

export type AtelierBrief = {
  id: string;
  titre: string;
  filename: string;
  markdown: string;
  sections: {
    contexteEntreprise: string;
    personnages: string;
    decisions: string;
    donneesReelles: string;
  };
  updatedAt: string;
};

function parseSections(md: string) {
  const get = (title: string) => {
    const re = new RegExp(
      `##\\s*${title}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
      "i"
    );
    const m = md.match(re);
    return (m?.[1] ?? "").trim();
  };
  return {
    contexteEntreprise: get("Contexte entreprise"),
    personnages: get("Personnages"),
    decisions: get("Décisions"),
    donneesReelles: get("Données réelles"),
  };
}

const RAW: { id: string; filename: string; markdown: string; updatedAt: string }[] =
  [
    {
      id: "brief-novacier",
      filename: "novacier.md",
      updatedAt: "2026-11-13T10:00:00.000Z",
      markdown: `# Fiche Novacier

## Contexte entreprise

Novacier Industrie — Saint-Étienne. PME métallurgique (~120 employés), 4 machines, AutoVolt = 45 % du CA. Quasi-faillite 2022. Cette semaine : 500 pièces qualité avant vendredi 16h. La semaine qui décide.

## Personnages

Marie Dubois (chef d'atelier) jauge le nouveau RP. Karim (maintenance) sait qu'un capteur est mort. Laurent Moreau (direction) presse pour un statut AutoVolt. Henri (mentor) guide l'arrivée.

## Décisions

J1 cause du retard (capteur vs machine vs rien). J2 heures sup vs réorg Marie. J3 panne Machine 3. J4 éthique micro-défauts. J5 négociation AutoVolt.

## Données réelles

Trésorerie ~420 k€, stock acier ~850 kg, prod ~60/j, rebut réel ~18 % une fois le brouillard levé. Objectif : 500 pièces qualité.
`,
    },
    {
      id: "brief-atelier-nord",
      filename: "atelier-nord.md",
      updatedAt: "2026-11-13T11:00:00.000Z",
      markdown: `# Fiche Atelier Nord

## Contexte entreprise

Atelier Nord — PME de sous-traitance mécanique. Brief provisoire pour tester le parcours Fiche → Scénario.

## Personnages

Équipe atelier à préciser dans le brief enrichi.

## Décisions

Décisions à construire à partir du terrain.

## Données réelles

Données à collecter sur site.
`,
    },
    {
      id: "brief-nouveau-projet",
      filename: "nouveau-projet.md",
      updatedAt: "2026-11-13T12:00:00.000Z",
      markdown: `# Fiche Nouveau Projet

## Contexte entreprise

Brief brouillon — nouveau projet à définir.

## Personnages

À renseigner.

## Décisions

À renseigner.

## Données réelles

À renseigner.
`,
    },
  ];

export function listAtelierBriefs(): AtelierBrief[] {
  return RAW.map((r) => {
    const titre =
      r.markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? r.filename;
    return {
      id: r.id,
      titre,
      filename: r.filename,
      markdown: r.markdown,
      sections: parseSections(r.markdown),
      updatedAt: r.updatedAt,
    };
  });
}

export function getAtelierBrief(id: string): AtelierBrief | undefined {
  return listAtelierBriefs().find((b) => b.id === id);
}

/** Import a pasted markdown brief (client-side, session only until wired). */
export function parseImportedBriefMarkdown(
  markdown: string,
  filename = "import.md"
): AtelierBrief {
  const titre = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? filename;
  return {
    id: `brief-import-${Date.now().toString(36)}`,
    titre,
    filename,
    markdown,
    sections: parseSections(markdown),
    updatedAt: new Date().toISOString(),
  };
}
