/** Narration / ending / onboarding copy — Novacier contexte only. */

export type ContexteRuntimeCopy = {
  entrepriseNom: string;
  endingFlash: {
    victoire: string;
    partielle: string;
    echec: string;
  };
  endingNarration: {
    victoire: (q: number, e: number) => string;
    partielle: (q: number, e: number) => string;
    echec: (q: number, e: number) => string;
  };
  startWeekFlash: string;
  startWeekJournal: { titre: string; narration: string };
  rumorFlash: string;
  onboarding: {
    step1Message: { from: string; role: string; text: string };
    step1Journal: { titre: string; narration: string };
    step1Flash: string;
    step2Message: { from: string; role: string; text: string };
    step2Journal: { titre: string; narration: string };
    step2Flash: string;
    step3Message: { from: string; role: string; text: string };
    step3Journal: { titre: string; narration: string };
    step3Flash: string;
  };
  metaJourLabel: (jour: number) => string;
  eventMailFrom: string;
  arrivalJournal: { titre: string; narration: string };
  livreOpened: { titre: string; narration: string };
  alarmLabel: string;
  roleIntroLines: string[];
  roleDescription: string;
  roleFocus: string[];
};

export const novacierRuntimeCopy: ContexteRuntimeCopy = {
  entrepriseNom: "Novacier",
  endingFlash: {
    victoire: "Victoire — contrat client critique tenu",
    partielle: "Victoire partielle",
    echec: "Échec — contrat en danger",
  },
  endingNarration: {
    victoire: (q, e) =>
      `Victoire. ${q} pièces qualité, éthique ${e}. Le client stratégique reste. L'entreprise tient.`,
    partielle: (q, e) =>
      `Victoire partielle. ${q} pièces qualité, éthique ${e}. Le contrat est fragile, mais vivant.`,
    echec: (q, e) =>
      `Échec. ${q} pièces qualité, éthique ${e}. Le client s'éloigne — l'écho de la crise passée.`,
  },
  startWeekFlash: "Jour 1 — 08:15. Mail de direction. Brouillard total.",
  startWeekJournal: {
    titre: "Jour 1 — Le brouillard",
    narration:
      "Lundi. Tous les KPIs affichent ???. La direction demande où en est le retard. La maintenance murmure qu'un capteur est mort.",
  },
  rumorFlash: "Rumeur concurrent / Pologne confirmée via interview",
  onboarding: {
    step1Message: {
      from: "Mentor",
      role: "Mentor",
      text: "Bien. Maintenant va voir la cheffe d'atelier — interview.",
    },
    step1Journal: {
      titre: "Jour 0 — Atelier",
      narration:
        "Le mentor t'a fait ouvrir l'Atelier Live. Les machines respirent. Une ligne clignote déjà rouge.",
    },
    step1Flash: "Étape 1/4 — Atelier découvert",
    step2Message: {
      from: "Mentor",
      role: "Mentor",
      text: "Tu as parlé à l'atelier. Ouvre maintenant l'ordinateur — ERP et mails sont dessus.",
    },
    step2Journal: {
      titre: "Jour 0 — Interview",
      narration:
        "Tu as rencontré la cheffe d'atelier. La confiance se gagne réponse après réponse.",
    },
    step2Flash: "Étape 2/4 — Interview faite",
    step3Message: {
      from: "Mentor",
      role: "Mentor",
      text: "Dernière étape : ton premier objectif. Stabilise la ligne critique quand tu seras prêt.",
    },
    step3Journal: {
      titre: "Jour 0 — Ordinateur",
      narration:
        "Tu as ouvert l'ordinateur de l'entreprise. ERP, mails, chat : tout passe par là.",
    },
    step3Flash: "Étape 3/4 — Ordinateur découvert",
  },
  metaJourLabel: (jour) => `Novacier Jour ${Math.max(1, jour)}`,
  eventMailFrom: "Laurent Moreau <laurent@novacier.fr>",
  arrivalJournal: {
    titre: "Lundi 8h00 — Arrivée",
    narration:
      "Tu franchis la porte de Novacier. Henri te salue. La Semaine Qui Décide De Tout commence.",
  },
  livreOpened: {
    titre: "Livre de Novacier",
    narration:
      "Tu as ouvert le Livre : 1987, quasi-faillite 2022, AutoVolt 45 % du CA. La mémoire du lieu.",
  },
  alarmLabel: "Alarme Machine 3",
  roleDescription:
    "Scénario POC : La Semaine Qui Décide De Tout — contrat AutoVolt.",
  roleFocus: ["Atelier", "Qualité", "AutoVolt"],
  roleIntroLines: [
    "Lundi 8h00. Tu viens d'être nommé Responsable de Production chez Novacier.",
    "120 employés. Quatre machines. AutoVolt = 45 % du CA. En 2022, l'entreprise a failli mourir.",
    "Cette semaine décide de tout : 500 pièces qualité avant vendredi 16h. Laurent écrit déjà. Karim sait un secret. Marie te jauge.",
  ],
};
