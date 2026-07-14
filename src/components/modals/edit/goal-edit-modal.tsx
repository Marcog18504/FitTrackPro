import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { goalStatuses, goalTypes } from "../../../constants";
import { styles } from "../../../styles";
import { FitnessData, FitnessGoal, GoalType } from "../../../types";
import { makeId, toNumber, today } from "../../../utils";
import { Field, PickerChips } from "../../form-controls";

type GoalEditModalProps = {
  item?: FitnessGoal;
  data: FitnessData;
  onClose: () => void;
  onSave: (item: FitnessGoal) => void;
};

export function GoalEditModal({ item, data, onClose, onSave }: GoalEditModalProps) {
  const [form, setForm] = useState<FitnessGoal>(getDefaultGoal(data));

  useEffect(() => {
    setForm({
      ...getDefaultGoal(data),
      ...item,
      goalType: item?.goalType ?? (item?.category as GoalType) ?? "Manuale",
      category: item?.goalType ?? item?.category ?? "Manuale",
    });
  }, [item, data]);

  function setField<K extends keyof FitnessGoal>(key: K, value: FitnessGoal[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setGoalType(goalType: string) {
    setForm((current) => ({
      ...current,
      goalType: goalType as GoalType,
      category: goalType,
      current: goalType === "Manuale" ? current.current : 0,
      linkedExerciseId: goalType === "Carico su esercizio" ? current.linkedExerciseId ?? data.exercises[0]?.id : current.linkedExerciseId,
      linkedPlanId: goalType === "Completamento scheda" ? current.linkedPlanId ?? data.plans[0]?.id : current.linkedPlanId,
    }));
  }

  function normalizedForm(): FitnessGoal {
    const goalType = form.goalType ?? "Manuale";
    return {
      ...form,
      goalType,
      category: goalType,
      current: goalType === "Manuale" ? toNumber(String(form.current ?? "")) : 0,
      linkedExerciseId: goalType === "Carico su esercizio" ? String(form.linkedExerciseId ?? "") : undefined,
      linkedPlanId: goalType === "Completamento scheda" ? String(form.linkedPlanId ?? "") : undefined,
      target: toNumber(String(form.target ?? "")),
    };
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Obiettivo</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Titolo" value={form.title} onChange={(value) => setField("title", value)} inputKind="name" required />
          <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
          <PickerChips label="Categoria" value={form.goalType} options={goalTypes} onChange={setGoalType} />
          {form.goalType === "Carico su esercizio" ? (
            <PickerChips
              label="Esercizio collegato"
              value={String(form.linkedExerciseId ?? "")}
              options={data.exercises.map((exercise) => exercise.id)}
              onChange={(value) => setField("linkedExerciseId", value)}
              getLabel={(value) => data.exercises.find((exercise) => exercise.id === value)?.name ?? value}
            />
          ) : null}
          {form.goalType === "Completamento scheda" ? (
            <PickerChips
              label="Scheda collegata"
              value={String(form.linkedPlanId ?? "")}
              options={data.plans.map((plan) => plan.id)}
              onChange={(value) => setField("linkedPlanId", value)}
              getLabel={(value) => data.plans.find((plan) => plan.id === value)?.name ?? value}
            />
          ) : null}
          <Field label="Valore target (numero)" value={form.target} onChange={(value) => setField("target", toNumber(value, 0))} inputKind="decimal" required />
          {form.goalType === "Manuale" ? (
            <Field label="Valore attuale (numero)" value={form.current} onChange={(value) => setField("current", toNumber(value, 0))} inputKind="decimal" required />
          ) : (
            <View style={styles.field}>
              <Text style={styles.label}>Valore attuale</Text>
              <Text style={styles.helperText}>Calcolato automaticamente dagli allenamenti salvati nel periodo.</Text>
            </View>
          )}
          <Field label="Data inizio" value={form.startDate} onChange={(value) => setField("startDate", value)} inputKind="date" maxLength={10} required />
          <Field label="Scadenza" value={form.dueDate} onChange={(value) => setField("dueDate", value)} inputKind="date" maxLength={10} />
          <PickerChips label="Stato" value={form.status} options={goalStatuses} onChange={(value) => setField("status", value as FitnessGoal["status"])} />
          <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
          <Pressable style={styles.saveButton} onPress={() => onSave(normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultGoal(data: FitnessData): FitnessGoal {
  return {
    id: makeId("go"),
    title: "",
    description: "",
    category: "Numero allenamenti",
    goalType: "Numero allenamenti",
    linkedExerciseId: data.exercises[0]?.id,
    linkedPlanId: data.plans[0]?.id,
    target: 10,
    current: 0,
    startDate: today(),
    dueDate: "",
    status: "Aperto",
    notes: "",
  };
}
