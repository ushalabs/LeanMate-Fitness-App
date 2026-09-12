import type { ImageSourcePropType } from 'react-native';
import type { Sex } from '../types/user';
import type { MuscleGroupId } from '../types/muscle';

export const VISUAL_ASSETS = {
  fitness: require('../../assets/visuals/fitness-card-male.png'),
  fitnessMale: require('../../assets/visuals/fitness-card-male.png'),
  fitnessFemale: require('../../assets/visuals/fitness-card-female.png'),
  fitnessGeneral: require('../../assets/visuals/fitness-card.png'),
  nutrition: require('../../assets/visuals/nutrition-card-v2.png'),
  nutritionSecondary: require('../../assets/visuals/nutrition-card.png'),
  weight: require('../../assets/visuals/weight-card-v2.png'),
  weightSecondary: require('../../assets/visuals/weight-card.png'),
  workoutMalePush: require('../../assets/visuals/workout-male-push.jpg'),
  workoutMalePull: require('../../assets/visuals/workout-male-pull.jpg'),
  workoutMaleLegs: require('../../assets/visuals/workout-male-legs.jpg'),
  workoutFemalePush: require('../../assets/visuals/workout-female-push.jpg'),
  workoutFemalePull: require('../../assets/visuals/workout-female-pull.jpg'),
  workoutFemaleLegs: require('../../assets/visuals/workout-female-legs.jpg'),
};

export const getFitnessVisual = (sex?: Sex) =>
  sex === 'female' ? VISUAL_ASSETS.fitnessFemale : VISUAL_ASSETS.fitnessMale;

const PUSH_MUSCLES = new Set<MuscleGroupId>(['chest', 'front_delts', 'side_delts', 'triceps']);
const PULL_MUSCLES = new Set<MuscleGroupId>(['lats', 'upper_back', 'traps', 'rear_delts', 'biceps', 'forearms']);
const LEG_MUSCLES = new Set<MuscleGroupId>(['quads', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors']);

const scoreGroup = (muscles: MuscleGroupId[], group: Set<MuscleGroupId>) =>
  muscles.reduce((score, muscle) => score + (group.has(muscle) ? 1 : 0), 0);

export const getMuscleVisual = (muscles: MuscleGroupId[] = [], sex?: Sex): ImageSourcePropType => {
  const scores = {
    push: scoreGroup(muscles, PUSH_MUSCLES),
    pull: scoreGroup(muscles, PULL_MUSCLES),
    legs: scoreGroup(muscles, LEG_MUSCLES),
  };
  const category = (Object.entries(scores) as Array<[keyof typeof scores, number]>)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'push';
  const female = sex === 'female';

  if (category === 'legs') return female ? VISUAL_ASSETS.workoutFemaleLegs : VISUAL_ASSETS.workoutMaleLegs;
  if (category === 'pull') return female ? VISUAL_ASSETS.workoutFemalePull : VISUAL_ASSETS.workoutMalePull;
  return female ? VISUAL_ASSETS.workoutFemalePush : VISUAL_ASSETS.workoutMalePush;
};
