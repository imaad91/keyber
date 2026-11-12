import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import type { Sauvegarde, SlotNumber } from "@/lib/sauvegarde";

export const dynamic = "force-dynamic";

function rowToSave(row: Record<string, unknown>): Sauvegarde {
  return {
    id: String(row.id),
    slot: Number(row.slot) as SlotNumber,
    nomJoueur: String(row.nom_joueur ?? "Pilote KEYBER"),
    mode: (row.mode as Sauvegarde["mode"]) ?? null,
    scenarioId: (row.scenario_id as string) ?? null,
    gameState: row.game_state as Sauvegarde["gameState"],
    dateDerniereSauvegarde: String(row.date_derniere_sauvegarde),
    jourActuel: Number(row.jour_actuel ?? 0),
    pourcentageProgression: Number(row.pourcentage_progression ?? 0),
  };
}

export async function GET(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      cloud: false,
      slots: [] as Sauvegarde[],
      message: "Supabase non configuré — sauvegarde locale uniquement.",
    });
  }
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId requis" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("sauvegardes")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    return NextResponse.json(
      { cloud: true, error: error.message, slots: [] },
      { status: 200 }
    );
  }
  return NextResponse.json({
    cloud: true,
    slots: (data ?? []).map((r) => rowToSave(r as Record<string, unknown>)),
  });
}

export async function PUT(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ cloud: false, ok: true });
  }
  const body = (await req.json()) as {
    userId: string;
    sauvegarde: Sauvegarde;
  };
  if (!body?.userId || !body?.sauvegarde) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }
  const s = body.sauvegarde;
  const { error } = await supabase.from("sauvegardes").upsert(
    {
      id: s.id,
      user_id: body.userId,
      slot: s.slot,
      nom_joueur: s.nomJoueur,
      mode: s.mode,
      scenario_id: s.scenarioId,
      game_state: s.gameState,
      date_derniere_sauvegarde: s.dateDerniereSauvegarde,
      jour_actuel: s.jourActuel,
      pourcentage_progression: s.pourcentageProgression,
    },
    { onConflict: "user_id,slot" }
  );
  if (error) {
    return NextResponse.json({ cloud: true, ok: false, error: error.message });
  }
  return NextResponse.json({ cloud: true, ok: true });
}

export async function DELETE(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ cloud: false, ok: true });
  }
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const slot = Number(url.searchParams.get("slot"));
  if (!userId || !(slot === 1 || slot === 2 || slot === 3)) {
    return NextResponse.json({ error: "params invalides" }, { status: 400 });
  }
  const { error } = await supabase
    .from("sauvegardes")
    .delete()
    .eq("user_id", userId)
    .eq("slot", slot);
  if (error) {
    return NextResponse.json({ cloud: true, ok: false, error: error.message });
  }
  return NextResponse.json({ cloud: true, ok: true });
}
