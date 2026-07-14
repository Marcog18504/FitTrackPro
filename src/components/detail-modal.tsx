import { ExerciseDetailModal } from "./modals/detail/exercise-detail-modal";
import { GoalDetailModal } from "./modals/detail/goal-detail-modal";
import { PlanDetailModal } from "./modals/detail/plan-detail-modal";
import { SessionDetailModal } from "./modals/detail/session-detail-modal";
import { WorkoutDetailModal } from "./modals/detail/workout-detail-modal";
import { Exercise, FitnessData, FitnessGoal, PlannedSession, SelectedState, WorkoutLog, WorkoutPlan } from "../types";

type DetailModalProps = {
  selected: SelectedState;
  data: FitnessData;
  onClose: () => void;
};

export function DetailModal({ selected, data, onClose }: DetailModalProps) {
  if (!selected) return null;

  if (selected.entity === "exercise") {
    return <ExerciseDetailModal item={selected.item as Exercise} onClose={onClose} />;
  }

  if (selected.entity === "plan") {
    return <PlanDetailModal item={selected.item as WorkoutPlan} data={data} onClose={onClose} />;
  }

  if (selected.entity === "session") {
    return <SessionDetailModal item={selected.item as PlannedSession} data={data} onClose={onClose} />;
  }

  if (selected.entity === "workout") {
    return <WorkoutDetailModal item={selected.item as WorkoutLog} data={data} onClose={onClose} />;
  }

  return <GoalDetailModal item={selected.item as FitnessGoal} data={data} onClose={onClose} />;
}
