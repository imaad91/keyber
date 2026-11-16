# KEYBER OS Rules

Référence Studio — l’Admin lit et propose ; Cursor construit ; le jeu ne lit jamais le Studio.

## Identité

- **KEYBER** = système d’exploitation (moteur, GameState, ERP, Ordinateur, Décider, Journal, Profil).
- **Modules exemple** = données scénario installées dessus (hors moteur générique).
- **Admin Studio** = Atelier / Book / Keyber OS / Contrôle / Équipe. Ne joue pas, n’écrit pas dans le GameState.

## Séparation OS / exemple

1. Aucune donnée d’entreprise / personnages démo dans le moteur générique (`lib/keyberOsRuntime.ts`, `lib/osBookPlay.ts`, moteurs OS).
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
5. Événements (1 fichier = 1 entreprise, pas de biblio partagée)

**Book** = espace Studio séparé (même niveau que Atelier / Keyber OS / Contrôle / Équipe), hors Atelier.
Génération des scénarios : bouton « Générer des scénarios » dans le Book (pas dans Création).
Chaque carte scénario/histoire a 3 vues (Texte · Graphique · Code / fichier de paramétrage) et un versionning V1, V2… (Live = une version précise).
Schéma param étendu (Étape 21) : `lib/scenarioParamSchema.ts` — blocs `Ordinateur`, `Jours`, `Interviews`, `Objectifs`, `Kpis`, `Conséquences`, `Intro` (vides OK). Vue Texte = résumé blocs ; Vue Graphique = nœuds blocs ; Vue Code = JSON normalisé.
Checklist parité feeling (Étape 22) : `lib/bookParityChecklist.ts` — cases rouge/vert sur fiche Book + pastilles cartes (mail, chat, ERP10, dayend, intro…).
Génération Book (Étape 23) : `buildSkeletonParamFile` + prompt imposent tous les blocs (Ordinateur structuré, Jours, Interviews…) — données Atelier seulement, pas d'invention.
Pont Événements (Étape 24) : Excel Atelier → `atelierEventsToParam` → « Événements entreprise » (jour/heure/urgent/condition/conséquences) → Moteur d'Événements OS.
Contrôle parité (Étape 25) : `/admin/controle/rapports/parite` — rapport lisible (Book checklist, modules OS OFF, double moteur) ; propose, ne patche pas.
Gouvernance Live (Étape 26) : flag `peutPublierLive` sur Équipe — visible fiche + note Book ; V1 n’empêche pas `setStatus(live)`.
Journal (Étape 27) : `/journal` lit `world.journal` via session Book OS (`osActivePlayStore`) ; Admin → Keyber OS → Journal.
Livre (Étape 28) : `/livre` lit `param.Livre` (structure vide OK) ; Admin → Keyber OS → Livre ; résumé lore Book Vue Texte.
Jouer une carte Book : **`/jouer/book/[id]`** — **chemin officiel Keyber OS** (Étape 20).
Bandeau orange MODE TEST si En cours de test ; badge vert LIVE si Live.
Shell : `components/osPlay/OsPlayShell.tsx` ← pipeline `lib/keyberOs/pipeline.ts`.
**`/play`** = POC Novacier legacy (`useGameStore`) — **intact, non branché sur le Book**.
Démo optionnelle seed Studio localStorage uniquement (données sous `data/scenarios/<id>/`, jamais dans le code OS).

**Keyber OS** = moteur générique du jeu : **chaque sous-onglet Admin = un module runtime** sous `lib/keyberOs/` + doc.
Sous-onglets : Vue Globale · ERP · Scénarios · Décisions · Événements · Progression · Interface Joueur · **Ordinateur** · **Temps** · **Cycle de vie** · **Notifications** · **Interviews** · **Relations** · **Objectifs** · **Visibilité** · Données & Sauvegarde.
Pack Ordinateur synthétisé depuis le param (`Ordinateur` optionnel) via `ordinateurPack.ts` — aucun nom d'entreprise dans le moteur.
Aucun contenu métier inventé — le moteur lit les fichiers de paramétrage.
Config runtime OS : `keyber-os-runtime-v1` (une section par composante) — Admin et Front-End partagent la même source. Progression jeu : `keyber-os-play-saves-v1`.
Pont Book → Front-End : `keyber-play-catalog-v1` (Live) + cartes Admin Tester → `/jouer/book/[id]`. Doc : Vue Globale « Pont Book ». Le jeu ne lit pas `keyber-studio-*` (Atelier).
Sans fichier sous `data/scenarios/`, le scénario disparaît du catalogue joueur.

## Agent Nettoyage

- Identifie, priorise, propose. **Ne supprime jamais** tout seul.
- Ne modifie jamais le Cœur.
- Ne crée jamais un 2ᵉ scénario.
- Si donnée d’exemple dans l’OS → proposition du type « Déplacer vers `data/scenarios/<id>/` », pas « Supprimer ».
