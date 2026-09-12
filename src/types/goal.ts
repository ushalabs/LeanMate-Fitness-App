import { MuscleGroupId } from './muscle';

export type FitnessGoalType =
  | 'lose_fat'
  | 'maintain'
  | 'lean_bulk'
  | 'build_muscle'
  | 'gain_weight';

export type GymFrequencyTarget = '2-3' | '3-4' | '4-5' | '5-6';

export interface GoalPeriod {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  fitnessGoal: FitnessGoalType;
  targetGymFrequency: GymFrequencyTarget;
  targetMuscleGroups: MuscleGroupId[];
  excludedMuscleGroups: MuscleGroupId[];
  calorieTarget: number;
  proteinTarget: number;
  estimatedMaintenance: number;
  active: boolean;
  notes?: string;
  createdAt: string;
}

export interface GoalComplianceReport {
  calorieStatus: 'green' | 'amber' | 'red';
  calorieMessage: string;
  trainingStatus: 'green' | 'amber' | 'red';
  trainingMessage: string;
  muscleCoverageStatus: 'green' | 'amber' | 'red';
  muscleCoverageMessage: string;
  overallScore: number; // 0 to 100
}
