/**
 * Keyber OS — Feeling ERP (tables vivantes, alertes, liens, export).
 * Générique : aucun nom d'entreprise.
 */

import type {
  ClientRow,
  CommandeRow,
  EmployeRow,
  FactureRow,
  FournisseurRow,
  MachineRow,
  MaintenanceRow,
  ProductionRow,
  StockRow,
  ErpModuleId,
} from "@/lib/computerTypes";
import type { OsComputerPack } from "@/lib/keyberOs/types";

export function stockStatutFromQty(
  qte: number,
  seuil: number
): StockRow["statut"] {
  if (qte <= 0 || qte < Math.max(1, seuil) * 0.25) return "Rupture";
  if (qte < seuil) return "Stock bas";
  return "OK";
}

/** Mappe les libellés libres (Lumière « À préparer », etc.) vers l'union typée. */
export function normalizeCommandeStatut(
  raw: string | undefined
): CommandeRow["statut"] {
  const s = (raw || "").toLowerCase();
  if (/livr|termin|done|complet|closed/.test(s)) return "Livrée";
  if (/annul|cancel/.test(s)) return "Annulée";
  if (/retard|urgent|critique|overdue|late/.test(s)) return "En retard";
  if (/pr[eé]par|cours|ouvert|pending|progress|planif|confirme/.test(s))
    return "En cours";
  return "En cours";
}

export function normalizeFactureStatut(
  raw: string | undefined
): FactureRow["statut"] {
  const s = (raw || "").toLowerCase();
  if (/pay[eé]|sold[eé]|r[eé]gl/.test(s)) return "Payée";
  if (/retard|overdue|impay/.test(s)) return "En retard";
  return "En attente";
}

export function normalizeProductionEtat(
  raw: string | undefined
): ProductionRow["etat"] {
  const s = (raw || "").toLowerCase();
  if (/panne|hs|fault|down|arr[eê]t.?urgence/.test(s)) return "En panne";
  if (/arr[eê]t|stop|idle|off|production/.test(s) && !/marche/.test(s)) {
    if (/panne|hs/.test(s)) return "En panne";
    if (/arr[eê]t|stop|idle|off/.test(s)) return "Arrêt";
  }
  if (/arr[eê]t|stop|idle|off/.test(s)) return "Arrêt";
  if (/panne|hs|fault|down/.test(s)) return "En panne";
  return "En marche";
}

export function normalizeMachineEtat(raw: string | undefined): string {
  const s = (raw || "").trim();
  if (!s) return "OK";
  if (/panne|hs|fault|down/i.test(s)) return "En panne";
  if (/arr[eê]t|stop|idle|off/i.test(s)) return "Arrêt";
  if (/prod|marche|run|ok/i.test(s)) return "En marche";
  return s;
}

export function normalizeStockRow(row: StockRow): StockRow {
  const qte = Number(row.qte) || 0;
  const seuil = Number(row.seuil) || 10;
  return {
    ...row,
    qte,
    seuil,
    statut: stockStatutFromQty(qte, seuil),
  };
}

export function normalizeCommandeRow(row: CommandeRow): CommandeRow {
  return {
    ...row,
    statut: normalizeCommandeStatut(String(row.statut)),
    qteCommandee: Number(row.qteCommandee) || 0,
    qteProduite: Number(row.qteProduite) || 0,
    montant: Number(row.montant) || 0,
  };
}

export function normalizeFactureRow(row: FactureRow): FactureRow {
  return {
    ...row,
    statut: normalizeFactureStatut(String(row.statut)),
    montant: Number(row.montant) || 0,
  };
}

export function normalizeProductionRow(row: ProductionRow): ProductionRow {
  return {
    ...row,
    etat: normalizeProductionEtat(String(row.etat)),
    objectifJour: Number(row.objectifJour) || 0,
    produitAujourdhui: Number(row.produitAujourdhui) || 0,
  };
}

export function normalizeMachineRow(row: MachineRow): MachineRow {
  return { ...row, etat: normalizeMachineEtat(row.etat) };
}

