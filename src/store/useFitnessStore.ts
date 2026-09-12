import { create } from 'zustand';
import { UserProfile, WeightEntry } from '../types/user';
import { DailyCalorieLog, RollingCalorieMetrics } from '../types/nutrition';
import { WorkoutLog, WorkoutSplit, WorkoutCompletion } from '../types/training';
import { prEngine, workoutOrder } from '../services/prEngine';
import { workoutInputSchema } from '../services/workoutProgression';
import { EXERCISE_BY_ID } from '../constants/exercises';
import { useUIStore } from './useUIStore';
import { GoalPeriod, FitnessGoalType, GymFrequencyTarget } from '../types/goal';
import { MuscleGroupId } from '../types/muscle';
import { MuscleCoverageStats, TrainingConsistencyStats, WeightTrendStats } from '../types/analytics';
import { calorieEngine } from '../services/calorieEngine';
import { trainingConsistencyEngine } from '../services/trainingConsistencyEngine';
import { muscleCoverageEngine } from '../services/muscleCoverageEngine';
import { weightTrendEngine } from '../services/weightTrendEngine';
import { goalPeriodEngine } from '../services/goalPeriodEngine';
import { maintenanceEngine } from '../services/maintenanceEngine';
import { splitRecommendationEngine } from '../services/splitRecommendationEngine';
import { DEFAULT_TARGET_MUSCLES } from '../constants/muscles';
import { UserProfilePatch, firestoreService } from '../firebase/firestoreService';
import { formatLocalDate } from '../utils/date';

const nowIso = () => new Date().toISOString();

export const createEmptyUserProfile = (
  uid = '',
  email = '',
  fullName = ''
): UserProfile => ({
  uid,
  fullName,
  username: email ? email.split('@')[0] : '',
  email,
  dateOfBirth: '',
  sex: 'male',
  height: 170,
  currentWeight: 70,
  preferredUnitSystem: 'metric',
  activityLevel: 'moderate',
  trainingIntensity: 'moderate',
  onboardingCompleted: false,
  createdAt: nowIso(),
  updatedAt: nowIso(),
});

const createSetupGoalPeriod = (): GoalPeriod => ({
  id: 'goal_setup_pending',
  startDate: formatLocalDate(new Date()),
  fitnessGoal: 'lean_bulk',
  targetGymFrequency: '4-5',
  targetMuscleGroups: DEFAULT_TARGET_MUSCLES,
  excludedMuscleGroups: [],
  calorieTarget: 2200,
  proteinTarget: 147,
  estimatedMaintenance: 2000,
  active: true,
  createdAt: nowIso(),
});

const computeAllMetrics = (
  user: UserProfile,
  goalPeriod: GoalPeriod,
  calories: DailyCalorieLog[],
  workouts: WorkoutLog[],
  weights: WeightEntry[]
) => {
  const maintenance = maintenanceEngine.calculate({
    weightKg: user.currentWeight,
    heightCm: user.height,
    dateOfBirth: user.dateOfBirth,
    sex: user.sex,
    activityLevel: user.activityLevel,
    trainingIntensity: user.trainingIntensity,
    goal: goalPeriod.fitnessGoal,
  });

  const rollingCalories = calorieEngine.calculateRollingMetrics(
    calories,
    goalPeriod.estimatedMaintenance || maintenance.estimatedMaintenance,
    goalPeriod.fitnessGoal
  );

  const trainingConsistency = trainingConsistencyEngine.calculate(workouts, goalPeriod.targetGymFrequency);

  const muscleCoverage = muscleCoverageEngine.calculate(
    workouts,
    goalPeriod.targetMuscleGroups,
    goalPeriod.excludedMuscleGroups,
    7
  );

  const weightTrends = weightTrendEngine.calculate(weights);

  return {
    rollingCalories,
    trainingConsistency,
    muscleCoverage,
    weightTrends,
  };
};

const splitCoversGoal = (split: WorkoutSplit, goalPeriod: GoalPeriod) => {
  const activeTargets = goalPeriod.targetMuscleGroups.filter((m) => !goalPeriod.excludedMuscleGroups.includes(m));
  const splitMuscles = new Set(split.days.flatMap((day) => (day.isRestDay ? [] : day.targetMuscles)));
  return activeTargets.every((muscle) => splitMuscles.has(muscle));
};

