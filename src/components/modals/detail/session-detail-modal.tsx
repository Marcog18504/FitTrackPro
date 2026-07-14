import { Text } from "react-native";
import { styles } from "../../../styles";
import { FitnessData, PlannedSession } from "../../../types";
import { DetailShell } from "./detail-shell";

type SessionDetailModalProps = {
  item: PlannedSession;
  data: FitnessData;
  onClose: () => void;
};

export function SessionDetailModal({ item, data, onClose }: SessionDetailModalProps) {
  const plan = data.plans.find((entry) => entry.id === item.planId);
  const day = plan?.days.find((entry) => entry.id === item.planDayId) ?? plan?.days[0];

  return (
    <DetailShell title={item.title} onClose={onClose}>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>data: </Text>
        {item.date}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>tipo: </Text>
        {item.type}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>stato: </Text>
        {item.status}
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
            <Text style={styles.detailLabel}>giorno pianificato: </Text>
            {day.name} della scheda
          </Text>
          {day.items.map((planItem) => {
            const exercise = data.exercises.find((entry) => entry.id === planItem.exerciseId);
            return (
              <Text key={planItem.id} style={styles.detailLine}>
                <Text style={styles.detailLabel}>{exercise?.name ?? "Esercizio eliminato"}: </Text>
                {planItem.sets} serie x {planItem.reps} ripetizioni
              </Text>
            );
          })}
        </>
      ) : null}
      {item.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {item.notes}
        </Text>
      ) : null}
    </DetailShell>
  );
}
