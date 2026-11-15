"use client";

import {
  formatOsClock,
  osInterviewSelect,
  osOrdinateurMarkEmailRead,
  osOrdinateurOpenApp,
  osOrdinateurSetAction,
  osVisibiliteFog,
  osVisibiliteInstallSensor,
  type OsComputerAppId,
  type OsPlayState,
} from "@/lib/keyberOs";
import { applyOsBookChoice, osBookErpSnapshot, osBookInterfaceView } from "@/lib/osBookPlay";
import { useKeyberOsRuntime } from "@/lib/keyberOsRuntime";
import { cn } from "@/lib/utils";
import {
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";

type Props = {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
  title: string;
  subtitle: string;
};

export function OsPlayShell({ play, setPlay, title, subtitle }: Props) {
  const { config } = useKeyberOsRuntime();
  const ui = osBookInterfaceView(play);
  const erp = osBookErpSnapshot(play);
  const fog = osVisibiliteFog(play);
  const apps = config.ordinateur.apps;

  if (!ui.showShell) {
    return (
      <SimpleBookPlay play={play} setPlay={setPlay} title={title} subtitle={subtitle} />
    );
  }

  return (
    <div className="flex min-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-lg">
      {/* Sidebar actions */}
      <aside className="flex w-48 shrink-0 flex-col border-r border-white/10 bg-slate-900/80 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Actions
        </p>
        {(
          [
            ["computer", "Ordinateur"],
            ["decide", "Décider"],
            ["interview", "Interview"],
            ["atelier-live", "Live prod"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              "mb-1 rounded-lg px-3 py-2 text-left text-sm font-medium",
              play.activeAction === id
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-white/10"
            )}
            onClick={() => setPlay(osOrdinateurSetAction(play, id))}
          >
            {label}
          </button>
        ))}
        {ui.showObjectives ? (
          <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Objectifs
            </p>
            {play.objectives.map((o) => (
              <p key={o.id} className="text-[11px] text-slate-400">
                {o.status === "COMPLETE" ? "✓" : "·"} {o.titre}
              </p>
            ))}
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {ui.showClock ? (
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
            <span>
              Semaine {play.week} · Jour {play.day} ·{" "}
              <span className="tabular-nums text-emerald-300">
                {formatOsClock(play.minutesSinceStart)}
              </span>
            </span>
            {ui.showProgressionLine ? (
              <span>
                XP {play.xp} · Niv. {play.niveau} · Score {play.score}
              </span>
            ) : null}
          </div>
        ) : null}

        {ui.showErpTiles ? (
          <div className="grid grid-cols-2 gap-2 border-b border-white/10 p-3 sm:grid-cols-4">
            <Kpi
              label="Trésorerie"
              value={
                fog
                  ? "???"
                  : `${erp.tresorerie.toLocaleString("fr-FR")} €`
              }
            />
            <Kpi label="Stock" value={fog ? "???" : String(erp.stock)} />
            <Kpi
              label="Production"
              value={fog ? "???" : String(erp.production)}
            />
            <Kpi
              label="Commandes"
              value={fog ? "???" : String(erp.commandes)}
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>

          {!play.activeAction ? (
            <p className="mt-6 max-w-lg text-sm text-slate-300">
              Ouvre l&apos;Ordinateur (ERP, mails, chat, dashboard), interviewe
              un PNJ, visite le live prod, puis prends une décision. Piloté par
              Keyber OS + fichier de paramétrage.
            </p>
          ) : null}

          {play.activeAction === "computer" ? (
            <OsComputer
              play={play}
              setPlay={setPlay}
              apps={apps}
              fog={fog}
            />
          ) : null}

          {play.activeAction === "decide" ? (
            <OsDecide play={play} setPlay={setPlay} />
          ) : null}

          {play.activeAction === "interview" ? (
            <OsInterviewPanel play={play} setPlay={setPlay} />
          ) : null}

          {play.activeAction === "atelier-live" ? (
            <OsAtelierLive play={play} fog={fog} />
          ) : null}

          {fog ? (
            <button
              type="button"
              className="mt-4 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200"
              onClick={() => setPlay(osVisibiliteInstallSensor(play))}
            >
              Installer un capteur (lever le brouillard ERP)
            </button>
          ) : null}
        </div>

        {ui.showPipelineLog ? (
          <div className="max-h-28 overflow-auto border-t border-white/10 bg-black/40 p-2 font-mono text-[10px] text-emerald-200/80">
            {play.log.slice(-8).map((l, i) => (
              <div key={`${i}-${l.slice(0, 20)}`}>{l}</div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums text-white">{value}</p>
    </div>
  );
}

function OsComputer({
  play,
  setPlay,
  apps,
  fog,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
  apps: Record<OsComputerAppId, boolean>;
  fog: boolean;
}) {
  const APP_META: {
    id: OsComputerAppId;
    titre: string;
    icon: typeof Mail;
  }[] = [
    { id: "erp", titre: "ERP", icon: Database },
    { id: "mail", titre: "Boîte Mail", icon: Mail },
    { id: "dashboard", titre: "Dashboard", icon: LayoutDashboard },
    { id: "documents", titre: "Documents", icon: FileText },
    { id: "chat", titre: "Chat", icon: MessageCircle },
    { id: "browser", titre: "Browser", icon: Globe },
  ];

  if (!play.computerApp) {
    return (
      <div className="mt-4">
        <p className="mb-3 text-sm text-slate-300">
          Ordinateur de production — choisis une application.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {APP_META.filter((a) => apps[a.id]).map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
              onClick={() => setPlay(osOrdinateurOpenApp(play, a.id))}
            >
              <a.icon className="h-5 w-5 text-emerald-300" />
              <span className="text-sm font-semibold">{a.titre}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <p className="text-sm font-semibold capitalize">{play.computerApp}</p>
        <button
          type="button"
          className="rounded p-1 hover:bg-slate-100"
          onClick={() => setPlay(osOrdinateurOpenApp(play, null))}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[420px] overflow-auto p-3 text-sm">
        {play.computerApp === "erp" ? <OsErpTable play={play} fog={fog} /> : null}
        {play.computerApp === "mail" ? (
          <OsMail play={play} setPlay={setPlay} />
        ) : null}
        {play.computerApp === "dashboard" ? (
          <OsDash play={play} fog={fog} />
        ) : null}
        {play.computerApp === "documents" ? (
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
        {play.computerApp === "chat" ? <OsChat play={play} /> : null}
        {play.computerApp === "browser" ? (
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
  );
}

function OsErpTable({ play, fog }: { play: OsPlayState; fog: boolean }) {
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
      <section>
        <h3 className="mb-2 font-semibold">Production</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-1">Ligne</th>
              <th>Produit</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            {play.computer.production.map((r) => (
              <tr key={r.ligne} className="border-b border-slate-100">
                <td className="py-1">{r.ligne}</td>
                <td>{v(r.produitAujourdhui)}</td>
                <td>{v(r.etat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h3 className="mb-2 font-semibold">Équipe / Fournisseurs / Clients</h3>
        <p className="text-xs text-slate-600">
          {play.computer.employes.length} employés ·{" "}
          {play.computer.fournisseurs.length} fournisseurs ·{" "}
          {play.computer.clients.length} clients ·{" "}
          {play.computer.factures.length} factures ·{" "}
          {play.computer.machines.length} machines
        </p>
      </section>
    </div>
  );
}

function OsMail({
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

function OsDash({ play, fog }: { play: OsPlayState; fog: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {play.computer.dashboardCards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-slate-50 p-4">
          <p className="text-[10px] uppercase text-slate-500">{c.label}</p>
          <p className="text-lg font-semibold">
            {fog ? "???" : c.value}
          </p>
        </div>
      ))}
      <div className="col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold text-emerald-900">Live production</p>
        <p className="mt-1 text-sm text-emerald-800">
          {play.computer.production[0]?.ligne || "Ligne"} —{" "}
          {fog ? "???" : play.computer.production[0]?.etat} · produit{" "}
          {fog ? "???" : play.computer.production[0]?.produitAujourdhui}/
          {play.computer.production[0]?.objectifJour}
        </p>
      </div>
    </div>
  );
}

function OsChat({ play }: { play: OsPlayState }) {
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

function OsDecide({
  play,
  setPlay,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
}) {
  const decision = play.decisions[play.stepIndex];
  if (play.finished) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold">Fin de scénario</h2>
        <p className="mt-2 text-sm text-slate-300">
          Score {play.score} · XP {play.xp} · Niveau {play.niveau}
        </p>
      </div>
    );
  }
  if (!decision) {
    return <p className="mt-4 text-sm text-slate-400">Aucune décision.</p>;
  }
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Décision {play.stepIndex + 1}/{play.decisions.length}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{decision.titre}</h2>
      <div className="mt-4 space-y-2">
        {decision.options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="block w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm hover:bg-white/10"
            onClick={() => setPlay(applyOsBookChoice(play, o.id))}
          >
            {o.label}
          </button>
        ))}
      </div>
      {play.feedback ? (
        <p className="mt-3 text-sm text-emerald-300">{play.feedback}</p>
      ) : null}
    </div>
  );
}

function OsInterviewPanel({
  play,
  setPlay,
}: {
  play: OsPlayState;
  setPlay: (s: OsPlayState) => void;
}) {
  const current = play.interviews.find((i) => i.id === play.selectedInterviewId);
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {play.interviews.map((i) => (
          <button
            key={i.id}
            type="button"
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm",
              play.selectedInterviewId === i.id
                ? "bg-violet-600 text-white"
                : "bg-white/10 text-slate-200"
            )}
            onClick={() => setPlay(osInterviewSelect(play, i.id))}
          >
            {i.nom}
          </button>
        ))}
      </div>
      {current ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">
            {current.nom} · {current.role}
          </p>
          <ul className="mt-3 space-y-3">
            {current.lines.map((l, idx) => (
              <li key={idx} className="text-sm">
                <p className="text-slate-400">Toi : {l.q}</p>
                <p className="mt-1 text-slate-100">{current.nom} : {l.a}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Choisis un interlocuteur.</p>
      )}
    </div>
  );
}

function OsAtelierLive({
  play,
  fog,
}: {
  play: OsPlayState;
  fog: boolean;
}) {
  const line = play.computer.production[0];
  const machine = play.computer.machines[0];
  return (
    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-300">
        Vue live production
      </p>
      <p className="mt-2 text-lg font-semibold text-white">
        {line?.ligne || "Ligne"} — {fog ? "???" : line?.etat}
      </p>
      <p className="mt-2 text-sm text-emerald-100/80">
        Produit aujourd&apos;hui :{" "}
        {fog ? "???" : `${line?.produitAujourdhui}/${line?.objectifJour}`} ·
        Machine {machine?.nom} ({fog ? "???" : machine?.etat}) · Stock{" "}
        {fog ? "???" : play.stock}
      </p>
    </div>
  );
}

function SimpleBookPlay({
  play,
  setPlay,
  title,
  subtitle,
}: Props) {
  const decision = play.decisions[play.stepIndex];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-slate-600">{subtitle}</p>
      {play.finished ? (
        <p className="mt-4 text-sm">Fin — score {play.score}</p>
      ) : decision ? (
        <div className="mt-4 space-y-2">
          <p className="font-medium">{decision.titre}</p>
          {decision.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="block w-full rounded-xl border px-4 py-3 text-left text-sm"
              onClick={() => setPlay(applyOsBookChoice(play, o.id))}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
