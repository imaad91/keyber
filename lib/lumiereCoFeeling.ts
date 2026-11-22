/**
 * Étape 37 — Contenu feeling Lumière & Co (exception démo).
 * Remplit ERP / mail / chat / docs / browser / intro / livre / conséquences.
 * N'altère pas Novacier.
 */

import type { OrdinateurExcelPack } from "@/lib/atelierOrdinateurExcel";
import type { ScenarioParamLivre } from "@/lib/osLivre";
import type { ScenarioParamOrdinateur } from "@/lib/scenarioParamSchema";

const ENTREPRISE = "Lumière & Co";

/** Intro / onboarding joueur. */
export function lumiereIntro(): string[] {
  return [
    "Bienvenue chez Lumière & Co — e-commerce de luminaires, entrepôt Vénissieux.",
    "Tu es Logisticien junior. Samir te coache ; Léa pousse le volume site ; Claire tient la trésorerie.",
    "Objectif de la semaine : tenir le stock Halo et les délais J+2 pendant le pic Noël.",
    "Ouvre l'Ordinateur : ERP stock, mails MingLight, chat interne. Puis tranche les décisions du jour.",
  ];
}

/** Catalogue de conséquences nommées (réutilisables). */
export function lumiereConsequences() {
  return [
    {
      id: "cons-stock-up",
      label: "Réappro Halo",
      consequences: [{ cible: "stock", valeur: 25 }],
    },
    {
      id: "cons-cash-hit",
      label: "Cash air freight",
      consequences: [{ cible: "tresorerie", valeur: -1500 }],
    },
    {
      id: "cons-confiance",
      label: "SAV client sauvé",
      consequences: [{ cible: "confianceClient", valeur: 8 }],
    },
    {
      id: "cons-moral-down",
      label: "Heures sup packing",
      consequences: [{ cible: "moral", valeur: -6 }],
    },
  ];
}

export function lumiereLivre(): ScenarioParamLivre {
  return {
    nom: ENTREPRISE,
    slogan: "Éclairer sans casser les délais.",
    histoire: {
      fondation:
        "Fondée à Lyon en 2019 par Claire Morel, Lumière & Co vend des luminaires design en ligne avec un entrepôt à Vénissieux.",
      datesCles: [
        { annee: "2019", fait: "Création — premier container MingLight" },
        { annee: "2021", fait: "Passage Shopify + 2 préparateurs" },
        { annee: "2024", fait: "Pic Noël x3 — stress stock Halo" },
      ],
      anecdotes: [
        "Le surnom « Halo » vient du halo de lumière du best-seller.",
        "Samir chronomètre le picking au stopwatch — le quai ne ment jamais.",
      ],
      crisesPassees: [
        "2022 : container bloqué en douane — rupture 11 jours.",
        "2023 : panne gerbeur — zone A fermée une après-midi.",
      ],
      narratif:
        "Petite équipe, gros volume saisonnier. La semaine décisive, c'est maintenant : stock Halo, SAV, et MingLight en retard.",
    },
    activite: {
      ceQuOnFabrique:
        "Achat-revente de luminaires (plafonniers, lampadaires, ampoules design). Pas de production.",
      pourQui: "Particuliers France + petits pros déco via le site.",
      produitsPhares: [
        {
          nom: "Halo 30",
          description: "Plafonnier best-seller — stock critique Q4.",
        },
        {
          nom: "Arc Soft",
          description: "Lampadaire design — volume moyen, marge haute.",
        },
      ],
      clientsPrincipaux: ["Particuliers Shopify", "Déco & Co (B2B léger)"],
    },
    organigramme: [
      { personnageId: "claire", label: "Claire Morel — Directrice" },
      { personnageId: "iv-samir", label: "Samir — Logisticien mentor" },
      { personnageId: "iv-lea", label: "Léa — E-commerce" },
    ],
    chiffresCles: {
      ca: "780 000 € / an",
      employes: 6,
      machines: 2,
      clients: 4200,
      satisfaction: "4,2 / 5",
    },
    valeurs: [
      {
        titre: "Délai J+2",
        description: "Promesse client non négociable en pic.",
      },
      {
        titre: "Stock honnête",
        description: "Mieux vaut couper une promo que mentir sur le dispo.",
      },
    ],
    glossaire: [
      {
        terme: "Halo",
        definition: "SKU plafonnier best-seller, stock de sécurité 80.",
      },
      {
        terme: "MingLight",
        definition: "Fournisseur Asie principal — délais longs Q4.",
      },
      {
        terme: "J+2",
        definition: "Engagement d'expédition sous 48 h ouvrées.",
      },
    ],
  };
}

