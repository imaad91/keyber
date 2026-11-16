/**
 * Étape 35 — Écriture data/scenarios/<id>/<fichier>.json
 * Refuse si le contrat fichier unique est rouge.
 */

import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import {
  ensureContractKeysInParam,
  validateScenarioFileContract,
} from "@/lib/scenarioFileContract";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body objet requis" }, { status: 400 });
  }

  const { param: rawParam, scenarioId: idOverride } = body as {
    param?: unknown;
    scenarioId?: string;
  };

  if (rawParam == null) {
    return NextResponse.json({ error: "param requis" }, { status: 400 });
  }

  const ensured = ensureContractKeysInParam(rawParam);
  const contract = validateScenarioFileContract(ensured);

  if (!contract.ok) {
    return NextResponse.json(
      {
        error: "Contrat fichier unique refusé",
        contract,
      },
      { status: 422 }
    );
  }

  const scenarioId =
    (typeof idOverride === "string" && idOverride.trim()
      ? idOverride.trim()
      : contract.scenarioId) || "scenario";
  const fileName = contract.fileName;
  if (!fileName) {
    return NextResponse.json(
      { error: "Nom de fichier indéterminé" },
      { status: 400 }
    );
  }

  const safeId = scenarioId.replace(/[^a-z0-9-_]/gi, "-").slice(0, 64);
  const safeFile = fileName.replace(/\\/g, "/").split("/").pop()!;
  if (!safeFile.endsWith(".json") || safeFile.includes("..")) {
    return NextResponse.json(
      { error: "Nom de fichier refusé" },
      { status: 400 }
    );
  }

  const dir = join(process.cwd(), "data", "scenarios", safeId);
  const full = join(dir, safeFile);

  try {
    mkdirSync(dir, { recursive: true });
    const payload = {
      ...ensured,
      fichier: safeFile,
    };
    writeFileSync(full, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Écriture disque impossible",
      },
      { status: 500 }
    );
  }

  const relative = `data/scenarios/${safeId}/${safeFile}`;
  return NextResponse.json({
    ok: true,
    path: relative,
    contract: validateScenarioFileContract({
      ...ensured,
      fichier: safeFile,
    }),
  });
}
