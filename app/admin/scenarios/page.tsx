"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Search,
} from "lucide-react";
import {
  AdminButton,
  Field,
  PageHeader,
  StatusBadge,
  inputClass,
  selectClass,
} from "@/components/admin/AdminPrimitives";
import { useAdminStore } from "@/lib/adminStore";
import {
  ADMIN_NIVEAUX,
  ADMIN_SECTEURS,
  ADMIN_STATUTS,
  niveauLabel,
  type AdminNiveau,
  type AdminScenarioStatus,
} from "@/lib/adminTypes";

export default function AdminScenariosPage() {
  const router = useRouter();
  const {
    scenarios,
    createScenario,
    duplicateScenario,
    archiveScenario,
    publishScenario,
    reorderScenarios,
  } = useAdminStore();

  const [q, setQ] = useState("");
  const [secteur, setSecteur] = useState("");
  const [competence, setCompetence] = useState("");
  const [statut, setStatut] = useState("");
  const [niveau, setNiveau] = useState("");

  const competences = useMemo(
    () =>
      Array.from(
        new Set(scenarios.map((s) => s.competence).filter(Boolean))
      ).sort(),
    [scenarios]
  );

  const filtered = useMemo(() => {
    return [...scenarios]
      .filter((s) => {
        if (q && !s.titre.toLowerCase().includes(q.toLowerCase())) return false;
        if (secteur && s.secteur !== secteur) return false;
        if (competence && s.competence !== competence) return false;
        if (statut && s.statut !== statut) return false;
        if (niveau && s.niveau !== niveau) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [scenarios, q, secteur, competence, statut, niveau]);

  function move(id: string, dir: -1 | 1) {
    const ordered = [...scenarios].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((s) => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const ids = ordered.map((s) => s.id);
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    reorderScenarios(ids);
  }

  return (
    <div>
      <PageHeader
        title="Scénarios"
        subtitle="Créer, ranger et publier les scénarios de la bibliothèque joueur."
        actions={
          <AdminButton
            onClick={() => {
              const id = createScenario();
              router.push(`/admin/scenarios/${id}`);
            }}
          >
            <Plus className="h-4 w-4" />
            Nouveau Scénario
          </AdminButton>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Recherche">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Nom du scénario…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </Field>
        <Field label="Secteur">
          <select
            className={selectClass}
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
          >
            <option value="">Tous</option>
            {ADMIN_SECTEURS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Compétence">
          <select
            className={selectClass}
            value={competence}
            onChange={(e) => setCompetence(e.target.value)}
          >
            <option value="">Toutes</option>
            {competences.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Statut">
          <select
            className={selectClass}
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
          >
            <option value="">Tous</option>
            {ADMIN_STATUTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Niveau">
          <select
            className={selectClass}
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
          >
            <option value="">Tous</option>
            {ADMIN_NIVEAUX.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <p className="mb-2 text-xs text-slate-500">
        L&apos;ordre ci-dessous définit l&apos;affichage dans la bibliothèque
        joueur. Utilisez les flèches pour réordonner.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Ordre</th>
              <th className="px-3 py-3 font-medium">Titre</th>
              <th className="px-3 py-3 font-medium">Secteur</th>
              <th className="px-3 py-3 font-medium">Statut</th>
              <th className="px-3 py-3 font-medium">Niveau</th>
              <th className="px-3 py-3 font-medium">Durée</th>
              <th className="px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-6 tabular-nums text-slate-500">
                      {s.order}
                    </span>
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => move(s.id, -1)}
                      aria-label="Monter"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => move(s.id, 1)}
                      aria-label="Descendre"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Link
                    href={`/admin/scenarios/${s.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {s.titre}
                  </Link>
                  <p className="text-xs text-slate-400">
                    {s.competence || "Sans compétence"}
                  </p>
                </td>
                <td className="px-3 py-3 text-slate-600">{s.secteur}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={s.statut as AdminScenarioStatus} />
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {niveauLabel(s.niveau as AdminNiveau)}
                </td>
                <td className="px-3 py-3 tabular-nums text-slate-600">
                  {s.dureeJours} j
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <AdminButton
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                      onClick={() => {
                        const id = duplicateScenario(s.id);
                        if (id) router.push(`/admin/scenarios/${id}`);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Dupliquer
                    </AdminButton>
                    {s.statut !== "publie" ? (
                      <AdminButton
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        onClick={() => publishScenario(s.id)}
                      >
                        Publier
                      </AdminButton>
                    ) : null}
                    {s.statut !== "archive" ? (
                      <AdminButton
                        variant="ghost"
                        className="px-2 py-1 text-xs"
                        onClick={() => archiveScenario(s.id)}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archiver
                      </AdminButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  Aucun scénario ne correspond aux filtres.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
