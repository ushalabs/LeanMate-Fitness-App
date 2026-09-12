export type Sex = 'male' | 'female' | 'other';
export type UnitSystem = 'metric' | 'imperial';
export type ActivityLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type TrainingIntensity = 'low' | 'moderate' | 'high' | 'very_high';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  profilePhoto?: string;
  dateOfBirth: string; // YYYY-MM-DD
  sex: Sex;
  height: number; // in cm
  currentWeight: number; // in kg
  preferredUnitSystem: UnitSystem;
  activityLevel: ActivityLevel;
  trainingIntensity: TrainingIntensity;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  recordedAt: string; // ISO date string
  source: 'manual' | 'scale_sync' | 'seed';
}
