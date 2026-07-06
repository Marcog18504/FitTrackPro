import { View } from "react-native";
import { EntityCard, SearchAndFilter, SectionTitle } from "../components/common";
import { sessionStatuses } from "../constants";
import { styles } from "../styles";
import { FitnessData, PlannedSession, SelectedState } from "../types";

type SessionsScreenProps = {
  data: FitnessData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onCreate: () => void;
  onEdit: (session: PlannedSession) => void;
  onDelete: (id: string) => void;
  onDuplicate: (session: PlannedSession) => void;
  setSelected: (selected: SelectedState) => void;
};

export function SessionsScreen({
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
}: SessionsScreenProps) {
  const items = data.sessions.filter((session) => {
    const plan = data.plans.find((entry) => entry.id === session.planId);
    const day = plan?.days.find((entry) => entry.id === session.planDayId) ?? plan?.days[0];
    const exerciseNames =
      day?.items
        .map((item) => data.exercises.find((entry) => entry.id === item.exerciseId)?.name)
        .filter(Boolean)
        .join(" ") ?? "";
    const haystack = `${session.title} ${session.type} ${session.status} ${session.date} ${plan?.name ?? ""} ${day?.name ?? ""} ${exerciseNames}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (filter === "Tutti" || session.status === filter || session.type === filter);
  });
  const types = Array.from(new Set(data.sessions.map((session) => session.type)));

  return (
    <View style={styles.stack}>
      <SectionTitle title="Sessioni pianificate" actionLabel="Pianifica" onAction={onCreate} />
      <SearchAndFilter
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        sections={[
          { title: "Stato", options: sessionStatuses },
          { title: "Tipo", options: types },
        ]}
      />
      {items.map((session) => {
        const plan = data.plans.find((entry) => entry.id === session.planId);
        const day = plan?.days.find((entry) => entry.id === session.planDayId) ?? plan?.days[0];

        return (
          <EntityCard
            key={session.id}
            title={session.title}
            subtitle={`${session.date} - ${session.status}${plan && day ? ` - ${plan.name}, ${day.name}` : ""}`}
            meta={session.type}
            onOpen={() => setSelected({ entity: "session", item: session })}
            onEdit={() => onEdit(session)}
            onDuplicate={() => onDuplicate(session)}
            onDelete={() => onDelete(session.id)}
          />
        );
      })}
    </View>
  );
}
