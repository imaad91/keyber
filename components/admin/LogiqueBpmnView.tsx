"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import type {
  CoeurChoix,
  CoeurCompetenceImpact,
  CoeurConsequence,
  CoeurDecision,
  CoeurEvenement,
  ScenarioCoeur,
} from "@/lib/adminCoeur";
import type { CoeurHighlight } from "@/lib/coeurHistory";
import { normalizeLockedImpact } from "@/lib/competenceLocks";
import { getCompetenceDef } from "@/lib/competences";
import { cn } from "@/lib/utils";

function CompetenceImpactCard({ impact }: { impact: CoeurCompetenceImpact }) {
  const n = normalizeLockedImpact(impact);
  const def = getCompetenceDef(n.competenceId);
  return (
    <li className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
      <p className="font-semibold text-slate-900">
        {def?.nom ?? n.competenceId}{" "}
        <span className="font-mono text-[10px] font-normal text-slate-400">
          {n.competenceId}
        </span>
      </p>
      {def?.descriptionPrecise ? (
        <p className="mt-0.5 text-[11px] text-slate-500">
          {def.descriptionPrecise}
        </p>
      ) : null}
      <p className="mt-1 text-[11px] text-slate-700">
        <span className="font-semibold">Indicateur testé :</span>{" "}
        {n.indicateurTeste ?? "—"}
      </p>
      <p className="mt-1 text-[11px] text-emerald-800">
        <span className="font-semibold">Si réussi :</span>{" "}
        {n.feedbackSiReussi || n.feedback || "—"}
      </p>
      <p className="mt-0.5 text-[11px] text-rose-800">
        <span className="font-semibold">Si échoué :</span>{" "}
        {n.feedbackSiEchoue || "—"}
      </p>
      <p className="mt-1 text-[10px] tabular-nums text-slate-400">+{n.xp} XP</p>
    </li>
  );
}

type SelectedNode =
  | { kind: "decision"; id: string }
  | { kind: "event"; id: string }
  | { kind: "choix"; decisionId: string; choixId: string };

const MESSAGE_TYPES = new Set(["Email", "Chat"]);

type Props = {
  coeur: ScenarioCoeur;
  /** Ghost nodes from previous version for SUPPRIMÉ */
  deletedNodes?: { decisions: CoeurDecision[]; evenements: CoeurEvenement[] };
  highlights: CoeurHighlight[];
  onlyHighlights?: boolean;
  blinkNodeId?: string | null;
  syncLabel?: string;
};

