import { WorkoutLog } from '../types/training';
import { GymFrequencyTarget } from '../types/goal';
import { TrainingConsistencyStats } from '../types/analytics';

export const trainingConsistencyEngine = {
  calculate(logs: WorkoutLog[], benchmark: GymFrequencyTarget): TrainingConsistencyStats {
    let benchmarkMin = 3;
    let benchmarkMax = 4;

    switch (benchmark) {
      case '2-3':
        benchmarkMin = 2;
        benchmarkMax = 3;
        break;
      case '3-4':
        benchmarkMin = 3;
        benchmarkMax = 4;
        break;
      case '4-5':
        benchmarkMin = 4;
        benchmarkMax = 5;
        break;
      case '5-6':
        benchmarkMin = 5;
        benchmarkMax = 6;
        break;
    }

    // Filter only actual workouts attended
    const trainedLogs = logs.filter((l) => l.trained);

    // Calculate over the last 28 days (4 rolling weeks)
    // To ensure precision, we count sessions in 7-day increments from newest backwards
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const getTrainedInWindow = (startDaysAgo: number, endDaysAgo: number) => {
      const windowStart = new Date(now.getTime() - startDaysAgo * oneDayMs);
      const windowEnd = new Date(now.getTime() - endDaysAgo * oneDayMs);
      return trainedLogs.filter((l) => {
        const d = new Date(l.date);
        return d >= windowEnd && d <= windowStart;
      }).length;
    };

    const w1Count = getTrainedInWindow(0, 7);
    const w2Count = getTrainedInWindow(7, 14);
    const w3Count = getTrainedInWindow(14, 21);
    const w4Count = getTrainedInWindow(21, 28);

    const totalSessionsLast4Weeks = w1Count + w2Count + w3Count + w4Count;
    // Weekly rolling average:
    const sessionsPerWeek = parseFloat((totalSessionsLast4Weeks / 4).toFixed(1));

    // Calculate adherence percentage relative to midpoint of benchmark
    const benchmarkMid = (benchmarkMin + benchmarkMax) / 2;
    const adherencePercentage = Math.min(100, Math.round((sessionsPerWeek / benchmarkMid) * 100));

    let status: 'green' | 'amber' | 'red' = 'green';
    let statusText: 'ON TRACK' | 'NEEDS ATTENTION' | 'BELOW TARGET' = 'ON TRACK';

    if (sessionsPerWeek >= benchmarkMin) {
      status = 'green';
      statusText = 'ON TRACK';
    } else if (sessionsPerWeek >= benchmarkMin - 0.7) {
      status = 'amber';
      statusText = 'NEEDS ATTENTION';
    } else {
      status = 'red';
      statusText = 'BELOW TARGET';
    }

    const weeklyBreakdown = [
      { weekLabel: 'W1', completed: w4Count, planned: benchmarkMax },
      { weekLabel: 'W2', completed: w3Count, planned: benchmarkMax },
      { weekLabel: 'W3', completed: w2Count, planned: benchmarkMax },
      { weekLabel: 'W4', completed: w1Count, planned: benchmarkMax },
    ];

    return {
      sessionsPerWeek,
      benchmarkTarget: `${benchmarkMin}–${benchmarkMax}`,
      benchmarkMin,
      benchmarkMax,
      status,
      statusText,
      adherencePercentage,
      weeklyBreakdown,
    };
  },
};
