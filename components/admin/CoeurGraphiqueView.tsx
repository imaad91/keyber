"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  patchConsequenceValeur,
  patchDecisionField,
  type CoeurChoix,
  type CoeurConsequence,
  type CoeurDecision,
  type CoeurEvenement,
  type ScenarioCoeur,
} from "@/lib/adminCoeur";
import { cn } from "@/lib/utils";
import { inputClass, textareaClass } from "@/components/admin/AdminPrimitives";

type Props = {
  coeur: ScenarioCoeur;
  onChange: (next: ScenarioCoeur) => void;
  syncOk: boolean;
};

type SelectedNode =
  | { kind: "decision"; id: string }
  | { kind: "event"; id: string }
  | { kind: "choix"; decisionId: string; choixId: string };

const MESSAGE_TYPES = new Set(["Email", "Chat"]);

export function CoeurGraphiqueView({ coeur, onChange, syncOk }: Props) {
  const [selected, setSelected] = useState<SelectedNode | null>(null);

  const days = useMemo(() => {
    const set = new Set<number>();
    coeur.decisions.forEach((d) => set.add(d.jour));
    coeur.evenements.forEach((e) => set.add(e.jour));
    for (let i = 1; i <= 5; i++) set.add(i);
    return Array.from(set).sort((a, b) => a - b);
  }, [coeur]);

  const detail = useMemo(() => resolveDetail(coeur, selected), [coeur, selected]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BpmnLegend />
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold",
            syncOk
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          )}
        >
          {syncOk
            ? "Synchronisé ✓ — CŒUR et Graphique identiques"
            : "Non synchronisé — En attente de validation"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-[#fafafa] p-4">
          {days.map((jour) => {
            const decision = coeur.decisions.find((d) => d.jour === jour);
            const events = coeur.evenements
              .filter((e) => e.jour === jour)
              .sort((a, b) => a.heure.localeCompare(b.heure));
            const triggers = events.filter((e) => !MESSAGE_TYPES.has(e.type));
            const messages = events.filter((e) => MESSAGE_TYPES.has(e.type));

            return (
              <DayLane
                key={jour}
                jour={jour}
                triggers={triggers}
                messages={messages}
                decision={decision}
                selected={selected}
                onSelect={setSelected}
              />
            );
          })}
        </div>

        <aside className="sticky top-4 h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Détail CŒUR
          </p>
          {!detail ? (
            <p className="mt-3 text-sm text-slate-500">
              Cliquez un nœud du schéma pour afficher le texte complet.
            </p>
          ) : (
            <DetailPanel
              detail={detail}
              onPatchTitre={(v) => {
                if (detail.kind === "decision") {
                  onChange(patchDecisionField(coeur, detail.decision.id, "titre", v));
                }
              }}
              onPatchDilemme={(v) => {
                if (detail.kind === "decision") {
                  onChange(
                    patchDecisionField(coeur, detail.decision.id, "dilemme", v)
                  );
                }
              }}
              onPatchValeur={(choixId, cible, valeur) => {
                if (detail.kind === "decision") {
                  onChange(
                    patchConsequenceValeur(
                      coeur,
                      detail.decision.id,
                      choixId,
                      cible,
                      valeur
                    )
                  );
                } else if (detail.kind === "choix") {
                  onChange(
                    patchConsequenceValeur(
                      coeur,
                      detail.decision.id,
                      choixId,
                      cible,
                      valeur
                    )
                  );
                }
              }}
            />
          )}
        </aside>
      </div>
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

function DayLane({
  jour,
  triggers,
  messages,
  decision,
  selected,
  onSelect,
}: {
  jour: number;
  triggers: CoeurEvenement[];
  messages: CoeurEvenement[];
  decision?: CoeurDecision;
  selected: SelectedNode | null;
  onSelect: (n: SelectedNode) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-300" />
        <span className="rounded-full border border-slate-900 bg-white px-3 py-0.5 text-[11px] font-bold tracking-[0.18em] text-slate-900">
          JOUR {jour}
        </span>
        <div className="h-px flex-1 bg-slate-300" />
      </div>

      <div className="flex flex-col items-center gap-0">
        {triggers.map((ev, i) => (
          <div key={ev.id} className="flex w-full flex-col items-center">
            {i > 0 ? <FlowArrow /> : null}
            <EventCircle
              label={shortEventName(ev)}
              active={selected?.kind === "event" && selected.id === ev.id}
              onClick={() => onSelect({ kind: "event", id: ev.id })}
            />
          </div>
        ))}

        {messages.map((ev, i) => (
          <div key={ev.id} className="flex w-full flex-col items-center">
            {triggers.length > 0 || i > 0 ? <FlowArrow /> : null}
            <MessageNode
              label={shortMessageLabel(ev)}
              type={ev.type}
              active={selected?.kind === "event" && selected.id === ev.id}
              onClick={() => onSelect({ kind: "event", id: ev.id })}
            />
          </div>
        ))}

        {decision ? (
          <>
            {triggers.length + messages.length > 0 ? <FlowArrow /> : null}
            <DecisionDiamond
              label={shortDecisionLabel(decision)}
              active={
                selected?.kind === "decision" && selected.id === decision.id
              }
              onClick={() => onSelect({ kind: "decision", id: decision.id })}
            />

            <div className="mt-1 grid w-full gap-3 lg:grid-cols-3">
              {decision.choix.slice(0, 3).map((c) => (
                <BranchColumn
                  key={c.id}
                  choix={c}
                  active={
                    selected?.kind === "choix" &&
                    selected.choixId === c.id &&
                    selected.decisionId === decision.id
                  }
                  onSelect={() =>
                    onSelect({
                      kind: "choix",
                      decisionId: decision.id,
                      choixId: c.id,
                    })
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-xs text-slate-400">— pas de décision —</p>
        )}
      </div>
    </section>
  );
}

function BranchColumn({
  choix,
  active,
  onSelect,
}: {
  choix: CoeurChoix;
  active: boolean;
  onSelect: () => void;
}) {
  const impacts = choix.consequences;
  const conditions = extractConditions(choix);

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 flex-col items-center justify-end">
        <div className="h-4 w-px bg-slate-800" />
        <span className="max-w-[9rem] truncate rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center text-[10px] font-semibold text-slate-800">
          {shortChoixLabel(choix.label)}
        </span>
      </div>
      <FlowArrow />
      <ActionRect
        label={shortActionLabel(choix)}
        active={active}
        onClick={onSelect}
      />
      <ImpactArrow labels={impacts.map(schematicImpact)} />
      {conditions.map((cond, i) => (
        <ConditionArrow key={i} label={cond} />
      ))}
    </div>
  );
}

/* —— Node shapes —— */

function DecisionDiamond({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative my-3 flex h-24 w-24 items-center justify-center"
      title={label}
    >
      <span
        className={cn(
          "absolute inset-1 rotate-45 border-[3px] border-black bg-black transition",
          active && "ring-4 ring-slate-400 ring-offset-2"
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
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[2.5rem] w-full max-w-[11rem] rounded-md border-2 border-black bg-white px-2 py-1.5 text-center text-[11px] font-semibold leading-tight text-slate-900 transition",
        active && "ring-2 ring-slate-400 ring-offset-1"
      )}
    >
      {label}
    </button>
  );
}

function EventCircle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-black px-1 text-center text-[10px] font-bold leading-tight text-slate-900 transition",
        active && "ring-2 ring-slate-400 ring-offset-1"
      )}
      style={{ background: "#D6F94C" }}
    >
      {label}
    </button>
  );
}

function MessageNode({
  label,
  type,
  active,
  onClick,
}: {
  label: string;
  type: string;
  active: boolean;
  onClick: () => void;
}) {
  const Icon =
    type === "Chat" ? MessageCircle : type === "Email" ? Mail : Phone;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex max-w-[14rem] items-center gap-2 rounded-md border border-slate-400 bg-slate-100 px-2.5 py-2 text-left text-[11px] font-semibold text-slate-800 transition",
        active && "ring-2 ring-slate-400 ring-offset-1"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-600" />
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function FlowArrow() {
  return (
    <div className="flex h-5 flex-col items-center justify-center" aria-hidden>
      <div className="h-full w-px bg-slate-800" />
      <div className="-mt-px h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-800" />
    </div>
  );
}

function ImpactArrow({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return <FlowArrow />;
  }
  return (
    <div className="mt-1 flex w-full flex-col items-center">
      <div className="h-3 w-px bg-slate-800" />
      <div className="w-full max-w-[11rem] border border-slate-300 bg-white px-1.5 py-1 font-mono text-[9px] leading-snug text-slate-700">
        {labels.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="h-2 w-px bg-slate-800" />
      <div className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-800" />
    </div>
  );
}

function ConditionArrow({ label }: { label: string }) {
  return (
    <div className="mt-2 flex w-full flex-col items-center">
      <div className="h-3 w-0 border-l border-dashed border-slate-600" />
      <span className="max-w-[11rem] border border-dashed border-slate-500 bg-white px-1.5 py-0.5 text-center font-mono text-[9px] text-slate-600">
        {label}
      </span>
      <div className="h-2 w-0 border-l border-dashed border-slate-600" />
    </div>
  );
}

/* —— Labels (schematic, never prose) —— */

function shortDecisionLabel(d: CoeurDecision): string {
  const raw = d.titre.replace(/^Jour\s*\d+\s*[—\-:]?\s*/i, "").trim();
  const short = raw.split(/[·|]/)[0]!.trim();
  const clipped =
    short.length > 18 ? `${short.slice(0, 16).trimEnd()}…` : short;
  return `J${d.jour} - ${clipped}${clipped.endsWith("?") ? "" : " ?"}`;
}

function shortChoixLabel(label: string): string {
  const cleaned = label
    .replace(/\s*\([^)]*€[^)]*\)/g, (m) => {
      const n = m.match(/([\d\s]+)\s*k?\s*€/i);
      if (!n) return "";
      const digits = n[1]!.replace(/\s/g, "");
      const num = Number(digits);
      if (num >= 1000) return ` ${Math.round(num / 1000)}k€`;
      return ` ${num}€`;
    })
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
  if (/capteur/i.test(cleaned)) return "Capteur 5k€";
  if (/machine/i.test(cleaned) && /80|nouvelle/i.test(label))
    return "Machine 80k€";
  if (/ne rien|rien faire|attendre/i.test(cleaned)) return "Rien";
  if (/heures?\s*sup/i.test(cleaned)) return "HS";
  if (/marie/i.test(cleaned)) return "Écouter Marie";
  if (/refuser/i.test(cleaned)) return "Refuser";
  if (/livrer/i.test(cleaned)) return "Livrer";
  if (/jeter|rebut|détruire/i.test(cleaned)) return "Jeter";
  if (/bypass|contourner/i.test(cleaned)) return "Bypass";
  if (/réparer/i.test(cleaned)) return "Réparer";
  return cleaned.length > 16 ? `${cleaned.slice(0, 14)}…` : cleaned;
}

function shortActionLabel(choix: CoeurChoix): string {
  const l = choix.label;
  if (/capteur/i.test(l)) return "Investir capteur";
  if (/nouvelle machine|commander.*machine/i.test(l)) return "Acheter machine";
  if (/ne rien|rien faire/i.test(l)) return "Ne rien faire";
  if (/heures?\s*sup|imposer/i.test(l)) return "Lancer heures sup";
  if (/marie|écouter|réorg/i.test(l)) return "Interviewer Marie";
  if (/refuser/i.test(l)) return "Refuser HS";
  if (/livrer/i.test(l)) return "Livrer pièces";
  if (/jeter|rebut|détruire/i.test(l)) return "Jeter défauts";
  if (/bypass|contourner/i.test(l)) return "Contourner M3";
  if (/réparer/i.test(l)) return "Réparer M3";
  if (/négoc|contrat|autovolt/i.test(l)) return "Négocier AutoVolt";
  // Verb-ish fallback: first 3 words max
  const words = l
    .replace(/\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(" ");
  return words.length > 22 ? `${words.slice(0, 20)}…` : words;
}

function shortEventName(ev: CoeurEvenement): string {
  const t = ev.titre;
  if (/panne/i.test(t)) return "Panne machine";
  if (/stock/i.test(t)) return "Alerte stock";
  if (/visite|autovolt|semaine critique/i.test(t)) return "Visite AutoVolt";
  if (/rumeur/i.test(t)) return "Rumeur";
  if (/défaut|micro/i.test(t)) return "Défaut qualité";
  if (/négoc/i.test(t)) return "Négociation";
  const words = t.split(/\s+/).slice(0, 2).join(" ");
  return words.length > 16 ? `${words.slice(0, 14)}…` : words;
}

function shortMessageLabel(ev: CoeurEvenement): string {
  const icon = ev.type === "Chat" ? "💬" : ev.type === "Email" ? "✉" : "📞";
  // "Mail Laurent — Où en est le retard ?" → Laurent - Retard ?
  let who = "";
  let subject = ev.titre;
  const m = ev.titre.match(
    /(?:Mail|Email|Chat|Appel)?\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][\wÀ-ÿ]+)?\s*[—\-:]\s*(.+)/i
  );
  if (m) {
    who = m[1] ?? "";
    subject = m[2] ?? ev.titre;
  } else if (/laurent/i.test(ev.titre)) who = "Laurent";
  else if (/karim/i.test(ev.titre)) who = "Karim";
  else if (/marie/i.test(ev.titre)) who = "Marie";
  else if (/henri/i.test(ev.titre)) who = "Henri";

  subject = subject
    .replace(/\?+$/, "?")
    .replace(/^où en est (le )?retard.*/i, "Retard ?")
    .trim();
  if (subject.length > 22) subject = `${subject.slice(0, 20)}…`;
  return who ? `${icon} ${who} - ${subject}` : `${icon} ${subject}`;
}

