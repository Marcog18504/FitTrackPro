import { ExerciseEditModal } from "./modals/edit/exercise-edit-modal";
import { GoalEditModal } from "./modals/edit/goal-edit-modal";
import { PlanEditModal } from "./modals/edit/plan-edit-modal";
import { SessionEditModal } from "./modals/edit/session-edit-modal";
import { WorkoutEditModal } from "./modals/edit/workout-edit-modal";
import { EditingState, Entity, Exercise, FitnessData, FitnessGoal, PlannedSession, WorkoutLog, WorkoutPlan } from "../types";

type EditModalProps = {
  editing: EditingState;
  data: FitnessData;
  onClose: () => void;
  onSave: (entity: Entity, item: unknown) => void;
};

export function EditModal({ editing, data, onClose, onSave }: EditModalProps) {
  if (!editing) return null;

  if (editing.entity === "exercise") {
    return <ExerciseEditModal item={editing.item as Exercise | undefined} data={data} onClose={onClose} onSave={(item) => onSave("exercise", item)} />;
  }

  if (editing.entity === "plan") {
    return <PlanEditModal item={editing.item as WorkoutPlan | undefined} data={data} onClose={onClose} onSave={(item) => onSave("plan", item)} />;
  }

  if (editing.entity === "session") {
    return <SessionEditModal item={editing.item as PlannedSession | undefined} data={data} onClose={onClose} onSave={(item) => onSave("session", item)} />;
  }

  if (editing.entity === "workout") {
    return <WorkoutEditModal item={editing.item as WorkoutLog | undefined} data={data} onClose={onClose} onSave={(item) => onSave("workout", item)} />;
  }

  return <GoalEditModal item={editing.item as FitnessGoal | undefined} data={data} onClose={onClose} onSave={(item) => onSave("goal", item)} />;
}
