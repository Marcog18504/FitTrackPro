import { Text } from "react-native";
import { styles } from "../../../styles";
import { Exercise } from "../../../types";
import { DetailShell } from "./detail-shell";

type ExerciseDetailModalProps = {
  item: Exercise;
  onClose: () => void;
};

export function ExerciseDetailModal({ item, onClose }: ExerciseDetailModalProps) {
  return (
    <DetailShell title={item.name} onClose={onClose}>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {item.description}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>gruppo principale: </Text>
        {item.primaryMuscle}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>gruppi secondari: </Text>
        {item.secondaryMuscles}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>difficolta: </Text>
        {item.difficulty}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>attrezzatura: </Text>
        {item.equipment}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>serie consigliate: </Text>
        {item.recommendedSets}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>ripetizioni consigliate: </Text>
        {item.recommendedReps} per serie
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>durata stimata: </Text>
        {item.estimatedDurationMinutes} minuti
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