/** Remplace les tableaux vides par une synthèse minimale jouable. */
export function ensureErpTablesNonEmpty(
  pack: OsComputerPack,
  ctx: {
    entreprise: string;
    stockQty: number;
    production: number;
    commandes: number;
    tresorerieBrute: number;
  }
): OsComputerPack {
  const stock =
    pack.stock?.length > 0
      ? pack.stock.map(normalizeStockRow)
      : [
          normalizeStockRow({
            ref: "SKU-001",
            nom: "Article principal",
            qte: ctx.stockQty,
            seuil: Math.max(10, Math.floor(ctx.stockQty * 0.4)),
            emplacement: "A-01",
            fournisseur: "Fournisseur A",
            prixUnitaire: 12,
            derniereEntree: "J-2",
            statut: "OK",
          }),
        ];

  const commandes =
    pack.commandes?.length > 0
      ? pack.commandes.map(normalizeCommandeRow)
      : [
          normalizeCommandeRow({
            numero: "CMD-1001",
            client: "Client principal",
            piece: stock[0]!.nom,
            qteCommandee: Math.max(10, ctx.commandes * 5),
            qteProduite: Math.floor(ctx.production / 2),
            dateLimite: "J+3",
            statut: "En cours",
            montant: Math.round(ctx.tresorerieBrute * 0.1),
          }),
        ];

  const production =
    pack.production?.length > 0
      ? pack.production.map(normalizeProductionRow)
      : [
          normalizeProductionRow({
            ligne: "Ligne 1",
            piece: stock[0]!.nom,
            objectifJour: 100,
            produitAujourdhui: ctx.production,
            tauxRebut: "2%",
            vitesse: "nominale",
            etat: "En marche",
          }),
        ];

  const employes: EmployeRow[] =
    pack.employes?.length > 0
      ? pack.employes
      : [
          {
            nom: "Responsable ops",
            poste: "Opérateur",
            equipe: "Ops",
            anciennete: "3 ans",
            heuresSup: "4h",
            tauxAbsence: "2%",
            statut: "Présent",
          },
        ];

  const factures =
    pack.factures?.length > 0
      ? pack.factures.map(normalizeFactureRow)
      : [
          normalizeFactureRow({
            numero: "FAC-1001",
            client: commandes[0]!.client,
            montant: commandes[0]!.montant,
            emission: "J-5",
            echeance: "J+10",
            statut: "En attente",
          }),
        ];

  const machines =
    pack.machines?.length > 0
      ? pack.machines.map(normalizeMachineRow)
      : [
          normalizeMachineRow({
            nom: "Ligne 1",
            type: "Production",
            etat: "En marche",
            vitesse: "nominale",
            tauxRebut: "2%",
            derniereMaint: "J-14",
            prochaineMaint: "J+16",
          }),
        ];

  const clients: ClientRow[] =
    pack.clients?.length > 0
      ? pack.clients
      : [
          {
            nom: commandes[0]!.client,
            pctCa: "40%",
            derniereCommande: commandes[0]!.numero,
            relation: "Bon",
            contact: "commercial",
          },
        ];

  const fournisseurs: FournisseurRow[] =
    pack.fournisseurs?.length > 0
      ? pack.fournisseurs
      : [
          {
            nom: stock[0]!.fournisseur,
            piece: stock[0]!.nom,
            delai: "5 j",
            prix: "standard",
            fiabilite: "OK",
          },
        ];

  let maintenance: MaintenanceRow[] = pack.maintenance?.length
    ? pack.maintenance
    : [];
  if (!maintenance.length && machines.length) {
    maintenance = machines.slice(0, 2).map((m, i) => ({
      id: `maint-${i + 1}`,
      equipement: m.nom,
      type: i === 0 ? "Préventive" : "Corrective",
      echeance: m.prochaineMaint || "J+7",
      technicien: employes[0]?.nom || "Tech",
      statut: /panne/i.test(m.etat) ? ("En cours" as const) : ("Planifiée" as const),
      priorite: /panne/i.test(m.etat) ? ("Haute" as const) : ("Normale" as const),
    }));
  }

  const dashboardCards =
    pack.dashboardCards?.length > 0
      ? pack.dashboardCards
      : [
          {
            label: "Trésorerie brute",
            value: `${Math.round(ctx.tresorerieBrute).toLocaleString("fr-FR")} €`,
          },
          { label: "Stock", value: String(ctx.stockQty) },
          { label: "Production jour", value: String(ctx.production) },
          { label: "Commandes", value: String(commandes.length) },
          { label: "Ligne 1", value: production[0]?.etat || "—" },
        ];

  return {
    ...pack,
    stock,
    commandes,
    production,
    employes,
    factures,
    machines,
    clients,
    fournisseurs,
    maintenance,
    dashboardCards,
    dashboardSeries:
      pack.dashboardSeries?.length > 0
        ? pack.dashboardSeries
        : [
            { name: "J-2", prod: Math.max(10, ctx.production - 10), panne: 0 },
            { name: "J-1", prod: Math.max(10, ctx.production - 5), panne: 1 },
            { name: "J", prod: ctx.production, panne: 0 },
          ],
  };
}

