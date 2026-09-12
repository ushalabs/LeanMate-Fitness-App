import React, { useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Search, Plus } from 'lucide-react-native';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';
import { EXERCISES } from '../../constants/exercises';
import { ExerciseDefinition } from '../../types/training';
import { MuscleGroupId } from '../../types/muscle';
import { ExerciseMedia } from './ExerciseMedia';
import { trainingStyles as s } from './TrainingSheet';

export function ExercisePicker({ onSelect, onBack, selectedIds, initialMuscle }: {
  onSelect: (exercise: ExerciseDefinition) => void; onBack: () => void; selectedIds: string[]; initialMuscle?: MuscleGroupId;
}) {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroupId | null>(initialMuscle || null);
  const choices = useMemo(() => EXERCISES.filter((e) => (!muscle || e.primaryMuscle === muscle) && e.name.toLowerCase().includes(search.toLowerCase())), [search, muscle]);
  return <>
    <TouchableOpacity onPress={onBack} style={s.row}><ArrowLeft size={20} color="#C084FC" /><Text style={s.accent}>Back to workout</Text></TouchableOpacity>
    <View style={s.row}><Search color="#C084FC" size={18} /><TextInput accessibilityLabel="Search exercises" style={[s.input, s.flex]} value={search} onChangeText={setSearch} placeholder="Search exercises" placeholderTextColor="#94A3B8" /></View>
    <View style={s.wrap}>
      <TouchableOpacity onPress={() => setMuscle(null)} style={[s.chip, !muscle && s.selected]}><Text style={s.label}>All</Text></TouchableOpacity>
      {ALL_MUSCLE_GROUPS.map((m) => <TouchableOpacity key={m.id} onPress={() => setMuscle(m.id)} style={[s.chip, muscle === m.id && s.selected]}><Text style={s.muted}>{m.name}</Text></TouchableOpacity>)}
    </View>
    {!choices.length && <Text style={s.muted}>No matching exercises.</Text>}
    {choices.map((e) => <TouchableOpacity key={e.id} disabled={selectedIds.includes(e.id)} onPress={() => onSelect(e)} style={[s.entry, selectedIds.includes(e.id) && s.disabled]}>
      <View style={s.row}>
        <ExerciseMedia exercise={e} small />
        <View style={s.flex}><Text style={s.label}>{e.name}</Text><Text style={s.muted}>{e.equipment} / {ALL_MUSCLE_GROUPS.find((m) => m.id === e.primaryMuscle)?.name || e.primaryMuscle}</Text></View>
        <Plus color="#C084FC" size={20} />
      </View>
    </TouchableOpacity>)}
  </>;
}
