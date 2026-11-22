/**
 * Keyber OS — Progression, Scores & Niveaux (Étape 19)
 * XP global + XP compétences ciblées/générales depuis ids param.
 * Aucun nom de compétence hardcodé (Novacier / AutoVolt…).
 */

import type { ScenarioParamFile } from "@/lib/bookGenerationPrompt";
import { getOsRuntimeConfig, isOsModuleEnabled } from "@/lib/keyberOsRuntime";
import type {
  OsCompetenceProgress,
  OsPlayState,
  OsProgressionBlock,
  OsSkillCatalogEntry,
  OsSkillImpact,
} from "@/lib/keyberOs/types";

/** Seuil XP interne d'une compétence pour +1 niveau skill (comme POC). */
export const OS_XP_PER_SKILL_LEVEL_DEFAULT = 100;

export function osSkillSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48) || "competence";
}

/**
 * Catalogue depuis le fichier de paramétrage Book.
 * Mode Compétence → compétence principale + sélectionnées.
 * Mode Histoire → compétences sélectionnées uniquement.
 */
export function osSkillsFromParam(
  param: ScenarioParamFile
): OsSkillCatalogEntry[] {
  const out: OsSkillCatalogEntry[] = [];
  const seen = new Set<string>();

  const push = (nom: string, type: "generale" | "ciblee") => {
    const n = nom.trim();
    if (!n) return;
    const id = osSkillSlug(n);
    if (seen.has(id)) return;
    seen.add(id);
    out.push({ id, nom: n, type });
  };

  if (param.Mode === "Compétence" && param.Compétence?.trim()) {
    push(param.Compétence, "ciblee");
  }

  for (const c of param["Compétences sélectionnées"] || []) {
    if (c?.nom) push(c.nom, "ciblee");
  }

  return out;
}

export function osProgressionBootFromParam(
  param: ScenarioParamFile
): OsProgressionBlock {
  const catalog = osSkillsFromParam(param);
  const competencesCiblees: Record<string, OsCompetenceProgress> = {};
  const competencesGenerales: Record<string, OsCompetenceProgress> = {};
  for (const s of catalog) {
    const prog: OsCompetenceProgress = {
      niveau: 1,
      xp: 0,
      ...(s.type === "ciblee"
        ? { indicateursValides: [false, false, false] }
        : {}),
    };
    if (s.type === "ciblee") competencesCiblees[s.id] = prog;
    else competencesGenerales[s.id] = prog;
  }
  return {
    xp: 0,
    niveau: 1,
    score: 0,
    competencesGenerales,
    competencesCiblees,
    catalog,
  };
}

function skillLevelThreshold(): number {
  return (
    getOsRuntimeConfig().progression.xpPerSkillLevel ||
    OS_XP_PER_SKILL_LEVEL_DEFAULT
  );
}

function ensureProgression(state: OsPlayState): OsPlayState {
  if (state.progression?.catalog?.length) return state;
  const boot = osProgressionBootFromParam(state.param);
  return {
    ...state,
    progression: {
      ...boot,
      xp: state.progression?.xp ?? state.xp ?? 0,
      niveau: state.progression?.niveau ?? state.niveau ?? 1,
      score: state.progression?.score ?? state.score ?? 0,
      competencesGenerales: {
        ...boot.competencesGenerales,
        ...(state.progression?.competencesGenerales ?? {}),
      },
      competencesCiblees: {
        ...boot.competencesCiblees,
        ...(state.progression?.competencesCiblees ?? {}),
      },
    },
  };
}

function resolveType(
  state: OsPlayState,
  competenceId: string,
  hint?: "generale" | "ciblee"
): "generale" | "ciblee" {
  if (hint) return hint;
  const cat = state.progression?.catalog?.find((c) => c.id === competenceId);
  if (cat) return cat.type;
  if (state.progression?.competencesGenerales?.[competenceId]) return "generale";
  return "ciblee";
}

function skillLabel(state: OsPlayState, competenceId: string): string {
  return (
    state.progression?.catalog?.find((c) => c.id === competenceId)?.nom ??
    competenceId
  );
}

