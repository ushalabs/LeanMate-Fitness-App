import { WeightEntry } from '../types/user';
import { WeightTrendStats } from '../types/analytics';

export const weightTrendEngine = {
  calculate(entries: WeightEntry[]): WeightTrendStats {
    if (!entries || entries.length === 0) {
      return {
        currentWeight: 70.0,
        previousWeight: 70.0,
        changeThisWeek: 0,
        fourWeekChange: 0,
        history: [],
      };
    }

    // Sort chronologically ascending (oldest to newest)
    const sorted = [...entries].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    const latest = sorted[sorted.length - 1];
    const currentWeight = latest.weight;

    // Previous entry (last entry before current)
    const previousEntry = sorted.length > 1 ? sorted[sorted.length - 2] : latest;
    const previousWeight = previousEntry.weight;
    const changeThisWeek = parseFloat((currentWeight - previousWeight).toFixed(2));

    // 4-week previous entry (~28 days ago or oldest available in window)
    const fourWeeksAgoDate = new Date();
    fourWeeksAgoDate.setDate(fourWeeksAgoDate.getDate() - 28);
    const fourWeeksAgoStr = fourWeeksAgoDate.toISOString();

    const oldEntry = sorted.find((e) => e.recordedAt >= fourWeeksAgoStr) || sorted[0];
    const fourWeekChange = parseFloat((currentWeight - oldEntry.weight).toFixed(2));

    const history = sorted.map((e) => ({
      date: e.recordedAt.split('T')[0],
      weight: e.weight,
    }));

    return {
      currentWeight,
      previousWeight,
      changeThisWeek,
      fourWeekChange,
      history,
    };
  },
};
