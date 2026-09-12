import { MuscleGroupId } from './muscle';

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroupId;
  secondaryMuscles: MuscleGroupId[];
  equipment: string;
  tracking: 'weighted' | 'bodyweight' | 'timed';
  imageAsset?: string;
  // Looping GIF URI; kept separate from the static image for future media packs.
  animationAsset?: string;
  instructions?: string[];
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rir?: number; // Reps In Reserve (0-5)
  completed: boolean;
  durationSeconds?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId?: string;
  name: string;
  primaryMuscle: MuscleGroupId;
  secondaryMuscles?: MuscleGroupId[];
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  trained: boolean;
  sessionName?: string;
  workoutName?: string;
  splitDayId?: string;
  schemaVersion?: 2;
  muscleGroups: MuscleGroupId[];
  durationMinutes?: number;
  notes?: string;
  exercises?: WorkoutExercise[];
  createdAt: string;
  updatedAt?: string;
}

export interface WorkoutSplitDay {
  id?: string;
  dayNumber: number;
  name: string;
  isRestDay: boolean;
  targetMuscles: MuscleGroupId[];
}

export interface WorkoutDraftSource {
  workoutName: string;
  muscleGroups: MuscleGroupId[];
  splitDayId?: string;
  exercises?: WorkoutExercise[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  kind: 'weight' | 'reps' | 'estimated1RM' | 'volume';
  value: number;
  previousValue: number;
  weightKg?: number;
  reps?: number;
}

export interface WorkoutCompletion {
  workout: WorkoutLog;
  records: PersonalRecord[];
}

export interface WorkoutSplit {
  id: string;
  name: string;
  daysPerWeek: number;
  days: WorkoutSplitDay[];
  rationale?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
