import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { sessionStatuses } from "../../../constants";
import { styles } from "../../../styles";
import { FitnessData, PlannedSession, WorkoutPlanDay } from "../../../types";
import { makeId, today } from "../../../utils";
import { Field, PickerChips, PlanSelector } from "../../form-controls";

type SessionEditModalProps = {
  item?: PlannedSession;
  data: FitnessData;
  onClose: () => void;
  onSave: (item: PlannedSession) => void;
};

export function SessionEditModal({ item, data, onClose, onSave }: SessionEditModalProps) {
  const [form, setForm] = useState<PlannedSession>(getDefaultSession(data));

  useEffect(() => {
    const current = item ?? getDefaultSession(data);
    const selectedPlan = data.plans.find((plan) => plan.id === current.planId);
    const selectedDay = selectedPlan?.days.find((day) => day.id === current.planDayId) ?? selectedPlan?.days[0];
    setForm({ ...current, planDayId: selectedDay?.id, exerciseIds: getPlanDayExerciseIds(selectedDay) });
  }, [item, data]);

  function setField<K extends keyof PlannedSession>(key: K, value: PlannedSession[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setSessionPlan(planId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === planId);
    const day = selectedPlan?.days[0];
    setForm((current) => ({ ...current, planId, planDayId: day?.id, exerciseIds: getPlanDayExerciseIds(day) }));
  }

  function setSessionDay(dayId: string) {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const day = selectedPlan?.days.find((entry) => entry.id === dayId);
    setForm((current) => ({ ...current, planDayId: dayId, exerciseIds: getPlanDayExerciseIds(day) }));
  }

  function normalizedForm(): PlannedSession {
    const selectedPlan = data.plans.find((plan) => plan.id === form.planId);
    const selectedDay = selectedPlan?.days.find((day) => day.id === form.planDayId);
    return { ...form, exerciseIds: getPlanDayExerciseIds(selectedDay) };
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Sessione</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
          <Field label="Data (YYYY-MM-DD)" value={form.date} onChange={(value) => setField("date", value)} inputKind="date" maxLength={10} required />
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
            ?.items.map((planItem) => {
              const exerciseName = data.exercises.find((exercise) => exercise.id === planItem.exerciseId)?.name ?? "Esercizio eliminato";
              return (
                <Text key={planItem.id} style={styles.detailLine}>
                  <Text style={styles.detailLabel}>{exerciseName}: </Text>
                  {planItem.sets} serie x {planItem.reps} ripetizioni
                </Text>
              );
            })}
          <PickerChips label="Stato" value={form.status} options={sessionStatuses} onChange={(value) => setField("status", value as PlannedSession["status"])} />
          <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
          <Pressable style={styles.saveButton} onPress={() => onSave(normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultSession(data: FitnessData): PlannedSession {
  return {
    id: makeId("se"),
    title: "",
    date: today(),
    type: "Forza",
    planId: data.plans[0]?.id,
    planDayId: data.plans[0]?.days[0]?.id,
    exerciseIds: getPlanDayExerciseIds(data.plans[0]?.days[0]),
    status: "Da svolgere",
    notes: "",
  };
}

function getPlanDayExerciseIds(day: WorkoutPlanDay | undefined) {
  return Array.from(new Set(day?.items.map((planItem) => planItem.exerciseId) ?? []));
}
