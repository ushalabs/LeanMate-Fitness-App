import { EXERCISE_BY_ID } from '../constants/exercises';
import { ExerciseSet, PersonalRecord, WorkoutExercise, WorkoutLog } from '../types/training';

export const completedSets = (entry: WorkoutExercise): ExerciseSet[] => (entry.sets || []).filter(
  (s) => s.completed && Number.isFinite(s.weightKg ?? 0) && (s.weightKg ?? 0) >= 0 &&
    ((Number.isInteger(s.reps) && (s.reps ?? 0) > 0) || (Number.isFinite(s.durationSeconds) && (s.durationSeconds ?? 0) > 0))
);

export const estimated1RM = (weight: number, reps: number): number =>
  Number.isFinite(weight) && weight > 0 && Number.isInteger(reps) && reps > 0 && reps <= 12
    ? (reps === 1 ? weight : weight * (1 + reps / 30)) : 0;

export const workoutOrder = (a: WorkoutLog, b: WorkoutLog) =>
  a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id);

export interface ExercisePerformance {
  workout: WorkoutLog;
  entry: WorkoutExercise;
  topWeight: number;
  e1rm: number;
  volume: number;
  bestSet?: ExerciseSet;
}

export function exerciseHistory(workouts: WorkoutLog[], exerciseId: string): ExercisePerformance[] {
  const weighted = EXERCISE_BY_ID.get(exerciseId)?.tracking === 'weighted';
  return workouts.filter((w) => w.trained).slice().sort(workoutOrder).flatMap((workout) => {
    const entries = (workout.exercises || []).filter((e) => e.exerciseId === exerciseId);
    if (!entries.length) return [];
    const entry = { ...entries[0], sets: entries.flatMap(completedSets) };
    if (!entry.sets.length) return [];
    const bestSet = [...entry.sets].sort((a, b) =>
      (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? b.durationSeconds ?? 0) - (a.reps ?? a.durationSeconds ?? 0))[0];
    return [{
      workout, entry, bestSet,
      topWeight: Math.max(0, ...entry.sets.map((s) => s.weightKg ?? 0)),
      e1rm: weighted ? Math.max(0, ...entry.sets.map((s) => estimated1RM(s.weightKg ?? 0, s.reps ?? 0))) : 0,
      volume: weighted ? entry.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0) : 0,
    }];
  });
}

export const prEngine = {
  detect(workout: WorkoutLog, history: WorkoutLog[]): PersonalRecord[] {
    if (!workout.trained) return [];
    // Backdated entries compare only to earlier sessions, never to their future.
    const prior = history.filter((w) => w.id !== workout.id && workoutOrder(w, workout) < 0);
    const records: PersonalRecord[] = [];
    const ids = [...new Set((workout.exercises || []).flatMap((e) => e.exerciseId ? [e.exerciseId] : []))];
    ids.forEach((exerciseId) => {
      const previous = exerciseHistory(prior, exerciseId);
      const current = exerciseHistory([workout], exerciseId)[0];
      // A first performance establishes a baseline rather than beating an invented record.
      if (!current || !previous.length) return;
      const add = (kind: PersonalRecord['kind'], value: number, previousValue: number, set = current.bestSet) => {
        const tolerance = kind === 'weight' ? 0.01 : kind === 'estimated1RM' ? 0.05 : kind === 'volume' ? 0.5 : 0;
        if (value > previousValue + tolerance) records.push({
          exerciseId, exerciseName: current.entry.name, kind, value, previousValue,
          ...(set?.weightKg !== undefined ? { weightKg: set.weightKg } : {}),
          ...(set?.reps !== undefined ? { reps: set.reps } : {}),
        });
      };
      add('weight', current.topWeight, Math.max(...previous.map((p) => p.topWeight)));
      const priorE1rm = Math.max(...previous.map((p) => p.e1rm));
      const e1Set = [...current.entry.sets].sort((a, b) => estimated1RM(b.weightKg ?? 0, b.reps ?? 0) - estimated1RM(a.weightKg ?? 0, a.reps ?? 0))[0];
      if (priorE1rm > 0) add('estimated1RM', current.e1rm, priorE1rm, e1Set);
      const priorVolume = Math.max(...previous.map((p) => p.volume));
      if (priorVolume > 0) add('volume', current.volume, priorVolume);
      const loads = [...new Set(current.entry.sets.filter((s) => s.reps).map((s) => s.weightKg ?? 0))];
      loads.forEach((load) => {
        const pastSets = previous.flatMap((p) => p.entry.sets).filter((s) => s.reps && Math.abs((s.weightKg ?? 0) - load) <= 0.01);
        if (!pastSets.length) return;
        const best = current.entry.sets.filter((s) => (s.weightKg ?? 0) === load && s.reps).sort((a, b) => b.reps! - a.reps!)[0];
        add('reps', best.reps!, Math.max(...pastSets.map((s) => s.reps!)), best);
      });
    });
    return records;
  },

  dashboard(history: WorkoutLog[]) {
    const ids = [...new Set(history.flatMap((w) => (w.exercises || []).flatMap((e) => e.exerciseId ? [e.exerciseId] : [])))];
    return ids.flatMap((exerciseId) => {
      const performances = exerciseHistory(history, exerciseId);
      if (!performances.length) return [];
      return [{
        exerciseId,
        name: performances[performances.length - 1].entry.name,
        topWeight: Math.max(...performances.map((p) => p.topWeight)),
        e1rm: Math.max(...performances.map((p) => p.e1rm)),
        volume: Math.max(...performances.map((p) => p.volume)),
        bestSet: performances.map((p) => p.bestSet!).sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0) || (b.reps ?? b.durationSeconds ?? 0) - (a.reps ?? a.durationSeconds ?? 0))[0],
        sessions: performances.length,
      }];
    }).sort((a, b) => a.name.localeCompare(b.name));
  },
};
