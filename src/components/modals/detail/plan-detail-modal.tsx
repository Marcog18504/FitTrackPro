import { Text, View } from "react-native";
import { styles } from "../../../styles";
import { FitnessData, WorkoutPlan } from "../../../types";
import { DetailShell } from "./detail-shell";

type PlanDetailModalProps = {
  item: WorkoutPlan;
  data: FitnessData;
  onClose: () => void;
};

export function PlanDetailModal({ item, data, onClose }: PlanDetailModalProps) {
  return (
    <DetailShell title={item.name} onClose={onClose}>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>obiettivo: </Text>
        {item.goal}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>livello: </Text>
        {item.level}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>durata: </Text>
        {item.durationMinutes} minuti
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>frequenza: </Text>
        {item.frequencyPerWeek} volte a settimana
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>recupero generale: </Text>
        {item.restSeconds} secondi
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {item.description}
      </Text>

      {item.days.map((day) => (
        <View key={day.id} style={styles.subCard}>
          <Text style={styles.cardTitle}>{day.name}</Text>
          {day.items.map((planItem) => {
            const exercise = data.exercises.find((entry) => entry.id === planItem.exerciseId);
            return (
              <Text key={planItem.id} style={styles.detailLine}>
                <Text style={styles.detailLabel}>{exercise?.name ?? "Esercizio eliminato"}: </Text>
                {planItem.sets} serie x {planItem.reps} ripetizioni
              </Text>
            );
          })}
        </View>
      ))}

      {item.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {item.notes}
        </Text>
      ) : null}
    </DetailShell>
  );
}
