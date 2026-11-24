/**
 * Actions du shell joueur — génériques (aucun scénario).
 */

import type { OsPlayerAction } from "@/lib/keyberOs/types";
import type { LucideIcon } from "lucide-react";
import { Factory, MessagesSquare, Monitor, Scale } from "lucide-react";

export type OsShellActionDef = {
  id: OsPlayerAction & string;
  titre: string;
  description: string;
  timeCostMinutes: number;
  icon: LucideIcon;
};

export const OS_SHELL_ACTIONS: OsShellActionDef[] = [
  {
    id: "computer",
    titre: "Accès Ordinateur",
    description: "ERP, mails, chat…",
    timeCostMinutes: 0,
    icon: Monitor,
  },
  {
    id: "interview",
    titre: "Interview",
    description: "Équipe & interlocuteurs",
    timeCostMinutes: 15,
    icon: MessagesSquare,
  },
  {
    id: "decide",
    titre: "Décider",
    description: "Décision du scénario",
    timeCostMinutes: 20,
    icon: Scale,
  },
  {
    id: "atelier-live",
    titre: "Vue Live Production",
    description: "Flux, postes, machines — selon le contexte",
    timeCostMinutes: 10,
    icon: Factory,
  },
];