/**
 * Aligne toutes les lignes ERP sur les scalars de session
 * (plus seulement la 1ʳᵉ ligne).
 */
export function syncErpTablesFromScalars(state: {
  tresorerieBrute: number;
  stock: number;
  production: number;
  commandes: number;
  computer: OsComputerPack;
}): OsComputerPack {
  const base = ensureErpTablesNonEmpty(state.computer, {
    entreprise: "Entreprise",
    stockQty: state.stock,
    production: state.production,
    commandes: state.commandes,
    tresorerieBrute: state.tresorerieBrute,
  });

  const weights = base.stock.map((r) => Math.max(1, r.qte || 1));
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  let stock = base.stock.map((r, i) => {
    const qte = Math.max(0, Math.round(state.stock * (weights[i]! / wSum)));
    return normalizeStockRow({ ...r, qte });
  });
  const stockSum = stock.reduce((s, r) => s + r.qte, 0);
  if (stock[0] && stockSum !== state.stock) {
    const qte = Math.max(0, stock[0].qte + (state.stock - stockSum));
    stock = [
      normalizeStockRow({ ...stock[0], qte }),
      ...stock.slice(1),
    ];
  }

  const objWeights = base.production.map((r) =>
    Math.max(1, r.objectifJour || 1)
  );
  const objSum = objWeights.reduce((a, b) => a + b, 0) || 1;
  let production = base.production.map((r, i) =>
    normalizeProductionRow({
      ...r,
      produitAujourdhui: Math.max(
        0,
        Math.round(state.production * (objWeights[i]! / objSum))
      ),
    })
  );
  const prodSum = production.reduce((s, r) => s + r.produitAujourdhui, 0);
  if (production[0] && prodSum !== state.production) {
    production = [
      normalizeProductionRow({
        ...production[0],
        produitAujourdhui: Math.max(
          0,
          production[0].produitAujourdhui + (state.production - prodSum)
        ),
      }),
      ...production.slice(1),
    ];
  }

  const fill = Math.min(1.2, state.production / Math.max(40, state.production || 40));
  const commandes = base.commandes.map((c) => {
    const row = normalizeCommandeRow(c);
    if (row.statut === "Livrée" || row.statut === "Annulée") return row;
    const target = Math.min(
      row.qteCommandee,
      Math.max(row.qteProduite, Math.floor(row.qteCommandee * fill * 0.85))
    );
    let statut: CommandeRow["statut"] = "En cours";
    if (target >= row.qteCommandee) statut = "Livrée";
    else if (row.statut === "En retard") statut = "En retard";
    return { ...row, qteProduite: target, statut };
  });

  const machines = base.machines.map((m) => {
    const linked = production.find(
      (p) =>
        p.ligne.toLowerCase() === m.nom.toLowerCase() ||
        m.nom.toLowerCase().includes(p.ligne.toLowerCase()) ||
        p.ligne.toLowerCase().includes(m.nom.toLowerCase())
    );
    if (!linked) return normalizeMachineRow(m);
    return normalizeMachineRow({
      ...m,
      etat:
        linked.etat === "En panne"
          ? "En panne"
          : linked.etat === "Arrêt"
            ? "Arrêt"
            : "En marche",
      vitesse: linked.vitesse || m.vitesse,
      tauxRebut: linked.tauxRebut || m.tauxRebut,
    });
  });

  const maintenance = (base.maintenance ?? []).map((m) => {
    const machine = machines.find((x) =>
      x.nom.toLowerCase().includes(m.equipement.toLowerCase()) ||
      m.equipement.toLowerCase().includes(x.nom.toLowerCase())
    );
    if (machine && /panne/i.test(machine.etat)) {
      return {
        ...m,
        statut: "En cours" as const,
        priorite:
          m.priorite === "Critique" ? m.priorite : ("Haute" as const),
      };
    }
    return m;
  });

  return {
    ...base,
    stock,
    production,
    commandes,
    machines,
    maintenance,
    dashboardCards: [
      {
        label: "Trésorerie brute",
        value: `${Math.round(state.tresorerieBrute).toLocaleString("fr-FR")} €`,
      },
      { label: "Stock", value: String(state.stock) },
      { label: "Production jour", value: String(state.production) },
      {
        label: "Commandes ouvertes",
        value: String(
          commandes.filter((c) => c.statut === "En cours" || c.statut === "En retard")
            .length
        ),
      },
      {
        label: "Alertes",
        value: String(
          collectErpAlerts({
            ...base,
            stock,
            production,
            commandes,
            machines,
            maintenance,
          }).length
        ),
      },
    ],
  };
}

