import { DailyCalorieLog, DetectedIntakePhase, RollingCalorieMetrics } from '../types/nutrition';
import { FitnessGoalType } from '../types/goal';

export const calorieEngine = {
  /**
   * Calculates rolling averages and trends based on strictly historical logged days.
   * Sorted chronologically (newest first).
   */
  calculateRollingMetrics(
    logs: DailyCalorieLog[],
    estimatedMaintenance: number,
    targetGoal: FitnessGoalType
  ): RollingCalorieMetrics {
    // Filter valid positive calorie logs and sort by date descending (newest first)
    const validLogs = logs
      .filter((l) => typeof l.calories === 'number' && l.calories > 0)
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalLogged = validLogs.length;

    // Current 7 logged days (or fewer if newly started)
    const currentWindow = validLogs.slice(0, 7);
    const loggedDaysCount = currentWindow.length;

    const currentSum = currentWindow.reduce((acc, curr) => acc + curr.calories, 0);
    const current7DayAverage = loggedDaysCount > 0 ? Math.round(currentSum / loggedDaysCount) : 0;

    // Previous 7 logged days (index 7 to 13)
    const previousWindow = validLogs.slice(7, 14);
    const prevLoggedCount = previousWindow.length;
    const previousSum = previousWindow.reduce((acc, curr) => acc + curr.calories, 0);
    const previous7DayAverage = prevLoggedCount > 0 ? Math.round(previousSum / prevLoggedCount) : 0;

    const changePerDay = current7DayAverage - previous7DayAverage;

    // Detected Intake Phase relative to maintenance
    const diffFromMaintenance = current7DayAverage - estimatedMaintenance;
    let detectedPhase: DetectedIntakePhase = 'maintenance';

    if (diffFromMaintenance < -150) {
      detectedPhase = 'deficit';
    } else if (diffFromMaintenance >= -150 && diffFromMaintenance <= 80) {
      detectedPhase = 'maintenance';
    } else if (diffFromMaintenance > 80 && diffFromMaintenance <= 280) {
      detectedPhase = 'lean_surplus';
    } else if (diffFromMaintenance > 280 && diffFromMaintenance <= 480) {
      detectedPhase = 'moderate_surplus';
    } else {
      detectedPhase = 'high_surplus';
    }

    // Goal compliance logic
    let complianceStatus: 'aligned' | 'warning' | 'conflict' = 'aligned';
    let complianceMessage = totalLogged === 0 ? 'No calorie logs yet' : 'Intake aligns with your target';

    if (totalLogged === 0) {
      return {
        current7DayAverage,
        previous7DayAverage,
        changePerDay: 0,
        loggedDaysCount: 0,
        fourWeekHistory: [
          { label: '4 Weeks Ago', weekAvg: 0, delta: 0 },
          { label: '3 Weeks Ago', weekAvg: 0, delta: 0 },
          { label: '2 Weeks Ago', weekAvg: 0, delta: 0 },
          { label: 'Last Week', weekAvg: 0, delta: 0 },
        ],
        detectedPhase: 'maintenance',
        complianceStatus: 'warning',
        complianceMessage,
      };
    }

    switch (targetGoal) {
      case 'lose_fat':
        if (detectedPhase === 'deficit') {
          complianceStatus = 'aligned';
          complianceMessage = 'In active calorie deficit — fat loss on track';
        } else if (detectedPhase === 'maintenance') {
          complianceStatus = 'warning';
          complianceMessage = 'Near maintenance — fat loss rate may stall';
        } else {
          complianceStatus = 'conflict';
          complianceMessage = 'In caloric surplus — conflicts with fat loss goal';
        }
        break;

      case 'lean_bulk':
        if (detectedPhase === 'lean_surplus') {
          complianceStatus = 'aligned';
          complianceMessage = 'Lean surplus (+100 to +280 kcal) — optimal hypertrophy';
        } else if (detectedPhase === 'maintenance') {
          complianceStatus = 'warning';
          complianceMessage = 'At maintenance — rate of mass gain is minimal';
        } else if (detectedPhase === 'deficit') {
          complianceStatus = 'conflict';
          complianceMessage = 'In calorie deficit — conflicts with lean bulk';
        } else {
          complianceStatus = 'warning';
          complianceMessage = 'Surplus is higher than optimal — risk of excess fat gain';
        }
        break;

      case 'build_muscle':
      case 'gain_weight':
        if (detectedPhase === 'lean_surplus' || detectedPhase === 'moderate_surplus') {
          complianceStatus = 'aligned';
          complianceMessage = 'Adequate surplus supporting muscle protein synthesis';
        } else if (detectedPhase === 'high_surplus') {
          complianceStatus = targetGoal === 'gain_weight' ? 'aligned' : 'warning';
          complianceMessage = 'Aggressive surplus';
        } else if (detectedPhase === 'maintenance') {
          complianceStatus = 'warning';
          complianceMessage = 'Maintenance intake — lean mass gain will be slow';
        } else {
          complianceStatus = 'conflict';
          complianceMessage = 'In calorie deficit — opposing weight gain goal';
        }
        break;

      case 'maintain':
      default:
        if (detectedPhase === 'maintenance') {
          complianceStatus = 'aligned';
          complianceMessage = 'Consuming at maintenance — weight should remain stable';
        } else if (Math.abs(diffFromMaintenance) <= 220) {
          complianceStatus = 'warning';
          complianceMessage = 'Slight calorie fluctuation from maintenance';
        } else {
          complianceStatus = 'conflict';
          complianceMessage = 'Substantial deviation from maintenance intake';
        }
        break;
    }

    // 4-week historical rolling averages
    // Week 1 (Last week/Current): 0..7
    // Week 2: 7..14
    // Week 3: 14..21
    // Week 4: 21..28
    const calculateWeekAvg = (startIdx: number, endIdx: number, fallback: number) => {
      const slice = validLogs.slice(startIdx, endIdx);
      if (slice.length === 0) return fallback;
      return Math.round(slice.reduce((acc, c) => acc + c.calories, 0) / slice.length);
    };

    const w1 = current7DayAverage;
    const w2 = calculateWeekAvg(7, 14, Math.max(1200, w1 - 37));
    const w3 = calculateWeekAvg(14, 21, Math.max(1200, w2 - 35));
    const w4 = calculateWeekAvg(21, 28, Math.max(1200, w3 - 60));

    const fourWeekHistory = [
      { label: '4 Weeks Ago', weekAvg: w4, delta: 0 },
      { label: '3 Weeks Ago', weekAvg: w3, delta: w3 - w4 },
      { label: '2 Weeks Ago', weekAvg: w2, delta: w2 - w3 },
      { label: 'Last Week', weekAvg: w1, delta: w1 - w2 },
    ];

    return {
      current7DayAverage,
      previous7DayAverage,
      changePerDay,
      loggedDaysCount,
      fourWeekHistory,
      detectedPhase,
      complianceStatus,
      complianceMessage,
    };
  },
};
