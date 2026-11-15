import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function scenariosRoot() {
  return join(process.cwd(), "data", "scenarios");
}

/** Cherche un fichier JSON sous data/scenarios/** */
function findScenarioFile(fileName: string): string | null {
  const safe = fileName.replace(/\\/g, "/").split("/").pop();
  if (!safe || !safe.endsWith(".json") || safe.includes("..")) return null;
  const root = scenariosRoot();
  if (!existsSync(root)) return null;

  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name);
      if (name.isDirectory()) stack.push(full);
      else if (name.isFile() && name.name === safe) return full;
    }
  }
  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: { file: string } }
) {
  const decoded = decodeURIComponent(ctx.params.file);
  const path = findScenarioFile(decoded);
  if (!path) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
  try {
    const json = JSON.parse(readFileSync(path, "utf8"));
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 500 });
  }
}

export async function HEAD(
  _req: Request,
  ctx: { params: { file: string } }
) {
  const decoded = decodeURIComponent(ctx.params.file);
  const path = findScenarioFile(decoded);
  if (!path) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 200 });
}
