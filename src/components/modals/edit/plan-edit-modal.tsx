import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { difficulties } from "../../../constants";
import { styles } from "../../../styles";
import { FitnessData, PlanExercise, WorkoutPlan, WorkoutPlanDay } from "../../../types";
import { makeId, toNumber } from "../../../utils";
import { Field, PickerChips } from "../../form-controls";

type PlanEditModalProps = {
  item?: WorkoutPlan;
  data: FitnessData;
  onClose: () => void;
  onSave: (item: WorkoutPlan) => void;
};

export function PlanEditModal({ item, data, onClose, onSave }: PlanEditModalProps) {
  const [form, setForm] = useState<WorkoutPlan>(getDefaultPlan());

  useEffect(() => {
    setForm(item ?? getDefaultPlan());
  }, [item]);

  function setField<K extends keyof WorkoutPlan>(key: K, value: WorkoutPlan[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setPlanDays(days: WorkoutPlanDay[]) {
    const exerciseIds = Array.from(new Set(days.flatMap((day) => day.items.map((planItem) => planItem.exerciseId))));
    setForm((current) => ({ ...current, days, exerciseIds }));
  }

  function addPlanDay() {
    setPlanDays([...form.days, { id: makeId("day"), name: `Giorno ${form.days.length + 1}`, items: [] }]);
  }

  function removePlanDay(dayId: string) {
    const days = form.days.filter((day) => day.id !== dayId);
    setPlanDays(days.length > 0 ? days : [{ id: makeId("day"), name: "Giorno 1", items: [] }]);
  }

  function updatePlanDayName(dayId: string, name: string) {
    setPlanDays(form.days.map((day) => (day.id === dayId ? { ...day, name } : day)));
  }

  function addExerciseToPlanDay(dayId: string, exerciseId: string) {
    setPlanDays(
      form.days.map((day) =>
        day.id === dayId
          ? { ...day, items: [...day.items, { id: makeId("pe"), exerciseId, sets: 3, reps: 10 }] }
          : day,
      ),
    );
  }

  function updatePlanItem(dayId: string, itemId: string, patch: Partial<PlanExercise>) {
    setPlanDays(
      form.days.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.map((planItem) => (planItem.id === itemId ? { ...planItem, ...patch } : planItem)) }
          : day,
      ),
    );
  }

  function removePlanItem(dayId: string, itemId: string) {
    setPlanDays(form.days.map((day) => (day.id === dayId ? { ...day, items: day.items.filter((planItem) => planItem.id !== itemId) } : day)));
  }

  function normalizedForm(): WorkoutPlan {
    const days = form.days.map((day) => ({
      ...day,
      name: String(day.name ?? ""),
      items: day.items.map((planItem) => ({
        ...planItem,
        sets: toNumber(String(planItem.sets ?? "")),
        reps: toNumber(String(planItem.reps ?? "")),
      })),
    }));

    return {
      ...form,
      durationMinutes: toNumber(String(form.durationMinutes ?? "")),
      frequencyPerWeek: toNumber(String(form.frequencyPerWeek ?? "")),
      restSeconds: toNumber(String(form.restSeconds ?? "")),
      days,
      exerciseIds: Array.from(new Set(days.flatMap((day) => day.items.map((planItem) => planItem.exerciseId)))),
    };
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Scheda</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Nome" value={form.name} onChange={(value) => setField("name", value)} inputKind="name" required />
          <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
          <Field label="Obiettivo" value={form.goal} onChange={(value) => setField("goal", value)} inputKind="name" required />
          <PickerChips label="Livello" value={form.level} options={difficulties} onChange={(value) => setField("level", value as WorkoutPlan["level"])} />
          <Field label="Durata prevista scheda (minuti)" value={form.durationMinutes} onChange={(value) => setField("durationMinutes", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Frequenza consigliata (volte a settimana)" value={form.frequencyPerWeek} onChange={(value) => setField("frequencyPerWeek", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Recupero consigliato generale (secondi)" value={form.restSeconds} onChange={(value) => setField("restSeconds", toNumber(value, 0))} inputKind="integer" required />

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

            {form.days.map((day, dayIndex) => (
              <View key={day.id} style={styles.subCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex}>
                    <Field label={`Nome giorno ${dayIndex + 1}`} value={day.name} onChange={(value) => updatePlanDayName(day.id, value)} inputKind="name" required />
                  </View>
                  <Pressable style={styles.dangerButton} onPress={() => removePlanDay(day.id)}>
                    <Text style={styles.dangerButtonText}>Rimuovi</Text>
                  </Pressable>
                </View>

                <Text style={styles.label}>Aggiungi esercizio</Text>
                <View style={styles.chips}>
                  {data.exercises.map((exercise) => (
                    <Pressable key={`${day.id}-${exercise.id}`} style={styles.chip} onPress={() => addExerciseToPlanDay(day.id, exercise.id)}>
                      <Text style={styles.chipText}>{exercise.name}</Text>
                    </Pressable>
                  ))}
                </View>

                {day.items.map((planItem) => {
                  const exerciseName = data.exercises.find((exercise) => exercise.id === planItem.exerciseId)?.name ?? "Esercizio eliminato";
                  return (
                    <View key={planItem.id} style={styles.planExerciseRow}>
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{exerciseName}</Text>
                        <View style={styles.row}>
                          <View style={styles.smallField}>
                            <Field label="Serie" value={planItem.sets} onChange={(value) => updatePlanItem(day.id, planItem.id, { sets: toNumber(value, 0) })} inputKind="integer" required />
                          </View>
                          <View style={styles.smallField}>
                            <Field label="Ripetizioni" value={planItem.reps} onChange={(value) => updatePlanItem(day.id, planItem.id, { reps: toNumber(value, 0) })} inputKind="integer" required />
                          </View>
                        </View>
                      </View>
                      <Pressable style={styles.dangerButton} onPress={() => removePlanItem(day.id, planItem.id)}>
                        <Text style={styles.dangerButtonText}>Elimina</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
          <Pressable style={styles.saveButton} onPress={() => onSave(normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultPlan(): WorkoutPlan {
  return {
    id: makeId("pl"),
    name: "",
    description: "",
    goal: "Forza",
    level: "Base",
    durationMinutes: 45,
    frequencyPerWeek: 3,
    exerciseIds: [],
    restSeconds: 90,
    days: [{ id: makeId("day"), name: "Giorno 1", items: [] }],
    notes: "",
  };
}
