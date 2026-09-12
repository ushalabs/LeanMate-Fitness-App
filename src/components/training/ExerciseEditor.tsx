import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowLeft, Check, Plus, Trash2, Copy } from 'lucide-react-native';
import { EXERCISE_BY_ID } from '../../constants/exercises';
import { ExerciseSet, WorkoutExercise } from '../../types/training';
import { ExercisePerformance } from '../../services/prEngine';
import { displayWeight, weightInKg, weightUnit } from '../../services/workoutProgression';
import { ExerciseMedia } from './ExerciseMedia';
import { trainingStyles as s } from './TrainingSheet';

type SetDraft = { weight: string; reps: string; seconds: string; rpe: string; rir: string };
const blankSet = (): SetDraft => ({ weight: '', reps: '', seconds: '', rpe: '', rir: '' });
export function ExerciseEditor({ entry, previous, imperial, onSave, onBack, onHistory }: {
  entry: WorkoutExercise; previous?: ExercisePerformance; imperial: boolean;
  onSave: (entry: WorkoutExercise) => void; onBack: () => void; onHistory: () => void;
}) {
  const definition = EXERCISE_BY_ID.get(entry.exerciseId!);
  const timed = definition?.tracking === 'timed';
  const fromEntry = (e: WorkoutExercise): SetDraft[] => e.sets.map((set) => ({
    weight: set.weightKg !== undefined ? String(displayWeight(set.weightKg, imperial)) : '',
    reps: set.reps !== undefined ? String(set.reps) : '', seconds: set.durationSeconds !== undefined ? String(set.durationSeconds) : '',
    rpe: set.rpe !== undefined ? String(set.rpe) : '', rir: set.rir !== undefined ? String(set.rir) : '',
  }));
  const [sets, setSets] = useState<SetDraft[]>(() => entry.sets.length ? fromEntry(entry) : [blankSet()]);
  const [notes, setNotes] = useState(entry.notes || '');
  const [effort, setEffort] = useState(false);
  const [error, setError] = useState('');
  const update = (i: number, field: keyof SetDraft, value: string) => setSets((current) => current.map((item, index) => index === i ? { ...item, [field]: value } : item));
  const save = () => {
    const optional = (value: string) => value.trim() ? Number(value) : undefined;
    const parsed: ExerciseSet[] = sets.map((set, i) => ({
      id: `${entry.id}_set_${i + 1}`, setNumber: i + 1, completed: true,
      ...(timed ? { durationSeconds: Number(set.seconds) } : { reps: Number(set.reps), weightKg: weightInKg(Number(set.weight || '0'), imperial) }),
      ...(optional(set.rpe) !== undefined ? { rpe: optional(set.rpe) } : {}),
      ...(optional(set.rir) !== undefined ? { rir: optional(set.rir) } : {}),
    }));
    if (parsed.some((set) => timed ? !Number.isInteger(set.durationSeconds) || set.durationSeconds! <= 0 || set.durationSeconds! > 86400 :
      !Number.isInteger(set.reps) || set.reps! <= 0 || set.reps! > 1000 || !Number.isFinite(set.weightKg) || set.weightKg! < 0 || set.weightKg! > 1500 || (definition?.tracking === 'weighted' && set.weightKg! <= 0))) {
      setError(timed ? 'Enter valid seconds for each set.' : 'Enter a valid weight and whole-number reps for each set.'); return;
    }
    if (parsed.some((set) => (set.rpe !== undefined && (!Number.isFinite(set.rpe) || set.rpe < 1 || set.rpe > 10)) || (set.rir !== undefined && (!Number.isInteger(set.rir) || set.rir < 0 || set.rir > 5)))) {
      setError('RPE must be 1-10; RIR must be a whole number from 0-5.'); return;
    }
    onSave({ ...entry, sets: parsed, notes: notes.trim() });
  };
  return <>
    <TouchableOpacity style={s.row} onPress={onBack}><ArrowLeft size={20} color="#C084FC" /><Text style={s.accent}>Back to workout</Text></TouchableOpacity>
    <View style={s.row}><ExerciseMedia exercise={definition} /><View style={s.flex}><Text style={s.title}>{entry.name}</Text><Text style={s.muted}>{definition?.equipment}</Text><TouchableOpacity onPress={onHistory} style={s.secondary}><Text style={s.accent}>Exercise history</Text></TouchableOpacity></View></View>
    {definition?.instructions?.map((instruction, i) => <Text key={i} style={s.muted}>{instruction}</Text>)}
    <Text style={s.label}>Previous workout{previous ? ` / ${previous.workout.date}` : ''}</Text>
    {previous ? <>
      {previous.entry.sets.map((set, i) => <Text key={i} style={s.muted}>Set {i + 1}: {timed ? `${set.durationSeconds} sec` : `${displayWeight(set.weightKg || 0, imperial)} ${weightUnit(imperial)} x ${set.reps}`}</Text>)}
      <TouchableOpacity onPress={() => setSets(fromEntry(previous.entry))} style={s.secondary}><Copy size={16} color="#C084FC" /><Text style={s.accent}>Use previous sets</Text></TouchableOpacity>
    </> : <Text style={s.muted}>No previous performance for this exercise.</Text>}
    <Text style={s.label}>Today's sets{definition?.tracking === 'bodyweight' ? ' / added weight only' : ''}</Text>
    <View style={s.row}><Text style={{ ...s.muted, width: 28 }}>Set</Text>{!timed && <Text style={[s.muted, s.flex]}>{weightUnit(imperial)}</Text>}<Text style={[s.muted, s.flex]}>{timed ? 'Seconds' : 'Reps'}</Text><View style={{ width: 40 }} /></View>
    {sets.map((set, i) => <View key={i} style={s.stack}>
      <View style={s.row}>
        <Text style={{ ...s.label, width: 28 }}>{i + 1}</Text>
        {!timed && <TextInput accessibilityLabel={`Set ${i + 1} weight`} style={[s.input, s.flex]} keyboardType="decimal-pad" placeholder={definition?.tracking === 'bodyweight' ? '0' : weightUnit(imperial)} placeholderTextColor="#94A3B8" value={set.weight} onChangeText={(v) => update(i, 'weight', v)} />}
        <TextInput accessibilityLabel={`Set ${i + 1} ${timed ? 'seconds' : 'reps'}`} style={[s.input, s.flex]} keyboardType="number-pad" placeholder={timed ? 'sec' : 'reps'} placeholderTextColor="#94A3B8" value={timed ? set.seconds : set.reps} onChangeText={(v) => update(i, timed ? 'seconds' : 'reps', v)} />
        <TouchableOpacity accessibilityLabel={`Remove set ${i + 1}`} disabled={sets.length === 1} style={[s.icon, sets.length === 1 && s.disabled]} onPress={() => setSets((current) => current.filter((_, idx) => idx !== i))}><Trash2 size={18} color="#FCA5A5" /></TouchableOpacity>
      </View>
      {effort && <View style={s.row}><TextInput accessibilityLabel={`Set ${i + 1} RPE`} style={[s.input, s.flex]} placeholder="RPE (optional)" placeholderTextColor="#94A3B8" keyboardType="decimal-pad" value={set.rpe} onChangeText={(v) => update(i, 'rpe', v)} /><TextInput accessibilityLabel={`Set ${i + 1} RIR`} style={[s.input, s.flex]} placeholder="RIR (optional)" placeholderTextColor="#94A3B8" keyboardType="number-pad" value={set.rir} onChangeText={(v) => update(i, 'rir', v)} /></View>}
    </View>)}
    <View style={s.wrap}><TouchableOpacity disabled={sets.length >= 30} style={s.secondary} onPress={() => setSets([...sets, blankSet()])}><Plus size={16} color="#C084FC" /><Text style={s.accent}>Add set</Text></TouchableOpacity><TouchableOpacity style={s.secondary} onPress={() => setEffort(!effort)}><Text style={s.accent}>{effort ? 'Hide' : 'Show'} RPE / RIR</Text></TouchableOpacity></View>
    <TextInput accessibilityLabel="Exercise notes" style={s.input} value={notes} onChangeText={setNotes} maxLength={1000} placeholder="Exercise notes (optional)" placeholderTextColor="#94A3B8" multiline />
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <TouchableOpacity onPress={save} style={s.button}><Check size={18} color="#FFF" /><Text style={s.buttonText}>Save exercise</Text></TouchableOpacity>
  </>;
}
