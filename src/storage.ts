import AsyncStorage from "@react-native-async-storage/async-storage";
import { FitnessData } from "./types";
import { seedData } from "./seed";
import { makeId } from "./utils";
import { muscleGroups } from "./constants";

const STORAGE_KEY = "fittrackpro:data:v1";

export async function loadFitnessData(): Promise<FitnessData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await saveFitnessData(seedData);
    return seedData;
  }

  const parsed = JSON.parse(raw) as FitnessData;
  const normalized = normalizeFitnessData(parsed);
  await saveFitnessData(normalized);
  return normalized;
}

export async function saveFitnessData(data: FitnessData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function resetFitnessData() {
  await saveFitnessData(seedData);
  return seedData;
}

function normalizeFitnessData(data: FitnessData): FitnessData {
  const plans = data.plans.map((plan) => {
    const legacy = plan as typeof plan & { duration?: string; frequency?: string };
    const legacyExerciseIds = plan.exerciseIds ?? [];
    const days =
      plan.days && plan.days.length > 0
        ? plan.days
        : [
            {
              id: makeId("day"),
              name: "Giorno 1",
              items: legacyExerciseIds.map((exerciseId) => ({
                id: makeId("pe"),
                exerciseId,
                sets: 3,
                reps: 10,
              })),
            },
          ];

    const exerciseIds = Array.from(new Set(days.flatMap((day) => day.items.map((item) => item.exerciseId))));

    return {
      ...plan,
      durationMinutes: safeNumber(plan.durationMinutes, extractNumbers(legacy.duration ?? "")[0] ?? 45),
      frequencyPerWeek: safeNumber(plan.frequencyPerWeek, extractNumbers(legacy.frequency ?? "")[0] ?? 3),
      restSeconds: Number.isFinite(Number(plan.restSeconds)) ? Number(plan.restSeconds) : 90,
      days,
      exerciseIds,
    };
  });

  return {
    ...data,
    exercises: data.exercises.map((exercise) => {
      const legacy = exercise as typeof exercise & { recommended?: string };
      const extracted = extractNumbers(legacy.recommended ?? "");
      return {
        ...exercise,
        primaryMuscle: normalizeMuscleGroup(exercise.primaryMuscle),
        recommendedSets: safeNumber(exercise.recommendedSets, extracted[0] ?? 3),
        recommendedReps: safeNumber(exercise.recommendedReps, extracted[1] ?? 10),
        estimatedDurationMinutes: safeNumber(exercise.estimatedDurationMinutes, 5),
      };
    }),
    plans,
    sessions: data.sessions.map((session) => {
      const plan = plans.find((entry) => entry.id === session.planId);
      const existingDay = plan?.days.find((day) => day.id === session.planDayId);
      const selectedDay = existingDay ?? plan?.days[0];

      return {
        ...session,
        planDayId: selectedDay?.id ?? session.planDayId,
        exerciseIds: selectedDay ? Array.from(new Set(selectedDay.items.map((item) => item.exerciseId))) : (session.exerciseIds ?? []),
      };
    }),
    workouts: data.workouts.map((workout) => {
      const legacyWorkout = workout as typeof workout & { loadKg?: number };
      const plan = plans.find((entry) => entry.id === workout.planId);
      const existingDay = plan?.days.find((day) => day.id === workout.planDayId);
      const selectedDay = existingDay ?? plan?.days[0];
      const existingLoads = new Map((workout.exerciseLoads ?? []).map((entry) => [entry.planItemId, Number(entry.loadKg)]));

      return {
        ...workout,
        planDayId: selectedDay?.id ?? workout.planDayId,
        exerciseLoads:
          selectedDay?.items.map((item) => ({
            planItemId: item.id,
            loadKg: safeNumber(existingLoads.get(item.id), 0),
          })) ??
          (Number.isFinite(Number(legacyWorkout.loadKg)) && Number(legacyWorkout.loadKg) > 0
            ? [{ planItemId: "legacy", loadKg: Number(legacyWorkout.loadKg) }]
            : []),
      };
    }),
  };
}

function safeNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractNumbers(value: string) {
  return value.match(/\d+/g)?.map(Number) ?? [];
}

function normalizeMuscleGroup(value: unknown) {
  const cleaned = String(value ?? "").trim();
  const normalized = cleaned.toLocaleLowerCase("it-IT");

  if (normalized === "core" || normalized === "addominali") return "Addome";
  return muscleGroups.find((group) => group.toLocaleLowerCase("it-IT") === normalized) ?? "Gambe";
}