const createBaseState = (user = createEmptyUserProfile()) => {
  const activeGoalPeriod = createSetupGoalPeriod();
  const computed = computeAllMetrics(user, activeGoalPeriod, [], [], []);

  return {
    user,
    goalPeriods: [] as GoalPeriod[],
    activeGoalPeriod,
    calorieLogs: [] as DailyCalorieLog[],
    workoutLogs: [] as WorkoutLog[],
    workoutHistory: [] as WorkoutLog[],
    workoutHistoryLoaded: false,
    workoutHistoryLoading: false,
    workoutHistoryError: null as string | null,
    weightEntries: [] as WeightEntry[],
    customSplits: splitRecommendationEngine.getRecommendations(
      activeGoalPeriod.targetGymFrequency,
      activeGoalPeriod.fitnessGoal
    ),
    ...computed,
  };
};

interface FitnessState {
  user: UserProfile;
  goalPeriods: GoalPeriod[];
  activeGoalPeriod: GoalPeriod;
  calorieLogs: DailyCalorieLog[];
  workoutLogs: WorkoutLog[];
  workoutHistory: WorkoutLog[];
  workoutHistoryLoaded: boolean;
  workoutHistoryLoading: boolean;
  workoutHistoryError: string | null;
  loadWorkoutHistory: () => Promise<void>;
  weightEntries: WeightEntry[];
  customSplits: WorkoutSplit[];
  rollingCalories: RollingCalorieMetrics;
  trainingConsistency: TrainingConsistencyStats;
  muscleCoverage: MuscleCoverageStats;
  weightTrends: WeightTrendStats;
  error: string | null;