/** Pack Ordinateur feeling complet (param). */
export function lumiereOrdinateurFeeling(): ScenarioParamOrdinateur {
  return {
    stock: [
      {
        ref: "HALO-30",
        nom: "Halo 30",
        qte: 95,
        seuil: 80,
        emplacement: "A-12",
        fournisseur: "MingLight",
        prixUnitaire: 42,
        derniereEntree: "J-5",
        statut: "Stock bas",
      },
      {
        ref: "ARC-SOFT",
        nom: "Arc Soft",
        qte: 48,
        seuil: 20,
        emplacement: "B-03",
        fournisseur: "VietGlow",
        prixUnitaire: 89,
        derniereEntree: "J-12",
        statut: "OK",
      },
      {
        ref: "BULB-E27",
        nom: "Ampoule E27 soft",
        qte: 320,
        seuil: 100,
        emplacement: "C-01",
        fournisseur: "MingLight",
        prixUnitaire: 4.5,
        derniereEntree: "J-2",
        statut: "OK",
      },
    ],
    commandes: [
      {
        numero: "CMD-4401",
        client: "Dupont M.",
        piece: "Halo 30",
        qteCommandee: 2,
        qteProduite: 0,
        dateLimite: "J+2",
        statut: "À préparer",
        montant: 168,
      },
      {
        numero: "CMD-4402",
        client: "Déco & Co",
        piece: "Arc Soft",
        qteCommandee: 6,
        qteProduite: 2,
        dateLimite: "J+3",
        statut: "En cours",
        montant: 890,
      },
      {
        numero: "CMD-4408",
        client: "Martin L.",
        piece: "Halo 30",
        qteCommandee: 1,
        qteProduite: 0,
        dateLimite: "J+1",
        statut: "Urgent",
        montant: 84,
      },
    ],
    production: [
      {
        ligne: "Packing 1",
        piece: "Halo 30",
        objectifJour: 40,
        produitAujourdhui: 18,
        tauxRebut: "1,2 %",
        vitesse: "normale",
        etat: "En marche",
      },
      {
        ligne: "Packing 2",
        piece: "Mix SKU",
        objectifJour: 55,
        produitAujourdhui: 22,
        tauxRebut: "0,8 %",
        vitesse: "tendue",
        etat: "En marche",
      },
    ],
    employes: [
      {
        nom: "Samir",
        poste: "Logisticien",
        equipe: "Entrepôt",
        anciennete: "4 ans",
        heuresSup: "4 h",
        tauxAbsence: "2 %",
        statut: "Présent",
      },
      {
        nom: "Nora",
        poste: "Préparatrice",
        equipe: "Entrepôt",
        anciennete: "1 an",
        heuresSup: "6 h",
        tauxAbsence: "0 %",
        statut: "Présent",
      },
      {
        nom: "Yanis",
        poste: "Préparateur",
        equipe: "Entrepôt",
        anciennete: "8 mois",
        heuresSup: "2 h",
        tauxAbsence: "5 %",
        statut: "Présent",
      },
      {
        nom: "Léa",
        poste: "E-commerce",
        equipe: "Bureau",
        anciennete: "3 ans",
        heuresSup: "0 h",
        tauxAbsence: "1 %",
        statut: "Présent",
      },
    ],
    factures: [
      {
        numero: "FAC-2201",
        client: "Déco & Co",
        montant: 2400,
        emission: "J-10",
        echeance: "J+20",
        statut: "En attente",
      },
      {
        numero: "FAC-2198",
        client: "Particuliers (lot)",
        montant: 1860,
        emission: "J-3",
        echeance: "J+12",
        statut: "Payée",
      },
    ],
    machines: [
      {
        nom: "Gerbeur A",
        type: "Gerbeur électrique",
        etat: "OK",
        vitesse: "nominale",
        tauxRebut: "—",
        derniereMaint: "J-30",
        prochaineMaint: "J+60",
      },
      {
        nom: "Imprimante étiquettes",
        type: "Zebra",
        etat: "Attention encre",
        vitesse: "OK",
        tauxRebut: "—",
        derniereMaint: "J-7",
        prochaineMaint: "J+21",
      },
    ],
    clients: [
      {
        nom: "Déco & Co",
        pctCa: "12 %",
        derniereCommande: "J-2",
        relation: "Bon",
        contact: "paul@decoandco.fr",
      },
      {
        nom: "Particuliers Shopify",
        pctCa: "78 %",
        derniereCommande: "Aujourd'hui",
        relation: "Variable",
        contact: "support@lumiere-co.fr",
      },
    ],
    fournisseurs: [
      {
        nom: "MingLight",
        piece: "Halo 30 / ampoules",
        delai: "28–40 j",
        prix: "compétitif",
        fiabilite: "moyenne Q4",
      },
      {
        nom: "VietGlow",
        piece: "Arc Soft",
        delai: "21–30 j",
        prix: "un peu plus cher",
        fiabilite: "bonne",
      },
    ],
    maintenance: [
      {
        id: "mnt-gerbeur",
        equipement: "Gerbeur A",
        type: "Préventive",
        echeance: "J+60",
        technicien: "Ext. LiftPro",
        statut: "Planifiée",
        priorite: "Normale",
      },
      {
        id: "mnt-zebra",
        equipement: "Imprimante étiquettes",
        type: "Consommable",
        echeance: "J+2",
        technicien: "Nora",
        statut: "À faire",
        priorite: "Haute",
      },
    ],
    emails: [
      {
        id: "mail-ming-retard",
        from: "ops@minglight.cn",
        subject: "Halo container — +12 jours",
        preview: "Container ML-884 delayed +12 days…",
        body: "Dear team, container ML-884 delayed +12 days. ETA revised. Please confirm air freight option if needed.",
        day: 1,
        time: "08:45",
        read: false,
        urgent: true,
      },
      {
        id: "mail-sav-colis",
        from: "sav@lumiere-co.fr",
        subject: "URGENT — colis perdu CMD-4390",
        preview: "Client relance. Transporteur confirme perte…",
        body: "Client relance. Transporteur confirme perte après enlèvement. Besoin décision rembourse / renvoi avant 16h.",
        day: 1,
        time: "11:05",
        read: false,
        urgent: true,
      },
      {
        id: "mail-lea-promo",
        from: "lea@lumiere-co.fr",
        subject: "Promo Halo — on tient ?",
        preview: "Le site push Halo ce week-end…",
        body: "Le site push Halo ce week-end. Confirme-moi le stock dispo demain matin sinon je coupe la bannière.",
        day: 1,
        time: "09:20",
        read: false,
      },
      {
        id: "mail-claire-cash",
        from: "claire@lumiere-co.fr",
        subject: "Air freight = cash",
        preview: "Si tu proposes de l'air MingLight…",
        body: "Si tu proposes de l'air MingLight, passe me voir avec le chiffre. Trésorerie déjà sous tension.",
        day: 1,
        time: "10:10",
        read: true,
      },
    ],
    chatContacts: [
      { id: "iv-samir", name: "Samir", role: "Logisticien" },
      { id: "iv-lea", name: "Léa", role: "E-commerce" },
      { id: "claire", name: "Claire", role: "Directrice" },
    ],
    chatThreads: [
      {
        contactId: "iv-samir",
        messages: [
          {
            from: "them" as const,
            text: "Commence par l'ERP Halo + le mail MingLight.",
            time: "08:50",
            alert: true,
          },
          {
            from: "me" as const,
            text: "OK — je regarde le seuil sécu.",
            time: "08:52",
          },
        ],
      },
      {
        contactId: "iv-lea",
        messages: [
          {
            from: "them" as const,
            text: "SAV flambe si on rate une expé Halo.",
            time: "09:30",
            alert: true,
          },
        ],
      },
      {
        contactId: "claire",
        messages: [
          {
            from: "them" as const,
            text: "Point cash à 14h si air freight.",
            time: "10:15",
          },
        ],
      },
    ],
    documents: [
      {
        id: "doc-proc-picking",
        titre: "Procédure picking Halo",
        type: "SOP",
        contenu:
          "1) Scanner A-12 2) Contrôler carton 3) Packing mousse 4) Étiquette J+2. Seuil alerte : stock < 80.",
      },
      {
        id: "doc-ming-contrat",
        titre: "Fiche MingLight Q4",
        type: "Fournisseur",
        contenu:
          "Incoterm FOB. Lead time nominal 28 j. Buffer sécu Halo = 80 u. Air freight sur devis Claire.",
      },
      {
        id: "doc-sav",
        titre: "Grille SAV colis perdu",
        type: "SAV",
        contenu:
          "Perte transporteur : renvoi prioritaire si stock > seuil, sinon avoir + délai annoncé.",
      },
    ],
    browser: [
      {
        id: "br-shopify-halo",
        title: "Shopify — page Halo 30",
        url: "https://shop.lumiere-co.example/halo-30",
        snippet: "Best-seller · promo week-end activée",
        body: "Bannière « −15 % Halo » live. Stock affiché côté site = 95 (sync WMS retardée).",
        tags: ["site", "promo", "halo"],
      },
      {
        id: "br-tracking",
        title: "Tracking transporteur CMD-4390",
        url: "https://track.carrier.example/4390",
        snippet: "Statut : Lost after pickup",
        body: "Dernier scan quai transporteur J-1 18h. Aucun scan hub.",
        tags: ["sav", "transport"],
      },
    ],
    dashboardCards: [
      { label: "Stock Halo", value: "95 u" },
      { label: "Commandes J", value: "14" },
      { label: "Retards J+2", value: "3" },
      { label: "Trésorerie", value: "48 k€" },
    ],
    dashboardSeries: [
      { name: "Lun", prod: 32, panne: 1 },
      { name: "Mar", prod: 38, panne: 0 },
      { name: "Mer", prod: 41, panne: 2 },
      { name: "Jeu", prod: 29, panne: 1 },
      { name: "Ven", prod: 44, panne: 0 },
      { name: "Sam", prod: 36, panne: 1 },
    ],
  };
}

