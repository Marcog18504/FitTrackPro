import { Difficulty, GoalStatus, SessionStatus } from "./types";

export const difficulties: Difficulty[] = ["Base", "Intermedio", "Avanzato"];

export const muscleGroups = ["Gambe", "Braccia", "Petto", "Schiena", "Addome", "Spalle"];

export const sessionStatuses: SessionStatus[] = ["Da svolgere", "Completata", "Saltata"];

export const goalStatuses: GoalStatus[] = ["Aperto", "Raggiunto", "In pausa", "Fallito"];

export const emptyData = {
  exercises: [],
  plans: [],
  sessions: [],
  workouts: [],
  goals: [],
};
