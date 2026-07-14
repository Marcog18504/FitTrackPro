import { View } from "react-native";
import { difficulties } from "../constants";
import { EntityCard, SearchAndFilter, SectionTitle } from "../components/common";
import { styles } from "../styles";
import { Exercise, FitnessData, SelectedState } from "../types";

type ExercisesScreenProps = {
  data: FitnessData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  setSelected: (selected: SelectedState) => void;
};

export function ExercisesScreen({
  data,
  query,
  setQuery,
  filter,
  setFilter,
  onCreate,
  onEdit,
  onDelete,
  setSelected,
}: ExercisesScreenProps) {
  const muscles = Array.from(new Set(data.exercises.map((exercise) => exercise.primaryMuscle)));
  const items = data.exercises.filter((exercise) => {
    const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Tutti" || exercise.primaryMuscle === filter || exercise.difficulty === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <View style={styles.stack}>
      <SectionTitle title="Esercizi" actionLabel="Aggiungi" onAction={onCreate} />
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        sections={[
          { title: "Gruppo muscolare", options: muscles },
          { title: "Difficolta", options: difficulties },
        ]}
      />
      {items.map((exercise) => (
        <EntityCard
          key={exercise.id}
          title={exercise.name}
          subtitle={`${exercise.primaryMuscle} - ${exercise.difficulty}`}
          meta={`${exercise.recommendedSets}x${exercise.recommendedReps} - ${exercise.estimatedDurationMinutes} min`}
          onOpen={() => setSelected({ entity: "exercise", item: exercise })}
          onEdit={() => onEdit(exercise)}
          onDelete={() => onDelete(exercise.id)}
        />
      ))}
    </View>
  );
}
