/**
 * Construit le pack Ordinateur depuis le fichier de paramétrage (générique).
 * Si le param contient un bloc Ordinateur, il est utilisé ; sinon synthèse depuis Contexte / Events.
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import type {
  OsComputerPack,
  OsEmail,
  OsInterview,
  OsObjective,
} from "@/lib/keyberOs/types";

type ParamOrdinateur = {
  stock?: OsComputerPack["stock"];
  commandes?: OsComputerPack["commandes"];
  production?: OsComputerPack["production"];
  employes?: OsComputerPack["employes"];
  factures?: OsComputerPack["factures"];
  machines?: OsComputerPack["machines"];
  clients?: OsComputerPack["clients"];
  fournisseurs?: OsComputerPack["fournisseurs"];
  emails?: OsEmail[];
  chatContacts?: OsComputerPack["chatContacts"];
  chatThreads?: OsComputerPack["chatThreads"];
  documents?: OsComputerPack["documents"];
  browser?: OsComputerPack["browser"];
  dashboardCards?: OsComputerPack["dashboardCards"];
  interviews?: OsInterview[];
  objectifs?: OsObjective[];
};

function asOrdinateur(param: ScenarioParamFile): ParamOrdinateur | null {
  const raw = (param as ScenarioParamFile & { Ordinateur?: ParamOrdinateur })
    .Ordinateur;
  return raw && typeof raw === "object" ? raw : null;
}

function parseNumber(raw: string | undefined, fallback: number) {
  if (!raw) return fallback;
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function buildComputerPackFromParam(
  param: ScenarioParamFile,
  tresorerieBrute: number,
  stockQty: number,
  production: number,
  commandes: number
): {
  computer: OsComputerPack;
  interviews: OsInterview[];
  objectives: OsObjective[];
} {
  const o = asOrdinateur(param);
  const entreprise = param.Entreprise || "Entreprise";
  const events = param["Événements entreprise"] || [];

  const stock =
    o?.stock ??
    [
      {
        ref: "SKU-001",
        nom: "Article principal",
        qte: stockQty,
        seuil: Math.max(10, Math.floor(stockQty * 0.4)),
        emplacement: "A-01",
        fournisseur: "Fournisseur A",
        prixUnitaire: 12,
        derniereEntree: "J-2",
        statut:
          stockQty < 40 ? "Rupture" : stockQty < 80 ? "Stock bas" : ("OK" as const),
      },
    ];

  const commandesRows =
    o?.commandes ??
    [
      {
        numero: "CMD-1001",
        client: "Client principal",
        piece: "Article principal",
        qteCommandee: Math.max(10, commandes * 5),
        qteProduite: Math.floor(production / 2),
        dateLimite: "J+3",
        statut: "En cours" as const,
        montant: tresorerieBrute * 0.1,
      },
    ];

  const productionRows =
    o?.production ??
    [
      {
        ligne: "Ligne 1",
        piece: "Article principal",
        objectifJour: 100,
        produitAujourdhui: production,
        tauxRebut: "2%",
        vitesse: "nominale",
        etat: "En marche" as const,
      },
    ];

  const employes =
    o?.employes ??
    [
      {
        nom: "Responsable ops",
        poste: param.Rôle || "Opérateur",
        equipe: "Ops",
        anciennete: "3 ans",
        heuresSup: "4h",
        tauxAbsence: "2%",
        statut: "Présent" as const,
      },
      {
        nom: "Équipier",
        poste: "Préparateur",
        equipe: "Ops",
        anciennete: "1 an",
        heuresSup: "2h",
        tauxAbsence: "5%",
        statut: "Présent" as const,
      },
    ];

  let fournisseurs =
    o?.fournisseurs ??
    events
      .filter((e) => /fournisseur/i.test(e.type) || /fournisseur/i.test(e.nom))
      .slice(0, 3)
      .map((e, i) => ({
        nom: e.nom,
        piece: "Article",
        delai: `${3 + i} j`,
        prix: "standard",
        fiabilite: e.type,
      }));

  if (!fournisseurs.length) {
    fournisseurs = [
      {
        nom: "Fournisseur A",
        piece: "Article principal",
        delai: "5 j",
        prix: "standard",
        fiabilite: "OK",
      },
    ];
  }

  const clients =
    o?.clients ??
    [
      {
        nom: "Client principal",
        pctCa: "40%",
        derniereCommande: "J-1",
        relation: "Bon" as const,
        contact: "achats@client.test",
      },
    ];

  const emails: OsEmail[] =
    o?.emails ??
    [
      {
        id: "mail-1",
        from: "Direction",
        subject: `Priorités — ${entreprise}`,
        body: `Bonjour,\n\nMerci de suivre les stocks et les commandes aujourd'hui.\nRelis aussi les événements entreprise dans le paramétrage.\n\n— Direction`,
        day: 1,
        read: false,
      },
      {
        id: "mail-2",
        from: clients[0]?.nom || "Client",
        subject: "Suivi commande CMD-1001",
        body: "Pouvez-vous confirmer le délai de livraison ?",
        day: 1,
        read: false,
      },
      ...events.slice(0, 2).map((e, i) => ({
        id: `mail-ev-${i}`,
        from: "Alerte ops",
        subject: e.nom,
        body: e.description || e.type,
        day: 1,
        read: false,
      })),
    ];

  const chatContacts =
    o?.chatContacts ??
    [
      { id: "c1", name: employes[0]!.nom, role: employes[0]!.poste },
      { id: "c2", name: employes[1]?.nom || "Collègue", role: "Équipe" },
    ];

  const chatThreads =
    o?.chatThreads ??
    [
      {
        contactId: "c1",
        messages: [
          {
            from: "them" as const,
            text: "Tu as vu le stock ce matin ?",
          },
          {
            from: "me" as const,
            text: "Je regarde l'ERP.",
          },
        ],
      },
    ];

  const documents =
    o?.documents ??
    [
      {
        id: "doc-1",
        titre: "Procédure réception",
        type: "Procédure",
        contenu: `Procédure générique pour ${entreprise}. Contrôle à réception, mise en stock, alerte seuil.`,
      },
      {
        id: "doc-2",
        titre: "Contexte entreprise",
        type: "Note",
        contenu: Object.entries(param.Contexte)
          .slice(0, 8)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n"),
      },
    ];

  const browser =
    o?.browser ??
    [
      {
        id: "b1",
        title: "Veille sectorielle",
        url: "https://example.test/veille",
        snippet: `Infos générales — secteur ${param.Secteur || "—"}.`,
        body: "Résultats génériques (aucune entreprise hardcodée dans l'OS).",
        tags: ["veille"],
      },
    ];

  const dashboardCards =
    o?.dashboardCards ??
    [
      {
        label: "Trésorerie brute",
        value: `${Math.round(tresorerieBrute).toLocaleString("fr-FR")} €`,
      },
      { label: "Stock", value: String(stockQty) },
      { label: "Production jour", value: String(production) },
      { label: "Commandes", value: String(commandes) },
    ];

  const interviews: OsInterview[] =
    o?.interviews ??
    [
      {
        id: "iv-1",
        nom: chatContacts[0]!.name,
        role: chatContacts[0]!.role,
        lines: [
          {
            q: "Comment va le stock ?",
            a: `On est autour de ${stockQty} unités. Surveille les seuils.`,
          },
          {
            q: "Un risque aujourd'hui ?",
            a:
              events[0]?.description ||
              "Rien de critique, mais reste sur l'ERP et les mails.",
          },
        ],
      },
      {
        id: "iv-2",
        nom: chatContacts[1]?.name || "Collègue",
        role: "Terrain",
        lines: [
          {
            q: "Tu as besoin de quelque chose ?",
            a: "Une décision claire sur le réappro suffirait.",
          },
        ],
      },
    ];

  const objectives: OsObjective[] =
    o?.objectifs ??
    [
      {
        id: "obj-1",
        titre: "Stabiliser le stock",
        type: "JOURNALIER",
        status: "EN_COURS",
        cible: `Stock ≥ ${Math.max(80, stockQty)}`,
      },
      {
        id: "obj-2",
        titre: "Traiter la décision du scénario",
        type: "JOURNALIER",
        status: "EN_COURS",
        cible: "1 décision minimale",
      },
    ];

  const machines =
    o?.machines ??
    [
      {
        nom: "Poste principal",
        type: "Ops",
        etat: "PRODUCTION",
        vitesse: "nominale",
        tauxRebut: "2%",
        derniereMaint: "J-10",
        prochaineMaint: "J+20",
      },
    ];

  const factures =
    o?.factures ??
    [
      {
        numero: "FAC-2001",
        client: clients[0]!.nom,
        montant: Math.round(tresorerieBrute * 0.05),
        emission: "J-5",
        echeance: "J+10",
        statut: "En attente" as const,
      },
    ];

  return {
    computer: {
      stock,
      commandes: commandesRows,
      production: productionRows,
      employes,
      factures,
      machines,
      clients,
      fournisseurs,
      emails,
      chatContacts,
      chatThreads,
      documents,
      browser,
      dashboardCards,
    },
    interviews,
    objectives,
  };
}

export function syncDashboardCards(state: {
  tresorerieBrute: number;
  stock: number;
  production: number;
  commandes: number;
  computer: OsComputerPack;
}): OsComputerPack {
  return {
    ...state.computer,
    dashboardCards: [
      {
        label: "Trésorerie brute",
        value: `${Math.round(state.tresorerieBrute).toLocaleString("fr-FR")} €`,
      },
      { label: "Stock", value: String(state.stock) },
      { label: "Production jour", value: String(state.production) },
      { label: "Commandes", value: String(state.commandes) },
      {
        label: "Ligne 1",
        value: state.computer.production[0]?.etat || "—",
      },
    ],
    stock: state.computer.stock.map((row, i) =>
      i === 0
        ? {
            ...row,
            qte: state.stock,
            statut:
              state.stock < 40
                ? "Rupture"
                : state.stock < 80
                  ? "Stock bas"
                  : "OK",
          }
        : row
    ),
    production: state.computer.production.map((row, i) =>
      i === 0 ? { ...row, produitAujourdhui: state.production } : row
    ),
  };
}

void parseNumber;
