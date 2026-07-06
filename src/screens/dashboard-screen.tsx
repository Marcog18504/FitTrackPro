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
};

export function DashboardScreen({
  data,
  stats,
  timerSeconds,
  timerRunning,
  setTimerSeconds,
  setTimerRunning,
  onNewExercise,
}: DashboardScreenProps) {
  return (
    <View style={styles.stack}>
      <SectionTitle title="Riepilogo" actionLabel="Nuovo esercizio" onAction={onNewExercise} />
      <View style={styles.statsGrid}>
        <StatCard label="Esercizi" value={data.exercises.length} />
        <StatCard label="Schede" value={data.plans.length} />
        <StatCard label="Sessioni settimana" value={stats.plannedThisWeek} />
        <StatCard label="Allenamenti" value={data.workouts.length} />
        <StatCard label="Minuti totali" value={stats.totalMinutes} />
        <StatCard label="Obiettivi raggiunti" value={`${stats.reachedGoals}/${data.goals.length}`} />
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
            <Text style={styles.secondaryButtonText}>90s</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setTimerRunning(false);
              setTimerSeconds(180);
            }}
          >
            <Text style={styles.secondaryButtonText}>3 min</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Distribuzione muscoli</Text>
        {Object.entries(stats.muscleCounts).map(([muscle, count]) => (
          <View key={muscle} style={styles.progressRow}>
            <Text style={styles.itemText}>{muscle}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, count * 30)}%` }]} />
            </View>
            <Text style={styles.muted}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
