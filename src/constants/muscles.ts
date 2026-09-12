import { MuscleGroupId, MuscleInfo } from '../types/muscle';

export const ALL_MUSCLE_GROUPS: MuscleInfo[] = [
  { id: 'chest', name: 'Chest', category: 'upper', view: 'front', description: 'Pectoralis major and minor' },
  { id: 'front_delts', name: 'Front Delts', category: 'upper', view: 'front', description: 'Anterior deltoids' },
  { id: 'side_delts', name: 'Side Delts', category: 'upper', view: 'both', description: 'Lateral deltoids' },
  { id: 'biceps', name: 'Biceps', category: 'upper', view: 'front', description: 'Biceps brachii' },
  { id: 'forearms', name: 'Forearms', category: 'upper', view: 'both', description: 'Brachioradialis and flexors/extensors' },
  { id: 'abs', name: 'Abs / Core', category: 'core', view: 'front', description: 'Rectus abdominis and obliques' },
  { id: 'quads', name: 'Quads', category: 'lower', view: 'front', description: 'Quadriceps femoris' },
  { id: 'adductors', name: 'Adductors', category: 'lower', view: 'front', description: 'Inner thigh complex' },
  
  { id: 'traps', name: 'Traps', category: 'upper', view: 'back', description: 'Trapezius upper/middle/lower' },
  { id: 'upper_back', name: 'Upper Back', category: 'upper', view: 'back', description: 'Rhomboids and teres major' },
  { id: 'rear_delts', name: 'Rear Delts', category: 'upper', view: 'back', description: 'Posterior deltoids' },
  { id: 'lats', name: 'Lats', category: 'upper', view: 'back', description: 'Latissimus dorsi' },
  { id: 'triceps', name: 'Triceps', category: 'upper', view: 'back', description: 'Triceps brachii all 3 heads' },
  { id: 'glutes', name: 'Glutes', category: 'lower', view: 'back', description: 'Gluteus maximus and medius' },
  { id: 'hamstrings', name: 'Hamstrings', category: 'lower', view: 'back', description: 'Biceps femoris, semitendinosus' },
  { id: 'calves', name: 'Calves', category: 'lower', view: 'both', description: 'Gastrocnemius and soleus' },
];

export const DEFAULT_TARGET_MUSCLES: MuscleGroupId[] = [
  'chest',
  'lats',
  'upper_back',
  'traps',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'abs',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
];
