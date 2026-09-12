import { GymFrequencyTarget, FitnessGoalType } from '../types/goal';
import { WorkoutSplit } from '../types/training';

export const splitRecommendationEngine = {
  getRecommendations(frequency: GymFrequencyTarget, goal: FitnessGoalType): WorkoutSplit[] {
    switch (frequency) {
      case '2-3':
        return [
          {
            id: 'full_body_3day',
            name: 'Full Body 3-Day Frequency',
            daysPerWeek: 3,
            rationale:
              'With 2–3 days available, training the entire body every session maximizes protein synthesis frequency across all muscle groups without junk volume.',
            days: [
              { dayNumber: 1, name: 'Day 1: Full Body (Chest, Quads, Lats focus)', isRestDay: false, targetMuscles: ['chest', 'quads', 'lats', 'front_delts', 'triceps'] },
              { dayNumber: 2, name: 'Day 2: Rest & Recovery', isRestDay: true, targetMuscles: [] },
              { dayNumber: 3, name: 'Day 3: Full Body (Back, Hamstrings, Shoulders focus)', isRestDay: false, targetMuscles: ['upper_back', 'hamstrings', 'side_delts', 'biceps', 'glutes'] },
              { dayNumber: 4, name: 'Day 4: Rest & Recovery', isRestDay: true, targetMuscles: [] },
              { dayNumber: 5, name: 'Day 5: Full Body (Arms, Core, Calves focus)', isRestDay: false, targetMuscles: ['biceps', 'triceps', 'abs', 'calves', 'chest', 'lats'] },
              { dayNumber: 6, name: 'Day 6: Rest & Recovery', isRestDay: true, targetMuscles: [] },
              { dayNumber: 7, name: 'Day 7: Rest & Recovery', isRestDay: true, targetMuscles: [] },
            ],
          },
        ];

      case '3-4':
        return [
          {
            id: 'upper_lower_4day',
            name: 'Upper / Lower Split (4-Day)',
            daysPerWeek: 4,
            rationale:
              'The gold standard 4-day split: provides 2x/week frequency for both upper and lower body while leaving 3 full days for systematic recovery.',
            days: [
              { dayNumber: 1, name: 'Upper A (Chest, Back, Arms)', isRestDay: false, targetMuscles: ['chest', 'lats', 'upper_back', 'biceps', 'triceps', 'side_delts'] },
              { dayNumber: 2, name: 'Lower A (Quads, Calves, Abs)', isRestDay: false, targetMuscles: ['quads', 'calves', 'abs', 'adductors'] },
              { dayNumber: 3, name: 'Rest Day', isRestDay: true, targetMuscles: [] },
              { dayNumber: 4, name: 'Upper B (Back, Chest, Shoulders)', isRestDay: false, targetMuscles: ['upper_back', 'lats', 'chest', 'front_delts', 'rear_delts', 'traps'] },
              { dayNumber: 5, name: 'Lower B (Hamstrings, Glutes, Abs)', isRestDay: false, targetMuscles: ['hamstrings', 'glutes', 'calves', 'abs', 'abductors'] },
              { dayNumber: 6, name: 'Rest Day', isRestDay: true, targetMuscles: [] },
              { dayNumber: 7, name: 'Rest Day', isRestDay: true, targetMuscles: [] },
            ],
          },
        ];

      case '4-5':
      case '5-6':
      default:
        return [
          {
            id: 'ppl_ul_5day',
            name: 'Push / Pull / Legs + Upper / Lower (5-Day)',
            daysPerWeek: 5,
            rationale:
              'Optimized for 4–5 day schedules: delivers dedicated hypertrophy days for push, pull, and legs, followed by an upper/lower composite for high stimulus coverage.',
            days: [
              { dayNumber: 1, name: 'Push (Chest, Shoulders, Triceps)', isRestDay: false, targetMuscles: ['chest', 'front_delts', 'side_delts', 'triceps'] },
              { dayNumber: 2, name: 'Pull (Lats, Upper Back, Biceps, Traps)', isRestDay: false, targetMuscles: ['lats', 'upper_back', 'rear_delts', 'biceps', 'traps'] },
              { dayNumber: 3, name: 'Legs & Core (Quads, Hamstrings, Calves, Abs)', isRestDay: false, targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'] },
              { dayNumber: 4, name: 'Rest Day', isRestDay: true, targetMuscles: [] },
              { dayNumber: 5, name: 'Upper Hypertrophy (Chest, Back, Arms)', isRestDay: false, targetMuscles: ['chest', 'lats', 'biceps', 'triceps', 'side_delts'] },
              { dayNumber: 6, name: 'Lower & Posterior Chain (Glutes, Hams, Core)', isRestDay: false, targetMuscles: ['hamstrings', 'glutes', 'calves', 'abs'] },
              { dayNumber: 7, name: 'Active Recovery', isRestDay: true, targetMuscles: [] },
            ],
          },
        ];
    }
  },
};
