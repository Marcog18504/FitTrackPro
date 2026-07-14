import { Text, View } from "react-native";
import { CardActions, SearchAndFilter, SectionTitle } from "../components/common";
import { styles } from "../styles";
import { FitnessData, SelectedState, WorkoutLog } from "../types";

type WorkoutsScreenProps = {
  data: FitnessData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (workout: WorkoutLog) => void;
  onDelete: (id: string) => void;
  setSelected: (selected: SelectedState) => void;
};

export function WorkoutsScreen({
  data,
  query,
  setQuery,
  filter,
  setFilter,
  onCreate,
  onEdit,
  onDelete,
  setSelected,
}: WorkoutsScreenProps) {
  const items = data.workouts.filter((workout) => {
    const plan = data.plans.find((entry) => entry.id === workout.planId);
    const day = plan?.days.find((entry) => entry.id === workout.planDayId) ?? plan?.days[0];
    const exerciseNames =
      day?.items
        .map((item) => data.exercises.find((entry) => entry.id === item.exerciseId)?.name)
        .filter(Boolean)
        .join(" ") ?? "";
    const haystack = `${workout.title} ${workout.date} ${workout.notes} ${plan?.name ?? ""} ${day?.name ?? ""} ${exerciseNames}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.stack}>
      <SectionTitle title="Storico allenamenti" actionLabel="Registra" onAction={onCreate} />
      <SearchAndFilter query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
      {sorted.map((workout, index) => {
        const plan = data.plans.find((entry) => entry.id === workout.planId);
        const day = plan?.days.find((entry) => entry.id === workout.planDayId) ?? plan?.days[0];
        const dayExercises =
          day?.items.map((item) => {
            const exercise = data.exercises.find((entry) => entry.id === item.exerciseId);
            const load = workout.exerciseLoads.find((entry) => entry.planItemId === item.id)?.loadKg ?? 0;
            return {
              id: item.id,
              name: exercise?.name ?? "Esercizio eliminato",
              sets: item.sets,
              reps: item.reps,
              load,
            };
          }) ?? [];
        const previous = sorted[index + 1];
        const comparison = previous
          ? `${workout.durationMinutes - previous.durationMinutes >= 0 ? "+" : ""}${workout.durationMinutes - previous.durationMinutes} min dal precedente`
          : "Primo dato disponibile";

        return (
          <View key={workout.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{workout.title}</Text>
                <Text style={styles.muted}>{workout.date} - fatica {workout.effort}/10</Text>
              </View>
              <Text style={styles.badge}>{workout.durationMinutes} min</Text>
            </View>

            {plan && day ? (
              <Text style={styles.detailLine}>
                Allenamento con scheda {plan.name} - {day.name} della scheda
              </Text>
            ) : null}
            {dayExercises.map((exercise) => (
              <Text key={exercise.id} style={styles.detailLine}>
                <Text style={styles.detailLabel}>{exercise.name}: </Text>
                {exercise.sets} serie x {exercise.reps} ripetizioni
                {exercise.load > 0 ? ` - ${exercise.load} kg` : ""}
              </Text>
            ))}
            <Text style={styles.muted}>{comparison}</Text>

            <CardActions
              onOpen={() => setSelected({ entity: "workout", item: workout })}
              onEdit={() => onEdit(workout)}
              onDelete={() => onDelete(workout.id)}
            />
          </View>
        );
      })}
    </View>
  );
}
