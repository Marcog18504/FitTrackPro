import { View } from "react-native";
import { EntityCard, SearchAndFilter, SectionTitle } from "../components/common";
import { difficulties } from "../constants";
import { styles } from "../styles";
import { FitnessData, SelectedState, WorkoutPlan } from "../types";

type PlansScreenProps = {
  data: FitnessData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (plan: WorkoutPlan) => void;
  onDelete: (id: string) => void;
  onDuplicate: (plan: WorkoutPlan) => void;
  setSelected: (selected: SelectedState) => void;
};

export function PlansScreen({
  data,
  query,
  setQuery,
  filter,
  setFilter,
  onCreate,
  onEdit,
  onDelete,
  onDuplicate,
  setSelected,
}: PlansScreenProps) {
  function planExerciseCount(plan: WorkoutPlan) {
    return plan.days.reduce((sum, day) => sum + day.items.length, 0);
  }

  const items = data.plans.filter((plan) => {
    const haystack = `${plan.name} ${plan.goal} ${plan.level}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (filter === "Tutti" || plan.goal === filter || plan.level === filter);
  });
  const goals = Array.from(new Set(data.plans.map((plan) => plan.goal)));

  return (
    <View style={styles.stack}>
      <SectionTitle title="Schede" actionLabel="Crea" onAction={onCreate} />
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        sections={[
          { title: "Obiettivo", options: goals },
          { title: "Livello", options: difficulties },
        ]}
      />
      {items.map((plan) => (
        <EntityCard
          key={plan.id}
          title={plan.name}
          subtitle={`${plan.goal} - ${plan.level}`}
          meta={`${plan.days.length} giorni - ${planExerciseCount(plan)} esercizi`}
          onOpen={() => setSelected({ entity: "plan", item: plan })}
          onEdit={() => onEdit(plan)}
          onDuplicate={() => onDuplicate(plan)}
          onDelete={() => onDelete(plan.id)}
        />
      ))}
    </View>
  );
}