/** Jours timeline avec signal DayEnd (checklist). */
export function lumiereJoursFeeling() {
  return [
    {
      id: "jour-1",
      jour: 1,
      label: "J1 — Feu au quai",
      phase: "urgence",
      decisionIds: ["h1", "d1"],
      eventIds: ["lumiere-ev-1", "lumiere-ev-2", "lumiere-ev-4"],
    },
    {
      id: "jour-1-end",
      jour: 1,
      label: "Fin de jour J1 — bilan quai",
      phase: "DAY_END",
      decisionIds: [],
      eventIds: [],
    },
    {
      id: "jour-2",
      jour: 2,
      label: "J2 — Pic Noël",
      phase: "pic",
      decisionIds: ["h2"],
      eventIds: ["lumiere-ev-3"],
    },
    {
      id: "jour-2-end",
      jour: 2,
      label: "Fin de jour J2 — bilan",
      phase: "DAY_END",
      decisionIds: [],
      eventIds: [],
    },
  ];
}

function row(values: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (typeof v === "boolean") out[k] = v ? "oui" : "non";
    else out[k] = String(v ?? "");
  }
  return out;
}

type AnyRow = Record<string, unknown>;

function rowsOf(v: unknown): AnyRow[] {
  return Array.isArray(v) ? (v as AnyRow[]) : [];
}

