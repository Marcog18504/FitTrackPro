import { Difficulty, GoalStatus, GoalType, SessionStatus } from "./types";

export const difficulties: Difficulty[] = ["Base", "Intermedio", "Avanzato"];

export const muscleGroups = ["Gambe", "Braccia", "Petto", "Schiena", "Addome", "Spalle"];

export const sessionStatuses: SessionStatus[] = ["Da svolgere", "Completata", "Saltata"];

export const goalStatuses: GoalStatus[] = ["Aperto", "Raggiunto", "Fallito"];

export const goalTypes: GoalType[] = [
  "Manuale",
  "Numero allenamenti",
  "Minuti totali",
  "Frequenza settimanale",
  "Carico su esercizio",
  "Completamento scheda",
];

export const emptyData = {
  exercises: [],
  plans: [],
  sessions: [],
  workouts: [],
  goals: [],
};
