import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import type { ProgressionGlobale } from "@/lib/sauvegarde";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(null);
  }
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("progression_globale")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json(null);
  }
  const row = data as Record<string, unknown>;
  const progression: ProgressionGlobale = {
    userId: String(row.user_id),
    niveauGlobal: Number(row.niveau_global ?? 1),
    xpTotal: Number(row.xp_total ?? 0),
    competences: (row.competences as ProgressionGlobale["competences"]) ?? {},
    histoiresTerminees: (row.histoires_terminees as string[]) ?? [],
    entrainementsTermines: (row.entrainements_termines as string[]) ?? [],
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
  return NextResponse.json(progression);
}

export async function PUT(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ cloud: false, ok: true });
  }
  const body = (await req.json()) as ProgressionGlobale;
  if (!body?.userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }
  const { error } = await supabase.from("progression_globale").upsert(
    {
      user_id: body.userId,
      niveau_global: body.niveauGlobal,
      xp_total: body.xpTotal,
      competences: body.competences,
      histoires_terminees: body.histoiresTerminees,
      entrainements_termines: body.entrainementsTermines,
      updated_at: body.updatedAt ?? new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    return NextResponse.json({ cloud: true, ok: false, error: error.message });
  }
  return NextResponse.json({ cloud: true, ok: true });
}
