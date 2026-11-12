"use client";

import {
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { DAY_LABELS } from "@/lib/computerData";
import { formatGameClock } from "@/lib/engine";
import { roles } from "@/lib/mock";
import { useGameStore } from "@/lib/store";
import type { ComputerAppId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ComputerBrowser } from "./ComputerBrowser";
import { ComputerChat } from "./ComputerChat";
import { ComputerDashboard } from "./ComputerDashboard";
import { ComputerDocs } from "./ComputerDocs";
import { ComputerErp } from "./ComputerErp";
import { ComputerMail } from "./ComputerMail";

const APPS: {
  id: ComputerAppId;
  titre: string;
  description: string;
  icon: typeof Mail;
  accent: string;
}[] = [
  {
    id: "erp",
    titre: "ERP Novacier",
    description: "Stock, commandes, employés, factures, machines",
    icon: Database,
    accent: "bg-sky-600",
  },
  {
    id: "mail",
    titre: "Boîte Mail",
    description: "Emails de Laurent, clients, fournisseurs",
    icon: Mail,
    accent: "bg-rose-600",
  },
  {
    id: "dashboard",
    titre: "Dashboard",
    description: "Graphiques, KPIs, pilotage",
    icon: LayoutDashboard,
    accent: "bg-emerald-600",
  },
  {
    id: "documents",
    titre: "Documents",
    description: "Contrats, procédures, fichiers",
    icon: FileText,
    accent: "bg-amber-600",
  },
  {
    id: "chat",
    titre: "Chat Interne",
    description: "Marie, Karim, Laurent",
    icon: MessageCircle,
    accent: "bg-violet-600",
  },
  {
    id: "browser",
    titre: "Navigateur",
    description: "Rechercher infos, concurrents, rumeurs",
    icon: Globe,
    accent: "bg-slate-700",
  },
];

export function ComputerDesktop() {
  const {
    gameState,
    computerApp,
    openComputerApp,
    closeComputerApp,
    setActiveAction,
  } = useGameStore();

  const role = roles.find((r) => r.id === gameState.roleId);
  const dayLabel =
    DAY_LABELS[gameState.day] ?? `Jour ${gameState.day}`;
  const clock = formatGameClock(gameState.minutesSinceStart);
  const unreadMail = gameState.emails.filter((e) => !e.read).length;
  const alertChat = gameState.messages.filter((m) => m.alert).length;

  return (
    <section className="computer-shell view-enter flex h-full min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-300 bg-slate-200 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-800 px-4 py-2.5 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            Session — {role?.titre ?? "Responsable de Production"} — Novacier —{" "}
            {dayLabel} {clock}
          </p>
          <p className="text-[11px] text-slate-300">
            Ordinateur de production · le temps avance à chaque application
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-slate-700 px-2.5 py-1 font-mono text-sm tabular-nums text-emerald-300">
            {clock}
          </span>
          <button
            type="button"
            onClick={() => setActiveAction(null)}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            Quitter l&apos;ordinateur / Retour au jeu
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {!computerApp ? (
          <div
            className="h-full overflow-auto p-6 md:p-8"
            style={{
              background:
                "linear-gradient(160deg, #1e3a5f 0%, #0f766e 45%, #134e4a 100%)",
            }}
          >
            <p className="mb-5 text-sm font-medium text-white/80">
              Bureau Novacier — double-cliquez une application
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {APPS.map((app) => {
                const Icon = app.icon;
                const badge =
                  app.id === "mail"
                    ? unreadMail
                    : app.id === "chat"
                      ? alertChat
                      : 0;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => openComputerApp(app.id)}
                    className="group flex flex-col items-start gap-3 rounded-xl border border-white/15 bg-white/10 p-4 text-left text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    <span className="relative">
                      <span
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl shadow-md",
                          app.accent
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      {badge > 0 ? (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {app.titre}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-white/70">
                        {app.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col bg-white text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm font-semibold text-slate-800">
                {APPS.find((a) => a.id === computerApp)?.titre}
              </p>
              <button
                type="button"
                onClick={() => closeComputerApp()}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
                Fermer
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {computerApp === "erp" ? <ComputerErp /> : null}
              {computerApp === "mail" ? <ComputerMail /> : null}
              {computerApp === "dashboard" ? <ComputerDashboard /> : null}
              {computerApp === "documents" ? <ComputerDocs /> : null}
              {computerApp === "chat" ? <ComputerChat /> : null}
              {computerApp === "browser" ? <ComputerBrowser /> : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