/**
 * Ajoute de l'XP à une compétence (id param). Monte le niveau skill si seuil atteint.
 * Optionnellement bump l'XP global (défaut : non — osProgressionApply gère le global).
 */
export function osAddSkillXp(
  state: OsPlayState,
  competenceId: string,
  amount: number,
  opts?: {
    type?: "generale" | "ciblee";
    indicateurIndex?: number;
    bumpGlobal?: boolean;
  }
): OsPlayState {
  if (amount <= 0) return state;
  let next = ensureProgression(state);
  const id = osSkillSlug(competenceId);
  const type = resolveType(next, id, opts?.type);
  const threshold = skillLevelThreshold();

  const bucket =
    type === "generale"
      ? { ...(next.progression!.competencesGenerales ?? {}) }
      : { ...(next.progression!.competencesCiblees ?? {}) };

  const current: OsCompetenceProgress = bucket[id] ?? {
    niveau: 1,
    xp: 0,
    ...(type === "ciblee" ? { indicateursValides: [false, false, false] } : {}),
  };

  let xp = current.xp + amount;
  let niveau = current.niveau;
  let leveled = 0;
  while (xp >= threshold && niveau < 5) {
    xp -= threshold;
    niveau += 1;
    leveled += 1;
  }
  if (niveau >= 5) {
    niveau = 5;
    xp = Math.min(xp, threshold - 1);
  }

  const indicateursValides = [
    ...(current.indicateursValides ?? [false, false, false]),
  ];
  if (
    type === "ciblee" &&
    typeof opts?.indicateurIndex === "number" &&
    opts.indicateurIndex >= 0 &&
    opts.indicateurIndex < 3
  ) {
    indicateursValides[opts.indicateurIndex] = true;
  }

  const updated: OsCompetenceProgress = {
    niveau,
    xp,
    ...(type === "ciblee" ? { indicateursValides } : {}),
  };
  bucket[id] = updated;

  const label = skillLabel(next, id);
  let globalXp = next.progression!.xp;
  let flatXp = next.xp;
  if (opts?.bumpGlobal) {
    globalXp += amount;
    flatXp += amount;
  }

  next = {
    ...next,
    xp: flatXp,
    niveau: next.progression!.niveau,
    progression: {
      ...next.progression!,
      xp: globalXp,
      competencesGenerales:
        type === "generale"
          ? bucket
          : next.progression!.competencesGenerales,
      competencesCiblees:
        type === "ciblee" ? bucket : next.progression!.competencesCiblees,
    },
    feedback:
      leveled > 0
        ? `${label} : Niveau ${niveau} !`
        : next.feedback,
    log: [
      ...next.log,
      leveled > 0
        ? `Progression → skill « ${label} » +${amount} XP → niv. ${niveau}`
        : `Progression → skill « ${label} » +${amount} XP (${xp}/${threshold})`,
    ],
  };

  // Ensure catalog has the id
  if (!next.progression!.catalog?.some((c) => c.id === id)) {
    next = {
      ...next,
      progression: {
        ...next.progression!,
        catalog: [
          ...(next.progression!.catalog ?? []),
          { id, nom: label, type },
        ],
      },
    };
  }

  return next;
}

export function osApplySkillImpacts(
  state: OsPlayState,
  impacts: OsSkillImpact[] | undefined
): { state: OsPlayState; debrief: string[] } {
  if (!impacts?.length) return { state, debrief: [] };
  let next = state;
  const debrief: string[] = [];
  for (const impact of impacts) {
    if (!impact.competenceId || impact.xp <= 0) continue;
    next = osAddSkillXp(next, impact.competenceId, impact.xp, {
      type: impact.type,
      indicateurIndex: impact.indicateurIndex,
    });
    const type = resolveType(next, osSkillSlug(impact.competenceId), impact.type);
    const nom = skillLabel(next, osSkillSlug(impact.competenceId));
    const typeLabel = type === "generale" ? "Générale" : "Ciblée";
    debrief.push(
      `${typeLabel} — ${nom} +${impact.xp}${
        impact.feedback ? ` : ${impact.feedback}` : ""
      }`
    );
  }
  if (debrief.length) {
    next = {
      ...next,
      world: {
        ...next.world,
        lastSkillDebrief: [
          ...debrief,
          ...(next.world?.lastSkillDebrief ?? []),
        ].slice(0, 12),
      },
    };
  }
  return { state: next, debrief };
}

