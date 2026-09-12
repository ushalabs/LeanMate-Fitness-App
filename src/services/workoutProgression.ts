import { z } from 'zod';
import { EXERCISE_BY_ID } from '../constants/exercises';
import { WorkoutDraftSource, WorkoutExercise, WorkoutLog } from '../types/training';
import { formatLocalDate } from '../utils/date';
import { completedSets, exerciseHistory, workoutOrder } from './prEngine';

const muscle = z.enum(['chest', 'lats', 'upper_back', 'traps', 'front_delts', 'side_delts', 'rear_delts', 'biceps', 'triceps', 'forearms', 'abs', 'glutes', 'quads', 'hamstrings', 'calves', 'adductors', 'abductors']);
export const workoutInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const parsed = new Date(`${value}T12:00:00`);
    return !Number.isNaN(parsed.getTime()) && formatLocalDate(parsed) === value && value <= formatLocalDate(new Date());
  }, 'Choose a valid date, today or earlier.'),
  trained: z.boolean(),
  workoutName: z.string().trim().min(1).max(100),
  sessionName: z.string().trim().max(100).optional(),
  splitDayId: z.string().max(200).optional(),
  muscleGroups: z.array(muscle).max(17),
  durationMinutes: z.number().int().positive().max(1440).optional(),
  notes: z.string().max(2000).optional(),
  exercises: z.array(z.object({
    id: z.string(), exerciseId: z.string(), name: z.string(), primaryMuscle: muscle,
    secondaryMuscles: z.array(muscle).optional(), notes: z.string().max(1000).optional(),
    sets: z.array(z.object({
      id: z.string(), setNumber: z.number().int().positive(), completed: z.literal(true),
      weightKg: z.number().finite().min(0).max(1500).optional(),
      reps: z.number().int().min(1).max(1000).optional(),
      durationSeconds: z.number().int().min(1).max(86400).optional(),
      rpe: z.number().min(1).max(10).optional(), rir: z.number().int().min(0).max(5).optional(),
    })).min(1).max(30),
  })).max(30),
}).superRefine((workout, ctx) => {
  if (workout.trained && !workout.exercises.length)
    ctx.addIssue({ code: 'custom', message: 'Choose at least one exercise and enter its sets before saving.' });
  const ids = new Set<string>();
  workout.exercises.forEach((entry) => {
    const definition = EXERCISE_BY_ID.get(entry.exerciseId);
    if (!definition || ids.has(entry.exerciseId)) ctx.addIssue({ code: 'custom', message: 'Choose distinct exercises from the library.' });
    ids.add(entry.exerciseId);
    entry.sets.forEach((set) => {
      if (definition?.tracking === 'timed' ? !set.durationSeconds : !set.reps)
        ctx.addIssue({ code: 'custom', message: `Enter ${definition?.tracking === 'timed' ? 'seconds' : 'reps'} for every ${entry.name} set.` });
      if (definition?.tracking === 'weighted' && !(set.weightKg! > 0))
        ctx.addIssue({ code: 'custom', message: `Enter a positive weight for ${entry.name}.` });
    });
  });
});

export const displayWeight = (kg: number, imperial: boolean) => Math.round(kg * (imperial ? 2.2046226218 : 1) * 100) / 100;
export const weightInKg = (weight: number, imperial: boolean) => Math.round(weight / (imperial ? 2.2046226218 : 1) * 10000) / 10000;
export const weightUnit = (imperial: boolean) => imperial ? 'lb' : 'kg';

export const workoutSource = (workout: WorkoutLog): WorkoutDraftSource => ({
  workoutName: workout.workoutName || workout.sessionName || 'Workout',
  muscleGroups: [...workout.muscleGroups],
  splitDayId: workout.splitDayId,
  // Previous performance is deliberately removed; references are fetched separately.
  exercises: (workout.exercises || []).filter((e) => e.exerciseId && EXERCISE_BY_ID.has(e.exerciseId)).map((e) => ({
    ...e, sets: (e.sets.length ? e.sets : [{ id: '1', setNumber: 1 }]).map((s, i) => ({ id: `${e.id}_${i}`, setNumber: i + 1, completed: false })),
  })),
});

export function performanceTrend(workouts: WorkoutLog[], adherence: number, coverage: number, today = formatLocalDate(new Date())) {
  const start = new Date(`${today}T12:00:00`);
  start.setDate(start.getDate() - 27);
  const recent = workouts.filter((w) => w.date >= formatLocalDate(start) && w.date <= today && w.trained).sort(workoutOrder);
  const ids = [...new Set(recent.flatMap((w) => (w.exercises || []).flatMap((e) => e.exerciseId && completedSets(e).length ? [e.exerciseId] : [])))];
  let improving = 0, declining = 0, tracked = 0;
  ids.forEach((id) => {
    const performances = exerciseHistory(recent, id).filter((p) => p.e1rm > 0);
    if (new Set(performances.map((p) => p.workout.date)).size < 3) return;
    const baseline = performances.slice(0, -1).slice(-2).reduce((sum, p) => sum + p.e1rm, 0) / 2;
    const change = performances[performances.length - 1].e1rm / baseline - 1;
    tracked++;
    if (change > 0.02) improving++;
    if (change < -0.05) declining++;
  });
  if (tracked < 2) return { status: 'insufficient', answer: 'Insufficient performance history. Track at least two weighted exercises on three separate days to compare progression.', metric: `${tracked} lifts with enough recent history` };
  const inconsistent = declining >= 2 || adherence < 60 || coverage < 40;
  const progressing = !inconsistent && improving >= 2 && adherence >= 80 && coverage >= 70;
  return {
    status: progressing ? 'improving' : inconsistent ? 'inconsistent' : 'stable',
    answer: progressing ? 'Several tracked lifts are improving alongside consistent training and muscle coverage.' : inconsistent ? 'Recent performance, attendance, or muscle coverage is inconsistent.' : 'Recent performance is broadly stable; there is no clear overall upward trend yet.',
    metric: `${improving} improving / ${declining} declining / ${tracked} tracked lifts (28 days)`,
  };
}
