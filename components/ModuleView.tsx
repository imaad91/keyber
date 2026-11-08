"use client";

type Row = { id: string; libelle: string; statut: string; valeur: string };

const EXAMPLE_ROWS: Row[] = [
  { id: "1", libelle: "Exemple A", statut: "En cours", valeur: "—" },
  { id: "2", libelle: "Exemple B", statut: "Planifié", valeur: "—" },
  { id: "3", libelle: "Exemple C", statut: "Terminé", valeur: "—" },
];

type ModuleViewProps = {
  title?: string;
};

export function ModuleView({ title = "Exemple Logistique" }: ModuleViewProps) {
  return (
    <section className="view-enter flex h-full flex-col gap-6">
      <header>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          Module
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Contenu générique — table d&apos;exemple.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Libellé</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Valeur</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLE_ROWS.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3 font-medium text-navy">{row.libelle}</td>
                <td className="px-4 py-3 text-slate-600">{row.statut}</td>
                <td className="px-4 py-3 text-slate-500">{row.valeur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
