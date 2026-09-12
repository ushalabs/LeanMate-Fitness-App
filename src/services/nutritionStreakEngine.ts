import { DailyCalorieLog } from '../types/nutrition';
import { formatLocalDate, previousLocalDate } from '../utils/date';

export const CALORIE_STREAK_TOLERANCE = 100;
export const PROTEIN_STREAK_TOLERANCE = 10;

export const isNutritionDayComplete = (
  log: DailyCalorieLog | undefined,
  calorieTarget: number,
  proteinTarget: number
) => Boolean(
  log &&
  Math.abs(log.calories - calorieTarget) <= CALORIE_STREAK_TOLERANCE &&
  typeof log.protein === 'number' &&
  log.protein >= proteinTarget - PROTEIN_STREAK_TOLERANCE
);

export const nutritionStreakEngine = {
  calculate(
    logs: DailyCalorieLog[],
    calorieTarget: number,
    proteinTarget: number,
    today = formatLocalDate(new Date())
  ) {
    const byDate = new Map(logs.map((log) => [log.date, log]));
    const todayComplete = isNutritionDayComplete(byDate.get(today), calorieTarget, proteinTarget);
    const yesterday = previousLocalDate(today);
    const yesterdayComplete = isNutritionDayComplete(byDate.get(yesterday), calorieTarget, proteinTarget);

    if (!todayComplete && !yesterdayComplete) {
      return { count: 0, todayComplete };
    }

    let count = 0;
    let cursor = todayComplete ? today : yesterday;
    while (isNutritionDayComplete(byDate.get(cursor), calorieTarget, proteinTarget)) {
      count += 1;
      cursor = previousLocalDate(cursor);
    }

    return { count, todayComplete };
  },
};
