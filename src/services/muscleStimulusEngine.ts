import { MuscleGroupId, MuscleStimulusScore, StimulusLevel } from '../types/muscle';
import { WorkoutLog } from '../types/training';
import { MuscleBalanceStats } from '../types/analytics';
import { ALL_MUSCLE_GROUPS } from '../constants/muscles';
import { formatLocalDate, startOfLocalWeek } from '../utils/date';
import { completedSets } from './prEngine';

// Mapping secondary muscles for common primary muscle movements
const SECONDARY_STIMULUS_MAP: Partial<Record<MuscleGroupId, MuscleGroupId[]>> = {
  chest: ['front_delts', 'triceps'],
  lats: ['biceps', 'upper_back', 'forearms'],
  upper_back: ['rear_delts', 'biceps', 'traps'],
  quads: ['glutes', 'adductors'],
  hamstrings: ['glutes', 'calves'],
  glutes: ['hamstrings', 'abductors'],
  front_delts: ['triceps'],
  side_delts: ['traps'],
};

export const muscleStimulusEngine = {
  /**
   * Calculates normalized 0-100% stimulus score for each muscle group in the given window
   */
  calculateStimulus(
    workouts: WorkoutLog[],
    targetMuscles: MuscleGroupId[],
    excludedMuscles: MuscleGroupId[],
    daysWindow = 7
  ): Record<MuscleGroupId, MuscleStimulusScore> {
    const weekStartStr = formatLocalDate(startOfLocalWeek(new Date()));
    const todayStr = formatLocalDate(new Date());

    const recentWorkouts = workouts.filter((w) => w.trained && w.date >= weekStartStr && w.date <= todayStr);

    const scores: Partial<Record<MuscleGroupId, MuscleStimulusScore>> = {};
    const primarySetsCount: Record<MuscleGroupId, number> = {} as any;
    const secondarySetsCount: Record<MuscleGroupId, number> = {} as any;

    ALL_MUSCLE_GROUPS.forEach((m) => {
      primarySetsCount[m.id] = 0;
      secondarySetsCount[m.id] = 0;
    });

    // Accumulate sets from workouts
    recentWorkouts.forEach((w) => {
      if (w.exercises && w.exercises.length > 0) {
        // Detailed exercise log
        w.exercises.forEach((ex) => {
          const setCount = completedSets(ex).length;
          primarySetsCount[ex.primaryMuscle] = (primarySetsCount[ex.primaryMuscle] || 0) + setCount;

          ex.secondaryMuscles?.forEach((sec) => {
            secondarySetsCount[sec] = (secondarySetsCount[sec] || 0) + setCount * 0.5;
          });
        });
        // Preserve explicitly logged targets not represented by an exercise.
        const represented = new Set(w.exercises.flatMap((ex) => [ex.primaryMuscle, ...(ex.secondaryMuscles || [])]));
        (w.muscleGroups || []).filter((m) => !represented.has(m)).forEach((m) => {
          primarySetsCount[m] = (primarySetsCount[m] || 0) + 4;
        });
      } else if (w.muscleGroups && w.muscleGroups.length > 0) {
        // Quick attendance log with selected muscles (default 4 sets per muscle)
        w.muscleGroups.forEach((m) => {
          primarySetsCount[m] = (primarySetsCount[m] || 0) + 4;
          // Add default secondaries
          const secondaries = SECONDARY_STIMULUS_MAP[m] || [];
          secondaries.forEach((sec) => {
            secondarySetsCount[sec] = (secondarySetsCount[sec] || 0) + 1.5;
          });
        });
      }
    });

    // Calculate normalized stimulus score (Benchmark optimal volume: ~10-12 weekly sets = 100%)
    const OPTIMAL_WEEKLY_SETS = 11;

    ALL_MUSCLE_GROUPS.forEach((m) => {
      const isExcluded = excludedMuscles.includes(m.id);
      const isTarget = targetMuscles.includes(m.id);
      const pSets = primarySetsCount[m.id] || 0;
      const sSets = secondarySetsCount[m.id] || 0;
      const totalEffectiveVolume = pSets + sSets;

      let rawPercent = Math.round((totalEffectiveVolume / OPTIMAL_WEEKLY_SETS) * 100);
      let score = Math.min(100, Math.max(0, rawPercent));

      let level: StimulusLevel = 'untrained';
      if (isExcluded) {
        level = 'excluded';
        score = 0;
      } else if (score >= 80) {
        level = 'high';
      } else if (score >= 50) {
        level = 'moderate';
      } else if (score > 0) {
        level = 'low';
      } else {
        level = 'untrained';
      }

      scores[m.id] = {
        muscleId: m.id,
        score,
        level,
        primarySets: Math.round(pSets),
        secondarySets: Math.round(sSets),
        isExcluded,
        isTarget,
      };
    });

    return scores as Record<MuscleGroupId, MuscleStimulusScore>;
  },

  /**
   * Calculates training balance score across target muscles (excluding excluded muscles)
   */
  calculateBalanceScore(
    stimulusMap: Record<MuscleGroupId, MuscleStimulusScore>,
    targetMuscles: MuscleGroupId[],
    excludedMuscles: MuscleGroupId[]
  ): MuscleBalanceStats {
    const activeTargets = targetMuscles.filter((m) => !excludedMuscles.includes(m));
    if (activeTargets.length === 0) {
      return {
        balanceScore: 100,
        needsAttention: [],
        summary: 'Well Balanced',
      };
    }

    const targetScores = activeTargets.map((m) => stimulusMap[m]?.score || 0);
    const avgScore = Math.round(targetScores.reduce((acc, s) => acc + s, 0) / targetScores.length);

    // Identify muscles that need attention (score < 40%)
    const needsAttention = activeTargets.filter((m) => {
      const s = stimulusMap[m]?.score || 0;
      return s < 40;
    });

    // Score penalty based on untrained or lagging target muscles
    const penaltyPerLagging = 8;
    const balanceScore = Math.max(0, Math.min(100, avgScore - needsAttention.length * penaltyPerLagging));

    let summary: 'Well Balanced' | 'Moderate Balance' | 'Needs Attention' = 'Well Balanced';
    if (balanceScore >= 80 && needsAttention.length <= 1) {
      summary = 'Well Balanced';
    } else if (balanceScore >= 60) {
      summary = 'Moderate Balance';
    } else {
      summary = 'Needs Attention';
    }

    return {
      balanceScore,
      needsAttention,
      summary,
    };
  },
};
