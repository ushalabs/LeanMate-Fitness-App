import { Sex, ActivityLevel, TrainingIntensity } from '../types/user';
import { FitnessGoalType } from '../types/goal';

interface MaintenanceCalculationParams {
  weightKg: number;
  heightCm: number;
  dateOfBirth: string; // YYYY-MM-DD
  sex: Sex;
  activityLevel: ActivityLevel;
  trainingIntensity: TrainingIntensity;
  goal?: FitnessGoalType;
}

export interface MaintenanceEstimateResult {
  bmr: number;
  activityMultiplier: number;
  intensityMultiplier: number;
  estimatedMaintenance: number; // TDEE in kcal/day
  recommendedCalorieTarget: number;
  recommendedProteinTarget: number; // in grams (e.g. ~2.0g - 2.2g per kg bodyweight)
  calculationFormula: string;
}

export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 25; // default fallback
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(16, Math.min(100, age));
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  low: 1.2, // Sedentary, desk work
  moderate: 1.375, // Light active, 6k-9k daily steps
  high: 1.55, // Active job or 10k-14k daily steps
  very_high: 1.725, // Heavy manual labor or endurance
};

const INTENSITY_FACTORS: Record<TrainingIntensity, number> = {
  low: 1.03,
  moderate: 1.08,
  high: 1.14,
  very_high: 1.2,
};

export const maintenanceEngine = {
  calculate(params: MaintenanceCalculationParams): MaintenanceEstimateResult {
    const { weightKg, heightCm, dateOfBirth, sex, activityLevel, trainingIntensity, goal = 'lean_bulk' } = params;
    const safeWeight = Math.max(30, Math.min(300, weightKg || 70));
    const safeHeight = Math.max(100, Math.min(250, heightCm || 175));
    const age = calculateAge(dateOfBirth);

    // Mifflin-St Jeor Formula
    let bmr = (10 * safeWeight) + (6.25 * safeHeight) - (5 * age);
    if (sex === 'female') {
      bmr -= 161;
    } else {
      bmr += 5;
    }

    const activityMult = ACTIVITY_FACTORS[activityLevel] || 1.375;
    const intensityMult = INTENSITY_FACTORS[trainingIntensity] || 1.08;

    // Total Daily Energy Expenditure (Estimated Maintenance)
    const rawTdee = bmr * activityMult * intensityMult;
    const estimatedMaintenance = Math.round(rawTdee);

    // Target adjustment based on goal
    let targetOffset = 0;
    switch (goal) {
      case 'lose_fat':
        targetOffset = -400; // Sustainable fat loss deficit
        break;
      case 'lean_bulk':
        targetOffset = 200; // Clean surplus to minimize fat gain (~+200 kcal)
        break;
      case 'build_muscle':
        targetOffset = 300; // Moderate surplus for hypertrophy
        break;
      case 'gain_weight':
        targetOffset = 500; // Aggressive surplus
        break;
      case 'maintain':
      default:
        targetOffset = 0;
        break;
    }

    const recommendedCalorieTarget = Math.max(1200, estimatedMaintenance + targetOffset);
    // Protein target: 2.0g to 2.2g per kg of bodyweight
    const recommendedProteinTarget = Math.round(safeWeight * 2.1);

    return {
      bmr: Math.round(bmr),
      activityMultiplier: activityMult,
      intensityMultiplier: intensityMult,
      estimatedMaintenance,
      recommendedCalorieTarget,
      recommendedProteinTarget,
      calculationFormula: 'Mifflin-St Jeor + Activity & Training Multipliers',
    };
  },
};