/** Staging Excel Ordinateur rempli (Étape 32/37). */
export function buildLumiereOrdinateurExcelPack(): OrdinateurExcelPack {
  const o = lumiereOrdinateurFeeling();
  const chatThreadRows: Record<string, string>[] = [];
  for (const t of rowsOf(o.chatThreads)) {
    const contactId = String(t.contactId || "");
    const messages = Array.isArray(t.messages) ? t.messages : [];
    for (const m of messages as AnyRow[]) {
      chatThreadRows.push(
        row({
          "Contact id": contactId,
          Auteur: m.from === "me" ? "Toi" : "Eux",
          Texte: String(m.text || ""),
          Jour: 1,
          Heure: String(m.time || ""),
        })
      );
    }
  }

  return {
    stock: rowsOf(o.stock).map((r) =>
      row({
        Réf: r.ref,
        Nom: r.nom,
        Qté: r.qte,
        Seuil: r.seuil,
        Emplacement: r.emplacement,
        Fournisseur: r.fournisseur,
        "Prix unitaire": r.prixUnitaire,
        "Dernière entrée": r.derniereEntree,
        Statut: r.statut,
      })
    ),
    commandes: rowsOf(o.commandes).map((r) =>
      row({
        Numéro: r.numero,
        Client: r.client,
        Pièce: r.piece,
        "Qté commandée": r.qteCommandee,
        "Qté produite": r.qteProduite,
        "Date limite": r.dateLimite,
        Statut: r.statut,
        Montant: r.montant,
      })
    ),
    production: rowsOf(o.production).map((r) =>
      row({
        Ligne: r.ligne,
        Pièce: r.piece,
        "Objectif jour": r.objectifJour,
        "Produit aujourd'hui": r.produitAujourdhui,
        "Taux rebut": r.tauxRebut,
        Vitesse: r.vitesse,
        État: r.etat,
      })
    ),
    employes: rowsOf(o.employes).map((r) =>
      row({
        Nom: r.nom,
        Poste: r.poste,
        Équipe: r.equipe,
        Ancienneté: r.anciennete,
        "Heures sup": r.heuresSup,
        "Taux absence": r.tauxAbsence,
        Statut: r.statut,
      })
    ),
    factures: rowsOf(o.factures).map((r) =>
      row({
        Numéro: r.numero,
        Client: r.client,
        Montant: r.montant,
        Émission: r.emission,
        Échéance: r.echeance,
        Statut: r.statut,
      })
    ),
    machines: rowsOf(o.machines).map((r) =>
      row({
        Nom: r.nom,
        Type: r.type,
        État: r.etat,
        Vitesse: r.vitesse,
        "Taux rebut": r.tauxRebut,
        "Dernière maint": r.derniereMaint,
        "Prochaine maint": r.prochaineMaint,
      })
    ),
    clients: rowsOf(o.clients).map((r) =>
      row({
        Nom: r.nom,
        "% CA": r.pctCa,
        "Dernière commande": r.derniereCommande,
        Relation: r.relation,
        Contact: r.contact,
      })
    ),
    fournisseurs: rowsOf(o.fournisseurs).map((r) =>
      row({
        Nom: r.nom,
        Pièce: r.piece,
        Délai: r.delai,
        Prix: r.prix,
        Fiabilité: r.fiabilite,
      })
    ),
    maintenance: rowsOf(o.maintenance).map((r) =>
      row({
        Id: r.id,
        Équipement: r.equipement,
        Type: r.type,
        Échéance: r.echeance,
        Technicien: r.technicien,
        Statut: r.statut,
        Priorité: r.priorite,
      })
    ),
    emails: rowsOf(o.emails).map((r) =>
      row({
        Id: r.id,
        De: r.from,
        À: "logistique@lumiere-co.fr",
        Objet: r.subject,
        Corps: r.body,
        Jour: r.day,
        Heure: r.time,
        Lu: r.read,
      })
    ),
    chatContacts: rowsOf(o.chatContacts).map((r) =>
      row({ Id: r.id, Nom: r.name, Rôle: r.role })
    ),
    chatThreads: chatThreadRows,
    documents: rowsOf(o.documents).map((r) =>
      row({
        Id: r.id,
        Titre: r.titre,
        Type: r.type,
        Contenu: r.contenu,
      })
    ),
    browser: rowsOf(o.browser).map((r) =>
      row({
        Id: r.id,
        Titre: r.title,
        URL: r.url,
        Snippet: r.snippet,
        Corps: r.body,
        Tags: Array.isArray(r.tags) ? r.tags.join(", ") : "",
      })
    ),
    dashboardCards: rowsOf(o.dashboardCards).map((r) =>
      row({ Label: r.label, Valeur: r.value })
    ),
    dashboardSeries: rowsOf(o.dashboardSeries).map((r) =>
      row({
        Id: String(r.name || ""),
        Label: String(r.name || ""),
        "Points (csv)": `${r.prod ?? 0}, ${r.panne ?? 0}`,
      })
    ),
  };
}
