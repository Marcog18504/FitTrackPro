import { FitnessData, FitnessGoal, GoalStatus, GoalType, WorkoutLog } from "./types";
import { today } from "./utils";

export function normalizeGoal(goal: FitnessGoal, data: FitnessData): FitnessGoal {
  const goalType = normalizeGoalType(goal);
  const current = goalType === "Manuale" ? Number(goal.current) : calculateGoalCurrent({ ...goal, goalType }, data);
  return normalizeGoalStatus({ ...goal, category: goalType, goalType, current });
}

export function refreshGoals(data: FitnessData): FitnessGoal[] {
  return data.goals.map((goal) => normalizeGoal(goal, data));
}

export function normalizeGoalStatus(goal: FitnessGoal): FitnessGoal {
  const normalizedStatus: GoalStatus =
    goal.status === "Aperto" || goal.status === "Raggiunto" || goal.status === "Fallito" ? goal.status : "Aperto";

  if (Number(goal.current) >= Number(goal.target)) {
    return { ...goal, status: "Raggiunto" as GoalStatus };
  }

  if (isPastDue(goal.dueDate)) {
    return { ...goal, status: "Fallito" as GoalStatus };
  }

  if (normalizedStatus === "Raggiunto" || normalizedStatus === "Fallito") {
    return { ...goal, status: "Aperto" as GoalStatus };
  }

  return { ...goal, status: normalizedStatus };
}

export function calculateGoalCurrent(goal: FitnessGoal, data: FitnessData) {
  const workouts = data.workouts.filter((workout) => isWorkoutInGoalRange(workout, goal));

  if (goal.goalType === "Numero allenamenti") {
    return workouts.length;
  }

  if (goal.goalType === "Minuti totali") {
    return workouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
  }

  if (goal.goalType === "Frequenza settimanale") {
    return getBestWeeklyFrequency(workouts);
  }

  if (goal.goalType === "Carico su esercizio") {
    return getBestExerciseLoad(goal, workouts, data);
  }

  if (goal.goalType === "Completamento scheda") {
    return workouts.filter((workout) => workout.planId === goal.linkedPlanId).length;
  }

  return Number(goal.current);
}

function normalizeGoalType(goal: FitnessGoal): GoalType {
  const legacyType = (goal as FitnessGoal & { goalType?: string }).goalType;
  if (isGoalType(legacyType)) return legacyType;

  const descriptor = `${goal.title} ${goal.description} ${goal.category}`.toLocaleLowerCase("it-IT");
  if (descriptor.includes("minut") || descriptor.includes("durata") || descriptor.includes("tempo")) return "Minuti totali";
  if (descriptor.includes("carico") || descriptor.includes("kg") || descriptor.includes("peso")) return "Carico su esercizio";
  if (descriptor.includes("scheda") || descriptor.includes("programma")) return "Completamento scheda";
  if (descriptor.includes("frequenza") || descriptor.includes("settimana")) return "Frequenza settimanale";
  if (descriptor.includes("allenament") || descriptor.includes("session") || descriptor.includes("workout")) return "Numero allenamenti";
  return "Manuale";
}

function isGoalType(value: unknown): value is GoalType {
  return (
    value === "Manuale" ||
    value === "Numero allenamenti" ||
    value === "Minuti totali" ||
    value === "Frequenza settimanale" ||
    value === "Carico su esercizio" ||
    value === "Completamento scheda"
  );
}

function isWorkoutInGoalRange(workout: WorkoutLog, goal: FitnessGoal) {
  return workout.date >= goal.startDate && (!goal.dueDate || workout.date <= goal.dueDate);
}

function getBestWeeklyFrequency(workouts: WorkoutLog[]) {
  const counts = new Map<string, number>();

  for (const workout of workouts) {
    const weekKey = getWeekKey(workout.date);
    if (!weekKey) continue;
    counts.set(weekKey, (counts.get(weekKey) ?? 0) + 1);
  }

  return Math.max(0, ...counts.values());
}

function getWeekKey(dateKey: string) {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return "";

  const monday = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBestExerciseLoad(goal: FitnessGoal, workouts: WorkoutLog[], data: FitnessData) {
  if (!goal.linkedExerciseId) return 0;

  let bestLoad = 0;
  for (const workout of workouts) {
    const plan = data.plans.find((entry) => entry.id === workout.planId);
    const day = plan?.days.find((entry) => entry.id === workout.planDayId);
    if (!day) continue;

    for (const load of workout.exerciseLoads) {
      const planItem = day.items.find((item) => item.id === load.planItemId);
      if (planItem?.exerciseId === goal.linkedExerciseId) {
        bestLoad = Math.max(bestLoad, load.loadKg);
      }
    }
  }

  return bestLoad;
}

function parseDateKey(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isPastDue(dueDate: string) {
  return Boolean(dueDate) && dueDate < today();
}
