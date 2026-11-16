"use client";

/**
 * Desktop Ordinateur OS — chrome exact `/play` ComputerDesktop (Étape 3).
 * Données = OsPlayState + runtime apps. Aucun useGameStore / contexte hardcodé.
 */

import {
  formatOsClock,
  osOrdinateurMarkEmailRead,
  osOrdinateurOpenApp,
  osOrdinateurSetAction,
  type OsComputerAppId,
  type OsPlayState,
} from "@/lib/keyberOs";
import { DAY_LABELS } from "@/lib/computerData";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";
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

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
  fog: boolean;
};

export function OsComputerDesktop({ play, setPlay, fog }: Props) {
  const { config } = useKeyberOsRuntime();
  const appsEnabled = config.ordinateur.apps;
  const computerApp = play.computerApp;

  const roleLabel = play.param.Rôle || play.param.Compétence || "Joueur";
  const entreprise = play.param.Entreprise || play.param.Nom || "Entreprise";
  const day = play.meta?.jourActuel ?? play.day;
  const minutes = play.meta?.minutesSinceStart ?? play.minutesSinceStart;
  const dayLabel = DAY_LABELS[day] ?? `Jour ${day}`;
  const clock = formatOsClock(minutes);

  const unreadMail = play.computer.emails.filter((e) => !e.read).length;
  const alertChat = play.computer.chatThreads.reduce(
    (n, t) => n + t.messages.filter((m) => m.alert).length,
    0
  );
  const dashboardAlert =
    play.computer.production.some((p) => p.etat !== "En marche") ||
    play.computer.stock.some((s) => s.statut !== "OK");

  const ALL_APPS: {
    id: OsComputerAppId;
    titre: string;
    description: string;
    icon: typeof Mail;
    accent: string;
  }[] = [
    {
      id: "erp",
      titre: "ERP Production",
      description: "Stock, commandes, employés, factures, machines",
      icon: Database,
      accent: "bg-sky-600",
    },
    {
      id: "mail",
      titre: "Boîte Mail",
      description: "Messages direction, clients, alertes",
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
      description: "Échanges équipe & interlocuteurs",
      icon: MessageCircle,
      accent: "bg-violet-600",
    },
    {
      id: "browser",
      titre: "Navigateur",
      description: "Rechercher infos, veille, rumeurs",
      icon: Globe,
      accent: "bg-slate-700",
    },
  ];
  const APPS = ALL_APPS.filter((a) => appsEnabled[a.id]);

  return (
    <section className="computer-shell view-enter flex h-full min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-300 bg-slate-200 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 bg-slate-800 px-4 py-2.5 text-white">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {roleLabel} · {entreprise} — {dayLabel} {clock}
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
            onClick={() => setPlay(osOrdinateurSetAction(play, null))}
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
            <p className="mb-5 text-sm font-medium text-white/80">Bureau</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {APPS.map((app) => {
                const Icon = app.icon;
                const mailBadge = app.id === "mail" ? unreadMail : 0;
                const chatBadge = app.id === "chat" ? alertChat : 0;
                const dashBadge =
                  app.id === "dashboard" && dashboardAlert ? 1 : 0;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setPlay(osOrdinateurOpenApp(play, app.id))}
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
                      {mailBadge > 0 ? (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {mailBadge}
                        </span>
                      ) : null}
                      {chatBadge > 0 ? (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                          {chatBadge}
                        </span>
                      ) : null}
                      {dashBadge > 0 ? (
                        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                          !
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
                {APPS.find((a) => a.id === computerApp)?.titre ?? computerApp}
              </p>
              <button
                type="button"
                onClick={() => setPlay(osOrdinateurOpenApp(play, null))}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
                Fermer
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3 text-sm">
              {computerApp === "erp" ? (
                <OsErpLite play={play} fog={fog} />
              ) : null}
              {computerApp === "mail" ? (
                <OsMailLite play={play} setPlay={setPlay} />
              ) : null}
              {computerApp === "dashboard" ? (
                <OsDashLite play={play} fog={fog} />
              ) : null}
              {computerApp === "documents" ? (
                <ul className="space-y-2">
                  {play.computer.documents.map((d) => (
                    <li key={d.id} className="rounded-lg border p-3">
                      <p className="font-semibold">{d.titre}</p>
                      <p className="text-xs text-slate-500">{d.type}</p>
                      <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                        {d.contenu}
                      </pre>
                    </li>
                  ))}
                </ul>
              ) : null}
              {computerApp === "chat" ? <OsChatLite play={play} /> : null}
              {computerApp === "browser" ? (
                <ul className="space-y-2">
                  {play.computer.browser.map((b) => (
                    <li key={b.id} className="rounded-lg border p-3">
                      <p className="font-semibold">{b.title}</p>
                      <p className="text-xs text-sky-700">{b.url}</p>
                      <p className="mt-1 text-xs text-slate-600">{b.snippet}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Contenu apps temporaire (Étapes 4–8 enrichiront ERP/mail/…). */
function OsErpLite({ play, fog }: { play: OsPlayState; fog: boolean }) {
  const v = (x: string | number) => (fog ? "???" : String(x));
  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 font-semibold">Stocks</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-1">Réf</th>
              <th>Nom</th>
              <th>Qté</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {play.computer.stock.map((r) => (
              <tr key={r.ref} className="border-b border-slate-100">
                <td className="py-1">{r.ref}</td>
                <td>{r.nom}</td>
                <td>{v(r.qte)}</td>
                <td>{v(r.statut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-slate-500">
        Modules ERP complets (10) → Étape 4. Pour l&apos;instant : aperçu stocks /
        commandes / production.
      </p>
      <section>
        <h3 className="mb-2 font-semibold">Commandes</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-1">N°</th>
              <th>Client</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {play.computer.commandes.map((r) => (
              <tr key={r.numero} className="border-b border-slate-100">
                <td className="py-1">{r.numero}</td>
                <td>{r.client}</td>
                <td>{v(r.statut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function OsMailLite({
  play,
  setPlay,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
}) {
  return (
    <ul className="space-y-2">
      {play.computer.emails.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            className={cn(
              "w-full rounded-lg border p-3 text-left",
              e.read ? "bg-slate-50" : "border-sky-300 bg-sky-50"
            )}
            onClick={() => setPlay(osOrdinateurMarkEmailRead(play, e.id))}
          >
            <p className="text-xs text-slate-500">
              {e.from} · J{e.day} {e.read ? "" : "· non lu"}
            </p>
            <p className="font-semibold">{e.subject}</p>
            <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
              {e.body}
            </pre>
          </button>
        </li>
      ))}
    </ul>
  );
}

function OsDashLite({ play, fog }: { play: OsPlayState; fog: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {play.computer.dashboardCards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-slate-50 p-4">
          <p className="text-[10px] uppercase text-slate-500">{c.label}</p>
          <p className="text-lg font-semibold">{fog ? "???" : c.value}</p>
        </div>
      ))}
    </div>
  );
}

function OsChatLite({ play }: { play: OsPlayState }) {
  const thread = play.computer.chatThreads[0];
  const contact = play.computer.chatContacts.find(
    (c) => c.id === thread?.contactId
  );
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">
        {contact ? `${contact.name} · ${contact.role}` : "Chat"}
      </p>
      <div className="space-y-2">
        {(thread?.messages || []).map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] rounded-lg px-3 py-2 text-xs",
              m.from === "me"
                ? "ml-auto bg-sky-600 text-white"
                : "bg-slate-100 text-slate-800"
            )}
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}
