import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { difficulties, goalStatuses, muscleGroups, sessionStatuses } from "../constants";
import { styles } from "../styles";
import { EditingState, Entity, FitnessData, PlanExercise, WorkoutExerciseLoad, WorkoutPlanDay } from "../types";
import { makeId, toNumber, today } from "../utils";
import { Field, MultiPickerChips, PickerChips, PlanSelector } from "./form-controls";

type EditableWorkoutExerciseLoad = Omit<WorkoutExerciseLoad, "loadKg"> & { loadKg: number | string };

type EditModalProps = {
  editing: EditingState;
  data: FitnessData;
  onClose: () => void;
  onSave: (entity: Entity, item: unknown) => void;
};

export function EditModal({ editing, data, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!editing) return;
    if (editing.item) {
      const current = editing.item as Record<string, unknown>;
      if (editing.entity === "workout") {
        const selectedPlan = data.plans.find((plan) => plan.id === current.planId);
        const selectedDay = selectedPlan?.days.find((day) => day.id === current.planDayId);
        const day = selectedDay ?? selectedPlan?.days[0];
        setForm({
          ...current,
          planDayId: day?.id,
          exerciseLoads: getWorkoutExerciseLoads(day, (current.exerciseLoads as EditableWorkoutExerciseLoad[] | undefined) ?? []),
        });
        return;
      }
      if (editing.entity === "session") {
        const selectedPlan = data.plans.find((plan) => plan.id === current.planId);
        const selectedDay = selectedPlan?.days.find((day) => day.id === current.planDayId);
        const day = selectedDay ?? selectedPlan?.days[0];
        setForm({
          ...current,
          planDayId: day?.id,
          exerciseIds: getPlanDayExerciseIds(day),
        });
        return;
      }
      setForm(current);
      return;
    }

    const defaults: Record<Entity, Record<string, unknown>> = {
      exercise: {
        id: makeId("ex"),
        name: "",
        description: "",
        primaryMuscle: "Gambe",
        secondaryMuscles: "",
        difficulty: "Base",
        equipment: "Corpo libero",
        recommendedSets: 3,
        recommendedReps: 10,
        estimatedDurationMinutes: 5,
        notes: "",
      },
      plan: {
        id: makeId("pl"),
        name: "",
        description: "",
        goal: "Forza",
        level: "Base",
        durationMinutes: 45,
        frequencyPerWeek: 3,
        exerciseIds: [],
        restSeconds: 90,
        days: [
          {
            id: makeId("day"),
            name: "Giorno 1",
            items: [],
          },
        ],
        notes: "",
      },
      session: {
        id: makeId("se"),
        title: "",
        date: today(),
        type: "Forza",
        planId: data.plans[0]?.id,
        planDayId: data.plans[0]?.days[0]?.id,
        exerciseIds: getPlanDayExerciseIds(data.plans[0]?.days[0]),
        status: "Da svolgere",
        notes: "",
      },
      workout: {
        id: makeId("wo"),
        title: "",
        date: today(),
        planId: data.plans[0]?.id,
        planDayId: data.plans[0]?.days[0]?.id,
        durationMinutes: 45,
        exerciseLoads: getWorkoutExerciseLoads(data.plans[0]?.days[0], []),
        effort: 6,
        notes: "",
      },
      goal: {
        id: makeId("go"),
        title: "",
        description: "",
        category: "Frequenza",
        target: 10,
        current: 0,
        startDate: today(),
        dueDate: "",
        status: "Aperto",
        notes: "",
      },
    };
    setForm(defaults[editing.entity]);
  }, [editing, data.plans]);

  if (!editing) return null;

  const entity = editing.entity;
  const titleByEntity: Record<Entity, string> = {
    exercise: "Esercizio",
    plan: "Scheda",
    session: "Sessione",
    workout: "Allenamento",
    goal: "Obiettivo",
  };

  function setField(key: string, value: unknown) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function getSecondaryMuscleOptions() {
    return muscleGroups.filter((group) => group !== form.primaryMuscle);
  }

  function setPrimaryMuscle(value: string) {
    const secondaryMuscles = String(form.secondaryMuscles ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry && entry !== value)
      .join(", ");
    setForm((current) => ({ ...current, primaryMuscle: value, secondaryMuscles }));
  }

  function setWorkoutPlan(planId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === planId);
    const day = selectedPlan?.days[0];
    setForm((current) => ({
      ...current,
      planId,
      planDayId: day?.id,
      exerciseLoads: getWorkoutExerciseLoads(day, []),
    }));
  }

  function setSessionPlan(planId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === planId);
    const day = selectedPlan?.days[0];
    setForm((current) => ({
      ...current,
      planId,
      planDayId: day?.id,
      exerciseIds: getPlanDayExerciseIds(day),
    }));
  }

  function setSessionDay(dayId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const day = selectedPlan?.days.find((entry) => entry.id === dayId);
    setForm((current) => ({
      ...current,
      planDayId: dayId,
      exerciseIds: getPlanDayExerciseIds(day),
    }));
  }

  function setWorkoutDay(dayId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const day = selectedPlan?.days.find((entry) => entry.id === dayId);
    setForm((current) => ({
      ...current,
      planDayId: dayId,
      exerciseLoads: getWorkoutExerciseLoads(day, (current.exerciseLoads as EditableWorkoutExerciseLoad[] | undefined) ?? []),
    }));
  }

  function updateWorkoutLoad(planItemId: string, value: string) {
    const loads = ((form.exerciseLoads as EditableWorkoutExerciseLoad[] | undefined) ?? []).map((entry) =>
      entry.planItemId === planItemId ? { ...entry, loadKg: value } : entry,
    );
    setField("exerciseLoads", loads);
  }

  function getWorkoutExerciseLoads(day: WorkoutPlanDay | undefined, currentLoads: EditableWorkoutExerciseLoad[]) {
    const loadsByPlanItemId = new Map(currentLoads.map((entry) => [entry.planItemId, entry.loadKg]));
    return day?.items.map((item) => ({ planItemId: item.id, loadKg: loadsByPlanItemId.get(item.id) ?? 0 })) ?? [];
  }

  function getPlanDayExerciseIds(day: WorkoutPlanDay | undefined) {
    return Array.from(new Set(day?.items.map((item) => item.exerciseId) ?? []));
  }

  function getPlanDays() {
    return ((form.days as WorkoutPlanDay[] | undefined) ?? []) as WorkoutPlanDay[];
  }

  function setPlanDays(days: WorkoutPlanDay[]) {
    const exerciseIds = Array.from(new Set(days.flatMap((day) => day.items.map((item) => item.exerciseId))));
    setForm((current) => ({ ...current, days, exerciseIds }));
  }

  function addPlanDay() {
    const days = getPlanDays();
    setPlanDays([...days, { id: makeId("day"), name: `Giorno ${days.length + 1}`, items: [] }]);
  }

  function removePlanDay(dayId: string) {
    const days = getPlanDays().filter((day) => day.id !== dayId);
    setPlanDays(days.length > 0 ? days : [{ id: makeId("day"), name: "Giorno 1", items: [] }]);
  }

  function updatePlanDayName(dayId: string, name: string) {
    setPlanDays(getPlanDays().map((day) => (day.id === dayId ? { ...day, name } : day)));
  }

  function addExerciseToPlanDay(dayId: string, exerciseId: string) {
    setPlanDays(
      getPlanDays().map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: [...day.items, { id: makeId("pe"), exerciseId, sets: 3, reps: 10 }],
            }
          : day,
      ),
    );
  }

  function updatePlanItem(dayId: string, itemId: string, patch: Partial<PlanExercise>) {
    setPlanDays(
      getPlanDays().map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
          : day,
      ),
    );
  }

  function removePlanItem(dayId: string, itemId: string) {
    setPlanDays(
      getPlanDays().map((day) =>
        day.id === dayId ? { ...day, items: day.items.filter((item) => item.id !== itemId) } : day,
      ),
    );
  }

  function normalizedForm() {
    if (entity === "exercise") {
      return {
        ...form,
        recommendedSets: toNumber(String(form.recommendedSets ?? "")),
        recommendedReps: toNumber(String(form.recommendedReps ?? "")),
        estimatedDurationMinutes: toNumber(String(form.estimatedDurationMinutes ?? "")),
      };
    }
    if (entity === "plan") {
      const days = getPlanDays().map((day) => ({
        ...day,
        name: String(day.name ?? ""),
        items: day.items.map((item) => ({
          ...item,
          sets: toNumber(String(item.sets ?? "")),
          reps: toNumber(String(item.reps ?? "")),
        })),
      }));

      return {
        ...form,
        durationMinutes: toNumber(String(form.durationMinutes ?? "")),
        frequencyPerWeek: toNumber(String(form.frequencyPerWeek ?? "")),
        restSeconds: toNumber(String(form.restSeconds ?? "")),
        days,
        exerciseIds: Array.from(new Set(days.flatMap((day) => day.items.map((item) => item.exerciseId)))),
      };
    }
    if (entity === "workout") {
      const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
      const selectedDay = selectedPlan?.days.find((day) => day.id === form.planDayId);
      return {
        ...form,
        exerciseLoads: getWorkoutExerciseLoads(
          selectedDay,
          ((form.exerciseLoads as EditableWorkoutExerciseLoad[] | undefined) ?? []).map((entry) => ({
            planItemId: entry.planItemId,
            loadKg: toNumber(String(entry.loadKg ?? ""), 0),
          })),
        ),
        durationMinutes: toNumber(String(form.durationMinutes ?? "")),
        effort: toNumber(String(form.effort ?? "")),
      };
    }
    if (entity === "session") {
      const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
      const selectedDay = selectedPlan?.days.find((day) => day.id === form.planDayId);
      return {
        ...form,
        exerciseIds: getPlanDayExerciseIds(selectedDay),
      };
    }
    if (entity === "goal") {
      return {
        ...form,
        target: toNumber(String(form.target ?? "")),
        current: toNumber(String(form.current ?? "")),
      };
    }
    return form;
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>{titleByEntity[entity]}</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {entity === "exercise" && (
            <>
              <Field label="Nome" value={form.name} onChange={(value) => setField("name", value)} inputKind="name" required />
              <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
              <PickerChips
                label="Gruppo muscolare"
                value={String(form.primaryMuscle)}
                options={muscleGroups}
                onChange={setPrimaryMuscle}
              />
              <MultiPickerChips
                label="Gruppi secondari"
                value={String(form.secondaryMuscles ?? "")}
                options={getSecondaryMuscleOptions()}
                onChange={(value) => setField("secondaryMuscles", value)}
                helperText="Seleziona uno o piu gruppi dalla lista."
              />
              <PickerChips label="Difficolta" value={String(form.difficulty)} options={difficulties} onChange={(value) => setField("difficulty", value)} />
              <Field label="Attrezzatura" value={form.equipment} onChange={(value) => setField("equipment", value)} inputKind="shortText" maxLength={80} required />
              <Field
                label="Serie consigliate (numero)"
                value={form.recommendedSets}
                onChange={(value) => setField("recommendedSets", value)}
                inputKind="integer"
                required
              />
              <Field
                label="Ripetizioni consigliate per serie (numero)"
                value={form.recommendedReps}
                onChange={(value) => setField("recommendedReps", value)}
                inputKind="integer"
                required
              />
              <Field
                label="Durata stimata esercizio (minuti)"
                value={form.estimatedDurationMinutes}
                onChange={(value) => setField("estimatedDurationMinutes", value)}
                inputKind="integer"
                required
              />
              <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
            </>
          )}

          {entity === "plan" && (
            <>
              <Field label="Nome" value={form.name} onChange={(value) => setField("name", value)} inputKind="name" required />
              <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
              <Field label="Obiettivo" value={form.goal} onChange={(value) => setField("goal", value)} inputKind="name" required />
              <PickerChips label="Livello" value={String(form.level)} options={difficulties} onChange={(value) => setField("level", value)} />
              <Field
                label="Durata prevista scheda (minuti)"
                value={form.durationMinutes}
                onChange={(value) => setField("durationMinutes", value)}
                inputKind="integer"
                required
              />
              <Field
                label="Frequenza consigliata (volte a settimana)"
                value={form.frequencyPerWeek}
                onChange={(value) => setField("frequencyPerWeek", value)}
                inputKind="integer"
                required
              />
              <Field
                label="Recupero consigliato generale (secondi)"
                value={form.restSeconds}
                onChange={(value) => setField("restSeconds", value)}
                inputKind="integer"
                required
              />
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>Giorni della scheda</Text>
                    <Text style={styles.muted}>Aggiungi esercizi con serie e ripetizioni per ogni giorno.</Text>
                  </View>
                  <Pressable style={styles.secondaryButton} onPress={addPlanDay}>
                    <Text style={styles.secondaryButtonText}>+ Giorno</Text>
                  </Pressable>
                </View>

                {getPlanDays().map((day, dayIndex) => (
                  <View key={day.id} style={styles.subCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.flex}>
                        <Field
                          label={`Nome giorno ${dayIndex + 1}`}
                          value={day.name}
                          onChange={(value) => updatePlanDayName(day.id, value)}
                          inputKind="name"
                          required
                        />
                      </View>
                      <Pressable style={styles.dangerButton} onPress={() => removePlanDay(day.id)}>
                        <Text style={styles.dangerButtonText}>Rimuovi</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.label}>Aggiungi esercizio</Text>
                    <View style={styles.chips}>
                      {data.exercises.map((exercise) => (
                        <Pressable
                          key={`${day.id}-${exercise.id}`}
                          style={styles.chip}
                          onPress={() => addExerciseToPlanDay(day.id, exercise.id)}
                        >
                          <Text style={styles.chipText}>{exercise.name}</Text>
                        </Pressable>
                      ))}
                    </View>

                    {day.items.map((item) => {
                      const exerciseName = data.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "Esercizio eliminato";
                      return (
                        <View key={item.id} style={styles.planExerciseRow}>
                          <View style={styles.flex}>
                            <Text style={styles.cardTitle}>{exerciseName}</Text>
                            <View style={styles.row}>
                              <View style={styles.smallField}>
                                <Field
                                  label="Serie"
                                  value={item.sets}
                                  onChange={(value) => updatePlanItem(day.id, item.id, { sets: toNumber(value, 0) })}
                                  inputKind="integer"
                                  required
                                />
                              </View>
                              <View style={styles.smallField}>
                                <Field
                                  label="Ripetizioni"
                                  value={item.reps}
                                  onChange={(value) => updatePlanItem(day.id, item.id, { reps: toNumber(value, 0) })}
                                  inputKind="integer"
                                  required
                                />
                              </View>
                            </View>
                          </View>
                          <Pressable style={styles.dangerButton} onPress={() => removePlanItem(day.id, item.id)}>
                            <Text style={styles.dangerButtonText}>Elimina</Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
              <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
            </>
          )}

          {entity === "session" && (
            <>
              <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
              <Field
                label="Data (YYYY-MM-DD)"
                value={form.date}
                onChange={(value) => setField("date", value)}
                inputKind="date"
                maxLength={10}
                required
              />
              <Field label="Tipo" value={form.type} onChange={(value) => setField("type", value)} inputKind="name" maxLength={40} required />
              <PlanSelector plans={data.plans} selected={String(form.planId ?? "")} onSelect={setSessionPlan} />
              <PickerChips
                label="Giorno della scheda"
                value={String(form.planDayId ?? "")}
                options={data.plans.find((plan) => plan.id === form.planId)?.days.map((day) => day.id) ?? []}
                onChange={setSessionDay}
                getLabel={(value) => data.plans.find((plan) => plan.id === form.planId)?.days.find((day) => day.id === value)?.name ?? value}
              />
              {data.plans
                .find((plan) => plan.id === form.planId)
                ?.days.find((day) => day.id === form.planDayId)
                ?.items.map((item) => {
                  const exerciseName = data.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "Esercizio eliminato";
                  return (
                    <Text key={item.id} style={styles.detailLine}>
                      <Text style={styles.detailLabel}>{exerciseName}: </Text>
                      {item.sets} serie x {item.reps} ripetizioni
                    </Text>
                  );
                })}
              <PickerChips label="Stato" value={String(form.status)} options={sessionStatuses} onChange={(value) => setField("status", value)} />
              <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
            </>
          )}

          {entity === "workout" && (
            <>
              <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
              <Field
                label="Data (YYYY-MM-DD)"
                value={form.date}
                onChange={(value) => setField("date", value)}
                inputKind="date"
                maxLength={10}
                required
              />
              <PlanSelector plans={data.plans} selected={String(form.planId ?? "")} onSelect={setWorkoutPlan} />
              <PickerChips
                label="Giorno della scheda svolto"
                value={String(form.planDayId ?? "")}
                options={data.plans.find((plan) => plan.id === form.planId)?.days.map((day) => day.id) ?? []}
                onChange={setWorkoutDay}
                getLabel={(value) => data.plans.find((plan) => plan.id === form.planId)?.days.find((day) => day.id === value)?.name ?? value}
              />
              {data.plans
                .find((plan) => plan.id === form.planId)
                ?.days.find((day) => day.id === form.planDayId)
                ?.items.map((item) => {
                  const exerciseName = data.exercises.find((exercise) => exercise.id === item.exerciseId)?.name ?? "Esercizio eliminato";
                  const load = ((form.exerciseLoads as EditableWorkoutExerciseLoad[] | undefined) ?? []).find((entry) => entry.planItemId === item.id);
                  return (
                    <View key={item.id} style={styles.planExerciseRow}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{exerciseName}</Text>
                        <Text style={styles.muted}>
                          {item.sets} serie x {item.reps} ripetizioni
                        </Text>
                      </View>
                      <View style={styles.smallField}>
                        <Field
                          label="Carico (kg)"
                          value={load?.loadKg ?? 0}
                          onChange={(value) => updateWorkoutLoad(item.id, value)}
                          inputKind="decimal"
                        />
                      </View>
                    </View>
                  );
                })}
              <Field label="Durata allenamento (minuti)" value={form.durationMinutes} onChange={(value) => setField("durationMinutes", value)} inputKind="integer" required />
              <Field label="Fatica percepita 1-10" value={form.effort} onChange={(value) => setField("effort", value)} inputKind="integer" required />
              <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
            </>
          )}

          {entity === "goal" && (
            <>
              <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
              <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
              <Field label="Categoria" value={form.category} onChange={(value) => setField("category", value)} inputKind="name" maxLength={40} required />
              <Field label="Valore target (numero)" value={form.target} onChange={(value) => setField("target", value)} inputKind="decimal" required />
              <Field label="Valore attuale (numero)" value={form.current} onChange={(value) => setField("current", value)} inputKind="decimal" required />
              <Field
                label="Data inizio"
                value={form.startDate}
                onChange={(value) => setField("startDate", value)}
                inputKind="date"
                maxLength={10}
                required
              />
              <Field
                label="Scadenza"
                value={form.dueDate}
                onChange={(value) => setField("dueDate", value)}
                inputKind="date"
                maxLength={10}
              />
              <PickerChips label="Stato" value={String(form.status)} options={goalStatuses} onChange={(value) => setField("status", value)} />
              <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
            </>
          )}

          <Pressable style={styles.saveButton} onPress={() => onSave(entity, normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}
