import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { DetailModal } from "./src/components/detail-modal";
import { EditModal } from "./src/components/edit-modal";
import { emptyData } from "./src/constants";
import { DashboardScreen } from "./src/screens/dashboard-screen";
import { ExercisesScreen } from "./src/screens/exercises-screen";
import { GoalsScreen } from "./src/screens/goals-screen";
import { PlansScreen } from "./src/screens/plans-screen";
import { SessionsScreen } from "./src/screens/sessions-screen";
import { WorkoutsScreen } from "./src/screens/workouts-screen";
import { loadFitnessData, resetFitnessData, saveFitnessData } from "./src/storage";
import { styles } from "./src/styles";
import {
  EditingState,
  Entity,
  Exercise,
  FitnessData,
  FitnessGoal,
  FitnessStats,
  GoalStatus,
  PlannedSession,
  SelectedState,
  WorkoutLog,
  WorkoutPlan,
} from "./src/types";
import { makeId } from "./src/utils";
import { makeUniqueCopyName, validateEntity } from "./src/validation";

type RootStackParamList = {
  MainTabs: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Esercizi: undefined;
  Schede: undefined;
  Sessioni: undefined;
  Storico: undefined;
  Obiettivi: undefined;
};

type AppState = {
  data: FitnessData;
  stats: FitnessStats;
  timerSeconds: number;
  timerRunning: boolean;
  setTimerSeconds: Dispatch<SetStateAction<number>>;
  setTimerRunning: Dispatch<SetStateAction<boolean>>;
  createEntity: (entity: Entity) => void;
  editEntity: (entity: Entity, item: unknown) => void;
  removeEntity: (entity: Entity, id: string) => void;
  duplicatePlan: (plan: WorkoutPlan) => Promise<void>;
  duplicateSession: (session: PlannedSession) => Promise<void>;
  setSelected: (selected: SelectedState) => void;
  confirmReset: () => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export default function App() {
  const [data, setData] = useState<FitnessData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState>(null);
  const [selected, setSelected] = useState<SelectedState>(null);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    loadFitnessData()
      .then(setData)
      .catch(() => Alert.alert("Errore", "Non riesco a caricare i dati locali."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) {
      if (timerSeconds <= 0) setTimerRunning(false);
      return;
    }

    const interval = setInterval(() => setTimerSeconds((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const stats = useMemo(() => {
    const completedSessions = data.sessions.filter((session) => session.status === "Completata").length;
    const plannedThisWeek = data.sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const now = new Date();
      const diffDays = (sessionDate.getTime() - now.getTime()) / 86400000;
      return diffDays >= -1 && diffDays <= 7;
    }).length;
    const totalMinutes = data.workouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
    const reachedGoals = data.goals.filter((goal) => goal.status === "Raggiunto").length;
    const muscleCounts = data.exercises.reduce<Record<string, number>>((acc, exercise) => {
      acc[exercise.primaryMuscle] = (acc[exercise.primaryMuscle] ?? 0) + 1;
      return acc;
    }, {});

    return { completedSessions, plannedThisWeek, totalMinutes, reachedGoals, muscleCounts };
  }, [data]);

  async function commit(nextData: FitnessData) {
    setData(nextData);
    await saveFitnessData(nextData);
  }

  function confirmDestructive(title: string, message: string, confirmText: string, onConfirm: () => void | Promise<void>) {
    if (Platform.OS === "web") {
      if (globalThis.confirm(`${title}\n\n${message}`)) {
        void onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: "Annulla", style: "cancel" },
      {
        text: confirmText,
        style: "destructive",
        onPress: () => {
          void onConfirm();
        },
      },
    ]);
  }

  async function saveEntity(entity: Entity, item: unknown) {
    const validation = validateEntity(entity, item, data);
    if (!validation.ok) {
      Alert.alert("Dato non valido", validation.message);
      return false;
    }

    if (entity === "exercise") {
      const exercise = validation.item as Exercise;
      const exists = data.exercises.some((entry) => entry.id === exercise.id);
      await commit({
        ...data,
        exercises: exists ? data.exercises.map((entry) => (entry.id === exercise.id ? exercise : entry)) : [exercise, ...data.exercises],
      });
      return true;
    }

    if (entity === "plan") {
      const plan = validation.item as WorkoutPlan;
      const exists = data.plans.some((entry) => entry.id === plan.id);
      await commit({
        ...data,
        plans: exists ? data.plans.map((entry) => (entry.id === plan.id ? plan : entry)) : [plan, ...data.plans],
      });
      return true;
    }

    if (entity === "session") {
      const session = validation.item as PlannedSession;
      const exists = data.sessions.some((entry) => entry.id === session.id);
      await commit({
        ...data,
        sessions: exists ? data.sessions.map((entry) => (entry.id === session.id ? session : entry)) : [session, ...data.sessions],
      });
      return true;
    }

    if (entity === "workout") {
      const workout = validation.item as WorkoutLog;
      const exists = data.workouts.some((entry) => entry.id === workout.id);
      await commit({
        ...data,
        workouts: exists ? data.workouts.map((entry) => (entry.id === workout.id ? workout : entry)) : [workout, ...data.workouts],
      });
      return true;
    }

    if (entity === "goal") {
      const goal = validation.item as FitnessGoal;
      const normalized = { ...goal, status: goal.current >= goal.target ? ("Raggiunto" as GoalStatus) : goal.status };
      const exists = data.goals.some((entry) => entry.id === normalized.id);
      await commit({
        ...data,
        goals: exists ? data.goals.map((entry) => (entry.id === normalized.id ? normalized : entry)) : [normalized, ...data.goals],
      });
      return true;
    }

    return false;
  }

  function removeEntity(entity: Entity, id: string) {
    confirmDestructive("Elimina", "Confermi l'eliminazione?", "Elimina", async () => {
      if (entity === "exercise") await commit({ ...data, exercises: data.exercises.filter((item) => item.id !== id) });
      if (entity === "plan") await commit({ ...data, plans: data.plans.filter((item) => item.id !== id) });
      if (entity === "session") await commit({ ...data, sessions: data.sessions.filter((item) => item.id !== id) });
      if (entity === "workout") await commit({ ...data, workouts: data.workouts.filter((item) => item.id !== id) });
      if (entity === "goal") await commit({ ...data, goals: data.goals.filter((item) => item.id !== id) });
    });
  }

  async function duplicatePlan(plan: WorkoutPlan) {
    await commit({
      ...data,
      plans: [
        {
          ...plan,
          id: makeId("pl"),
          name: makeUniqueCopyName(data.plans.map((entry) => entry.name), plan.name),
          days: plan.days.map((day) => ({
            ...day,
            id: makeId("day"),
            items: day.items.map((item) => ({ ...item, id: makeId("pe") })),
          })),
        },
        ...data.plans,
      ],
    });
  }

  async function duplicateSession(session: PlannedSession) {
    await commit({
      ...data,
      sessions: [
        {
          ...session,
          id: makeId("se"),
          title: makeUniqueCopyName(data.sessions.map((entry) => entry.title), session.title),
          status: "Da svolgere",
        },
        ...data.sessions,
      ],
    });
  }

  function confirmReset() {
    confirmDestructive("Reset dati", "Vuoi ripristinare i dati demo?", "Reset", async () => setData(await resetFitnessData()));
  }

  const appState: AppState = {
    data,
    stats,
    timerSeconds,
    timerRunning,
    setTimerSeconds,
    setTimerRunning,
    createEntity: (entity) => setEditing({ entity }),
    editEntity: (entity, item) => setEditing({ entity, item }),
    removeEntity,
    duplicatePlan,
    duplicateSession,
    setSelected,
    confirmReset,
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>FitTrackPro</Text>
        <Text style={styles.muted}>Caricamento dati...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
            {() => <MainTabs appState={appState} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <EditModal
        editing={editing}
        data={data}
        onClose={() => setEditing(null)}
        onSave={async (entity, item) => {
          const saved = await saveEntity(entity, item);
          if (saved) setEditing(null);
        }}
      />
      <DetailModal selected={selected} data={data} onClose={() => setSelected(null)} />
    </>
  );
}

function MainTabs({ appState }: { appState: AppState }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#F6F7F2" },
        headerTintColor: "#17211B",
        headerRight: () => <ResetButton onReset={appState.confirmReset} />,
        tabBarActiveTintColor: "#123C2D",
        tabBarInactiveTintColor: "#68746B",
        tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#E0E5DC" },
      }}
    >
      <Tab.Screen name="Dashboard">{() => <DashboardRoute appState={appState} />}</Tab.Screen>
      <Tab.Screen name="Esercizi">{() => <ExercisesRoute appState={appState} />}</Tab.Screen>
      <Tab.Screen name="Schede">{() => <PlansRoute appState={appState} />}</Tab.Screen>
      <Tab.Screen name="Sessioni">{() => <SessionsRoute appState={appState} />}</Tab.Screen>
      <Tab.Screen name="Storico">{() => <WorkoutsRoute appState={appState} />}</Tab.Screen>
      <Tab.Screen name="Obiettivi">{() => <GoalsRoute appState={appState} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Pressable style={[styles.ghostButton, { marginRight: 14 }]} onPress={onReset}>
      <Text style={styles.ghostButtonText}>Reset</Text>
    </Pressable>
  );
}

function DashboardRoute({ appState }: { appState: AppState }) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <DashboardScreen
        data={appState.data}
        stats={appState.stats}
        timerSeconds={appState.timerSeconds}
        timerRunning={appState.timerRunning}
        setTimerSeconds={appState.setTimerSeconds}
        setTimerRunning={appState.setTimerRunning}
        onNewExercise={() => appState.createEntity("exercise")}
      />
    </ScrollView>
  );
}

