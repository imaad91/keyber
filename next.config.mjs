/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Ancien Atelier → shell
      { source: "/admin/atelier/chantier", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/chantier/:path*", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/contextes", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/contextes/:path*", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/scenarios", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/scenarios/:path*", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/briefs", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/briefs/:path*", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/atelier/competences/:id", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/atelier/workflow/:scenarioId", destination: "/admin/atelier/workflow", permanent: false },
      // Legacy admin routes
      { source: "/admin/logique", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/logique/:id", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/fiches", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/fiches/suivi", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/fiches/:id", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/scenarios", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/scenarios/:id", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/workflow", destination: "/admin/systeme/architecture", permanent: false },
      { source: "/admin/workflow/scenarios", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/workflow/scenarios/:id", destination: "/admin/atelier/creation", permanent: false },
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
      { source: "/admin/competences/:id", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/systeme/competences", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/systeme/competences/:id", destination: "/admin/atelier/competences", permanent: false },
      { source: "/admin/bibliotheque", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/entreprises", destination: "/admin/atelier/creation", permanent: false },
      { source: "/admin/personnages", destination: "/admin/atelier/roles", permanent: false },
      { source: "/admin/consultants", destination: "/admin/equipe/utilisateurs", permanent: false },
      { source: "/admin/parametres", destination: "/admin/equipe/utilisateurs", permanent: false },
      { source: "/admin/decisions", destination: "/admin/atelier/creation", permanent: false },
    ];
  },
};

export default nextConfig;
