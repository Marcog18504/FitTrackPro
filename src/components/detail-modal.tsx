import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";
import { FitnessData, PlannedSession, SelectedState, WorkoutLog, WorkoutPlan } from "../types";

type DetailModalProps = {
  selected: SelectedState;
  data: FitnessData;
  onClose: () => void;
};

export function DetailModal({ selected, data, onClose }: DetailModalProps) {
  if (!selected) return null;

  const item = selected.item as Record<string, unknown>;
  const selectedPlan = selected.entity === "plan" ? (selected.item as WorkoutPlan) : null;
  const planName = data.plans.find((plan) => plan.id === item.planId)?.name;
  const exerciseNames = ((item.exerciseIds as string[] | undefined) ?? [])
    .map((id) => data.exercises.find((exercise) => exercise.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} transparent>
      <View style={styles.overlay}>
        <View style={styles.detailBox}>
          <ScrollView contentContainerStyle={styles.stack}>
            <Text style={styles.sectionTitle}>{String(item.name ?? item.title ?? "Dettaglio")}</Text>
            {selectedPlan ? (
              <PlanDetail plan={selectedPlan} data={data} />
            ) : selected.entity === "exercise" ? (
              <ExerciseDetail item={item} />
            ) : selected.entity === "workout" ? (
              <WorkoutDetail item={selected.item as WorkoutLog} data={data} />
            ) : selected.entity === "session" ? (
              <SessionDetail item={selected.item as PlannedSession} data={data} />
            ) : selected.entity === "goal" ? (
              <GoalDetail item={item} />
            ) : (
              <>
                {Object.entries(item).map(([key, value]) => {
                  if (key === "id" || key === "exerciseIds" || key === "planId") return null;
                  return (
                    <Text key={key} style={styles.detailLine}>
                      <Text style={styles.detailLabel}>{key}: </Text>
                      {String(value)}
                    </Text>
                  );
                })}
                {planName && (
                  <Text style={styles.detailLine}>
                    <Text style={styles.detailLabel}>scheda: </Text>
                    {planName}
                  </Text>
                )}
                {exerciseNames && (
                  <Text style={styles.detailLine}>
                    <Text style={styles.detailLabel}>esercizi: </Text>
                    {exerciseNames}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Ok</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SessionDetail({ item, data }: { item: PlannedSession; data: FitnessData }) {
  const plan = data.plans.find((entry) => entry.id === item.planId);
  const day = plan?.days.find((entry) => entry.id === item.planDayId) ?? plan?.days[0];

  return (
    <>
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
    </>
  );
}

function PlanDetail({ plan, data }: { plan: WorkoutPlan; data: FitnessData }) {
  return (
    <>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>obiettivo: </Text>
        {plan.goal}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>livello: </Text>
        {plan.level}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>durata: </Text>
        {plan.durationMinutes} minuti
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>frequenza: </Text>
        {plan.frequencyPerWeek} volte a settimana
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>recupero generale: </Text>
        {plan.restSeconds} secondi
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {plan.description}
      </Text>

      {plan.days.map((day) => (
        <View key={day.id} style={styles.subCard}>
          <Text style={styles.cardTitle}>{day.name}</Text>
          {day.items.map((item) => {
            const exercise = data.exercises.find((entry) => entry.id === item.exerciseId);
            return (
              <Text key={item.id} style={styles.detailLine}>
                <Text style={styles.detailLabel}>{exercise?.name ?? "Esercizio eliminato"}: </Text>
                {item.sets} serie x {item.reps} ripetizioni
              </Text>
            );
          })}
        </View>
      ))}

      {plan.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {plan.notes}
        </Text>
      ) : null}
    </>
  );
}

function ExerciseDetail({ item }: { item: Record<string, unknown> }) {
  return (
    <>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {String(item.description ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>gruppo principale: </Text>
        {String(item.primaryMuscle ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>gruppi secondari: </Text>
        {String(item.secondaryMuscles ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>difficolta: </Text>
        {String(item.difficulty ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>attrezzatura: </Text>
        {String(item.equipment ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>serie consigliate: </Text>
        {String(item.recommendedSets ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>ripetizioni consigliate: </Text>
        {String(item.recommendedReps ?? "")} per serie
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>durata stimata: </Text>
        {String(item.estimatedDurationMinutes ?? "")} minuti
      </Text>
      {item.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {String(item.notes)}
        </Text>
      ) : null}
    </>
  );
}

function WorkoutDetail({ item, data }: { item: WorkoutLog; data: FitnessData }) {
  const plan = data.plans.find((entry) => entry.id === item.planId);
  const day = plan?.days.find((entry) => entry.id === item.planDayId) ?? plan?.days[0];
  return (
    <>
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
    </>
  );
}

function GoalDetail({ item }: { item: Record<string, unknown> }) {
  return (
    <>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>descrizione: </Text>
        {String(item.description ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>categoria: </Text>
        {String(item.category ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>valore target: </Text>
        {String(item.target ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>valore attuale: </Text>
        {String(item.current ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>data inizio: </Text>
        {String(item.startDate ?? "")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>scadenza: </Text>
        {String(item.dueDate || "nessuna scadenza")}
      </Text>
      <Text style={styles.detailLine}>
        <Text style={styles.detailLabel}>stato: </Text>
        {String(item.status ?? "")}
      </Text>
      {item.notes ? (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>note: </Text>
          {String(item.notes)}
        </Text>
      ) : null}
    </>
  );
}
