export type ActionType =
  | "CONSULT_MODULE"
  | "VIEW_DASHBOARD"
  | "ANALYZE_DATA"
  | "INTERVIEW"
  | "DECIDE";

export type Action = {
  id: string;
  type: ActionType;
  titre: string;
  icone: string;
  description: string;
};

export type GameState = {
  tresorerie: number;
  production: number;
  moral: number;
  [key: string]: number;
};

export type Personnage = {
  id: string;
  nom: string;
  role: string;
  avatar: string;
  dialogues: string[];
};

export type Decision = {
  id: string;
  titre: string;
  impact: string;
  deltas?: Partial<GameState>;
};
