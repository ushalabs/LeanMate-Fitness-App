import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { ExerciseDefinition } from '../../types/training';

export function ExerciseMedia({ exercise, small = false }: { exercise?: ExerciseDefinition; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const uri = exercise?.animationAsset || exercise?.imageAsset;
  useEffect(() => setFailed(false), [uri]);
  const size = small ? 44 : 112;
  return <View style={{ width: size, height: size, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.12)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {uri && !failed ? <Image source={{ uri }} accessibilityLabel={exercise?.name} resizeMode="contain" onError={() => setFailed(true)} style={{ width: size, height: size }} /> : <Dumbbell size={small ? 22 : 44} color="#C084FC" />}
  </View>;
}
