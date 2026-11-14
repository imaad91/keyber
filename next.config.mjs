/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/admin/logique", destination: "/admin/atelier/scenarios", permanent: false },
      { source: "/admin/logique/:id", destination: "/admin/atelier/scenarios/:id", permanent: false },
      { source: "/admin/fiches", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/fiches/suivi", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/fiches/:id", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/atelier/briefs", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/atelier/briefs/:id", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/scenarios", destination: "/admin/atelier/scenarios", permanent: false },
      { source: "/admin/scenarios/:id", destination: "/admin/atelier/scenarios/:id", permanent: false },
      { source: "/admin/workflow", destination: "/admin/systeme/architecture", permanent: false },
      { source: "/admin/workflow/scenarios", destination: "/admin/atelier/scenarios", permanent: false },
      { source: "/admin/workflow/scenarios/:id", destination: "/admin/atelier/scenarios/:id", permanent: false },
      { source: "/admin/workflow/architecture", destination: "/admin/systeme/architecture", permanent: false },
      { source: "/admin/workflow/glossaire", destination: "/admin/systeme/glossaire", permanent: false },
      { source: "/admin/workflow/glossaire/:terme", destination: "/admin/systeme/glossaire/:terme", permanent: false },
      { source: "/admin/workflow/journal-decisions", destination: "/admin/systeme/journal-decisions", permanent: false },
      { source: "/admin/workflow/journal-decisions/:id", destination: "/admin/systeme/journal-decisions/:id", permanent: false },
      { source: "/admin/coeur", destination: "/admin/systeme/coeur", permanent: false },
      { source: "/admin/coeur/langage", destination: "/admin/systeme/coeur", permanent: false },
      { source: "/admin/coeur/langage/:id", destination: "/admin/systeme/coeur/:id", permanent: false },
      { source: "/admin/coeur/agents", destination: "/admin/controle/agents", permanent: false },
      { source: "/admin/coeur/agents/:agentId", destination: "/admin/controle/agents/:agentId", permanent: false },
      { source: "/admin/coeur/rapport", destination: "/admin/controle/agents", permanent: false },
      { source: "/admin/competences", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/competences/generales", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/competences/ciblees", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/competences/:id", destination: "/admin/atelier/competences/:id", permanent: false },
      { source: "/admin/systeme/competences", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/systeme/competences/:id", destination: "/admin/atelier/competences/:id", permanent: false },
      { source: "/admin/bibliotheque", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/entreprises", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/personnages", destination: "/admin/atelier/contextes", permanent: false },
      { source: "/admin/consultants", destination: "/admin/equipe/utilisateurs", permanent: false },
      { source: "/admin/parametres", destination: "/admin/equipe/utilisateurs", permanent: false },
      { source: "/admin/decisions", destination: "/admin/atelier/scenarios", permanent: false },
    ];
  },
};

export default nextConfig;
