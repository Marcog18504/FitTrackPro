import { Text } from "react-native";
import { styles } from "../../../styles";
import { FitnessData, WorkoutLog } from "../../../types";
import { DetailShell } from "./detail-shell";

type WorkoutDetailModalProps = {
  item: WorkoutLog;
  data: FitnessData;
  onClose: () => void;
};

export function WorkoutDetailModal({ item, data, onClose }: WorkoutDetailModalProps) {
  const plan = data.plans.find((entry) => entry.id === item.planId);
  const day = plan?.days.find((entry) => entry.id === item.planDayId) ?? plan?.days[0];

  return (
    <DetailShell title={item.title} onClose={onClose}>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>data: </Text>
        {item.date}
      </Text>
      {plan ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>scheda: </Text>
          {plan.name}
        </Text>
      ) : null}
      {day ? (
        <>
          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>giorno svolto: </Text>
            {day.name} della scheda
          </Text>
          {day.items.map((planItem) => {
            const exercise = data.exercises.find((entry) => entry.id === planItem.exerciseId);
            const load = item.exerciseLoads.find((entry) => entry.planItemId === planItem.id)?.loadKg ?? 0;
            return (
              <Text key={planItem.id} style={styles.detailLine}>
                <Text style={styles.detailLabel}>{exercise?.name ?? "Esercizio eliminato"}: </Text>
                {planItem.sets} serie x {planItem.reps} ripetizioni
                {load > 0 ? ` - ${load} kg` : ""}
              </Text>
            );
          })}
        </>
      ) : null}
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>durata: </Text>
        {item.durationMinutes} minuti
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>fatica percepita: </Text>
        {item.effort}/10
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
