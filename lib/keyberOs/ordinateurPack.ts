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
  OsSensor,
} from "@/lib/keyberOs/types";
import {
  readParamInterviews,
  readParamObjectifs,
} from "@/lib/scenarioParamSchema";
import { osDefaultSensors } from "@/lib/keyberOs/visibilite";

type ParamOrdinateur = {
  stock?: OsComputerPack["stock"];
  commandes?: OsComputerPack["commandes"];
  production?: OsComputerPack["production"];
  employes?: OsComputerPack["employes"];
  factures?: OsComputerPack["factures"];
  machines?: OsComputerPack["machines"];
  clients?: OsComputerPack["clients"];
  fournisseurs?: OsComputerPack["fournisseurs"];
  maintenance?: OsComputerPack["maintenance"];
  emails?: OsEmail[];
  chatContacts?: OsComputerPack["chatContacts"];
  chatThreads?: OsComputerPack["chatThreads"];
  documents?: OsComputerPack["documents"];
  browser?: OsComputerPack["browser"];
  dashboardCards?: OsComputerPack["dashboardCards"];
  dashboardSeries?: OsComputerPack["dashboardSeries"];
  interviews?: OsInterview[];
  objectifs?: OsObjective[];
  sensors?: OsSensor[];
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
  sensors: OsSensor[];
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
        preview: "Suivre stocks et commandes aujourd'hui…",
        body: `Bonjour,\n\nMerci de suivre les stocks et les commandes aujourd'hui.\nRelis aussi les événements entreprise dans le paramétrage.\n\n— Direction`,
        day: 1,
        time: "08:12",
        read: false,
        urgent: true,
      },
      {
        id: "mail-2",
        from: clients[0]?.nom || "Client",
        subject: "Suivi commande CMD-1001",
        preview: "Pouvez-vous confirmer le délai…",
        body: "Pouvez-vous confirmer le délai de livraison ?",
        day: 1,
        time: "08:45",
        read: false,
      },
      ...events.slice(0, 2).map((e, i) => ({
        id: `mail-ev-${i}`,
        from: "Alerte ops",
        subject: e.nom,
        preview: (e.description || e.type).slice(0, 80),
        body: e.description || e.type,
        day: 1,
        time: `09:${String(10 + i * 5).padStart(2, "0")}`,
        read: false,
        urgent: /critique|urgence|panne/i.test(e.type + e.nom),
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
            time: "08:05",
            alert: true,
          },
          {
            from: "me" as const,
            text: "Je regarde l'ERP.",
            time: "08:06",
          },
        ],
      },
      {
        contactId: "c2",
        messages: [
          {
            from: "them" as const,
            text: "Dis-moi quand tu as une décision.",
            time: "08:20",
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
        contenu: `Procédure générique — ${entreprise}.\n\n1. Contrôle quantitatif à quai\n2. Contrôle qualité échantillon\n3. Mise en stock + mise à jour ERP\n4. Alerte si seuil bas`,
      },
      {
        id: "doc-2",
        titre: "Contexte entreprise",
        type: "Note",
        contenu:
          Object.entries(param.Contexte)
            .slice(0, 10)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n") || `Entreprise: ${entreprise}\nSecteur: ${param.Secteur || "—"}`,
      },
      {
        id: "doc-3",
        titre: "Check-list maintenance",
        type: "Check-list",
        contenu:
          "Avant démarrage ligne :\n- Niveau huile / lubrifiant\n- Garde-corps en place\n- Dernière alarme acquittée\n- OF du jour chargé dans l'ERP",
      },
      {
        id: "doc-4",
        titre: "Consignes sécurité",
        type: "Consignes",
        contenu:
          "EPI obligatoires en zone production.\nSignaler toute panne via Chat interne + ERP Maintenance.\nNe pas forcer un redémarrage sans validation.",
      },
    ];

  const secteur = param.Secteur || "industrie";
  const browser =
    o?.browser ??
    [
      {
        id: "b1",
        title: `Veille ${secteur} — tendances semaine`,
        url: "https://example.test/veille",
        snippet: `Synthèse sectorielle (${secteur}) : tensions supply chain et délais.`,
        body: `Veille générique — secteur ${secteur}.\n\nLes délais fournisseurs restent tendus. Surveille stock et OF critiques. Aucune entreprise nommément citée dans le moteur OS.`,
        tags: ["veille", "stock", "delais", secteur.toLowerCase()],
      },
      {
        id: "b2",
        title: "Maintenance préventive — bonnes pratiques",
        url: "https://example.test/maintenance",
        snippet: "Planifier avant panne : check-lists, pièces d'usure, créneaux.",
        body: "Bonnes pratiques génériques : calendrier préventif, stock pièces critiques, escalade Chat + ERP si panne ligne.",
        tags: ["maintenance", "panne", "machines"],
      },
      {
        id: "b3",
        title: "Pilotage production — KPI utiles",
        url: "https://example.test/kpi",
        snippet: "Trésorerie, rebut, moral, confiance client — lecture opérationnelle.",
        body: "Les KPI génériques du dashboard (prod, pannes, stock) suffisent pour décider au quotidien. Active le capteur pour lever le brouillard.",
        tags: ["kpi", "dashboard", "production", "fog"],
      },
      {
        id: "b4",
        title: "Rumeurs terrain (non vérifiées)",
        url: "https://example.test/rumeurs",
        snippet: "Bruits de couloir : surcharge ligne, fatigue équipe.",
        body: "Contenu générique. Croiser avec Chat interne et interviews avant de décider. Une rumeur n'est pas un fait ERP.",
        tags: ["rumeur", "rh", "equipe", "interview"],
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
    readParamInterviews(param) ??
    [
      {
        id: "iv-1",
        nom: chatContacts[0]!.name,
        role: chatContacts[0]!.role,
        phrase: "Le stock, c'est mon radar.",
        bio: `Responsable ops chez ${entreprise}. Suit les seuils et les alertes.`,
        relationConfiance: 58,
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
        questions: [
          {
            id: "iv1-q1",
            texte: "Comment va le stock ?",
            choices: [
              {
                id: "iv1-q1-a",
                texte: "Donne-moi le chiffre exact et le seuil.",
                reponse: `On est à ${stockQty} unités. Le seuil de sécurité, c'est autour de ${Math.max(40, Math.floor(stockQty * 0.4))}.`,
                confianceDelta: 4,
                xp: 5,
              },
              {
                id: "iv1-q1-b",
                texte: "On verra plus tard, j'ai autre chose.",
                reponse: "OK… mais ne tarde pas trop, les seuils ne mentent pas.",
                confianceDelta: -3,
              },
            ],
          },
          {
            id: "iv1-q2",
            texte: "Un risque aujourd'hui ?",
            choices: [
              {
                id: "iv1-q2-a",
                texte: "Dis-moi tout, même les rumeurs.",
                reponse:
                  events[0]?.description ||
                  "Rien de critique, mais croise ERP et mails avant de décider.",
                confianceDelta: 5,
                unlockInfo: "RISQUE_PARTAGE",
                xp: 8,
              },
              {
                id: "iv1-q2-b",
                texte: "Reste factuel, pas de panique.",
                reponse: "Compris. Je te remonte seulement ce qui est dans l'ERP.",
                confianceDelta: 2,
              },
            ],
          },
        ],
      },
      {
        id: "iv-2",
        nom: chatContacts[1]?.name || "Collègue",
        role: "Terrain",
        phrase: "Une décision claire, et on avance.",
        bio: "Équipier terrain — packing / picking.",
        relationConfiance: 52,
        lines: [
          {
            q: "Tu as besoin de quelque chose ?",
            a: "Une décision claire sur le réappro suffirait.",
          },
        ],
        questions: [
          {
            id: "iv2-q1",
            texte: "Tu as besoin de quelque chose ?",
            choices: [
              {
                id: "iv2-q1-a",
                texte: "Je tranche le réappro aujourd'hui.",
                reponse: "Parfait. L'équipe attendait ça.",
                confianceDelta: 6,
                xp: 5,
                consequences: [{ cible: "moral", valeur: 2 }],
              },
              {
                id: "iv2-q1-b",
                texte: "Débrouillez-vous encore une journée.",
                reponse: "…On fera avec. Mais le moral, ça descend.",
                confianceDelta: -5,
                consequences: [{ cible: "moral", valeur: -3 }],
              },
            ],
          },
        ],
      },
    ];

  const stockCible = Math.max(80, Math.floor(stockQty * 0.9) + 10);
  const objectives: OsObjective[] =
    readParamObjectifs(param) ??
    [
      {
        id: "obj-stock",
        titre: "Stabiliser le stock",
        type: "JOURNALIER",
        status: "EN_COURS",
        description: "Remonter le stock au-dessus du seuil de sécurité.",
        cible: `Stock ≥ ${stockCible}`,
        cibleNombre: stockCible,
        metric: "stock",
        op: "gte",
        progression: Math.min(stockCible, stockQty),
        xp: 25,
        failOnDayEnd: true,
      },
      {
        id: "obj-decide",
        titre: "Traiter la décision du scénario",
        type: "JOURNALIER",
        status: "EN_COURS",
        description: "Valider au moins une décision aujourd'hui.",
        cible: "1 décision",
        cibleNombre: 1,
        metric: "stepIndex",
        op: "gte",
        progression: 0,
        xp: 20,
        failOnDayEnd: true,
      },
      {
        id: "obj-hebdo-pieces",
        titre: "Tenir la qualité de la semaine",
        type: "HEBDOMADAIRE",
        status: "EN_COURS",
        description: "Accumuler des pièces / qualité sur la semaine.",
        cible: "Qualité ≥ 200",
        cibleNombre: 200,
        metric: "piecesBrutesSemaine",
        op: "gte",
        progression: 0,
        xp: 40,
        failOnDayEnd: false,
      },
    ];

  const machines =
    o?.machines ??
    [
      {
        nom: "Poste découpe",
        type: "Usinage",
        etat: "PRODUCTION",
        vitesse: "62 u/h",
        tauxRebut: "1.5%",
        derniereMaint: "J-8",
        prochaineMaint: "J+22",
      },
      {
        nom: "Presse",
        type: "Formage",
        etat: "PRODUCTION",
        vitesse: "48 u/h",
        tauxRebut: "2%",
        derniereMaint: "J-12",
        prochaineMaint: "J+18",
      },
      {
        nom: "Ligne assemblage",
        type: "Assemblage",
        etat: "PANNE",
        vitesse: "0 u/h",
        tauxRebut: "—",
        derniereMaint: "J-3",
        prochaineMaint: "Urgente",
      },
      {
        nom: "Poste contrôle",
        type: "Qualité",
        etat: "ARRET",
        vitesse: "0 u/h",
        tauxRebut: "0.5%",
        derniereMaint: "J-5",
        prochaineMaint: "J+30",
      },
    ];

  const dashboardSeries =
    o?.dashboardSeries ??
    [
      { name: "J1", prod: Math.max(40, production - 10), panne: 4 },
      { name: "J2", prod: Math.max(40, production), panne: 5 },
      { name: "J3", prod: Math.max(30, production - 20), panne: 18 },
      { name: "J4", prod: Math.max(45, production - 5), panne: 8 },
      { name: "J5", prod: Math.max(50, production + 10), panne: 6 },
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

  const maintenance =
    o?.maintenance ??
    [
      {
        id: "maint-1",
        equipement: machines[0]?.nom || "Poste principal",
        type: "Préventive",
        echeance: "J+20",
        technicien: "Tech A",
        statut: "Planifiée" as const,
        priorite: "Normale" as const,
      },
    ];

  const sensors: OsSensor[] =
    o?.sensors?.length
      ? o.sensors.map((s) => ({
          ...s,
          installed: Boolean(s.installed),
        }))
      : osDefaultSensors();

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
      maintenance,
      emails,
      chatContacts,
      chatThreads,
      documents,
      browser,
      dashboardCards,
      dashboardSeries,
    },
    interviews,
    objectives,
    sensors,
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
