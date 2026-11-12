"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
  AVATAR_STYLES,
  uid,
  type AdminDialogue,
  type AdminPersonnage,
} from "@/lib/adminTypes";

export default function AdminPersonnageEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { personnages, entreprises, scenarios, updatePersonnage } =
    useAdminStore();
  const existing = personnages.find((p) => p.id === id);
  const [form, setForm] = useState<AdminPersonnage | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        ...existing,
        scenarioIds: [...existing.scenarioIds],
        dialogues: existing.dialogues.map((d) => ({
          ...d,
          choices: d.choices.map((c) => ({
            ...c,
            consequences: c.consequences.map((x) => ({ ...x })),
          })),
        })),
      });
    }
  }, [existing]);

  if (!existing || !form) {
    return (
      <div>
        <p className="text-sm text-slate-500">Personnage introuvable.</p>
        <Link href="/admin/personnages" className="text-sm underline">
          Retour
        </Link>
      </div>
    );
  }

  function updateDialogue(di: number, patch: Partial<AdminDialogue>) {
    setForm((f) => {
      if (!f) return f;
      const dialogues = f.dialogues.map((d, i) =>
        i === di ? { ...d, ...patch } : d
      );
      return { ...f, dialogues };
    });
  }

  return (
    <div>
      <Link
        href="/admin/personnages"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Personnages
      </Link>
      <PageHeader
        title={`${form.prenom} ${form.nom}`.trim() || "Personnage"}
        subtitle="Fiche + dialogues avec conséquences de confiance / moral / etc."
        actions={
          <AdminButton
            onClick={() => {
              updatePersonnage(form.id, form);
              router.push("/admin/personnages");
            }}
          >
            Enregistrer
          </AdminButton>
        }
      />

      <div className="space-y-5">
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-2">
          <Field label="Prénom">
            <input
              className={inputClass}
              value={form.prenom}
              onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            />
          </Field>
          <Field label="Nom">
            <input
              className={inputClass}
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </Field>
          <Field label="Âge">
            <input
              type="number"
              className={inputClass}
              value={form.age}
              onChange={(e) =>
                setForm({ ...form, age: Number(e.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Poste">
            <input
              className={inputClass}
              value={form.poste}
              onChange={(e) => setForm({ ...form, poste: e.target.value })}
            />
          </Field>
          <Field label="Entreprise liée">
            <select
              className={selectClass}
              value={form.entrepriseId ?? ""}
              onChange={(e) =>
                setForm({ ...form, entrepriseId: e.target.value || null })
              }
            >
              <option value="">— Aucune —</option>
              {entreprises.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Avatar flat illustration">
            <select
              className={selectClass}
              value={form.avatarStyle}
              onChange={(e) =>
                setForm({ ...form, avatarStyle: e.target.value })
              }
            >
              {AVATAR_STYLES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Confiance de départ (0–100)"
            hint="Méfiant < 40 · Neutre 40–70 · Allié > 70"
          >
            <input
              type="range"
              min={0}
              max={100}
              value={form.confianceDepart}
              onChange={(e) =>
                setForm({
                  ...form,
                  confianceDepart: Number(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="mt-1 text-sm tabular-nums text-slate-600">
              {form.confianceDepart}
            </p>
          </Field>
          <Field label="Caractère en 1 phrase">
            <input
              className={inputClass}
              value={form.caractere}
              onChange={(e) => setForm({ ...form, caractere: e.target.value })}
            />
          </Field>
          <Field label="Description" className="lg:col-span-2">
            <textarea
              className={textareaClass}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <Field label="Scénarios liés" className="lg:col-span-2">
            <div className="flex flex-col gap-2">
              {scenarios.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={form.scenarioIds.includes(s.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.scenarioIds, s.id]
                        : form.scenarioIds.filter((x) => x !== s.id);
                      setForm({ ...form, scenarioIds: next });
                    }}
                  />
                  {s.titre}
                </label>
              ))}
            </div>
          </Field>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Dialogues</h2>
            <AdminButton
              variant="secondary"
              onClick={() =>
                setForm({
                  ...form,
                  dialogues: [
                    ...form.dialogues,
                    {
                      id: uid("dlg"),
                      question: "Nouvelle question",
                      choices: [
                        {
                          id: uid("ch"),
                          texte: "Je te fais confiance",
                          reponse: "",
                          consequences: [
                            {
                              metric: `Confiance ${form.prenom || "PNJ"}`,
                              delta: 10,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                })
              }
            >
              <Plus className="h-4 w-4" />
              Ajouter un dialogue
            </AdminButton>
          </div>

          <div className="space-y-6">
            {form.dialogues.map((d, di) => (
              <div
                key={d.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <Field label="Question" className="flex-1">
                    <input
                      className={inputClass}
                      value={d.question}
                      onChange={(e) =>
                        updateDialogue(di, { question: e.target.value })
                      }
                    />
                  </Field>
                  <AdminButton
                    variant="ghost"
                    className="mt-6"
                    onClick={() =>
                      setForm({
                        ...form,
                        dialogues: form.dialogues.filter((_, i) => i !== di),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>

                <div className="space-y-3">
                  {d.choices.map((c, ci) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <Field label={`Choix ${ci + 1}`}>
                        <input
                          className={inputClass}
                          value={c.texte}
                          onChange={(e) => {
                            const choices = d.choices.map((x, j) =>
                              j === ci ? { ...x, texte: e.target.value } : x
                            );
                            updateDialogue(di, { choices });
                          }}
                        />
                      </Field>
                      <Field label="Réponse du personnage" className="mt-2">
                        <textarea
                          className={textareaClass}
                          value={c.reponse}
                          onChange={(e) => {
                            const choices = d.choices.map((x, j) =>
                              j === ci ? { ...x, reponse: e.target.value } : x
                            );
                            updateDialogue(di, { choices });
                          }}
                        />
                      </Field>
                      <div className="mt-2">
                        <p className="mb-1 text-xs font-medium text-slate-500">
                          Conséquences (ex. Confiance Marie +10, Moral +5)
                        </p>
                        {c.consequences.map((cons, ki) => (
                          <div key={ki} className="mb-1 flex gap-2">
                            <input
                              className={inputClass}
                              placeholder="Métrique"
                              value={cons.metric}
                              onChange={(e) => {
                                const consequences = c.consequences.map(
                                  (x, j) =>
                                    j === ki
                                      ? { ...x, metric: e.target.value }
                                      : x
                                );
                                const choices = d.choices.map((x, j) =>
                                  j === ci ? { ...x, consequences } : x
                                );
                                updateDialogue(di, { choices });
                              }}
                            />
                            <input
                              type="number"
                              className={`${inputClass} w-28`}
                              value={cons.delta}
                              onChange={(e) => {
                                const consequences = c.consequences.map(
                                  (x, j) =>
                                    j === ki
                                      ? {
                                          ...x,
                                          delta: Number(e.target.value) || 0,
                                        }
                                      : x
                                );
                                const choices = d.choices.map((x, j) =>
                                  j === ci ? { ...x, consequences } : x
                                );
                                updateDialogue(di, { choices });
                              }}
                            />
                          </div>
                        ))}
                        <AdminButton
                          variant="ghost"
                          className="mt-1 text-xs"
                          onClick={() => {
                            const consequences = [
                              ...c.consequences,
                              { metric: "Moral", delta: 5 },
                            ];
                            const choices = d.choices.map((x, j) =>
                              j === ci ? { ...x, consequences } : x
                            );
                            updateDialogue(di, { choices });
                          }}
                        >
                          + conséquence
                        </AdminButton>
                      </div>
                    </div>
                  ))}
                  {d.choices.length < 3 ? (
                    <AdminButton
                      variant="secondary"
                      onClick={() => {
                        const choices = [
                          ...d.choices,
                          {
                            id: uid("ch"),
                            texte: `Choix ${d.choices.length + 1}`,
                            reponse: "",
                            consequences: [],
                          },
                        ];
                        updateDialogue(di, { choices });
                      }}
                    >
                      Ajouter un choix
                    </AdminButton>
                  ) : null}
                </div>
              </div>
            ))}
            {form.dialogues.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucun dialogue pour l&apos;instant.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
