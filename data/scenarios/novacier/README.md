# Pack Novacier (Étape 41 — exemple only)

Contenu extrait de `data/contextes/novacier/` + `data/scenarioNovacier.ts` vers un fichier de paramétrage Book unique.

- JSON : `novacier_responsable-de-production-histoire_v1.json`
- Régénérer : `npx tsx scripts/write-novacier-scenario.ts`
- Seed Admin : `/admin/book/demo-novacier`
- Jouer : `/jouer/live` → Book → `/jouer/book/[id]` (Keyber OS)
- `/play` redirige vers `/jouer/live` (POC joueur retiré)

**Règle** : aucun nom Novacier dans `lib/keyberOs/*`.
