/** Textes exacts des prompts Contrôle — à copier dans Cursor. */

export const PROMPT_AUDIT = `TU ES CURSOR. Tu dois porter les 7 casquettes suivantes, LES UNES APRÈS LES AUTRES, dans l'ordre, et générer 1 rapport séparé par casquette. Ne mélange pas les rapports. Fais 7 rapports distincts, numérotés.
RÈGLES OS : KEYBER = OS. NOVACIER = app exemple. L'OS ne doit JAMAIS contenir en dur : Novacier, AutoVolt, Marie, Karim, Laurent, Henri, 500 pièces, machine 3. L'OS est générique. Un scénario fournit les données via getScenario(id). Le Cœur est en lecture seule. Un scénario ne peut pas exister sans contexte. Une compétence technique doit avoir définition exacte, formule, indicateurs précis, erreurs fréquentes, niveaux.
CASQUETTE 1 - MILO : Prends la casquette de Milo. Vérifie la jouabilité. Génère RAPPORT 1 - MILO avec Score 0-100, blocages, propositions.
CASQUETTE 2 - ATLAS : Prends la casquette d'Atlas. Vérifie le métier, les formules, ex MRP : Besoin net = Besoin brut - Stock - En-cours. Signale les fiches trop vagues. Génère RAPPORT 2 - ATLAS.
CASQUETTE 3 - MAYA : Prends la casquette de Maya. Vérifie si on apprend vraiment. Génère RAPPORT 3 - MAYA.
CASQUETTE 4 - IRIS : Prends la casquette d'Iris. Vérifie si l'ERP affiche les bonnes données, venues du module, pas en dur. Génère RAPPORT 4 - IRIS.
CASQUETTE 5 - ORCHESTRA : Prends la casquette d'Orchestra. Vérifie l'architecture, le Cœur = seule vérité, pas de données en dur. Sois très critique. Génère RAPPORT 5 - ORCHESTRA.
CASQUETTE 6 - LIA : Prends la casquette de Lia. Vérifie l'ergonomie, la facilité. Génère RAPPORT 6 - LIA.
CASQUETTE 7 - CLEO : Prends la casquette de Cleo. Identifie ce qu'il faut nettoyer, par priorité Critique / Majeure / Mineure, avec fichier + ligne + proposition. Ne supprime rien. Génère RAPPORT 7 - CLEO.
À LA FIN, après les 7 rapports séparés, ajoute un résumé en 5 lignes : quel est le rapport le plus critique à corriger en premier ?`;

export const PROMPT_CORRECTION = `TU ES CURSOR. Tu dois corriger le code de Keyber à partir d'un rapport d'audit. Ne génère pas de nouveau rapport. Corrige.
RÈGLES OS : KEYBER = OS. NOVACIER = app exemple. L'OS ne doit JAMAIS contenir en dur : Novacier, AutoVolt, Marie, Karim, Laurent, Henri, 500 pièces, machine 3. L'OS est générique. Un scénario fournit les données via getScenario(id). Le Cœur est en lecture seule. Un scénario ne peut pas exister sans contexte. Respecte KEYBER_OS_RULES.md si il existe.
MÉTHODE : Je vais te coller ci-dessous UN rapport, d'UN seul agent. Tu dois corriger UNIQUEMENT ce qui est dans ce rapport-là. Ne corrige pas autre chose. Ne rajoute pas de fonctionnalité. 1) Lis le rapport, identifie les corrections par priorité Critique, puis Majeure, puis Mineure. 2) Pour chaque correction, fais-la une par une, explique ce que tu as fait avec fichier + ligne. 3) Si c'est une donnée d'exemple dans l'OS, déplace-la vers data/scenarios/novacier/, ne la supprime pas. 4) Si c'est du code mort, vérifie qu'il n'est appelé nulle part avant de supprimer. 5) Si tu n'es pas sûr, dis-le et propose, n'invente pas. 6) Vérifie que la démo Novacier fonctionne toujours, que l'ERP affiche toujours les données du module, que le Cœur est toujours en lecture seule. 7) Ne modifie JAMAIS le Cœur directement.
À LA FIN, RENDS : liste des corrections faites avec fichier + ligne, liste des corrections non faites avec la raison, résultat du check npm run check:os si il existe, et une phrase : "Il reste X corrections, ou ce rapport est terminé, tu peux passer au rapport suivant."
MODE D'EMPLOI : Pour corriger : 1) Copie ce Prompt Correction. 2) Colle-le dans Cursor. 3) Juste en dessous, colle UN seul rapport, ex le Rapport 5 d'Orchestra. 4) Cursor corrige uniquement ce rapport-là.`;

export const PROMPT_MODE_EMPLOI =
  "Étape 1 - Audit : Copie le Prompt Audit, colle-le dans Cursor, Cursor te génère 7 rapports. Tu stockes chaque rapport dans Contrôle > Rapports, dans son agent. Étape 2 - Correction : Choisis le rapport le plus critique, copie le Prompt Correction, colle-le dans Cursor + UN seul rapport, Cursor corrige uniquement ce rapport-là.";
