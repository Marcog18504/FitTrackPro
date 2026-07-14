import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { difficulties, muscleGroups } from "../../../constants";
import { styles } from "../../../styles";
import { Exercise, FitnessData } from "../../../types";
import { makeId, toNumber } from "../../../utils";
import { Field, MultiPickerChips, PickerChips } from "../../form-controls";

type ExerciseEditModalProps = {
  item?: Exercise;
  data: FitnessData;
  onClose: () => void;
  onSave: (item: Exercise) => void;
};

export function ExerciseEditModal({ item, onClose, onSave }: ExerciseEditModalProps) {
  const [form, setForm] = useState<Exercise>(getDefaultExercise());

  useEffect(() => {
    setForm(item ?? getDefaultExercise());
  }, [item]);

  function setField<K extends keyof Exercise>(key: K, value: Exercise[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function getSecondaryMuscleOptions() {
    return muscleGroups.filter((group) => group !== form.primaryMuscle);
  }

  function setPrimaryMuscle(value: string) {
    const secondaryMuscles = form.secondaryMuscles
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry && entry !== value)
      .join(", ");
    setForm((current) => ({ ...current, primaryMuscle: value, secondaryMuscles }));
  }

  function normalizedForm(): Exercise {
    return {
      ...form,
      recommendedSets: toNumber(String(form.recommendedSets ?? "")),
      recommendedReps: toNumber(String(form.recommendedReps ?? "")),
      estimatedDurationMinutes: toNumber(String(form.estimatedDurationMinutes ?? "")),
    };
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Esercizio</Text>
          <Pressable style={styles.ghostButton} onPress={onClose}>
            <Text style={styles.ghostButtonText}>Chiudi</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Field label="Nome" value={form.name} onChange={(value) => setField("name", value)} inputKind="name" required />
          <Field label="Descrizione" value={form.description} onChange={(value) => setField("description", value)} inputKind="longText" multiline required />
          <PickerChips label="Gruppo muscolare" value={form.primaryMuscle} options={muscleGroups} onChange={setPrimaryMuscle} />
          <MultiPickerChips
            label="Gruppi secondari"
            value={form.secondaryMuscles}
            options={getSecondaryMuscleOptions()}
            onChange={(value) => setField("secondaryMuscles", value)}
            helperText="Seleziona uno o piu gruppi dalla lista."
          />
          <PickerChips label="Difficolta" value={form.difficulty} options={difficulties} onChange={(value) => setField("difficulty", value as Exercise["difficulty"])} />
          <Field label="Attrezzatura" value={form.equipment} onChange={(value) => setField("equipment", value)} inputKind="shortText" maxLength={80} required />
          <Field label="Serie consigliate (numero)" value={form.recommendedSets} onChange={(value) => setField("recommendedSets", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Ripetizioni consigliate per serie (numero)" value={form.recommendedReps} onChange={(value) => setField("recommendedReps", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Durata stimata esercizio (minuti)" value={form.estimatedDurationMinutes} onChange={(value) => setField("estimatedDurationMinutes", toNumber(value, 0))} inputKind="integer" required />
          <Field label="Note" value={form.notes} onChange={(value) => setField("notes", value)} inputKind="longText" multiline />
          <Pressable style={styles.saveButton} onPress={() => onSave(normalizedForm())}>
            <Text style={styles.saveButtonText}>Salva</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function getDefaultExercise(): Exercise {
  return {
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
  };
}
