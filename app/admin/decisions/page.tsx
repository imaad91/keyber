"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import {
  ADMIN_EVENT_TYPES,
  uid,
  type AdminChoice,
  type AdminDecision,
  type AdminEvent,
  type AdminEventType,
} from "@/lib/adminTypes";

type TimelineItem =
  | { kind: "decision"; data: AdminDecision }
  | { kind: "event"; data: AdminEvent };

export default function AdminDecisionsPage() {
  const {
    scenarios,
    decisions,
    events,
    createDecision,
    updateDecision,
    deleteDecision,
    createEvent,
    updateEvent,
    deleteEvent,
    reorderTimeline,
  } = useAdminStore();

  const [scenarioId, setScenarioId] = useState(
    scenarios[0]?.id ?? ""
  );
  const [editDecisionId, setEditDecisionId] = useState<string | null>(null);
  const [editEventId, setEditEventId] = useState<string | null>(null);

  const scenarioDecisions = useMemo(
    () =>
      decisions
        .filter((d) => d.scenarioId === scenarioId)
        .sort((a, b) => a.jour - b.jour || a.order - b.order),
    [decisions, scenarioId]
  );

  const scenarioEvents = useMemo(
    () =>
      events
        .filter((e) => e.scenarioId === scenarioId)
        .sort((a, b) => a.jour - b.jour || a.heure.localeCompare(b.heure) || a.order - b.order),
    [events, scenarioId]
  );

  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [
      ...scenarioDecisions.map((d) => ({ kind: "decision" as const, data: d })),
      ...scenarioEvents.map((e) => ({ kind: "event" as const, data: e })),
    ];
    return items.sort((a, b) => {
      const dj = a.data.jour - b.data.jour;
      if (dj !== 0) return dj;
      const ha = "heure" in a.data ? a.data.heure : "00:00";
      const hb = "heure" in b.data ? b.data.heure : "00:00";
      return ha.localeCompare(hb) || a.data.order - b.data.order;
    });
  }, [scenarioDecisions, scenarioEvents]);

  const days = useMemo(() => {
    const set = new Set(timeline.map((t) => t.data.jour));
    return Array.from(set).sort((a, b) => a - b);
  }, [timeline]);

  const editingDecision = decisions.find((d) => d.id === editDecisionId);
  const editingEvent = events.find((e) => e.id === editEventId);

  function moveSameKind(item: TimelineItem, dir: -1 | 1) {
    if (item.kind === "decision") {
      const list = [...scenarioDecisions];
      const idx = list.findIndex((d) => d.id === item.data.id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= list.length) return;
      const ids = list.map((d) => d.id);
      [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
      reorderTimeline(scenarioId, "decision", ids);
    } else {
      const list = [...scenarioEvents];
      const idx = list.findIndex((e) => e.id === item.data.id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= list.length) return;
      const ids = list.map((e) => e.id);
      [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
      reorderTimeline(scenarioId, "event", ids);
    }
  }

  return (
    <div>
      <PageHeader
        title="Décisions & événements"
        subtitle="Dilemmes, choix avec conséquences, et timeline jour par jour."
        actions={
          <>
            <AdminButton
              disabled={!scenarioId}
              onClick={() => {
                const id = createDecision(scenarioId);
                setEditDecisionId(id);
                setEditEventId(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Nouvelle décision
            </AdminButton>
            <AdminButton
              variant="secondary"
              disabled={!scenarioId}
              onClick={() => {
                const id = createEvent(scenarioId);
                setEditEventId(id);
                setEditDecisionId(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Nouvel événement
            </AdminButton>
          </>
        }
      />

      <Field label="Scénario" className="mb-6 max-w-md">
        <select
          className={selectClass}
          value={scenarioId}
          onChange={(e) => {
            setScenarioId(e.target.value);
            setEditDecisionId(null);
            setEditEventId(null);
          }}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titre}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Timeline visuelle
          </h2>
          {days.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun élément — créez une décision ou un événement.
            </p>
          ) : (
            <div className="space-y-6">
              {days.map((day) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Jour {day}
                  </p>
                  <ol className="relative space-y-2 border-l-2 border-slate-100 pl-4">
                    {timeline
                      .filter((t) => t.data.jour === day)
                      .map((item) => (
                        <li key={`${item.kind}-${item.data.id}`} className="relative">
                          <span
                            className={`absolute -left-[21px] top-2 h-2.5 w-2.5 rounded-full ${
                              item.kind === "decision"
                                ? "bg-slate-900"
                                : "bg-sky-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (item.kind === "decision") {
                                setEditDecisionId(item.data.id);
                                setEditEventId(null);
                              } else {
                                setEditEventId(item.data.id);
                                setEditDecisionId(null);
                              }
                            }}
                            className="w-full rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-left transition hover:border-slate-300 hover:bg-white"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  {item.kind === "decision"
                                    ? "Décision"
                                    : (item.data as AdminEvent).type}{" "}
                                  · {item.data.heure}
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                  {item.data.titre}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-0.5">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSameKind(item, -1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.stopPropagation();
                                      moveSameKind(item, -1);
                                    }
                                  }}
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSameKind(item, 1);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.stopPropagation();
                                      moveSameKind(item, 1);
                                    }
                                  }}
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                  </ol>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {!editingDecision && !editingEvent ? (
            <p className="text-sm text-slate-500">
              Sélectionnez un élément sur la timeline, ou créez-en un nouveau.
            </p>
          ) : null}

          {editingDecision ? (
            <DecisionEditor
              decision={editingDecision}
              onSave={(data) => {
                updateDecision(editingDecision.id, data);
              }}
              onDelete={() => {
                deleteDecision(editingDecision.id);
                setEditDecisionId(null);
              }}
            />
          ) : null}

          {editingEvent ? (
            <EventEditor
              event={editingEvent}
              onSave={(data) => {
                updateEvent(editingEvent.id, data);
              }}
              onDelete={() => {
                deleteEvent(editingEvent.id);
                setEditEventId(null);
              }}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function DecisionEditor({
  decision,
  onSave,
  onDelete,
}: {
  decision: AdminDecision;
  onSave: (data: Partial<AdminDecision>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useStateClone(decision);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Éditer la décision</h2>
        <AdminButton variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Supprimer
        </AdminButton>
      </div>
      <div className="space-y-3">
        <Field label="Titre">
          <input
            className={inputClass}
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jour">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.jour}
              onChange={(e) =>
                setForm({ ...form, jour: Number(e.target.value) || 1 })
              }
            />
          </Field>
          <Field label="Heure">
            <input
              className={inputClass}
              value={form.heure}
              onChange={(e) => setForm({ ...form, heure: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Dilemme">
          <textarea
            className={textareaClass}
            value={form.dilemme}
            onChange={(e) => setForm({ ...form, dilemme: e.target.value })}
          />
        </Field>

        {form.choix.map((c, i) => (
          <ChoiceEditor
            key={c.id}
            index={i}
            choice={c}
            onChange={(next) => {
              const choix = form.choix.map((x, j) => (j === i ? next : x));
              setForm({ ...form, choix });
            }}
          />
        ))}
        {form.choix.length < 3 ? (
          <AdminButton
            variant="secondary"
            onClick={() =>
              setForm({
                ...form,
                choix: [
                  ...form.choix,
                  {
                    id: uid("ch"),
                    texte: `Choix ${form.choix.length + 1}`,
                    consequences: [],
                  },
                ],
              })
            }
          >
            Ajouter un choix
          </AdminButton>
        ) : null}

        <AdminButton onClick={() => onSave(form)}>Enregistrer</AdminButton>
      </div>
    </div>
  );
}

function ChoiceEditor({
  index,
  choice,
  onChange,
}: {
  index: number;
  choice: AdminChoice;
  onChange: (c: AdminChoice) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <Field label={`Choix ${index + 1}`}>
        <input
          className={inputClass}
          value={choice.texte}
          onChange={(e) => onChange({ ...choice, texte: e.target.value })}
        />
      </Field>
      <p className="mb-1 mt-2 text-xs font-medium text-slate-500">
        Conséquences (ex. Trésorerie -5000, Moral -10, Confiance Marie +10)
      </p>
      {choice.consequences.map((cons, ki) => (
        <div key={ki} className="mb-1 flex gap-2">
          <input
            className={inputClass}
            placeholder="Métrique"
            value={cons.metric}
            onChange={(e) => {
              const consequences = choice.consequences.map((x, j) =>
                j === ki ? { ...x, metric: e.target.value } : x
              );
              onChange({ ...choice, consequences });
            }}
          />
          <input
            type="number"
            className={`${inputClass} w-28`}
            value={cons.delta}
            onChange={(e) => {
              const consequences = choice.consequences.map((x, j) =>
                j === ki
                  ? { ...x, delta: Number(e.target.value) || 0 }
                  : x
              );
              onChange({ ...choice, consequences });
            }}
          />
        </div>
      ))}
      <AdminButton
        variant="ghost"
        className="text-xs"
        onClick={() =>
          onChange({
            ...choice,
            consequences: [
              ...choice.consequences,
              { metric: "Trésorerie", delta: -5000 },
            ],
          })
        }
      >
        + conséquence
      </AdminButton>
    </div>
  );
}

function EventEditor({
  event,
  onSave,
  onDelete,
}: {
  event: AdminEvent;
  onSave: (data: Partial<AdminEvent>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useStateClone(event);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          Éditer l&apos;événement
        </h2>
        <AdminButton variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Supprimer
        </AdminButton>
      </div>
      <div className="space-y-3">
        <Field label="Titre">
          <input
            className={inputClass}
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jour">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.jour}
              onChange={(e) =>
                setForm({ ...form, jour: Number(e.target.value) || 1 })
              }
            />
          </Field>
          <Field label="Heure">
            <input
              className={inputClass}
              value={form.heure}
              onChange={(e) => setForm({ ...form, heure: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Type">
          <select
            className={selectClass}
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as AdminEventType })
            }
          >
            {ADMIN_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Texte narratif">
          <textarea
            className={textareaClass}
            value={form.texte}
            onChange={(e) => setForm({ ...form, texte: e.target.value })}
          />
        </Field>
        <AdminButton onClick={() => onSave(form)}>Enregistrer</AdminButton>
      </div>
    </div>
  );
}

/** Local draft synced when the selected entity id changes. */
function useStateClone<T extends { id: string }>(entity: T) {
  const [form, setForm] = useState(entity);
  useEffect(() => {
    setForm(entity);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching item
  }, [entity.id]);
  return [form, setForm] as const;
}
