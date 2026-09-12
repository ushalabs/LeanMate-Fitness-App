export interface DailyCalorieLog {
  id: string; // usually date string YYYY-MM-DD
  date: string; // YYYY-MM-DD
  calories: number;
  protein?: number; // in grams
  carbohydrates?: number; // in grams
  fats?: number; // in grams
  createdAt: string;
  updatedAt: string;
}

export type DetectedIntakePhase =
  | 'deficit'
  | 'maintenance'
  | 'lean_surplus'
  | 'moderate_surplus'
  | 'high_surplus';

export interface RollingCalorieMetrics {
  current7DayAverage: number;
  previous7DayAverage: number;
  changePerDay: number;
  loggedDaysCount: number; // e.g. 7 of 7 or 4 of 7
  fourWeekHistory: {
    label: string;
    weekAvg: number;
    delta: number;
  }[];
  detectedPhase: DetectedIntakePhase;
  complianceStatus: 'aligned' | 'warning' | 'conflict';
  complianceMessage: string;
}
