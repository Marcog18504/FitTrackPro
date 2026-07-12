import { Text } from "react-native";
import { styles } from "../../../styles";
import { FitnessData, FitnessGoal } from "../../../types";
import { DetailShell } from "./detail-shell";

type GoalDetailModalProps = {
  item: FitnessGoal;
  data: FitnessData;
  onClose: () => void;
};

export function GoalDetailModal({ item, data, onClose }: GoalDetailModalProps) {
  const exerciseName = data.exercises.find((exercise) => exercise.id === item.linkedExerciseId)?.name;
  const planName = data.plans.find((plan) => plan.id === item.linkedPlanId)?.name;

  return (
    <DetailShell title={item.title} onClose={onClose}>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {item.description}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>categoria: </Text>
        {item.category}
      </Text>
      {exerciseName ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>esercizio collegato: </Text>
          {exerciseName}
        </Text>
      ) : null}
      {planName ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>scheda collegata: </Text>
          {planName}
        </Text>
      ) : null}
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>valore target: </Text>
        {item.target}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>valore attuale: </Text>
        {item.current}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>data inizio: </Text>
        {item.startDate}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>scadenza: </Text>
        {item.dueDate || "nessuna scadenza"}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>stato: </Text>
        {item.status}
      </Text>
      {item.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {item.notes}
        </Text>
      ) : null}
    </DetailShell>
  );
}