export type ErpAlert = {
  id: string;
  severity: "critique" | "haute" | "info";
  module: ErpModuleId;
  label: string;
  /** Clé de ligne pour ouvrir la fiche */
  rowKey: string;
};

export function collectErpAlerts(pack: OsComputerPack): ErpAlert[] {
  const out: ErpAlert[] = [];
  for (const r of pack.stock) {
    if (r.statut === "Rupture") {
      out.push({
        id: `stock-rupture-${r.ref}`,
        severity: "critique",
        module: "stock",
        label: `Rupture ${r.ref} — ${r.nom}`,
        rowKey: r.ref,
      });
    } else if (r.statut === "Stock bas") {
      out.push({
        id: `stock-bas-${r.ref}`,
        severity: "haute",
        module: "stock",
        label: `Stock bas ${r.ref} (${r.qte}/${r.seuil})`,
        rowKey: r.ref,
      });
    }
  }
  for (const c of pack.commandes) {
    if (c.statut === "En retard") {
      out.push({
        id: `cmd-retard-${c.numero}`,
        severity: "critique",
        module: "commandes",
        label: `Commande ${c.numero} en retard — ${c.client}`,
        rowKey: c.numero,
      });
    }
  }
  for (const p of pack.production) {
    if (p.etat === "En panne") {
      out.push({
        id: `prod-panne-${p.ligne}`,
        severity: "critique",
        module: "production",
        label: `Ligne ${p.ligne} en panne`,
        rowKey: p.ligne,
      });
    }
  }
  for (const m of pack.machines) {
    if (/panne/i.test(m.etat)) {
      out.push({
        id: `mach-panne-${m.nom}`,
        severity: "haute",
        module: "machines",
        label: `Machine ${m.nom} — ${m.etat}`,
        rowKey: m.nom,
      });
    }
  }
  for (const f of pack.factures) {
    if (f.statut === "En retard") {
      out.push({
        id: `fac-retard-${f.numero}`,
        severity: "haute",
        module: "factures",
        label: `Facture ${f.numero} en retard`,
        rowKey: f.numero,
      });
    }
  }
  for (const m of pack.maintenance ?? []) {
    if (m.statut === "En retard" || m.priorite === "Critique") {
      out.push({
        id: `maint-${m.id}`,
        severity: m.priorite === "Critique" ? "critique" : "haute",
        module: "maintenance",
        label: `Maintenance ${m.equipement} — ${m.statut}`,
        rowKey: m.id,
      });
    }
  }
  return out;
}

export type ErpLink = {
  module: ErpModuleId;
  rowKey: string;
  label: string;
};

