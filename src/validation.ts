import {
  Entity,
  Exercise,
  FitnessData,
  FitnessGoal,
  GoalType,
  PlannedSession,
  WorkoutLog,
  WorkoutPlan,
} from "./types";
import { goalTypes, muscleGroups } from "./constants";
import { today } from "./utils";

type ValidationResult =
  | { ok: true; item: Exercise | WorkoutPlan | PlannedSession | WorkoutLog | FitnessGoal }
  | { ok: false; message: string };

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 '\-/]*$/;
const listPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 ,'\-/]*$/;
const shortTextPattern = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9][A-Za-zÀ-ÖØ-öø-ÿ0-9 .,;:'()/%+\-]*$/;
const invalidControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function cleanText(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function cleanLongText(value: unknown) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/^ +/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalize(value: string) {
  return cleanText(value).toLocaleLowerCase("it-IT");
}

function isValidName(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength && namePattern.test(value);
}

function isValidList(value: string, maxLength: number) {
  return value.length === 0 || (value.length <= maxLength && listPattern.test(value));
}

function isValidShortText(value: string, maxLength: number) {
  return value.length > 0 && value.length <= maxLength && shortTextPattern.test(value);
}

function isValidLongText(value: string, maxLength: number, required = false) {
  if (required && value.length === 0) return false;
  return value.length <= maxLength && !invalidControlCharacters.test(value);
}

function hasDuplicate<T extends { id: string }>(
  items: T[],
  currentId: string,
  getKey: (item: T) => string,
  key: string,
) {
  return items.some((item) => item.id !== currentId && normalize(getKey(item)) === normalize(key));
}

function isValidDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isIntegerInRange(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max;
}

function hasAtMostTwoDecimals(value: number) {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

function fail(message: string): ValidationResult {
  return { ok: false, message };
}

export function validateEntity(entity: Entity, item: unknown, data: FitnessData): ValidationResult {
  if (entity === "exercise") return validateExercise(item as Exercise, data);
  if (entity === "plan") return validatePlan(item as WorkoutPlan, data);
  if (entity === "session") return validateSession(item as PlannedSession, data);
  if (entity === "workout") return validateWorkout(item as WorkoutLog, data);
  return validateGoal(item as FitnessGoal, data);
}

export function makeUniqueCopyName(existingNames: string[], baseName: string) {
  const cleaned = cleanText(baseName);
  const names = new Set(existingNames.map(normalize));
  let candidate = `${cleaned} copia`;
  let counter = 2;

  while (names.has(normalize(candidate))) {
    candidate = `${cleaned} copia ${counter}`;
    counter += 1;
  }

  return candidate;
}

function normalizeMuscleGroup(value: unknown) {
  const cleaned = cleanText(value);
  const normalized = normalize(cleaned);

  if (normalized === "core" || normalized === "addominali") return "Addome";
  if (["glutei", "quadricipiti", "femorali", "polpacci"].includes(normalized)) return "Gambe";
  if (["bicipiti", "tricipiti", "avambracci"].includes(normalized)) return "Braccia";
  return muscleGroups.find((group) => normalize(group) === normalized) ?? cleaned;
}

function splitSecondaryMuscles(value: string) {
  return value
    .split(",")
    .map((entry) => cleanText(entry))
    .filter(Boolean);
}

function normalizeSecondaryMuscles(value: unknown) {
  return Array.from(new Set(splitSecondaryMuscles(cleanText(value)).map(normalizeMuscleGroup))).join(", ");
}

function validateExercise(exercise: Exercise, data: FitnessData): ValidationResult {
  const cleaned: Exercise = {
    ...exercise,
    name: cleanText(exercise.name),
    primaryMuscle: normalizeMuscleGroup(exercise.primaryMuscle),
    secondaryMuscles: normalizeSecondaryMuscles(exercise.secondaryMuscles),
    description: cleanLongText(exercise.description),
    equipment: cleanText(exercise.equipment),
    recommendedSets: Number(exercise.recommendedSets),
    recommendedReps: Number(exercise.recommendedReps),
    estimatedDurationMinutes: Number(exercise.estimatedDurationMinutes),
    notes: cleanLongText(exercise.notes),
  };

  if (!isValidName(cleaned.name, 60)) {
    return fail("Il nome dell'esercizio deve contenere da 1 a 60 caratteri tra lettere, numeri, spazi, apostrofo, trattino e slash.");
  }
  if (hasDuplicate(data.exercises, cleaned.id, (entry) => entry.name, cleaned.name)) {
    return fail("Esiste gia un esercizio con questo nome.");
  }
  if (!muscleGroups.includes(cleaned.primaryMuscle)) {
    return fail("Seleziona un gruppo muscolare principale tra quelli disponibili.");
  }
  if (!isValidList(cleaned.secondaryMuscles, 120)) {
    return fail("I gruppi secondari possono contenere lettere, numeri, spazi, virgole, apostrofi, trattini e barre.");
  }
  if (splitSecondaryMuscles(cleaned.secondaryMuscles).some((group) => !muscleGroups.includes(group))) {
    return fail("Seleziona i gruppi secondari solo tra quelli disponibili.");
  }
  if (splitSecondaryMuscles(cleaned.secondaryMuscles).includes(cleaned.primaryMuscle)) {
    return fail("Il gruppo principale non puo essere inserito anche tra i gruppi secondari.");
  }
  if (!isValidLongText(cleaned.description, 500, true)) {
    return fail("Inserisci una descrizione valida, lunga al massimo 500 caratteri.");
  }
  if (!isValidShortText(cleaned.equipment, 80)) {
    return fail("Inserisci un'attrezzatura valida, lunga al massimo 80 caratteri.");
  }
  if (!isIntegerInRange(cleaned.recommendedSets, 1, 100)) {
    return fail("Le serie consigliate devono essere un numero intero compreso tra 1 e 100.");
  }
  if (!isIntegerInRange(cleaned.recommendedReps, 1, 10000)) {
    return fail("Le ripetizioni consigliate devono essere un numero intero compreso tra 1 e 10000.");
  }
  if (!isIntegerInRange(cleaned.estimatedDurationMinutes, 1, 1440)) {
    return fail("La durata stimata deve essere un numero intero compreso tra 1 e 1440 minuti.");
  }
  if (!isValidLongText(cleaned.notes, 500)) return fail("Le note non possono superare 500 caratteri.");

  return { ok: true, item: cleaned };
}

function validatePlan(plan: WorkoutPlan, data: FitnessData): ValidationResult {
  const days = (plan.days ?? []).map((day) => ({
    ...day,
    name: cleanText(day.name),
    items: (day.items ?? []).map((item) => ({
      ...item,
      sets: Number(item.sets),
      reps: Number(item.reps),
    })),
  }));
  const exerciseIds = Array.from(new Set(days.flatMap((day) => day.items.map((item) => item.exerciseId))));
  const cleaned: WorkoutPlan = {
    ...plan,
    name: cleanText(plan.name),
    description: cleanLongText(plan.description),
    goal: cleanText(plan.goal),
    durationMinutes: Number(plan.durationMinutes),
    frequencyPerWeek: Number(plan.frequencyPerWeek),
    notes: cleanLongText(plan.notes),
    restSeconds: Number(plan.restSeconds),
    days,
    exerciseIds,
  };

  if (!isValidName(cleaned.name, 60)) {
    return fail("Il nome della scheda deve contenere da 1 a 60 caratteri tra lettere, numeri, spazi, apostrofo, trattino e slash.");
  }
  if (hasDuplicate(data.plans, cleaned.id, (entry) => entry.name, cleaned.name)) {
    return fail("Esiste gia una scheda con questo nome.");
  }
  if (!isValidName(cleaned.goal, 60)) return fail("L'obiettivo della scheda deve essere un testo valido di massimo 60 caratteri.");
  if (!isValidLongText(cleaned.description, 500, true)) return fail("Inserisci una descrizione valida di massimo 500 caratteri.");
  if (!isIntegerInRange(cleaned.durationMinutes, 1, 1440)) {
    return fail("La durata prevista deve essere un numero intero compreso tra 1 e 1440 minuti.");
  }
  if (!isIntegerInRange(cleaned.frequencyPerWeek, 1, 14)) {
    return fail("La frequenza settimanale deve essere un numero intero compreso tra 1 e 14.");
  }
  if (!isIntegerInRange(cleaned.restSeconds, 1, 3600)) {
    return fail("Il recupero generale deve essere un numero intero compreso tra 1 e 3600 secondi.");
  }
  if (cleaned.days.length === 0) return fail("Inserisci almeno un giorno nella scheda.");

  const dayNames = new Set<string>();
  for (const day of cleaned.days) {
    if (!isValidName(day.name, 40)) return fail("Ogni giorno della scheda deve avere un nome valido di massimo 40 caratteri.");
    if (dayNames.has(normalize(day.name))) return fail("Non puoi inserire due giorni con lo stesso nome nella stessa scheda.");
    dayNames.add(normalize(day.name));
    if (day.items.length === 0) return fail(`${day.name} deve contenere almeno un esercizio.`);

    const exerciseIdsInDay = new Set<string>();
    for (const item of day.items) {
      if (!data.exercises.some((exercise) => exercise.id === item.exerciseId)) {
        return fail(`${day.name} contiene un esercizio non piu presente nell'archivio.`);
      }
      if (exerciseIdsInDay.has(item.exerciseId)) {
        return fail(`In ${day.name} lo stesso esercizio non puo essere inserito due volte.`);
      }
      exerciseIdsInDay.add(item.exerciseId);
      if (!isIntegerInRange(item.sets, 1, 100)) return fail(`Le serie in ${day.name} devono essere comprese tra 1 e 100.`);
      if (!isIntegerInRange(item.reps, 1, 10000)) return fail(`Le ripetizioni in ${day.name} devono essere comprese tra 1 e 10000.`);
    }
  }

  if (!isValidLongText(cleaned.notes, 500)) return fail("Le note non possono superare 500 caratteri.");
  return { ok: true, item: cleaned };
}

function validateSession(session: PlannedSession, data: FitnessData): ValidationResult {
  const selectedPlan = data.plans.find((plan) => plan.id === session.planId);
  const selectedDay = selectedPlan?.days.find((day) => day.id === session.planDayId);
  const cleaned: PlannedSession = {
    ...session,
    title: cleanText(session.title),
    date: cleanText(session.date),
    type: cleanText(session.type),
    notes: cleanLongText(session.notes),
    planDayId: selectedDay?.id ?? selectedPlan?.days[0]?.id ?? session.planDayId,
    exerciseIds: Array.from(new Set((selectedDay ?? selectedPlan?.days[0])?.items.map((item) => item.exerciseId) ?? [])),
  };

  if (!isValidName(cleaned.title, 60)) {
    return fail("Il titolo della sessione deve contenere da 1 a 60 caratteri tra lettere, numeri, spazi, apostrofo, trattino e slash.");
  }
  if (!isValidDate(cleaned.date)) return fail("La data della sessione deve essere reale e nel formato YYYY-MM-DD.");
  if (cleaned.date < today()) return fail("La sessione deve essere pianificata da oggi in poi: non puoi usare una data passata.");
  if (!isValidName(cleaned.type, 40)) return fail("Il tipo di sessione deve essere un testo valido di massimo 40 caratteri.");
  if (
    data.sessions.some(
      (entry) =>
        entry.id !== cleaned.id &&
        normalize(entry.title) === normalize(cleaned.title) &&
        cleanText(entry.date) === cleaned.date,
    )
  ) {
    return fail("Esiste gia una sessione con lo stesso titolo nella stessa data.");
  }
  if (!cleaned.planId || !selectedPlan) return fail("Associa una scheda esistente alla sessione.");
  if (!cleaned.planDayId) return fail("Seleziona il giorno della scheda per la sessione.");
  if (cleaned.exerciseIds.length === 0) return fail("Il giorno scelto deve contenere almeno un esercizio.");
  if (!isValidLongText(cleaned.notes, 500)) return fail("Le note non possono superare 500 caratteri.");

  return { ok: true, item: cleaned };
}

function validateWorkout(workout: WorkoutLog, data: FitnessData): ValidationResult {
  const selectedPlan = data.plans.find((plan) => plan.id === workout.planId);
  const selectedDay = selectedPlan?.days.find((day) => day.id === workout.planDayId);
  const loadsByPlanItemId = new Map((workout.exerciseLoads ?? []).map((entry) => [entry.planItemId, Number(entry.loadKg)]));
  const cleaned: WorkoutLog = {
    ...workout,
    title: cleanText(workout.title),
    date: cleanText(workout.date),
    planDayId: selectedDay?.id ?? selectedPlan?.days[0]?.id ?? workout.planDayId,
    exerciseLoads:
      (selectedDay ?? selectedPlan?.days[0])?.items.map((item) => ({
        planItemId: item.id,
        loadKg: Number(loadsByPlanItemId.get(item.id) ?? 0),
      })) ?? [],
    notes: cleanLongText(workout.notes),
    durationMinutes: Number(workout.durationMinutes),
    effort: Number(workout.effort),
  };

  if (!isValidName(cleaned.title, 60)) {
    return fail("Il titolo dell'allenamento deve contenere da 1 a 60 caratteri tra lettere, numeri, spazi, apostrofo, trattino e slash.");
  }
  if (!isValidDate(cleaned.date)) return fail("La data dell'allenamento deve essere reale e nel formato YYYY-MM-DD.");
  if (cleaned.date > today()) return fail("L'allenamento registrato non puo avere una data futura.");
  if (
    data.workouts.some(
      (entry) =>
        entry.id !== cleaned.id &&
        normalize(entry.title) === normalize(cleaned.title) &&
        cleanText(entry.date) === cleaned.date,
    )
  ) {
    return fail("Esiste gia un allenamento con lo stesso titolo nella stessa data.");
  }
  if (cleaned.planId && !selectedPlan) return fail("La scheda associata all'allenamento non esiste piu.");
  if (selectedPlan && !cleaned.planDayId) return fail("Seleziona il giorno della scheda svolto.");
  if (!isIntegerInRange(cleaned.durationMinutes, 1, 1440)) {
    return fail("La durata deve essere un numero intero compreso tra 1 e 1440 minuti.");
  }
  for (const load of cleaned.exerciseLoads) {
    if (!Number.isFinite(load.loadKg) || load.loadKg < 0 || load.loadKg > 1000 || !hasAtMostTwoDecimals(load.loadKg)) {
      return fail("Ogni carico deve essere compreso tra 0 e 1000 kg e avere al massimo due decimali.");
    }
  }
  if (!isIntegerInRange(cleaned.effort, 1, 10)) {
    return fail("La fatica percepita deve essere un numero intero tra 1 e 10.");
  }
  if (!isValidLongText(cleaned.notes, 500)) return fail("Le note non possono superare 500 caratteri.");

  return { ok: true, item: cleaned };
}

function validateGoal(goal: FitnessGoal, data: FitnessData): ValidationResult {
  const goalType = goalTypes.includes(goal.goalType) ? goal.goalType : ("Manuale" as GoalType);
  const cleaned: FitnessGoal = {
    ...goal,
    title: cleanText(goal.title),
    description: cleanLongText(goal.description),
    category: goalType,
    goalType,
    linkedExerciseId: goalType === "Carico su esercizio" ? cleanText(goal.linkedExerciseId) : undefined,
    linkedPlanId: goalType === "Completamento scheda" ? cleanText(goal.linkedPlanId) : undefined,
    startDate: cleanText(goal.startDate),
    dueDate: cleanText(goal.dueDate),
    notes: cleanLongText(goal.notes),
    target: Number(goal.target),
    current: Number(goal.current),
  };

  if (!isValidName(cleaned.title, 60)) {
    return fail("Il titolo dell'obiettivo deve contenere da 1 a 60 caratteri tra lettere, numeri, spazi, apostrofo, trattino e slash.");
  }
  if (hasDuplicate(data.goals, cleaned.id, (entry) => entry.title, cleaned.title)) {
    return fail("Esiste gia un obiettivo con questo titolo.");
  }
  if (!goalTypes.includes(cleaned.goalType)) return fail("Seleziona una categoria obiettivo tra quelle disponibili.");
  if (cleaned.goalType === "Carico su esercizio" && !data.exercises.some((exercise) => exercise.id === cleaned.linkedExerciseId)) {
    return fail("Seleziona un esercizio esistente per l'obiettivo di carico.");
  }
  if (cleaned.goalType === "Completamento scheda" && !data.plans.some((plan) => plan.id === cleaned.linkedPlanId)) {
    return fail("Seleziona una scheda esistente per l'obiettivo di completamento.");
  }
  if (!isValidLongText(cleaned.description, 500, true)) return fail("Inserisci una descrizione valida di massimo 500 caratteri.");
  if (!Number.isFinite(cleaned.target) || cleaned.target <= 0 || cleaned.target > 1000000 || !hasAtMostTwoDecimals(cleaned.target)) {
    return fail("Il target deve essere maggiore di zero, non superiore a 1.000.000 e avere al massimo due decimali.");
  }
  if (!Number.isFinite(cleaned.current) || cleaned.current < 0 || cleaned.current > 1000000 || !hasAtMostTwoDecimals(cleaned.current)) {
    return fail("Il valore attuale deve essere non negativo, non superiore a 1.000.000 e avere al massimo due decimali.");
  }
  if (!isValidDate(cleaned.startDate)) return fail("La data di inizio deve essere reale e nel formato YYYY-MM-DD.");
  if (cleaned.dueDate && !isValidDate(cleaned.dueDate)) return fail("La scadenza deve essere reale e nel formato YYYY-MM-DD.");
  if (cleaned.dueDate && cleaned.dueDate < cleaned.startDate) return fail("La scadenza non puo essere precedente alla data di inizio.");
  if (!isValidLongText(cleaned.notes, 500)) return fail("Le note non possono superare 500 caratteri.");

  return { ok: true, item: cleaned };
}