function ExercisesRoute({ appState }: { appState: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <ExercisesScreen
        data={appState.data}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        onCreate={() => appState.createEntity("exercise")}
        onEdit={(exercise) => appState.editEntity("exercise", exercise)}
        onDelete={(id) => appState.removeEntity("exercise", id)}
        setSelected={appState.setSelected}
      />
    </ScrollView>
  );
}

function PlansRoute({ appState }: { appState: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <PlansScreen
        data={appState.data}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        onCreate={() => appState.createEntity("plan")}
        onEdit={(plan) => appState.editEntity("plan", plan)}
        onDelete={(id) => appState.removeEntity("plan", id)}
        onDuplicate={appState.duplicatePlan}
        setSelected={appState.setSelected}
      />
    </ScrollView>
  );
}

function SessionsRoute({ appState }: { appState: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SessionsScreen
        data={appState.data}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        onCreate={() => appState.createEntity("session")}
        onEdit={(session) => appState.editEntity("session", session)}
        onDelete={(id) => appState.removeEntity("session", id)}
        onDuplicate={appState.duplicateSession}
        setSelected={appState.setSelected}
      />
    </ScrollView>
  );
}

function WorkoutsRoute({ appState }: { appState: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <WorkoutsScreen
        data={appState.data}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        onCreate={() => appState.createEntity("workout")}
        onEdit={(workout) => appState.editEntity("workout", workout)}
        onDelete={(id) => appState.removeEntity("workout", id)}
        setSelected={appState.setSelected}
      />
    </ScrollView>
  );
}

function GoalsRoute({ appState }: { appState: AppState }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tutti");

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <GoalsScreen
        data={appState.data}
        query={query}
        setQuery={setQuery}
        filter={filter}
        setFilter={setFilter}
        onCreate={() => appState.createEntity("goal")}
        onEdit={(goal) => appState.editEntity("goal", goal)}
        onDelete={(id) => appState.removeEntity("goal", id)}
        setSelected={appState.setSelected}
      />
    </ScrollView>
  );
}