/** Strict schematic impact: Cible + Valeur (no prose). */
function schematicImpact(c: CoeurConsequence): string {
  const cible = schematicCible(c.cible);
  if (c.setValeur) return `${cible} = ${c.setValeur}`;
  if (c.mode === "set") return `${cible} = ${c.valeur}`;
  if (c.cible === "temps") {
    const sign = c.valeur >= 0 ? "+" : "";
    return `Temps ${sign}${c.valeur}min`;
  }
  const sign = c.valeur > 0 ? "+" : "";
  return `${cible} ${sign}${c.valeur}`;
}

function schematicCible(cible: string): string {
  const map: Record<string, string> = {
    tresorerie: "Trésorerie",
    stock: "Stock",
    stockKg: "Stock",
    production: "Production",
    tauxRebut: "TauxRebut",
    moral: "Moral",
    ethique: "Éthique",
    xp: "XP",
    temps: "Temps",
    "visibilite.erp": "Visibilité.ERP",
    "visibilite.stock": "Visibilité.Stock",
    "visibilite.production": "Visibilité.Prod",
    "confiance.marie": "Confiance.Marie",
    "confiance.karim": "Confiance.Karim",
    "confiance.laurent": "Confiance.Laurent",
    "confiance.henri": "Confiance.Henri",
    "flags.sensorInstalled": "Flag.Capteur",
    "flags.overtimeBonus": "Flag.HS",
    "flags.marieReorgBonus": "Flag.Marie",
    "flags.machine3DownDays": "Flag.M3Down",
    "flags.machine3Bypass": "Flag.Bypass",
    "flags.alarmActive": "Flag.Alarme",
  };
  if (map[cible]) return map[cible]!;
  if (cible.startsWith("badge.")) return `Badge.${cible.slice(6)}`;
  if (cible.startsWith("machine.")) return `Machine.${cible.split(".")[1]}`;
  if (cible.startsWith("flags.")) return `Flag.${cible.slice(6)}`;
  return cible
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(".");
}