/** Liens croisés par homonymie (V1 — pas de FK formelles). */
export function erpCrossLinks(
  pack: OsComputerPack,
  module: ErpModuleId,
  row: Record<string, string | number>
): ErpLink[] {
  const links: ErpLink[] = [];
  const blob = Object.values(row).map((v) => String(v).toLowerCase()).join(" ");

  const push = (m: ErpModuleId, key: string, label: string) => {
    if (links.some((l) => l.module === m && l.rowKey === key)) return;
    if (m === module && String(row[Object.keys(row)[0]!] ?? "") === key) return;
    links.push({ module: m, rowKey: key, label });
  };

  for (const s of pack.stock) {
    if (
      blob.includes(s.ref.toLowerCase()) ||
      blob.includes(s.nom.toLowerCase())
    ) {
      push("stock", s.ref, `Stock ${s.ref}`);
    }
  }
  for (const c of pack.commandes) {
    if (
      blob.includes(c.numero.toLowerCase()) ||
      blob.includes(c.client.toLowerCase()) ||
      blob.includes(c.piece.toLowerCase())
    ) {
      push("commandes", c.numero, `Commande ${c.numero}`);
    }
  }
  for (const p of pack.production) {
    if (
      blob.includes(p.ligne.toLowerCase()) ||
      blob.includes(p.piece.toLowerCase())
    ) {
      push("production", p.ligne, `OF ${p.ligne}`);
    }
  }
  for (const m of pack.machines) {
    if (blob.includes(m.nom.toLowerCase())) {
      push("machines", m.nom, `Machine ${m.nom}`);
    }
  }
  for (const c of pack.clients) {
    if (blob.includes(c.nom.toLowerCase())) {
      push("clients", c.nom, `Client ${c.nom}`);
    }
  }
  for (const f of pack.fournisseurs) {
    if (
      blob.includes(f.nom.toLowerCase()) ||
      blob.includes(f.piece.toLowerCase())
    ) {
      push("fournisseurs", f.nom, `Fournisseur ${f.nom}`);
    }
  }
  for (const m of pack.maintenance ?? []) {
    if (
      blob.includes(m.equipement.toLowerCase()) ||
      blob.includes(m.id.toLowerCase())
    ) {
      push("maintenance", m.id, `Maint. ${m.equipement}`);
    }
  }
  for (const f of pack.factures) {
    if (
      blob.includes(f.numero.toLowerCase()) ||
      blob.includes(f.client.toLowerCase())
    ) {
      push("factures", f.numero, `Facture ${f.numero}`);
    }
  }

  return links.slice(0, 8);
}