/**
 * Après un choix : XP global + XP compétences (impacts choix / décision / catalogue param).
 */
export function osProgressionApply(state: OsPlayState): OsPlayState {
  if (!isOsModuleEnabled("progression")) {
    return {
      ...state,
      log: [
        ...state.log,
        "Progression, Scores & Niveaux → module désactivé (Admin)",
      ],
    };
  }

  const cfg = getOsRuntimeConfig().progression;
  let next = ensureProgression(state);

  const xpGain = cfg.xpPerChoice;
  const scoreGain = cfg.scorePerChoice;
  next = {
    ...next,
    xp: next.xp + xpGain,
    score: next.score + scoreGain,
    log: [...next.log],
  };
  next.progression = {
    ...next.progression!,
    xp: (next.progression?.xp ?? 0) + xpGain,
    score: (next.progression?.score ?? 0) + scoreGain,
  };

  const threshold = next.niveau * cfg.xpPerLevel;
  if (next.xp >= threshold) {
    next.niveau += 1;
    next.progression = {
      ...next.progression!,
      niveau: next.niveau,
    };
    next.log.push(
      `Progression → niveau global ${next.niveau} (XP ${next.xp}, seuil ${cfg.xpPerLevel}/niv)`
    );
  } else {
    next.log.push(
      `Progression → +${xpGain} XP / +${scoreGain} score (total XP ${next.xp})`
    );
  }

  // Skill XP : pipeline appelle avant stepIndex++ → décision courante = stepIndex
  const currentDecision = state.decisions[state.stepIndex];
  const lastChoiceId = state.world?.dayDecisionId;
  const choice = currentDecision?.options.find((o) => o.id === lastChoiceId);

  const impacts: OsSkillImpact[] = [
    ...(choice?.competenceImpacts ?? []),
  ];

  // Fallback : XP skill sur compétences du param (Mode Compétence / sélection)
  if (cfg.skillXpEnabled !== false && !impacts.length) {
    const skillXp = cfg.xpPerSkillChoice ?? 15;
    const catalog = next.progression?.catalog ?? [];
    if (currentDecision?.competenceId) {
      impacts.push({
        competenceId: currentDecision.competenceId,
        type: "ciblee",
        xp: skillXp,
        feedback: `Décision « ${currentDecision.titre} »`,
      });
    } else if (catalog.length) {
      const primary = catalog.find((c) => c.type === "ciblee") ?? catalog[0]!;
      impacts.push({
        competenceId: primary.id,
        type: primary.type,
        xp: skillXp,
        feedback: `Décision « ${currentDecision?.titre ?? "choix"} »`,
      });
    }
  }

  if (impacts.length) {
    const applied = osApplySkillImpacts(next, impacts);
    next = applied.state;
  }

  return next;
}

export function osSkillProgressList(state: OsPlayState): {
  id: string;
  nom: string;
  type: "generale" | "ciblee";
  niveau: number;
  xp: number;
  threshold: number;
}[] {
  const s = ensureProgression(state);
  const threshold = skillLevelThreshold();
  const catalog = s.progression?.catalog ?? [];
  if (catalog.length) {
    return catalog.map((c) => {
      const prog =
        c.type === "generale"
          ? s.progression!.competencesGenerales[c.id]
          : s.progression!.competencesCiblees[c.id];
      return {
        id: c.id,
        nom: c.nom,
        type: c.type,
        niveau: prog?.niveau ?? 1,
        xp: prog?.xp ?? 0,
        threshold,
      };
    });
  }
  const rows = [
    ...Object.entries(s.progression?.competencesCiblees ?? {}).map(
      ([id, p]) => ({
        id,
        nom: id,
        type: "ciblee" as const,
        niveau: p.niveau,
        xp: p.xp,
        threshold,
      })
    ),
    ...Object.entries(s.progression?.competencesGenerales ?? {}).map(
      ([id, p]) => ({
        id,
        nom: id,
        type: "generale" as const,
        niveau: p.niveau,
        xp: p.xp,
        threshold,
      })
    ),
  ];
  return rows;
}
