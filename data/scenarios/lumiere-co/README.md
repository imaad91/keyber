# Lumière & Co — fichiers de paramétrage (démo)

Entreprise de démonstration Studio. **Ne pas confondre avec Novacier** (toujours en dur ailleurs).

- `lumiere-co_planification-mrp-competence_v1.json` — Mode Compétence (V1)
- `lumiere-co_logisticien-histoire_v1.json` — Mode Histoire (V1)

1 scénario = 1 fichier. Contenu aussi injecté en localStorage Book (`keyber-studio-book-v1`).

Schéma étendu (Étape 21) : chaque JSON inclut les coquilles `Ordinateur`, `Jours`, `Interviews`, `Objectifs`, `Kpis`, `Conséquences`, `Intro` (vides autorisées).

Événements OS (Étape 24) : `KEYBER_Events_Lumiere_Co.xlsx` — template rempli démo (Jour/Heure/Urgent/Conséquences). Les JSON param portent les events mappés (heure + conséquences).

Narration / décisions (Étape 33) : `KEYBER_Narration_Lumiere_Co.xlsx` — PNJ, Objectifs, Kpis, Jours, Décisions, Options, Fins (rempli démo). Staging Création via seed `narrationPack` ; import dry-run aussi sur la fiche.
