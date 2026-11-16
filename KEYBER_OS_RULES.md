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
Jouer une carte Book : `/jouer/book/[id]` — bandeau orange MODE TEST si En cours de test ; badge vert LIVE si Live.
Démo optionnelle seed Studio localStorage uniquement (données sous `data/scenarios/<id>/`, jamais dans le code OS).

**Keyber OS** = moteur générique du jeu : **chaque sous-onglet Admin = un module runtime** sous `lib/keyberOs/` + doc.
Sous-onglets : Vue Globale · ERP · Scénarios · Décisions · Événements · Progression · Interface Joueur · **Ordinateur** · **Temps** · **Interviews** · **Objectifs** · **Visibilité** · Données & Sauvegarde.
Pipeline Front : `lib/keyberOs/pipeline.ts` + shell `components/osPlay/OsPlayShell.tsx` (parité POC : mail, chat, ERP tables, dashboard live, interviews…).
Pack Ordinateur synthétisé depuis le param (`Ordinateur` optionnel) via `ordinateurPack.ts` — aucun nom d'entreprise dans le moteur.
Aucun contenu métier inventé — le moteur lit les fichiers de paramétrage.
Config runtime OS : `keyber-os-runtime-v1` (une section par composante) — Admin et Front-End partagent la même source. Progression jeu : `keyber-os-play-saves-v1`.
Pont Book → Front-End : `keyber-play-catalog-v1` (Live uniquement). Le jeu ne lit pas `keyber-studio-*` (Atelier).
Sans fichier sous `data/scenarios/`, le scénario disparaît du catalogue joueur.

## Agent Nettoyage

- Identifie, priorise, propose. **Ne supprime jamais** tout seul.
- Ne modifie jamais le Cœur.
- Ne crée jamais un 2ᵉ scénario.
- Si donnée d’exemple dans l’OS → proposition du type « Déplacer vers `data/scenarios/<id>/` », pas « Supprimer ».