export function LogiqueBpmnView({
  coeur,
  deletedNodes,
  highlights,
  onlyHighlights,
  blinkNodeId,
  syncLabel = "Synchronisé ✓ — CŒUR et Logique identiques",
}: Props) {
  const [selected, setSelected] = useState<SelectedNode | null>(null);

  const hlMap = useMemo(() => {
    const m = new Map<string, CoeurHighlight>();
    for (const h of highlights) {
      if (!h.seen || h.kind === "supprime") m.set(h.nodeId, h);
    }
    return m;
  }, [highlights]);

  const days = useMemo(() => {
    const set = new Set<number>();
    coeur.decisions.forEach((d) => set.add(d.jour));
    coeur.evenements.forEach((e) => set.add(e.jour));
    deletedNodes?.decisions.forEach((d) => set.add(d.jour));
    deletedNodes?.evenements.forEach((e) => set.add(e.jour));
    for (let i = 1; i <= 5; i++) set.add(i);
    return Array.from(set).sort((a, b) => a - b);
  }, [coeur, deletedNodes]);

  const detail = useMemo(() => resolveDetail(coeur, selected), [coeur, selected]);
  const selectedHl = selected
    ? hlMap.get(
        selected.kind === "choix" ? selected.choixId : selected.id
      ) ??
      Array.from(hlMap.values()).find(
        (h) =>
          selected.kind === "choix" &&
          h.nodeId.startsWith(selected.choixId + ":")
      )
    : null;

  function visible(nodeId: string, relatedIds: string[] = []) {
    if (!onlyHighlights) return true;
    if (hlMap.has(nodeId)) return true;
    return relatedIds.some((id) => hlMap.has(id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BpmnLegend />
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          {syncLabel}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-[#fafafa] p-4">
          {days.map((jour) => {
            const decision = coeur.decisions.find((d) => d.jour === jour);
            const events = coeur.evenements
              .filter((e) => e.jour === jour)
              .sort((a, b) => a.heure.localeCompare(b.heure));
            const triggers = events.filter((e) => !MESSAGE_TYPES.has(e.type));
            const messages = events.filter((e) => MESSAGE_TYPES.has(e.type));
            const delDec = deletedNodes?.decisions.filter((d) => d.jour === jour) ?? [];
            const delEv =
              deletedNodes?.evenements.filter((e) => e.jour === jour) ?? [];

            const dayHasHl =
              !onlyHighlights ||
              (decision && visible(decision.id, decision.choix.map((c) => c.id))) ||
              events.some((e) => visible(e.id)) ||
              delDec.some((d) => hlMap.has(d.id)) ||
              delEv.some((e) => hlMap.has(e.id));

            if (!dayHasHl) return null;

            return (
              <DayLane
                key={jour}
                jour={jour}
                triggers={triggers}
                messages={messages}
                decision={decision}
                deletedDecisions={delDec}
                deletedEvents={delEv}
                selected={selected}
                onSelect={setSelected}
                hlMap={hlMap}
                onlyHighlights={onlyHighlights}
                blinkNodeId={blinkNodeId}
              />
            );
          })}
        </div>

        <aside className="sticky top-4 h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Détail (lecture seule)
          </p>
          {!detail && !selectedHl ? (
            <p className="mt-3 text-sm text-slate-500">
              Cliquez un nœud — aucune édition possible ici.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {selectedHl && (selectedHl.before || selectedHl.after) ? (
                <CompareBox hl={selectedHl} />
              ) : null}
              {detail ? <ReadOnlyDetail detail={detail} /> : null}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function CompareBox({ hl }: { hl: CoeurHighlight }) {
  return (
    <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 text-xs">
      <p className="mb-2 font-bold uppercase tracking-wide text-orange-800">
        Comparatif
      </p>
      {hl.before ? (
        <p className="text-slate-500 line-through">AVANT : {hl.before}</p>
      ) : null}
      {hl.after ? (
        <p className="font-semibold text-orange-800">APRÈS : {hl.after}</p>
      ) : null}
    </div>
  );
}

function ReadOnlyDetail({
  detail,
}: {
  detail:
    | { kind: "decision"; decision: CoeurDecision }
    | { kind: "event"; event: CoeurEvenement }
    | { kind: "choix"; decision: CoeurDecision; choix: CoeurChoix };
}) {
  if (detail.kind === "event") {
    const e = detail.event;
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-400">
          {e.type} · J{e.jour} {e.heure}
        </p>
        <h3 className="text-sm font-semibold">{e.titre}</h3>
        <p className="text-sm text-slate-600">{e.texte}</p>
      </div>
    );
  }
  if (detail.kind === "choix") {
    const c = detail.choix;
    const generales =
      c.competencesImpactees?.filter((i) => i.type === "generale") ?? [];
    const ciblees =
      c.competencesImpactees?.filter((i) => i.type === "ciblee") ?? [];
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-400">Action</p>
        <h3 className="text-sm font-semibold">{c.label}</h3>
        {c.feedbackTexte ? (
          <p className="text-sm text-slate-600">{c.feedbackTexte}</p>
        ) : null}
        {(generales.length > 0 || ciblees.length > 0) && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
            {generales.length > 0 ? (
              <div>
                <p className="font-semibold text-slate-700">Générales</p>
                <ul className="mt-1 space-y-2">
                  {generales.map((i) => (
                    <CompetenceImpactCard
                      key={`${i.competenceId}-${i.feedback}`}
                      impact={i}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
            {ciblees.length > 0 ? (
              <div>
                <p className="font-semibold text-slate-700">Ciblées</p>
                <ul className="mt-1 space-y-2">
                  {ciblees.map((i) => (
                    <CompetenceImpactCard
                      key={`${i.competenceId}-${i.feedback}`}
                      impact={i}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        <ul className="font-mono text-[10px] text-slate-600">
          {c.consequences.map((cons, i) => (
            <li key={i}>{schematicImpact(cons)}</li>
          ))}
        </ul>
      </div>
    );
  }
  const d = detail.decision;
  const allImpacts = d.choix.flatMap((c) => c.competencesImpactees ?? []);
  const generales = allImpacts.filter((i) => i.type === "generale");
  const ciblees = allImpacts.filter((i) => i.type === "ciblee");
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-slate-400">
        Décision · J{d.jour}
      </p>
      <h3 className="text-sm font-semibold">{d.titre}</h3>
      <p className="text-sm text-slate-600">{d.dilemme}</p>
      {(generales.length > 0 || ciblees.length > 0) && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
          <p className="font-semibold text-slate-700">Compétences impactées</p>
          {generales.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase text-slate-500">Générales</p>
              <ul className="mt-1 space-y-2">
                {generales.map((i) => (
                  <CompetenceImpactCard
                    key={`g-${i.competenceId}-${(i.feedback || "").slice(0, 24)}`}
                    impact={i}
                  />
                ))}
              </ul>
            </div>
          ) : null}
          {ciblees.length > 0 ? (
            <div>
              <p className="text-[10px] uppercase text-slate-500">Ciblées</p>
              <ul className="mt-1 space-y-2">
                {ciblees.map((i) => (
                  <CompetenceImpactCard
                    key={`c-${i.competenceId}-${(i.feedback || "").slice(0, 24)}`}
                    impact={i}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DayLane({
  jour,
  triggers,
  messages,
  decision,
  deletedDecisions,
  deletedEvents,
  selected,
  onSelect,
  hlMap,
  onlyHighlights,
  blinkNodeId,
}: {
  jour: number;
  triggers: CoeurEvenement[];
  messages: CoeurEvenement[];
  decision?: CoeurDecision;
  deletedDecisions: CoeurDecision[];
  deletedEvents: CoeurEvenement[];
  selected: SelectedNode | null;
  onSelect: (n: SelectedNode) => void;
  hlMap: Map<string, CoeurHighlight>;
  onlyHighlights?: boolean;
  blinkNodeId?: string | null;
}) {
  const show = (id: string, extra: string[] = []) => {
    if (!onlyHighlights) return true;
    if (hlMap.has(id)) return true;
    return extra.some(
      (x) =>
        hlMap.has(x) ||
        Array.from(hlMap.keys()).some((k) => k.startsWith(x + ":"))
    );
  };

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="rounded-full border border-slate-900 bg-white px-3 py-0.5 text-[11px] font-bold tracking-[0.18em]">
          JOUR {jour}
        </span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>
      <div className="flex flex-col items-center">
        {[...triggers, ...deletedEvents.filter((e) => !MESSAGE_TYPES.has(e.type))].map(
          (ev, i) =>
            show(ev.id) ? (
              <div key={ev.id} className="flex w-full flex-col items-center">
                {i > 0 ? <FlowArrow /> : null}
                <EventCircle
                  label={shortEventName(ev)}
                  active={selected?.kind === "event" && selected.id === ev.id}
                  hl={hlMap.get(ev.id)}
                  blink={blinkNodeId === ev.id}
                  onClick={() => onSelect({ kind: "event", id: ev.id })}
                />
              </div>
            ) : null
        )}
        {[...messages, ...deletedEvents.filter((e) => MESSAGE_TYPES.has(e.type))].map(
          (ev) =>
            show(ev.id) ? (
              <div key={ev.id} className="flex w-full flex-col items-center">
                <FlowArrow />
                <MessageNode
                  label={shortMessageLabel(ev)}
                  type={ev.type}
                  active={selected?.kind === "event" && selected.id === ev.id}
                  hl={hlMap.get(ev.id)}
                  blink={blinkNodeId === ev.id}
                  onClick={() => onSelect({ kind: "event", id: ev.id })}
                />
              </div>
            ) : null
        )}
        {decision &&
        show(
          decision.id,
          decision.choix.map((c) => c.id)
        ) ? (
          <>
            <FlowArrow />
            <DecisionDiamond
              label={shortDecisionLabel(decision)}
              active={selected?.kind === "decision" && selected.id === decision.id}
              hl={hlMap.get(decision.id)}
              blink={blinkNodeId === decision.id}
              onClick={() => onSelect({ kind: "decision", id: decision.id })}
            />
            <div className="mt-1 grid w-full gap-3 lg:grid-cols-3">
              {decision.choix.slice(0, 3).map((c) =>
                show(c.id, [`${c.id}:`]) ||
                Array.from(hlMap.keys()).some((k) =>
                  k.startsWith(c.id + ":")
                ) ||
                !onlyHighlights ? (
                  <BranchColumn
                    key={c.id}
                    choix={c}
                    active={
                      selected?.kind === "choix" && selected.choixId === c.id
                    }
                    hl={hlMap.get(c.id)}
                    impactHighlights={Array.from(hlMap.entries())
                      .filter(([k]) => k.startsWith(c.id + ":"))
                      .map(([, v]) => v)}
                    blink={blinkNodeId === c.id}
                    onSelect={() =>
                      onSelect({
                        kind: "choix",
                        decisionId: decision.id,
                        choixId: c.id,
                      })
                    }
                  />
                ) : null
              )}
            </div>
          </>
        ) : null}
        {deletedDecisions.map((d) =>
          hlMap.has(d.id) ? (
            <div key={d.id} className="mt-3">
              <DecisionDiamond
                label={shortDecisionLabel(d)}
                active={false}
                hl={hlMap.get(d.id)}
                blink={blinkNodeId === d.id}
                onClick={() => onSelect({ kind: "decision", id: d.id })}
              />
            </div>
          ) : null
        )}
      </div>
    </section>
  );
}

function BranchColumn({
  choix,
  active,
  hl,
  impactHighlights,
  blink,
  onSelect,
}: {
  choix: CoeurChoix;
  active: boolean;
  hl?: CoeurHighlight;
  impactHighlights: CoeurHighlight[];
  blink?: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 flex-col items-center justify-end">
        <div className="h-4 w-px bg-slate-800" />
        <span className="max-w-[9rem] truncate rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center text-[10px] font-semibold">
          {shortChoixLabel(choix.label)}
        </span>
      </div>
      <FlowArrow />
      <ActionRect
        label={shortActionLabel(choix)}
        active={active}
        hl={hl}
        blink={blink}
        onClick={onSelect}
      />
      <ImpactArrow
        labels={choix.consequences.map(schematicImpact)}
        highlights={impactHighlights}
      />
    </div>
  );
}

function HighlightBadge({ hl }: { hl?: CoeurHighlight }) {
  if (!hl || (hl.seen && hl.kind !== "supprime")) return null;
  const styles = {
    nouveau: "bg-emerald-600 text-white",
    modifie: "bg-orange-500 text-white",
    supprime: "bg-slate-500 text-white",
  };
  const labels = {
    nouveau: "NOUVEAU",
    modifie: "MODIFIÉ",
    supprime: "SUPPRIMÉ",
  };
  return (
    <span
      className={cn(
        "absolute -right-2 -top-2 z-20 rounded px-1 py-0.5 text-[8px] font-bold",
        styles[hl.kind]
      )}
    >
      {labels[hl.kind]}
    </span>
  );
}

function hlRing(hl?: CoeurHighlight, blink?: boolean) {
  if (blink) return "animate-pulse ring-4 ring-sky-400 ring-offset-2";
  if (!hl || (hl.seen && hl.kind !== "supprime")) return "";
  if (hl.kind === "nouveau")
    return "ring-4 ring-emerald-400 ring-offset-2 shadow-[0_0_20px_rgba(16,185,129,0.55)]";
  if (hl.kind === "modifie")
    return "ring-4 ring-orange-400 ring-offset-2 shadow-[0_0_20px_rgba(249,115,22,0.55)]";
  return "opacity-40 grayscale line-through";
}

function DecisionDiamond({
  label,
  active,
  hl,
  blink,
  onClick,
}: {
  label: string;
  active: boolean;
  hl?: CoeurHighlight;
  blink?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative my-3 flex h-24 w-24 items-center justify-center",
        hlRing(hl, blink)
      )}
    >
      <HighlightBadge hl={hl} />
      <span
        className={cn(
          "absolute inset-1 rotate-45 border-[3px] bg-black",
          hl?.kind === "nouveau" && !hl.seen
            ? "border-emerald-500"
            : hl?.kind === "modifie" && !hl.seen
              ? "border-orange-500"
              : "border-black",
          active && "ring-2 ring-white"
        )}
      />
      <span className="relative z-10 max-w-[4.5rem] text-center text-[10px] font-bold leading-tight text-white">
        {label}
      </span>
    </button>
  );
}

function ActionRect({
  label,
  active,
  hl,
  blink,
  onClick,
}: {
  label: string;
  active: boolean;
  hl?: CoeurHighlight;
  blink?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative min-h-[2.5rem] w-full max-w-[11rem] rounded-md border-2 border-black bg-white px-2 py-1.5 text-center text-[11px] font-semibold leading-tight",
        active && "ring-2 ring-slate-400",
        hlRing(hl, blink),
        hl?.kind === "nouveau" && !hl.seen && "border-emerald-600",
        hl?.kind === "modifie" && !hl.seen && "border-orange-500"
      )}
    >
      <HighlightBadge hl={hl} />
      {label}
    </button>
  );
}

function EventCircle({
  label,
  active,
  hl,
  blink,
  onClick,
}: {
  label: string;
  active: boolean;
  hl?: CoeurHighlight;
  blink?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-black px-1 text-center text-[10px] font-bold leading-tight",
        active && "ring-2 ring-slate-400",
        hlRing(hl, blink),
        hl?.kind === "nouveau" && !hl.seen && "border-emerald-600",
        hl?.kind === "modifie" && !hl.seen && "border-orange-500"
      )}
      style={{ background: "#D6F94C" }}
    >
      <HighlightBadge hl={hl} />
      {label}
    </button>
  );
}

function MessageNode({
  label,
  type,
  active,
  hl,
  blink,
  onClick,
}: {
  label: string;
  type: string;
  active: boolean;
  hl?: CoeurHighlight;
  blink?: boolean;
  onClick: () => void;
}) {
  const Icon =
    type === "Chat" ? MessageCircle : type === "Email" ? Mail : Phone;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex max-w-[14rem] items-center gap-2 rounded-md border border-slate-400 bg-slate-100 px-2.5 py-2 text-left text-[11px] font-semibold",
        active && "ring-2 ring-slate-400",
        hlRing(hl, blink)
      )}
    >
      <HighlightBadge hl={hl} />
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function FlowArrow() {
  return (
    <div className="flex h-5 flex-col items-center" aria-hidden>
      <div className="h-full w-px bg-slate-800" />
      <div className="-mt-px h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-800" />
    </div>
  );
}

function ImpactArrow({
  labels,
  highlights,
}: {
  labels: string[];
  highlights: CoeurHighlight[];
}) {
  const modified = highlights.filter((h) => h.kind === "modifie" && !h.seen);
  return (
    <div className="mt-1 flex w-full flex-col items-center">
      <div className="h-3 w-px bg-slate-800" />
      <div
        className={cn(
          "w-full max-w-[11rem] border border-slate-300 bg-white px-1.5 py-1 font-mono text-[9px] leading-snug",
          modified.length > 0 && "border-orange-400 border-2"
        )}
      >
        {modified.map((h) => (
          <div key={h.id}>
            {h.before ? (
              <div className="text-slate-400 line-through">{h.before}</div>
            ) : null}
            {h.after ? (
              <div className="font-semibold text-orange-700">{h.after}</div>
            ) : null}
          </div>
        ))}
        {labels
          .filter(
            (l) =>
              !modified.some(
                (h) =>
                  (h.after && l.startsWith(h.after.split(" ")[0]!)) ||
                  (h.before && l.startsWith(h.before.split(" ")[0]!))
              )
          )
          .map((l) => (
            <div key={l}>{l}</div>
          ))}
      </div>
      <div className="h-2 w-px bg-slate-800" />
      <div className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-800" />
    </div>
  );
}

function BpmnLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
      <LegendItem>
        <span className="inline-block h-3 w-3 rotate-45 border-2 border-black bg-black" />
        Losange = Décision
      </LegendItem>
      <LegendItem>
        <span className="inline-block h-2.5 w-5 rounded-sm border border-black bg-white" />
        Rectangle = Action
      </LegendItem>
      <LegendItem>
        <Mail className="h-3.5 w-3.5" />
        Enveloppe = Message
      </LegendItem>
      <LegendItem>
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border border-black"
          style={{ background: "#D6F94C" }}
        />
        Cercle = Événement
      </LegendItem>
      <LegendItem>
        <span className="h-0.5 w-5 bg-slate-800" />
        Flèche pleine = Impact
      </LegendItem>
      <LegendItem>
        <span className="h-0 w-5 border-t border-dashed border-slate-600" />
        Pointillé = Condition
      </LegendItem>
    </div>
  );
}

function LegendItem({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5">{children}</span>;
}

/* labels */
function shortDecisionLabel(d: CoeurDecision): string {
  const raw = d.titre.replace(/^Jour\s*\d+\s*[—\-:]?\s*/i, "").trim();
  const short = raw.split(/[·|]/)[0]!.trim();
  const clipped = short.length > 18 ? `${short.slice(0, 16)}…` : short;
  return `J${d.jour} - ${clipped}${clipped.endsWith("?") ? "" : " ?"}`;
}
function shortChoixLabel(label: string): string {
  if (/capteur/i.test(label)) return "Capteur 5k€";
  if (/machine/i.test(label) && /80|nouvelle/i.test(label)) return "Machine 80k€";
  if (/ne rien|rien faire/i.test(label)) return "Rien";
  if (/heures?\s*sup/i.test(label)) return "HS";
  if (/marie/i.test(label)) return "Écouter Marie";
  return label.length > 16 ? `${label.slice(0, 14)}…` : label;
}
function shortActionLabel(choix: CoeurChoix): string {
  const l = choix.label;
  if (/capteur/i.test(l)) return "Investir capteur";
  if (/nouvelle machine|commander.*machine/i.test(l)) return "Acheter machine";
  if (/ne rien|rien faire/i.test(l)) return "Ne rien faire";
  if (/heures?\s*sup|imposer/i.test(l)) return "Lancer heures sup";
  if (/marie|écouter|réorg/i.test(l)) return "Interviewer Marie";
  if (/livrer/i.test(l)) return "Livrer pièces";
  if (/jeter|rebut/i.test(l)) return "Jeter défauts";
  if (/réparer/i.test(l)) return "Réparer M3";
  if (/bypass|contourner/i.test(l)) return "Contourner M3";
  return l.split(/\s+/).slice(0, 3).join(" ").slice(0, 22);
}
function shortEventName(ev: CoeurEvenement): string {
  if (/panne/i.test(ev.titre)) return "Panne machine";
  if (/visite|autovolt|semaine critique/i.test(ev.titre)) return "Visite AutoVolt";
  if (/rumeur/i.test(ev.titre)) return "Rumeur";
  if (/défaut|micro/i.test(ev.titre)) return "Défaut qualité";
  if (/négoc/i.test(ev.titre)) return "Négociation";
  return ev.titre.split(/\s+/).slice(0, 2).join(" ").slice(0, 16);
}
function shortMessageLabel(ev: CoeurEvenement): string {
  const icon = ev.type === "Chat" ? "💬" : "✉";
  let who = "";
  let subject = ev.titre;
  if (/laurent/i.test(ev.titre)) who = "Laurent";
  if (/karim/i.test(ev.titre)) who = "Karim";
  if (/marie/i.test(ev.titre)) who = "Marie";
  if (/henri/i.test(ev.titre)) who = "Henri";
  subject = subject
    .replace(/^(Mail|Email)\s+\w+\s*[—\-:]\s*/i, "")
    .replace(/^où en est (le )?retard.*/i, "Retard AutoVolt");
  if (subject.length > 22) subject = `${subject.slice(0, 20)}…`;
  return who ? `${icon} ${who} - ${subject}` : `${icon} ${subject}`;
}
function schematicImpact(c: CoeurConsequence): string {
  const map: Record<string, string> = {
    tresorerie: "Trésorerie",
    temps: "Temps",
    xp: "XP",
    moral: "Moral",
    ethique: "Éthique",
    production: "Production",
    tauxRebut: "TauxRebut",
    "visibilite.erp": "Visibilité.ERP",
    "visibilite.stock": "Visibilité.Stock",
    "visibilite.production": "Visibilité.Prod",
    "confiance.marie": "Confiance.Marie",
    "confiance.karim": "Confiance.Karim",
    "confiance.laurent": "Confiance.Laurent",
    "confiance.henri": "Confiance.Henri",
  };
  const cible =
    map[c.cible] ??
    c.cible
      .split(".")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(".");
  if (c.mode === "set" || c.setValeur)
    return `${cible} = ${c.setValeur ?? c.valeur}`;
  if (c.cible === "temps")
    return `Temps ${c.valeur >= 0 ? "+" : ""}${c.valeur}min`;
  return `${cible} ${c.valeur > 0 ? "+" : ""}${c.valeur}`;
}

function resolveDetail(coeur: ScenarioCoeur, selected: SelectedNode | null) {
  if (!selected) return null;
  if (selected.kind === "decision") {
    const d = coeur.decisions.find((x) => x.id === selected.id);
    return d ? ({ kind: "decision" as const, decision: d }) : null;
  }
  if (selected.kind === "event") {
    const e = coeur.evenements.find((x) => x.id === selected.id);
    return e ? ({ kind: "event" as const, event: e }) : null;
  }
  const d = coeur.decisions.find((x) => x.id === selected.decisionId);
  const c = d?.choix.find((x) => x.id === selected.choixId);
  return d && c ? { kind: "choix" as const, decision: d, choix: c } : null;
}
