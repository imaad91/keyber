/**
 * Écrit le JSON Book Novacier sous data/scenarios/novacier/.
 * Usage : npx tsx scripts/write-novacier-scenario.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  buildNovacierHistoireParam,
  novacierParamFileName,
} from "../lib/novacierBookPack";
import { validateScenarioFileContract } from "../lib/scenarioFileContract";

const fichier = novacierParamFileName();
const param = buildNovacierHistoireParam(fichier);
const contract = validateScenarioFileContract(param);
if (!contract.ok) {
  console.error("Contrat KO", contract.issues);
  process.exit(1);
}

const dir = join(process.cwd(), "data", "scenarios", "novacier");
mkdirSync(dir, { recursive: true });
const out = join(dir, fichier);
writeFileSync(out, `${JSON.stringify(param, null, 2)}\n`, "utf8");
console.log("Wrote", out);
console.log(
  "Decisions",
  (param.Décisions || []).length,
  "Events",
  (param["Événements entreprise"] || []).length,
  "Intro",
  (param.Intro || []).length
);
