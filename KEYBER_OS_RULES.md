# KEYBER OS Rules

Référence Studio — l’Admin lit et propose ; Cursor construit ; le jeu ne lit jamais le Studio.

## Identité

- **KEYBER** = système d’exploitation (moteur, GameState, ERP, Ordinateur, Décider, Journal, Profil).
- **Novacier** = module exemple installé dessus (données scénario uniquement).
- **Admin Studio** = Atelier / Système / Contrôle / Équipe. Ne joue pas, n’écrit pas dans le GameState.

## Séparation OS / exemple

1. Aucune donnée Novacier / AutoVolt / personnages démo dans le moteur générique.
2. Les données d’exemple vivent sous `data/` (ou `data/scenarios/<id>/`), jamais hardcodées dans `lib/engine.ts`, `lib/gameState.ts`, `lib/playContent.ts` (hors bridge temporaire documenté).
3. Un 2ᵉ scénario doit pouvoir s’installer sans toucher l’OS.

## Studio vs jeu

1. Storage Studio : `keyber-studio-*` uniquement. Jamais `keyber-admin-v1`.
2. Le jeu (`lib/store.ts` / GameState) ne lit pas le localStorage Studio.
3. Pas de bandeau « Studio » dans Décider / play.
4. Les agents (Contrôle) relisent et proposent — ils ne patchent pas le Cœur ni le code.

## Atelier — couches + sous-onglets (ordre fixe)

Couches métier :
1. Contexte d’entreprise  
2. Compétences (générales vs techniques précises)  
3. Scénarios (liés à un contexte + compétences de ce contexte)

Sous-onglets Studio Atelier :
1. Contextes d’entreprise  
2. Compétences  
3. Scénarios  
4. Workflow (BPMN 2.0 généré depuis le scénario — logique métier uniquement, jamais de code / fichiers / Novacier en dur dans l’UI)

## Agent Nettoyage

- Identifie, priorise, propose. **Ne supprime jamais** tout seul.
- Ne modifie jamais le Cœur.
- Ne crée jamais un 2ᵉ scénario.
- Si donnée d’exemple dans l’OS → proposition du type « Déplacer vers `data/scenarios/novacier/` », pas « Supprimer ».
