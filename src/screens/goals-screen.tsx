import { Text, View } from "react-native";
import { CardActions, SearchAndFilter, SectionTitle } from "../components/common";
import { goalStatuses, goalTypes } from "../constants";
import { styles } from "../styles";
import { FitnessData, FitnessGoal, SelectedState } from "../types";
import { progressPercent } from "../utils";

type GoalsScreenProps = {
  data: FitnessData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (goal: FitnessGoal) => void;
  onDelete: (id: string) => void;
  setSelected: (selected: SelectedState) => void;
};

export function GoalsScreen({
  data,
  query,
  setQuery,
  filter,
  setFilter,
  onCreate,
  onEdit,
  onDelete,
  setSelected,
}: GoalsScreenProps) {
  const items = data.goals.filter((goal) => {
    const haystack = `${goal.title} ${goal.category} ${goal.goalType} ${goal.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (filter === "Tutti" || goal.status === filter || goal.category === filter || goal.goalType === filter);
  });

  return (
    <View style={styles.stack}>
      <SectionTitle title="Obiettivi" actionLabel="Aggiungi" onAction={onCreate} />
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        sections={[
          { title: "Stato", options: goalStatuses },
          { title: "Categoria", options: goalTypes },
        ]}
      />
      {items.map((goal) => (
        <View key={goal.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.flex}>
              <Text style={styles.cardTitle}>{goal.title}</Text>
              <Text style={styles.muted}>
                {goal.category} - {goal.status}
              </Text>
            </View>
            <Text style={styles.badge}>{progressPercent(goal.current, goal.target)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent(goal.current, goal.target)}%` }]} />
          </View>
          <Text style={styles.itemText}>
            {goal.current}/{goal.target} entro {goal.dueDate || "nessuna scadenza"}
          </Text>
          <CardActions
            onOpen={() => setSelected({ entity: "goal", item: goal })}
            onEdit={() => onEdit(goal)}
            onDelete={() => onDelete(goal.id)}
          />
        </View>
      ))}
    </View>
  );
}
