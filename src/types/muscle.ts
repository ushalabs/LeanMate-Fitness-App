export type MuscleGroupId =
  | 'chest'
  | 'lats'
  | 'upper_back'
  | 'traps'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'adductors'
  | 'abductors';

export type StimulusLevel = 'high' | 'moderate' | 'low' | 'untrained' | 'excluded';

export interface MuscleInfo {
  id: MuscleGroupId;
  name: string;
  category: 'upper' | 'lower' | 'core';
  view: 'front' | 'back' | 'both';
  description: string;
}

export interface MuscleStimulusScore {
  muscleId: MuscleGroupId;
  score: number; // 0 to 100 percentage
  level: StimulusLevel;
  primarySets: number;
  secondarySets: number;
  isExcluded: boolean;
  isTarget: boolean;
}
