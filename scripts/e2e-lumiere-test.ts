/**
 * Étape 38 — parcours Test E2E Lumière (headless).
 * Ordinateur → Interview → Live → Décider → DayEnd → Journal/Livre.
 * Corrections bugs seulement côté app ; ce script prouve le feeling path.
 */

import fs from "fs";
import { applyOsBookChoice, createOsBookPlayState } from "../lib/osBookPlay";
import {
  osOrdinateurMarkEmailRead,
  osOrdinateurOpenApp,
  osOrdinateurSetAction,
} from "../lib/keyberOs/ordinateur";
import {
  osApplyDialogueChoice,
  osInterviewSelect,
} from "../lib/keyberOs/interviews";
import {
  osCycleVieCloseAndAdvance,
  osCycleVieForceDayEnd,
} from "../lib/keyberOs/cycleVie";
import { livreFromParam, summarizeLivreLore } from "../lib/osLivre";
import { ensureContractKeysInParam } from "../lib/scenarioFileContract";
import { resolveCharacterId } from "../lib/characterStyle";
import type { OsPlayState } from "../lib/keyberOs/types";

type Issue = { severity: "bug" | "warn" | "ok"; message: string };

function snap(label: string, play: OsPlayState): string {
  return `[${label}] finished=${play.finished} step=${play.stepIndex}/${play.decisions.length} day=${play.day} action=${play.activeAction} app=${play.computerApp} journal=${(play.world?.journal || []).length} dayEnd=${Boolean(play.world?.showDayEnd)}`;
}

function assertNoNovacierBleed(play: OsPlayState, issues: Issue[]) {
  const blob = JSON.stringify({
    paramSource: play.paramSource,
    log: play.log.slice(-20),
    feedback: play.feedback,
    entreprise: play.param?.Entreprise ?? (play.param as { entreprise?: string })?.entreprise,
    contacts: play.computer?.chatContacts?.map((c) => c.name),
  });
  if (/novacier/i.test(blob)) {
    issues.push({
      severity: "bug",
      message: "Fuite Novacier détectée dans l'état / logs de session OS",
    });
  } else {
    issues.push({
      severity: "ok",
      message: "Pas de fuite Novacier dans paramSource/log/contacts",
    });
  }
}

