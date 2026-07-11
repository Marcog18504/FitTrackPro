export type Difficulty = "Base" | "Intermedio" | "Avanzato";

export type SessionStatus = "Da svolgere" | "Completata" | "Saltata";

export type GoalStatus = "Aperto" | "Raggiunto" | "In pausa" | "Fallito";

export type Exercise = {
  id: string;
  name: string;
  description: string;
  primaryMuscle: string;
  secondaryMuscles: string;
  difficulty: Difficulty;
  equipment: string;
  recommendedSets: number;
  recommendedReps: number;
  estimatedDurationMinutes: number;
  notes: string;
};

export type PlanExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: number;
};

export type WorkoutPlanDay = {
  id: string;
  name: string;
  items: PlanExercise[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  goal: string;
  level: Difficulty;
  durationMinutes: number;
  frequencyPerWeek: number;
  exerciseIds: string[];
  restSeconds: number;
  days: WorkoutPlanDay[];
  notes: string;
};

export type PlannedSession = {
  id: string;
  title: string;
  date: string;
  type: string;
  planId?: string;
  planDayId?: string;
  exerciseIds: string[];
  status: SessionStatus;
  notes: string;
};

export type WorkoutExerciseLoad = {
  planItemId: string;
  loadKg: number;
};

export type WorkoutLog = {
  id: string;
  title: string;
  date: string;
  planId?: string;
  planDayId?: string;
  durationMinutes: number;
  exerciseLoads: WorkoutExerciseLoad[];
  effort: number;
  notes: string;
};

export type FitnessGoal = {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  startDate: string;
  dueDate: string;
  status: GoalStatus;
  notes: string;
};

export type FitnessData = {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  sessions: PlannedSession[];
  workouts: WorkoutLog[];
  goals: FitnessGoal[];
};

export type Entity = "exercise" | "plan" | "session" | "workout" | "goal";

export type EditingState = { entity: Entity; item?: unknown } | null;

export type SelectedState = { entity: Entity; item: unknown } | null;

export type FitnessStats = {
  completedSessions: number;
  plannedThisWeek: number;
  totalMinutes: number;
  reachedGoals: number;
  muscleCounts: Record<string, number>;
};