export function erpRowsAsRecords(
  pack: OsComputerPack,
  module: ErpModuleId
): { key: string; label: string; cells: (string | number)[]; record: Record<string, string | number>; statut?: string }[] {
  if (module === "stock") {
    return pack.stock.map((r) => ({
      key: r.ref,
      label: `${r.ref} — ${r.nom}`,
      statut: r.statut,
      record: { ...r },
      cells: [
        r.ref,
        r.nom,
        r.qte,
        r.seuil,
        r.emplacement,
        r.fournisseur,
        r.prixUnitaire,
        r.derniereEntree,
        r.statut,
      ],
    }));
  }
  if (module === "commandes") {
    return pack.commandes.map((r) => ({
      key: r.numero,
      label: `${r.numero} — ${r.client}`,
      statut: r.statut,
      record: { ...r },
      cells: [
        r.numero,
        r.client,
        r.piece,
        r.qteCommandee,
        r.qteProduite,
        r.dateLimite,
        r.statut,
        r.montant,
      ],
    }));
  }
  if (module === "production") {
    return pack.production.map((r) => ({
      key: r.ligne,
      label: `${r.ligne} — ${r.piece}`,
      statut: r.etat,
      record: { ...r },
      cells: [
        r.ligne,
        r.piece,
        r.objectifJour,
        r.produitAujourdhui,
        r.tauxRebut,
        r.vitesse,
        r.etat,
      ],
    }));
  }
  if (module === "employes") {
    return pack.employes.map((r) => ({
      key: r.nom,
      label: r.nom,
      statut: r.statut,
      record: { ...r },
      cells: [
        r.nom,
        r.poste,
        r.equipe,
        r.anciennete,
        r.heuresSup,
        r.tauxAbsence,
        r.statut,
      ],
    }));
  }
  if (module === "factures") {
    return pack.factures.map((r) => ({
      key: r.numero,
      label: `${r.numero} — ${r.client}`,
      statut: r.statut,
      record: { ...r },
      cells: [r.numero, r.client, r.montant, r.emission, r.echeance, r.statut],
    }));
  }
  if (module === "machines") {
    return pack.machines.map((r) => ({
      key: r.nom,
      label: r.nom,
      statut: r.etat,
      record: { ...r },
      cells: [
        r.nom,
        r.type,
        r.etat,
        r.vitesse,
        r.tauxRebut,
        r.derniereMaint,
        r.prochaineMaint,
      ],
    }));
  }
  if (module === "clients") {
    return pack.clients.map((r) => ({
      key: r.nom,
      label: r.nom,
      statut: r.relation,
      record: { ...r },
      cells: [r.nom, r.pctCa, r.derniereCommande, r.relation, r.contact],
    }));
  }
  if (module === "fournisseurs") {
    return pack.fournisseurs.map((r) => ({
      key: r.nom,
      label: r.nom,
      record: { ...r },
      cells: [r.nom, r.piece, r.delai, r.prix, r.fiabilite],
    }));
  }
  if (module === "maintenance") {
    return (pack.maintenance ?? []).map((r) => ({
      key: r.id,
      label: `${r.equipement} — ${r.type}`,
      statut: r.statut,
      record: { ...r },
      cells: [
        r.equipement,
        r.type,
        r.echeance,
        r.technicien,
        r.statut,
        r.priorite,
      ],
    }));
  }
  return [];
}

export const ERP_MODULE_HEADERS: Record<Exclude<ErpModuleId, "dashboard">, string[]> = {
  stock: [
    "Référence",
    "Nom pièce",
    "Quantité",
    "Seuil d'alerte",
    "Emplacement",
    "Fournisseur",
    "Prix unitaire €",
    "Dernière entrée",
    "Statut",
  ],
  commandes: [
    "N° commande",
    "Client",
    "Pièce",
    "Qté commandée",
    "Qté produite",
    "Date limite",
    "Statut",
    "Montant €",
  ],
  production: [
    "Ligne/Machine",
    "Pièce en cours",
    "Objectif jour",
    "Produit aujourd'hui",
    "Taux rebut %",
    "Vitesse",
    "État",
  ],
  employes: [
    "Nom",
    "Poste",
    "Équipe",
    "Ancienneté",
    "Heures sup semaine",
    "Taux absence",
    "Statut",
  ],
  factures: [
    "N° facture",
    "Client",
    "Montant €",
    "Date émission",
    "Date échéance",
    "Statut",
  ],
  machines: [
    "Nom",
    "Type",
    "État",
    "Vitesse actuelle",
    "Taux rebut %",
    "Dernière maintenance",
    "Prochaine maintenance",
  ],
  clients: [
    "Nom",
    "% du CA",
    "Dernière commande",
    "Statut relation",
    "Contact",
  ],
  fournisseurs: ["Nom", "Pièce fournie", "Délai livraison", "Prix", "Fiabilité"],
  maintenance: [
    "Équipement",
    "Type",
    "Échéance",
    "Technicien",
    "Statut",
    "Priorité",
  ],
};

export function exportErpModuleCsv(
  pack: OsComputerPack,
  module: Exclude<ErpModuleId, "dashboard">
): string {
  const headers = ERP_MODULE_HEADERS[module];
  const rows = erpRowsAsRecords(pack, module);
  const esc = (v: string | number) => {
    const s = String(v);
    if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    headers.join(";"),
    ...rows.map((r) => r.cells.map(esc).join(";")),
  ].join("\n");
}

export function downloadErpCsv(
  pack: OsComputerPack,
  module: Exclude<ErpModuleId, "dashboard">
) {
  if (typeof window === "undefined") return;
  const csv = exportErpModuleCsv(pack, module);
  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `keyber-erp-${module}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