function extractConditions(choix: CoeurChoix): string[] {
  const out: string[] = [];
  const conds = choix.conditions;
  if (!conds) return out;
  const list = Array.isArray(conds) ? conds : [conds];
  for (const c of list) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    const si = typeof o.si === "string" ? o.si : null;
    if (!si) continue;
    if (typeof o.superieurA === "number") {
      out.push(`SI ${schematicCible(si)} > ${o.superieurA}`);
    } else if (typeof o.inferieurA === "number") {
      out.push(`SI ${schematicCible(si)} < ${o.inferieurA}`);
    } else if (typeof o.egalA === "number") {
      out.push(`SI ${schematicCible(si)} = ${o.egalA}`);
    } else {
      out.push(`SI ${schematicCible(si)}`);
    }
  }
  return out;
}

/* —— Detail panel —— */

type Detail =
  | { kind: "decision"; decision: CoeurDecision }
  | { kind: "event"; event: CoeurEvenement }
  | { kind: "choix"; decision: CoeurDecision; choix: CoeurChoix };

function resolveDetail(
  coeur: ScenarioCoeur,
  selected: SelectedNode | null
): Detail | null {
  if (!selected) return null;
  if (selected.kind === "decision") {
    const d = coeur.decisions.find((x) => x.id === selected.id);
    return d ? { kind: "decision", decision: d } : null;
  }
  if (selected.kind === "event") {
    const e = coeur.evenements.find((x) => x.id === selected.id);
    return e ? { kind: "event", event: e } : null;
  }
  const d = coeur.decisions.find((x) => x.id === selected.decisionId);
  const c = d?.choix.find((x) => x.id === selected.choixId);
  return d && c ? { kind: "choix", decision: d, choix: c } : null;
}