function main() {
  const issues: Issue[] = [];
  const lines: string[] = [];

  const raw = JSON.parse(
    fs.readFileSync(
      "data/scenarios/lumiere-co/lumiere-co_logisticien-histoire_v1.json",
      "utf8"
    )
  );
  const param = ensureContractKeysInParam(raw);
  const source = {
    kind: "embedded" as const,
    fileName: String(param.fichier || "lumiere.json"),
    relativePath: `data/scenarios/lumiere-co/${param.fichier}`,
    label: `source = fichier ${param.fichier} (embedded)`,
  };

  let play = createOsBookPlayState(param as never, "e2e-lumiere-hist", source);
  lines.push(snap("boot", play));

  if (!play.paramSource?.label.includes("source = fichier")) {
    issues.push({ severity: "bug", message: "Boot sans log source fichier" });
  } else {
    issues.push({ severity: "ok", message: play.paramSource.label });
  }

  if (!play.computer?.stock?.length) {
    issues.push({ severity: "bug", message: "ERP stock vide après boot" });
  }
  if (!play.computer?.emails?.length) {
    issues.push({ severity: "bug", message: "Mails vides après boot" });
  }
  if (!play.computer?.machines?.length) {
    issues.push({ severity: "bug", message: "Machines atelier vides après boot" });
  }
  if (!play.interviews?.length) {
    issues.push({ severity: "bug", message: "Interviews vides après boot" });
  }
  if (!play.decisions?.length) {
    issues.push({ severity: "bug", message: "Décisions vides après boot" });
  }

  assertNoNovacierBleed(play, issues);

  // —— Ordinateur ——
  play = osOrdinateurSetAction(play, "computer");
  play = osOrdinateurOpenApp(play, "erp");
  lines.push(snap("erp", play));
  if (play.computerApp !== "erp") {
    issues.push({ severity: "bug", message: "Open ERP n'a pas posé computerApp=erp" });
  }

  play = osOrdinateurOpenApp(play, "mail");
  const mailId = play.computer?.emails?.[0]?.id;
  if (mailId) {
    play = osOrdinateurMarkEmailRead(play, mailId);
    const stillUnread =
      play.computer?.emails?.find((e) => e.id === mailId)?.read === false;
    if (stillUnread) {
      issues.push({
        severity: "bug",
        message: "Mark email read n'a pas basculé read",
      });
    } else {
      issues.push({ severity: "ok", message: `Mail ${mailId} lu` });
    }
  }
  lines.push(snap("mail", play));

  play = osOrdinateurOpenApp(play, "chat");
  play = osOrdinateurOpenApp(play, "dashboard");
  play = osOrdinateurOpenApp(play, "documents");
  play = osOrdinateurOpenApp(play, "browser");
  lines.push(snap("apps", play));

  // —— Interview ——
  const iv = play.interviews[0];
  if (iv) {
    play = osInterviewSelect(play, iv.id);
    const q = iv.questions?.[0];
    const choice = q?.choices?.[0];
    if (q && choice) {
      const beforeJournal = (play.world?.journal || []).length;
      play = osApplyDialogueChoice(play, iv.id, choice);
      const afterJournal = (play.world?.journal || []).length;
      if (afterJournal <= beforeJournal) {
        issues.push({
          severity: "warn",
          message:
            "Interview choice n'a pas ajouté d'entrée journal (peut être OK)",
        });
      } else {
        issues.push({ severity: "ok", message: "Interview → journal +" });
      }
    } else {
      issues.push({
        severity: "bug",
        message: `Interview ${iv.id} sans questions/choices riches`,
      });
    }
  }
  lines.push(snap("interview", play));

  // —— Live (atelier) ——
  play = osOrdinateurSetAction(play, "atelier-live");
  lines.push(snap("live", play));
  if (play.activeAction !== "atelier-live") {
    issues.push({
      severity: "bug",
      message: "Action atelier-live non posée",
    });
  } else if (!(play.computer?.machines?.length > 0)) {
    issues.push({
      severity: "bug",
      message: "Live ouvert mais machines vides",
    });
  } else {
    issues.push({
      severity: "ok",
      message: `Live atelier · ${play.computer.machines.length} machine(s)`,
    });
  }

  // —— Décider ——
  play = osOrdinateurSetAction(play, "decide");
  const d0 = play.decisions[play.stepIndex];
  if (d0?.options?.[0]) {
    const before = play.stepIndex;
    play = applyOsBookChoice(play, d0.options[0].id);
    if (play.stepIndex !== before + 1 && !play.finished) {
      issues.push({
        severity: "bug",
        message: `Décision ${d0.id} n'a pas avancé stepIndex (${before}→${play.stepIndex})`,
      });
    } else {
      issues.push({
        severity: "ok",
        message: `Décision ${d0.id} / ${d0.options[0].id}`,
      });
    }
  } else {
    issues.push({ severity: "bug", message: "Pas d'option pour décider" });
  }
  lines.push(snap("decide", play));

  // —— DayEnd ——
  const dayBefore = play.day;
  play = osCycleVieForceDayEnd(play);
  lines.push(snap("dayend", play));
  if (!play.world?.showDayEnd) {
    issues.push({ severity: "bug", message: "DayEnd forcé sans showDayEnd" });
  } else {
    issues.push({ severity: "ok", message: "DayEnd overlay OK" });
  }

  play = osCycleVieCloseAndAdvance(play);
  lines.push(snap("day+1", play));
  if (play.world?.showDayEnd) {
    issues.push({
      severity: "bug",
      message: "DayEnd toujours ouvert après CloseAndAdvance",
    });
  } else if (play.day <= dayBefore && !play.finished) {
    issues.push({
      severity: "bug",
      message: `Jour non avancé (${dayBefore}→${play.day})`,
    });
  } else {
    issues.push({
      severity: "ok",
      message: `Passage de jour ${dayBefore}→${play.day}`,
    });
  }

  // —— Journal / Livre ——
  const journalLen = (play.world?.journal || []).length;
  const journalBlob = JSON.stringify(play.world?.journal || []);
  if (/novacier/i.test(journalBlob)) {
    issues.push({
      severity: "bug",
      message: "Journal contient une mention Novacier",
    });
  }
  const livre = livreFromParam(param);
  const livreLines = summarizeLivreLore(livre);
  if (journalLen === 0) {
    issues.push({
      severity: "warn",
      message:
        "Journal vide après parcours (décision/interview devraient écrire)",
    });
  } else {
    issues.push({ severity: "ok", message: `Journal ${journalLen} entrée(s)` });
  }
  if (livreLines.length === 0) {
    issues.push({ severity: "bug", message: "Livre lore vide" });
  } else {
    issues.push({ severity: "ok", message: `Livre ${livreLines.length} ligne(s)` });
  }
  if (/novacier/i.test(JSON.stringify(livre))) {
    issues.push({
      severity: "bug",
      message: "Livre param contient Novacier",
    });
  }

  const contactNames = (play.computer?.chatContacts || []).map((c) => c.name);
  if (!contactNames.length) {
    issues.push({
      severity: "warn",
      message: "Aucun chatContact pour portraits Journal OS",
    });
  } else {
    issues.push({
      severity: "ok",
      message: `Contacts Journal OS: ${contactNames.slice(0, 3).join(", ")}`,
    });
  }

  const portraitSamples = ["Samir", "Léa", "Claire", "iv-samir", "iv-lea"];
  const missingPortraits = portraitSamples.filter(
    (s) => !resolveCharacterId(s)
  );
  if (missingPortraits.length) {
    issues.push({
      severity: "bug",
      message: `Portraits PNJ manquants: ${missingPortraits.join(", ")}`,
    });
  } else {
    issues.push({
      severity: "ok",
      message: "Portraits SVG Lumière résolus (Samir / Léa / Claire)",
    });
  }

  const bugs = issues.filter((i) => i.severity === "bug");
  const warns = issues.filter((i) => i.severity === "warn");

  console.log(lines.join("\n"));
  console.log("--- issues ---");
  for (const i of issues) {
    console.log(`${i.severity.toUpperCase()}: ${i.message}`);
  }
  console.log(`SUMMARY bugs=${bugs.length} warns=${warns.length}`);
  if (bugs.length) process.exitCode = 1;
}

main();
