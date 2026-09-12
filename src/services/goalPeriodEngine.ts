import { GoalPeriod, FitnessGoalType, GymFrequencyTarget } from '../types/goal';
import { MuscleGroupId } from '../types/muscle';
import { formatLocalDate } from '../utils/date';

interface CreateGoalPeriodParams {
  fitnessGoal: FitnessGoalType;
  targetGymFrequency: GymFrequencyTarget;
  targetMuscleGroups: MuscleGroupId[];
  excludedMuscleGroups: MuscleGroupId[];
  calorieTarget: number;
  proteinTarget: number;
  estimatedMaintenance: number;
  notes?: string;
}

export const goalPeriodEngine = {
  /**
   * Creates a new Goal Period and marks any existing active periods as ended/archived
   */
  createNewPeriod(
    existingPeriods: GoalPeriod[],
    newParams: CreateGoalPeriodParams
  ): { updatedPeriods: GoalPeriod[]; activePeriod: GoalPeriod } {
    const today = formatLocalDate(new Date());

    // Archive previous active periods with endDate set to today
    const updatedPeriods = existingPeriods.map((period) => {
      if (period.active) {
        return {
          ...period,
          active: false,
          endDate: today,
        };
      }
      return period;
    });

    const newPeriod: GoalPeriod = {
      id: `goal_${Date.now()}`,
      startDate: today,
      fitnessGoal: newParams.fitnessGoal,
      targetGymFrequency: newParams.targetGymFrequency,
      targetMuscleGroups: newParams.targetMuscleGroups,
      excludedMuscleGroups: newParams.excludedMuscleGroups,
      calorieTarget: newParams.calorieTarget,
      proteinTarget: newParams.proteinTarget,
      estimatedMaintenance: newParams.estimatedMaintenance,
      active: true,
      createdAt: new Date().toISOString(),
    };

    if (newParams.notes) {
      newPeriod.notes = newParams.notes;
    }

    updatedPeriods.push(newPeriod);

    return {
      updatedPeriods,
      activePeriod: newPeriod,
    };
  },

  /**
   * Retrieves the goal period that was active on a specific date (for historical comparison)
   */
  getPeriodForDate(periods: GoalPeriod[], targetDate: string): GoalPeriod | undefined {
    // Find period where startDate <= targetDate and (endDate is null or endDate >= targetDate)
    const matched = periods.find((p) => {
      const startsBefore = p.startDate <= targetDate;
      const endsAfter = !p.endDate || p.endDate >= targetDate;
      return startsBefore && endsAfter;
    });

    if (matched) return matched;
    // Fallback to active period
    return periods.find((p) => p.active) || periods[periods.length - 1];
  },
};