  recalculateAll: () => void;
  setUser: (user: UserProfile) => void;
  updateUserProfile: (patch: UserProfilePatch, options?: { recordWeightChange?: boolean }) => Promise<void>;
  completeOnboarding: (params: {
    fitnessGoal: FitnessGoalType;
    targetGymFrequency: GymFrequencyTarget;
    targetMuscleGroups: MuscleGroupId[];
    excludedMuscleGroups: MuscleGroupId[];
  }) => Promise<void>;
  logCalories: (log: Omit<DailyCalorieLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteCalorieLog: (dateStr: string) => Promise<void>;
  logWorkout: (workout: Omit<WorkoutLog, 'id' | 'createdAt'>) => Promise<WorkoutCompletion>;
  saveCustomSplit: (split: Omit<WorkoutSplit, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  recordWeight: (weight: number, source?: 'manual' | 'scale_sync') => Promise<void>;
  switchGoal: (params: {
    fitnessGoal: FitnessGoalType;
    targetGymFrequency: GymFrequencyTarget;
    targetMuscleGroups: MuscleGroupId[];
    excludedMuscleGroups: MuscleGroupId[];
  }) => Promise<void>;
  clearUserData: () => void;
  initUserData: (uid: string, email?: string | null, displayName?: string | null) => Promise<void>;
  clearError: () => void;
}

let historyRequest: { uid: string; promise: Promise<void> } | null = null;
let sessionGeneration = 0;

export const useFitnessStore = create<FitnessState>((set, get) => ({
  ...createBaseState(),
  error: null,

  recalculateAll: () => {
    const { user, activeGoalPeriod, calorieLogs, workoutLogs, weightEntries } = get();
    set(computeAllMetrics(user, activeGoalPeriod, calorieLogs, workoutLogs, weightEntries));
  },

  setUser: (user: UserProfile) => {
    set({ user, error: null });
    get().recalculateAll();
  },

  updateUserProfile: async (patch, options) => {
    const current = get().user;
    const updatedUser: UserProfile = {
      ...current,
      ...patch,
      updatedAt: nowIso(),
    };

    try {
      if (updatedUser.uid) {
        await firestoreService.saveUserProfile(updatedUser);
      }

      set({ user: updatedUser, error: null });

      if (
        options?.recordWeightChange &&
        typeof patch.currentWeight === 'number' &&
        patch.currentWeight !== current.currentWeight
      ) {
        await get().recordWeight(patch.currentWeight, 'manual');
      } else {
        get().recalculateAll();
      }
    } catch (e: any) {
      const message = e?.message || 'Could not save profile changes.';
      set({ error: message });
      throw new Error(message);
    }
  },

  completeOnboarding: async (params) => {
    const { user, goalPeriods } = get();
    const maintenance = maintenanceEngine.calculate({
      weightKg: user.currentWeight,
      heightCm: user.height,
      dateOfBirth: user.dateOfBirth,
      sex: user.sex,
      activityLevel: user.activityLevel,
      trainingIntensity: user.trainingIntensity,
      goal: params.fitnessGoal,
    });

    const { updatedPeriods, activePeriod } = goalPeriodEngine.createNewPeriod(goalPeriods, {
      ...params,
      calorieTarget: maintenance.recommendedCalorieTarget,
      proteinTarget: maintenance.recommendedProteinTarget,
      estimatedMaintenance: maintenance.estimatedMaintenance,
    });

    const completedUser = { ...user, onboardingCompleted: true, updatedAt: nowIso() };

    try {
      if (completedUser.uid) {
        await firestoreService.saveUserProfile(completedUser);
        await firestoreService.saveGoalPeriods(completedUser.uid, updatedPeriods);
      }

      set({
        user: completedUser,
        goalPeriods: updatedPeriods,
        activeGoalPeriod: activePeriod,
        customSplits: splitRecommendationEngine.getRecommendations(
          activePeriod.targetGymFrequency,
          activePeriod.fitnessGoal
        ),
        error: null,
      });
      get().recalculateAll();
    } catch (e: any) {
      const message = e?.message || 'Could not complete onboarding.';
      set({ error: message });
      throw new Error(message);
    }
  },

  logCalories: async (entry) => {
    const { calorieLogs, user } = get();
    const nowStr = nowIso();
    const newLog: DailyCalorieLog = {
      id: `cal_${entry.date}`,
      ...entry,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const existingIdx = calorieLogs.findIndex((l) => l.date === entry.date);
    const updatedLogs = existingIdx >= 0 ? [...calorieLogs] : [newLog, ...calorieLogs];
    if (existingIdx >= 0) updatedLogs[existingIdx] = newLog;

    if (user.uid) {
      await firestoreService.saveCalorieLog(user.uid, newLog);
    }

    set({ calorieLogs: updatedLogs, error: null });
    get().recalculateAll();
  },

  deleteCalorieLog: async (dateStr: string) => {
    const { calorieLogs, user } = get();
    if (user.uid) {
      await firestoreService.deleteCalorieLog(user.uid, dateStr);
    }
    set({ calorieLogs: calorieLogs.filter((l) => l.date !== dateStr), error: null });
    get().recalculateAll();
  },

  loadWorkoutHistory: async () => {
    const uid = get().user.uid;
    const generation = sessionGeneration;
    if (!uid) throw new Error('Sign in to load workout history.');
    if (get().workoutHistoryLoaded) return;
    if (historyRequest?.uid === uid) return historyRequest.promise;
    set({ workoutHistoryLoading: true, workoutHistoryError: null });
    const promise = (async () => {
      try {
        const all: WorkoutLog[] = [];
        let cursor;
        do {
          const page = await firestoreService.getWorkoutHistoryPage(uid, cursor);
          if (get().user.uid !== uid || generation !== sessionGeneration) return;
          all.push(...page.workouts);
          cursor = page.hasMore ? page.cursor : undefined;
        } while (cursor);
        const merged = new Map(all.map((w) => [w.id, w]));
        get().workoutLogs.forEach((w) => merged.set(w.id, w));
        set({ workoutHistory: [...merged.values()].sort(workoutOrder), workoutHistoryLoaded: true, workoutHistoryLoading: false });
      } catch (e: any) {
        if (get().user.uid === uid && generation === sessionGeneration) set({ workoutHistoryLoading: false, workoutHistoryError: e?.message || 'Could not load workout history.' });
        throw e;
      } finally {
        if (historyRequest?.uid === uid && generation === sessionGeneration) historyRequest = null;
      }
    })();
    historyRequest = { uid, promise };
    return promise;
  },

  logWorkout: async (workoutData) => {
    const { user } = get();
    if (!user.uid) throw new Error('Sign in before saving a workout.');
    const parsed = workoutInputSchema.parse({ ...workoutData,
      workoutName: workoutData.workoutName || workoutData.sessionName || 'Workout', exercises: workoutData.exercises || [],
    });
    if (parsed.exercises.length) await get().loadWorkoutHistory();
    if (get().user.uid !== user.uid) throw new Error('Your account changed. Please reopen the workout.');
    const exercises = parsed.trained ? parsed.exercises.map((entry) => {
      const definition = EXERCISE_BY_ID.get(entry.exerciseId)!;
      return { ...entry, primaryMuscle: definition.primaryMuscle, secondaryMuscles: definition.secondaryMuscles };
    }) : [];
    const newLog: WorkoutLog = {
      id: `workout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...parsed,
      sessionName: parsed.workoutName,
      schemaVersion: 2,
      exercises,
      muscleGroups: parsed.trained ? [...new Set([...parsed.muscleGroups, ...exercises.map((e) => e.primaryMuscle)])] : [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    if (user.uid) {
      await firestoreService.saveWorkoutLog(user.uid, newLog);
    }

    const records = prEngine.detect(newLog, get().workoutHistory);
    if (get().user.uid !== user.uid) return { workout: newLog, records };
    set((state) => ({ workoutLogs: [newLog, ...state.workoutLogs].sort((a, b) => workoutOrder(b, a)),
      workoutHistory: [...state.workoutHistory, newLog].sort(workoutOrder), error: null }));
    get().recalculateAll();
    return { workout: newLog, records };
  },

  saveCustomSplit: async (splitData) => {
    const { user } = get();
    if (!user.uid) throw new Error('Sign in before saving a split.');
    const now = nowIso();
    const id = splitData.id || `custom_split_${Date.now()}`;
    const split: WorkoutSplit = {
      ...splitData,
      id,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
      days: splitData.days.map((day) => ({ ...day, id: day.id || `${id}_day_${day.dayNumber}` })),
    };

    if (user.uid) {
      await firestoreService.saveCustomSplit(user.uid, split);
    }

    if (get().user.uid === user.uid) set({ customSplits: [split], error: null });
  },

  recordWeight: async (weight: number, source = 'manual') => {
    const { weightEntries, user } = get();
    const newEntry: WeightEntry = {
      id: `wt_${Date.now()}`,
      weight,
      recordedAt: nowIso(),
      source,
    };

    if (user.uid) {
      await firestoreService.saveWeightEntry(user.uid, newEntry);
    }

    set({
      weightEntries: [...weightEntries, newEntry],
      user: { ...user, currentWeight: weight, updatedAt: nowIso() },
      error: null,
    });
    get().recalculateAll();
  },

  switchGoal: async (params) => {
    const { goalPeriods, user } = get();
    const maintenance = maintenanceEngine.calculate({
      weightKg: user.currentWeight,
      heightCm: user.height,
      dateOfBirth: user.dateOfBirth,
      sex: user.sex,
      activityLevel: user.activityLevel,
      trainingIntensity: user.trainingIntensity,
      goal: params.fitnessGoal,
    });

    const { updatedPeriods, activePeriod } = goalPeriodEngine.createNewPeriod(goalPeriods, {
      ...params,
      calorieTarget: maintenance.recommendedCalorieTarget,
      proteinTarget: maintenance.recommendedProteinTarget,
      estimatedMaintenance: maintenance.estimatedMaintenance,
    });

    if (user.uid) {
      await firestoreService.saveGoalPeriods(user.uid, updatedPeriods);
    }

    set({
      goalPeriods: updatedPeriods,
      activeGoalPeriod: activePeriod,
      customSplits: splitRecommendationEngine.getRecommendations(
        activePeriod.targetGymFrequency,
        activePeriod.fitnessGoal
      ),
      error: null,
    });
    get().recalculateAll();
  },

  clearUserData: () => {
    sessionGeneration++;
    historyRequest = null;
    useUIStore.getState().closeLogWorkoutModal();
    useUIStore.getState().closeCreateSplitModal();
    set({ ...createBaseState(), error: null });
  },

  initUserData: async (uid, email, displayName) => {
    const generation = ++sessionGeneration;
    historyRequest = null;
    const fallbackProfile = createEmptyUserProfile(uid, email || '', displayName || '');
    set({ ...createBaseState(fallbackProfile), error: null });

    try {
      const [profile, periods, calorieLogs, workoutLogs, weightEntries, customSplits] = await Promise.all([
        firestoreService.getUserProfile(uid),
        firestoreService.getGoalPeriods(uid),
        firestoreService.getCalorieLogs(uid),
        firestoreService.getWorkoutLogs(uid),
        firestoreService.getWeightEntries(uid),
        firestoreService.getCustomSplits(uid),
      ]);

      const user = profile || fallbackProfile;
      if (generation !== sessionGeneration) return;
      const activeGoalPeriod = periods.find((p) => p.active) || periods[periods.length - 1] || createSetupGoalPeriod();
      const validCustomSplits = customSplits.filter((split) => splitCoversGoal(split, activeGoalPeriod));

      set({
        user,
        goalPeriods: periods,
        activeGoalPeriod,
        calorieLogs,
        workoutLogs,
        weightEntries,
        customSplits: validCustomSplits.length > 0
          ? validCustomSplits
          : splitRecommendationEngine.getRecommendations(
              activeGoalPeriod.targetGymFrequency,
              activeGoalPeriod.fitnessGoal
            ),
        error: null,
      });
      get().recalculateAll();
    } catch (e: any) {
      const message = e?.message || 'Could not load user data.';
      if (generation !== sessionGeneration) return;
      set({ ...createBaseState(fallbackProfile), error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
