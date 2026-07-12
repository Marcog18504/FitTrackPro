import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../../../styles";
import { FitnessData, WorkoutExerciseLoad, WorkoutLog, WorkoutPlanDay } from "../../../types";
import { makeId, toNumber, today } from "../../../utils";
import { Field, PickerChips, PlanSelector } from "../../form-controls";

type EditableWorkoutExerciseLoad = Omit<WorkoutExerciseLoad, "loadKg"> & { loadKg: number | string };
type EditableWorkoutLog = Omit<WorkoutLog, "exerciseLoads"> & { exerciseLoads: EditableWorkoutExerciseLoad[] };

type WorkoutEditModalProps = {
  item?: WorkoutLog;
  data: FitnessData;
  onClose: () => void;
  onSave: (item: WorkoutLog) => void;
};

export function WorkoutEditModal({ item, data, onClose, onSave }: WorkoutEditModalProps) {
  const [form, setForm] = useState<EditableWorkoutLog>(getDefaultWorkout(data));

  useEffect(() => {
    const current = item ?? getDefaultWorkout(data);
    const selectedPlan = data.plans.find((plan) => plan.id === current.planId);
    const selectedDay = selectedPlan?.days.find((day) => day.id === current.planDayId) ?? selectedPlan?.days[0];
    setForm({ ...current, planDayId: selectedDay?.id, exerciseLoads: getWorkoutExerciseLoads(selectedDay, current.exerciseLoads ?? []) });
  }, [item, data]);

  function setField<K extends keyof WorkoutLog>(key: K, value: WorkoutLog[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setWorkoutPlan(planId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === planId);
    const day = selectedPlan?.days[0];
    setForm((current) => ({ ...current, planId, planDayId: day?.id, exerciseLoads: getWorkoutExerciseLoads(day, []) }));
  }

  function setWorkoutDay(dayId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const day = selectedPlan?.days.find((entry) => entry.id === dayId);
    setForm((current) => ({ ...current, planDayId: dayId, exerciseLoads: getWorkoutExerciseLoads(day, current.exerciseLoads) }));
  }

  function updateWorkoutLoad(planItemId: string, value: string) {
    setForm((current) => ({
      ...current,
      exerciseLoads: current.exerciseLoads.map((entry) => (entry.planItemId === planItemId ? { ...entry, loadKg: value } : entry)),
    }));
  }

  function normalizedForm(): WorkoutLog {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const selectedDay = selectedPlan?.days.find((day) => day.id === form.planDayId);
    return {
      ...form,
      exerciseLoads: getWorkoutExerciseLoads(
        selectedDay,
        form.exerciseLoads.map((entry) => ({ planItemId: entry.planItemId, loadKg: toNumber(String(entry.loadKg ?? ""), 0) })),
      ).map((entry) => ({ planItemId: entry.planItemId, loadKg: toNumber(String(entry.loadKg ?? ""), 0) })),
      durationMinutes: toNumber(String(form.durationMinutes ?? "")),
      effort: toNumber(String(form.effort ?? "")),
    };
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Allenamento</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
          <Field label="Data (YYYY-MM-DD)" value={form.date} onChange={(value) => setField("date", value)} inputKind="date" maxLength={10} required />
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
            ?.items.map((planItem) => {
              const exerciseName = data.exercises.find((exercise) => exercise.id === planItem.exerciseId)?.name ?? "Esercizio eliminato";
              const load = form.exerciseLoads.find((entry) => entry.planItemId === planItem.id);
              return (
                <View key={planItem.id} style={styles.planExerciseRow}>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{exerciseName}</Text>
                    <Text style={styles.muted}>
                      {planItem.sets} serie x {planItem.reps} ripetizioni
                    </Text>
                  </View>
                  <View style={styles.smallField}>
                    <Field label="Carico (kg)" value={load?.loadKg ?? 0} onChange={(value) => updateWorkoutLoad(planItem.id, value)} inputKind="decimal" />
                  </View>
                </View>
              );
            })}
          <Field label="Durata allenamento (minuti)" value={form.durationMinutes} onChange={(value) => setField("durationMinutes", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Fatica percepita 1-10" value={form.effort} onChange={(value) => setField("effort", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
          <Pressable style={styles.saveButton} onPress={() => onSave(normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultWorkout(data: FitnessData): EditableWorkoutLog {
  return {
    id: makeId("wo"),
    title: "",
    date: today(),
    planId: data.plans[0]?.id,
    planDayId: data.plans[0]?.days[0]?.id,
    durationMinutes: 45,
    exerciseLoads: getWorkoutExerciseLoads(data.plans[0]?.days[0], []),
    effort: 6,
    notes: "",
  };
}

function getWorkoutExerciseLoads(day: WorkoutPlanDay | undefined, currentLoads: EditableWorkoutExerciseLoad[]) {
  const loadsByPlanItemId = new Map(currentLoads.map((entry) => [entry.planItemId, entry.loadKg]));
  return day?.items.map((planItem) => ({ planItemId: planItem.id, loadKg: loadsByPlanItemId.get(planItem.id) ?? 0 })) ?? [];
}