function DetailPanel({
  detail,
  onPatchTitre,
  onPatchDilemme,
  onPatchValeur,
}: {
  detail: Detail;
  onPatchTitre: (v: string) => void;
  onPatchDilemme: (v: string) => void;
  onPatchValeur: (choixId: string, cible: string, valeur: number) => void;
}) {
  if (detail.kind === "event") {
    const e = detail.event;
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-400">
          {e.type} · J{e.jour} {e.heure}
        </p>
        <h3 className="text-sm font-semibold text-slate-900">{e.titre}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{e.texte}</p>
      </div>
    );
  }

  if (detail.kind === "choix") {
    const c = detail.choix;
    return (
      <div className="mt-3 space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Action · {shortChoixLabel(c.label)}
        </p>
        <h3 className="text-sm font-semibold text-slate-900">{c.label}</h3>
        {c.feedbackTexte ? (
          <p className="text-sm text-slate-600">{c.feedbackTexte}</p>
        ) : null}
        <div className="space-y-1.5">
          {c.consequences.map((cons, i) => (
            <div key={`${cons.cible}-${i}`} className="flex items-center gap-2">
              <span className="flex-1 font-mono text-[10px] text-slate-500">
                {schematicImpact(cons)}
              </span>
              <input
                type="number"
                className={cn(inputClass, "w-24")}
                value={cons.valeur}
                onChange={(e) =>
                  onPatchValeur(c.id, cons.cible, Number(e.target.value) || 0)
                }
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const d = detail.decision;
  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-semibold uppercase text-slate-400">
        Décision · J{d.jour}
      </p>
      <label className="block text-xs font-medium text-slate-600">
        Titre
        <input
          className={cn(inputClass, "mt-1")}
          value={d.titre}
          onChange={(e) => onPatchTitre(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Dilemme (CŒUR)
        <textarea
          className={cn(textareaClass, "mt-1 min-h-[80px]")}
          value={d.dilemme}
          onChange={(e) => onPatchDilemme(e.target.value)}
        />
      </label>
      <ul className="space-y-1 text-xs text-slate-600">
        {d.choix.map((c) => (
          <li key={c.id} className="font-mono">
            → {shortChoixLabel(c.label)}
          </li>
        ))}
      </ul>
    </div>
  );
}
