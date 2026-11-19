"use client";

/**
 * Aperçu interactif Admin → Keyber OS → ERP (même UI joueur).
 */

import { useMemo, useState } from "react";
import { OsComputerErp } from "@/components/osPlay/OsComputerErp";
import { ensureErpTablesNonEmpty } from "@/lib/keyberOs/erpFeeling";
import {
  createDefaultOsKpis,
  createEmptyOsFinance,
  createEmptyOsHistorique,
  createEmptyOsHumain,
  createEmptyOsMeta,
  createEmptyOsProgression,
  createEmptyOsVisibilite,
  createEmptyOsWorld,
} from "@/lib/keyberOs/createRichDefaults";
import type { OsPlayState } from "@/lib/keyberOs/types";
import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { cn } from "@/lib/utils";

function demoPlay(fog: boolean): OsPlayState {
  const computer = ensureErpTablesNonEmpty(
    {
      stock: [
        {
          ref: "SKU-A",
          nom: "Composant A",
          qte: 42,
          seuil: 80,
          emplacement: "A-01",
          fournisseur: "Fournisseur Nord",
          prixUnitaire: 18,
          derniereEntree: "J-1",
          statut: "Stock bas",
        },
        {
          ref: "SKU-B",
          nom: "Composant B",
          qte: 120,
          seuil: 40,
          emplacement: "B-02",
          fournisseur: "Fournisseur Sud",
          prixUnitaire: 9,
          derniereEntree: "J-3",
          statut: "OK",
        },
        {
          ref: "SKU-C",
          nom: "Vis M6",
          qte: 8,
          seuil: 50,
          emplacement: "C-10",
          fournisseur: "Fournisseur Nord",
          prixUnitaire: 0.4,
          derniereEntree: "J-6",
          statut: "Rupture",
        },
      ],
      commandes: [
        {
          numero: "CMD-101",
          client: "Client Alpha",
          piece: "Composant A",
          qteCommandee: 200,
          qteProduite: 80,
          dateLimite: "J+2",
          statut: "En retard",
          montant: 12000,
        },
        {
          numero: "CMD-102",
          client: "Client Beta",
          piece: "Composant B",
          qteCommandee: 50,
          qteProduite: 20,
          dateLimite: "J+5",
          statut: "En cours",
          montant: 4500,
        },
      ],
      production: [
        {
          ligne: "Ligne 1",
          piece: "Composant A",
          objectifJour: 100,
          produitAujourdhui: 62,
          tauxRebut: "3%",
          vitesse: "basse",
          etat: "En marche",
        },
        {
          ligne: "Ligne 2",
          piece: "Composant B",
          objectifJour: 80,
          produitAujourdhui: 0,
          tauxRebut: "—",
          vitesse: "0",
          etat: "En panne",
        },
      ],
      employes: [],
      factures: [
        {
          numero: "FAC-90",
          client: "Client Alpha",
          montant: 3200,
          emission: "J-20",
          echeance: "J-2",
          statut: "En retard",
        },
      ],
      machines: [
        {
          nom: "Ligne 1",
          type: "Assemblage",
          etat: "En marche",
          vitesse: "basse",
          tauxRebut: "3%",
          derniereMaint: "J-10",
          prochaineMaint: "J+5",
        },
        {
          nom: "Ligne 2",
          type: "Assemblage",
          etat: "En panne",
          vitesse: "0",
          tauxRebut: "—",
          derniereMaint: "J-30",
          prochaineMaint: "J+1",
        },
      ],
      clients: [],
      fournisseurs: [],
      maintenance: [],
      emails: [],
      chatContacts: [],
      chatThreads: [],
      documents: [],
      browser: [],
      dashboardCards: [],
      dashboardSeries: [
        { name: "J-4", prod: 90, panne: 2 },
        { name: "J-3", prod: 85, panne: 4 },
        { name: "J-2", prod: 70, panne: 8 },
        { name: "J-1", prod: 55, panne: 12 },
        { name: "J", prod: 62, panne: 10 },
      ],
    },
    {
      entreprise: "Démo ERP",
      stockQty: 170,
      production: 62,
      commandes: 2,
      tresorerieBrute: 48000,
    }
  );

  const param = {
    Nom: "Démo ERP Admin",
    Entreprise: "Démo ERP",
  } as ScenarioParamFile;

  return {
    sessionId: "admin-erp-preview",
    param,
    paramSource: null,
    stepIndex: 0,
    decisions: [],
    eventsFired: [],
    tresorerieBrute: 48000,
    stock: 170,
    production: 62,
    commandes: 2,
    xp: 0,
    niveau: 1,
    score: 0,
    log: [],
    finished: false,
    feedback: null,
    day: 1,
    week: 1,
    minutesSinceStart: 120,
    dayLengthMinutes: 600,
    visibilityLevel: fog ? 0 : 3,
    sensorInstalled: !fog,
    activeAction: "computer",
    computerApp: "erp",
    selectedInterviewId: null,
    computer,
    interviews: [],
    objectives: [],
    meta: createEmptyOsMeta({
      scenarioId: "admin-erp-preview",
      jourActuel: 1,
      week: 1,
      minutesSinceStart: 120,
      dayLengthMinutes: 600,
    }),
    finance: createEmptyOsFinance({
      tresorerie: 48000,
      stockKg: 170,
      productionParJour: 62,
      commandes: 2,
    }),
    humain: createEmptyOsHumain(),
    relations: {},
    progression: createEmptyOsProgression(),
    visibilite: createEmptyOsVisibilite({
      level: fog ? 0 : 3,
      sensorInstalled: !fog,
    }),
    historique: createEmptyOsHistorique(),
    flags: {},
    world: createEmptyOsWorld(),
    kpis: createDefaultOsKpis(),
  };
}

export function ErpModulePreview() {
  const [fog, setFog] = useState(false);
  const play = useMemo(() => demoPlay(fog), [fog]);

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Aperçu ERP joueur (live)
          </p>
          <p className="text-xs text-slate-500">
            Même UI que Book → Ordinateur → ERP. Ouvre « Analyse &amp; graphes »
            dans la sidebar gauche.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFog((v) => !v)}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-semibold",
            fog
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-700"
          )}
        >
          Fog {fog ? "ON" : "OFF"}
        </button>
      </div>
      <div className="h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <OsComputerErp play={play} fog={fog} />
      </div>
    </section>
  );
}
