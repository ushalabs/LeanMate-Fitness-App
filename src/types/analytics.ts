import { MuscleGroupId, MuscleStimulusScore } from './muscle';

export interface TrainingConsistencyStats {
  sessionsPerWeek: number;
  benchmarkTarget: string; // e.g. "4–5"
  benchmarkMin: number;
  benchmarkMax: number;
  status: 'green' | 'amber' | 'red';
  statusText: 'ON TRACK' | 'NEEDS ATTENTION' | 'BELOW TARGET';
  adherencePercentage: number;
  weeklyBreakdown: {
    weekLabel: string;
    completed: number;
    planned: number;
  }[];
}

export interface MuscleCoverageStats {
  targetedCount: number;
  trainedCount: number;
  percentage: number;
  missedMuscles: MuscleGroupId[];
  allTargetedCovered: boolean;
  stimulusScores: Record<MuscleGroupId, MuscleStimulusScore>;
}

export interface MuscleBalanceStats {
  balanceScore: number; // 0 to 100
  needsAttention: MuscleGroupId[];
  summary: 'Well Balanced' | 'Moderate Balance' | 'Needs Attention';
}

export interface WeightTrendStats {
  currentWeight: number;
  previousWeight: number;
  changeThisWeek: number;
  fourWeekChange: number;
  history: {
    date: string;
    weight: number;
  }[];
}
