# KEYBER OS Rules

Référence Studio — l’Admin lit et propose ; Cursor construit ; le jeu ne lit jamais le Studio.

## Identité

- **KEYBER** = système d’exploitation (moteur, GameState, ERP, Ordinateur, Décider, Journal, Profil).
- **Novacier** = module exemple installé dessus (données scénario uniquement).
- **Admin Studio** = Atelier / Book / Système / Contrôle / Équipe. Ne joue pas, n’écrit pas dans le GameState.

## Séparation OS / exemple

1. Aucune donnée Novacier / AutoVolt / personnages démo dans le moteur générique.
2. Les données d’exemple vivent sous `data/` (ou `data/scenarios/<id>/`), jamais hardcodées dans `lib/engine.ts`, `lib/gameState.ts`, `lib/playContent.ts` (hors bridge temporaire documenté).
3. Un 2ᵉ scénario doit pouvoir s’installer sans toucher l’OS.

## Studio vs jeu

1. Storage Studio : `keyber-studio-*` uniquement. Jamais `keyber-admin-v1`.
2. Le jeu (`lib/store.ts` / GameState) ne lit pas le localStorage Studio.
3. Pas de bandeau « Studio » dans Décider / play.
4. Les agents (Contrôle) relisent et proposent — ils ne patchent pas le Cœur ni le code.

## Atelier + Book (Studio)

Règle scénario (non négociable) : chaque scénario a **un seul Mode** —
**Mode Compétence** *ou* **Mode Histoire** (jamais les deux, jamais aucun).
- Mode Compétence = entraînement intensif, pas de rôle, 1 compétence précise, avec Cours.
- Mode Histoire = mise en pratique, Rôle → Secteur → Entreprise, événements aléatoires.

Sous-onglets Atelier (ordre fixe) :
1. Création  
2. Workflow  
3. Rôles  
4. Compétences  

**Book** = espace Studio séparé (même niveau que Atelier / Système / Contrôle / Équipe), hors Atelier.

## Agent Nettoyage

- Identifie, priorise, propose. **Ne supprime jamais** tout seul.
- Ne modifie jamais le Cœur.
- Ne crée jamais un 2ᵉ scénario.
- Si donnée d’exemple dans l’OS → proposition du type « Déplacer vers `data/scenarios/novacier/` », pas « Supprimer ».
