"use client";

/**
 * Clear Campus Phase 3 — monde libre (carte + explore), thème clair.
 */

import { useMemo, useState } from "react";
import {
  Building2,
  DoorOpen,
  Factory,
  Map as MapIcon,
  MessagesSquare,
  Monitor,
  Scale,
  FileText,
} from "lucide-react";
import { CLEAR_CAMPUS_LIGHT_TOKENS } from "@/lib/clearCampus/charter";
import { normalizeCampus, normalizeHotspots } from "@/lib/clearCampus/schema";
import type { ScenarioParamHotspot } from "@/lib/clearCampus/types";
import {
  ensureOsCampus,
  osCampusEnsureOnState,
  osCampusGoToRoom,
  osHotspotActivate,
  type OsPlayState,
} from "@/lib/keyberOs";
import type { ScenarioParamFileExtended } from "@/lib/scenarioParamSchema";
import { cn } from "@/lib/utils";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
};

type Mode = "map" | "explore";

const HOTSPOT_ICON: Record<
  ScenarioParamHotspot["type"],
  typeof Monitor
> = {
  suite: Monitor,
  interview: MessagesSquare,
  decision: Scale,
  document: FileText,
  productionLive: Factory,
};

export function OsCampusWorld({ play, setPlay }: Props) {
  const [mode, setMode] = useState<Mode>("map");
  const param = play.param as ScenarioParamFileExtended;
  const campus = useMemo(() => normalizeCampus(param.Campus), [param.Campus]);
  const hotspots = useMemo(
    () => normalizeHotspots(param.Hotspots),
    [param.Hotspots]
  );
  const stateCampus = ensureOsCampus(osCampusEnsureOnState(play));
  const currentRoom =
    campus.rooms.find((r) => r.id === stateCampus.currentRoomId) ?? null;
  const roomHotspots = hotspots.filter(
    (h) => h.roomId === stateCampus.currentRoomId
  );

  const empty = campus.wings.length === 0 && campus.rooms.length === 0;

  function goRoom(roomId: string) {
    setPlay(osCampusGoToRoom(osCampusEnsureOnState(play), roomId));
    setMode("explore");
  }

  function activate(hotspotId: string) {
    setPlay(osHotspotActivate(osCampusEnsureOnState(play), hotspotId));
  }

  return (
    <section className="flex h-full min-h-[420px] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.accent }}
          >
            Clear Campus
          </p>
          <h2
            className="font-display text-2xl font-semibold"
            style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.text }}
          >
            {play.param.Entreprise || play.param.Nom || "Entreprise"}
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: CLEAR_CAMPUS_LIGHT_TOKENS.textMuted }}
          >
            Circule dans le campus · ouvre les outils depuis les lieux
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <ModeBtn
            active={mode === "map"}
            onClick={() => setMode("map")}
            icon={MapIcon}
            label="Carte"
          />
          <ModeBtn
            active={mode === "explore"}
            onClick={() => setMode("explore")}
            icon={DoorOpen}
            label="Explorer"
          />
        </div>
      </header>

      {empty ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Campus vide dans le param — renseigne{" "}
          <code className="mx-1 text-xs">Campus</code> +{" "}
          <code className="mx-1 text-xs">Hotspots</code> (Atelier / Book).
        </div>
      ) : mode === "map" ? (
        <div className="grid flex-1 gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ailes
            </p>
            {campus.wings.map((w) => {
              const locked = !stateCampus.unlockedWingIds.includes(w.id);
              return (
                <div key={w.id} className="rounded-xl border border-slate-100 p-2">
                  <p
                    className={cn(
                      "flex items-center gap-2 text-sm font-semibold",
                      locked ? "text-slate-400" : "text-slate-900"
                    )}
                  >
                    <Building2 className="h-3.5 w-3.5 text-teal-700" />
                    {w.label}
                    {locked ? " · verrouillé" : null}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {campus.rooms
                      .filter((r) => r.wingId === w.id)
                      .map((r) => {
                        const rLocked = !stateCampus.unlockedRoomIds.includes(
                          r.id
                        );
                        const active = stateCampus.currentRoomId === r.id;
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              disabled={rLocked}
                              onClick={() => goRoom(r.id)}
                              className={cn(
                                "w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                                active &&
                                  "bg-teal-50 font-semibold text-teal-900 ring-1 ring-teal-200",
                                !active &&
                                  !rLocked &&
                                  "text-slate-600 hover:bg-slate-50",
                                rLocked && "cursor-not-allowed text-slate-300"
                              )}
                            >
                              {r.label}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              );
            })}
          </aside>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 p-6 shadow-sm">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(13,148,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.05) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
            <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {campus.rooms.map((r, i) => {
                const locked = !stateCampus.unlockedRoomIds.includes(r.id);
                const hs = hotspots.filter((h) => h.roomId === r.id);
                const wing = campus.wings.find((w) => w.id === r.wingId);
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={locked}
                    onClick={() => goRoom(r.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-left shadow-sm transition",
                      locked
                        ? "border-slate-100 bg-slate-50/80 opacity-50"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
                      {wing?.label || r.wingId}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {r.label}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {locked
                        ? "Verrouillé"
                        : hs.length
                          ? `${hs.length} hotspot(s)`
                          : "Aucun hotspot"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">
              Explorer
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {currentRoom?.label || "Choisis une salle sur la carte"}
            </h3>
          </div>
          <div className="relative flex-1 bg-gradient-to-b from-slate-50 to-teal-50/30 p-6">
            {!currentRoom ? (
              <p className="text-sm text-slate-500">
                Passe en mode Carte et ouvre une salle.
              </p>
            ) : (
              <>
                <p className="mb-4 max-w-md text-sm text-slate-600">
                  Interagis avec les points d&apos;action de cette salle.
                </p>
                <div className="flex flex-wrap gap-3">
                  {roomHotspots.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Aucun hotspot dans cette salle.
                    </p>
                  ) : (
                    roomHotspots.map((h) => {
                      const Icon = HOTSPOT_ICON[h.type];
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => activate(h.id)}
                          className="flex min-w-[160px] items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                        >
                          <span className="mt-0.5 rounded-lg bg-teal-50 p-2 text-teal-800">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              {h.label}
                            </span>
                            <span className="mt-0.5 block text-[11px] text-slate-500">
                              {h.type}
                              {h.timeCostMin
                                ? ` · ${h.timeCostMin} min`
                                : ""}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ModeBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof MapIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-teal-700 text-white"
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
