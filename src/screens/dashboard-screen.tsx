import { Pressable, Text, View } from "react-native";
import { SectionTitle, StatCard } from "../components/common";
import { styles } from "../styles";
import { FitnessData, FitnessStats } from "../types";
import { formatTimer } from "../utils";

type DashboardScreenProps = {
  data: FitnessData;
  stats: FitnessStats;
  timerSeconds: number;
  timerRunning: boolean;
  setTimerSeconds: (value: number) => void;
  setTimerRunning: (value: boolean | ((current: boolean) => boolean)) => void;
  onNewExercise: () => void;
  onNewPlan: () => void;
  onStartTodayWorkout: () => void;
};

export function DashboardScreen({
  data,
  stats,
  timerSeconds,
  timerRunning,
  setTimerSeconds,
  setTimerRunning,
  onNewExercise,
  onNewPlan,
  onStartTodayWorkout,
}: DashboardScreenProps) {
  const today = getTodayKey();
  const todaySession = data.sessions.find((session) => session.date === today);
  const todayPlan = data.plans.find((plan) => plan.id === todaySession?.planId) ?? data.plans[0];
  const todayDay = todayPlan?.days.find((day) => day.id === todaySession?.planDayId) ?? todayPlan?.days[0];
  const streakDays = getCurrentWeekTrainingDays(data.workouts.map((workout) => workout.date));
  const muscleEntries = Object.entries(stats.muscleCounts).sort((a, b) => b[1] - a[1]);
  const visibleMuscles = muscleEntries.slice(0, 4);
  const hiddenMuscleCount = Math.max(0, muscleEntries.length - visibleMuscles.length);

  return (
    <View style={styles.stack}>
      <SectionTitle title="Riepilogo" actionLabel="Nuovo esercizio" onAction={onNewExercise} />

      <View style={styles.highlightCard}>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.overline}>Ingresso rapido</Text>
            <Text style={styles.highlightTitle}>{todayPlan ? `Oggi: Scheda ${todayPlan.name}` : "Oggi: nessuna scheda"}</Text>
            <Text style={styles.highlightMuted}>
              {todayPlan && todayDay
                ? `${todayDay.name} - ${todayDay.items.length} esercizi pronti`
                : "Crea una scheda per avviare rapidamente l'allenamento."}
            </Text>
          </View>
          <Text style={styles.highlightBadge}>{todaySession?.status ?? "Pronto"}</Text>
        </View>
        <Pressable style={styles.highlightButton} onPress={todayPlan ? onStartTodayWorkout : onNewPlan}>
          <Text style={styles.highlightButtonText}>{todayPlan ? "Registra allenamento" : "Crea scheda"}</Text>
        </Pressable>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Esercizi" value={data.exercises.length} icon="barbell-outline" />
        <StatCard label="Schede" value={data.plans.length} icon="clipboard-outline" />
        <StatCard label="Sessioni settimana" value={stats.plannedThisWeek} icon="calendar-outline" />
        <StatCard label="Allenamenti" value={data.workouts.length} icon="fitness-outline" />
        <StatCard label="Minuti totali" value={stats.totalMinutes} icon="stopwatch-outline" />
        <StatCard label="Obiettivi raggiunti" value={`${stats.reachedGoals}/${data.goals.length}`} icon="flag-outline" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <Text style={styles.cardTitle}>Costanza settimanale</Text>
            <Text style={styles.muted}>Si colora quando registri un allenamento.</Text>
          </View>
          <Text style={styles.badge}>{streakDays.filter((day) => day.trained).length}/7</Text>
        </View>
        <View style={styles.weekRow}>
          {streakDays.map((day) => (
            <View key={day.key} style={[styles.weekDay, day.trained && styles.activeWeekDay]}>
              <Text style={[styles.weekDayText, day.trained && styles.activeWeekDayText]}>{day.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Timer recupero</Text>
        <Text style={styles.timer}>{formatTimer(timerSeconds)}</Text>
        <View style={styles.row}>
          <Pressable style={styles.primaryButton} onPress={() => setTimerRunning((value) => !value)}>
            <Text style={styles.primaryButtonText}>{timerRunning ? "Pausa" : "Avvia"}</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setTimerRunning(false);
              setTimerSeconds(90);
            }}
          >
            <Text style={styles.secondaryButtonText}>1:30</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setTimerRunning(false);
              setTimerSeconds(180);
            }}
          >
            <Text style={styles.secondaryButtonText}>3:00</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setTimerSeconds(timerSeconds + 30)}>
            <Text style={styles.secondaryButtonText}>+30s</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribuzione muscoli</Text>
        {visibleMuscles.map(([muscle, count]) => (
          <View key={muscle} style={styles.progressRow}>
            <Text style={styles.itemText}>{muscle}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, count * 30)}%` }]} />
            </View>
            <Text style={styles.muted}>{count}</Text>
          </View>
        ))}
        {hiddenMuscleCount > 0 ? <Text style={styles.muted}>+{hiddenMuscleCount} altri gruppi muscolari</Text> : null}
      </View>
    </View>
  );
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekTrainingDays(workoutDates: string[]) {
  const labels = ["L", "M", "M", "G", "V", "S", "D"];
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const trainedDays = new Set(
    workoutDates
      .map((date) => {
        const parsed = parseDateKey(date);
        if (!parsed) return null;
        const diffDays = Math.floor((parsed.getTime() - monday.getTime()) / 86400000);
        return diffDays >= 0 && diffDays < 7 ? diffDays : null;
      })
      .filter((value): value is number => value !== null),
  );

  return labels.map((label, index) => ({ key: `${label}-${index}`, label, trained: trainedDays.has(index) }));
}

function parseDateKey(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
