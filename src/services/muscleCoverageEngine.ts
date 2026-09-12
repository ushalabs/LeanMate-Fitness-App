import { MuscleGroupId } from '../types/muscle';
import { WorkoutLog } from '../types/training';
import { MuscleCoverageStats } from '../types/analytics';
import { muscleStimulusEngine } from './muscleStimulusEngine';
import { formatLocalDate, startOfLocalWeek } from '../utils/date';

export const muscleCoverageEngine = {
  calculate(
    workouts: WorkoutLog[],
    targetMuscles: MuscleGroupId[],
    excludedMuscles: MuscleGroupId[],
    daysWindow = 7
  ): MuscleCoverageStats {
    const weekStartStr = formatLocalDate(startOfLocalWeek(new Date()));
    const todayStr = formatLocalDate(new Date());

    // Filter current calendar week trained logs. The daysWindow argument is kept for API compatibility.
    const recentLogs = workouts.filter((w) => w.trained && w.date >= weekStartStr && w.date <= todayStr);

    // Filter target muscles: eliminate any that are excluded
    const activeTargets = targetMuscles.filter((m) => !excludedMuscles.includes(m));

    // Calculate detailed stimulus scores for all muscles
    const stimulusScores = muscleStimulusEngine.calculateStimulus(recentLogs, targetMuscles, excludedMuscles, daysWindow);

    // A muscle is considered trained in coverage if it has received any primary or secondary stimulus > 0
    const trainedTargetMuscles = activeTargets.filter((m) => {
      const score = stimulusScores[m]?.score || 0;
      return score > 0;
    });

    const missedMuscles = activeTargets.filter((m) => !trainedTargetMuscles.includes(m));
    const allTargetedCovered = missedMuscles.length === 0;
    const targetedCount = activeTargets.length;
    const trainedCount = trainedTargetMuscles.length;
    const percentage = targetedCount > 0 ? Math.round((trainedCount / targetedCount) * 100) : 100;

    return {
      targetedCount,
      trainedCount,
      percentage,
      missedMuscles,
      allTargetedCovered,
      stimulusScores,
    };
  },
};
