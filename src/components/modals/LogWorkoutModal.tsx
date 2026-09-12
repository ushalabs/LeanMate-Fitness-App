import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ArrowDown, ArrowUp, Check, Copy, Dumbbell, Pencil, Plus, Repeat2, Trash2, Trophy } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';
import { MuscleGroupId } from '../../types/muscle';
import { ExerciseDefinition, WorkoutCompletion, WorkoutDraftSource, WorkoutExercise } from '../../types/training';
import { formatLocalDate } from '../../utils/date';
import { exerciseHistory, workoutOrder } from '../../services/prEngine';
import { displayWeight, weightUnit, workoutSource } from '../../services/workoutProgression';
import { TrainingSheet, trainingStyles as s } from '../training/TrainingSheet';
import { ExercisePicker } from '../training/ExercisePicker';
import { ExerciseEditor } from '../training/ExerciseEditor';
import { ExerciseDetail } from '../training/ExerciseDetail';

const muscleName = (id: MuscleGroupId) => ALL_MUSCLE_GROUPS.find((group) => group.id === id)?.name || id;

export const LogWorkoutModal: React.FC = () => {
  const { isLogWorkoutModalOpen: visible, closeLogWorkoutModal: close, workoutDraftSource } = useUIStore();
  const { user, customSplits, workoutLogs, workoutHistory, workoutHistoryLoading, workoutHistoryError, workoutHistoryLoaded, loadWorkoutHistory, logWorkout } = useFitnessStore();
  const [date, setDate] = useState('');
  const [trained, setTrained] = useState(true);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [muscles, setMuscles] = useState<MuscleGroupId[]>([]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [splitDayId, setSplitDayId] = useState<string | undefined>();
  const [editor, setEditor] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const [filter, setFilter] = useState<MuscleGroupId | undefined>();
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [repeatPicker, setRepeatPicker] = useState(false);
  const [summary, setSummary] = useState<WorkoutCompletion | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [error, setError] = useState('');
  const imperial = user.preferredUnitSystem === 'imperial';

  const applySource = (source: WorkoutDraftSource) => {
    setName(source.workoutName); setMuscles([...source.muscleGroups]); setSplitDayId(source.splitDayId);
    setExercises((source.exercises || []).map((e) => ({ ...e, sets: e.sets.map((set) => ({ id: set.id, setNumber: set.setNumber, completed: false })) })));
    setRepeatPicker(false);
  };
  useEffect(() => {
    if (!visible) return;
    setDate(formatLocalDate(new Date())); setTrained(true); setName(''); setDuration(''); setMuscles([]);
    setNotes(''); setExercises([]); setSplitDayId(undefined); setEditor(null); setPicker(false); setDetail(null);
    setReplaceId(null); setRepeatPicker(false); setSummary(null); setSaving(false); setError(''); savingRef.current = false;
    if (workoutDraftSource) applySource(workoutDraftSource);
    void loadWorkoutHistory().catch(() => {});
  }, [visible, user.uid, workoutDraftSource]);

  const addExercise = (definition: ExerciseDefinition) => {
    const entryId = `entry_${definition.id}_${Date.now()}`;
    const entry: WorkoutExercise = { id: entryId, exerciseId: definition.id, name: definition.name,
      primaryMuscle: definition.primaryMuscle, secondaryMuscles: definition.secondaryMuscles,
      sets: [{ id: `set_${Date.now()}`, setNumber: 1, completed: false }] };
    setMuscles((current) => current.includes(definition.primaryMuscle) ? current : [...current, definition.primaryMuscle]);
    setExercises((current) => replaceId ? current.map((e) => e.id === replaceId ? entry : e) : [...current, entry]);
    setReplaceId(null); setPicker(false); setEditor(entry.id);
  };
  const openMusclePicker = (muscle: MuscleGroupId) => {
    setError('');
    setMuscles((current) => current.includes(muscle) ? current : [...current, muscle]);
    setFilter(muscle);
    setReplaceId(null);
    setPicker(true);
  };
  const move = (index: number, offset: number) => setExercises((current) => {
    const next = [...current];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    return next;
  });
  const save = async () => {
    if (savingRef.current) return;
    if (trained && !name.trim()) { setError('Give this workout a name.'); return; }
    if (trained && !exercises.length) { setError('Choose at least one exercise from the targeted muscles, then enter its sets and reps.'); return; }
    const unfinished = trained && exercises.find((e) => !e.sets.length || e.sets.some((set) => !set.completed));
    if (unfinished) { setError(`Enter today's sets for ${unfinished.name} before completing the workout.`); return; }
    setError(''); savingRef.current = true; setSaving(true);
    try {
      const result = await logWorkout({ date, trained, workoutName: trained ? name : name || 'Rest Day',
        muscleGroups: trained ? muscles : [], exercises: trained ? exercises : [], splitDayId,
        ...(trained && duration.trim() ? { durationMinutes: Number(duration) } : {}), notes: notes.trim(),
      });
      if (useFitnessStore.getState().user.uid === user.uid) setSummary(result);
    } catch (e: any) {
      setError(e?.issues?.[0]?.message || e?.message || 'Workout not saved. Please try again.');
    } finally { savingRef.current = false; setSaving(false); }
  };
  const editing = exercises.find((e) => e.id === editor);
  const history = workoutHistoryLoaded ? workoutHistory : workoutLogs;
  const previous = editing?.exerciseId ? exerciseHistory(history.filter((w) => w.date <= date), editing.exerciseId).slice(-1)[0] : undefined;

  return <TrainingSheet visible={visible} title={summary ? 'Workout Complete' : 'Log Workout Session'} onClose={close} busy={saving} pageKey={summary ? 'summary' : detail || (picker ? 'picker' : editor || 'workout')}>
    {summary ? <>
      <Check color="#C084FC" size={32} /><Text style={s.title}>{summary.workout.workoutName}</Text>
      <Text style={s.muted}>{summary.workout.exercises?.length || 0} exercises / {summary.workout.exercises?.reduce((sum, e) => sum + e.sets.length, 0) || 0} sets{summary.workout.durationMinutes ? ` / ${summary.workout.durationMinutes} minutes` : ''}</Text>
      {summary.records.length > 0 && <View style={s.row}><Trophy color="#FBBF24" size={20} /><Text style={s.label}>{summary.records.length} New PRs</Text></View>}
      {summary.records.map((record, i) => <View style={s.entry} key={i}>
        <Text style={s.label}>{record.exerciseName}</Text>
        <Text style={s.accent}>{({ weight: 'New Weight PR', reps: 'New Rep PR', estimated1RM: 'New Estimated 1RM PR', volume: 'New Volume PR' })[record.kind]}</Text>
        <Text style={s.muted}>{record.kind === 'reps' ? `${record.value} reps at ${displayWeight(record.weightKg || 0, imperial)} ${weightUnit(imperial)}` : `${displayWeight(record.value, imperial)} ${weightUnit(imperial)}${record.kind === 'volume' ? ' x reps' : ''}`}</Text>
      </View>)}
      <TouchableOpacity onPress={close} style={s.button}><Text style={s.buttonText}>Done</Text></TouchableOpacity>
    </> : picker ?
      <ExercisePicker key={replaceId || filter || 'all'} initialMuscle={filter} selectedIds={exercises.filter((e) => e.id !== replaceId).map((e) => e.exerciseId!)} onBack={() => { setPicker(false); setReplaceId(null); }} onSelect={addExercise} /> : editing ? <>
        {detail && <ExerciseDetail key={detail} exerciseId={detail} history={history} imperial={imperial} onBack={() => setDetail(null)} />}
        <View style={[s.stack, detail && { display: 'none' }]}>
        {workoutHistoryLoading && <ActivityIndicator color="#C084FC" />}
        {!!workoutHistoryError && <Text style={s.error}>{workoutHistoryError}</Text>}
        <ExerciseEditor key={editing.id} entry={editing} previous={previous} imperial={imperial} onBack={() => setEditor(null)} onHistory={() => setDetail(editing.exerciseId!)} onSave={(entry) => { setExercises((current) => current.map((e) => e.id === entry.id ? entry : e)); setEditor(null); }} />
        </View>
      </> : <>
      <View style={s.row}><Text style={[s.label, s.flex]}>{trained ? 'Training session' : 'Rest day'}</Text><Switch value={trained} onValueChange={setTrained} trackColor={{ true: '#8B5CF6', false: '#475569' }} /></View>
      <Text style={s.label}>Date</Text><TextInput accessibilityLabel="Workout date" value={date} onChangeText={setDate} style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" maxLength={10} />
      {trained && <>
        <Text style={s.label}>Workout name</Text><TextInput accessibilityLabel="Workout name" value={name} onChangeText={setName} style={s.input} placeholder="e.g. Upper A, Chest + Triceps" placeholderTextColor="#94A3B8" maxLength={100} />
        {!exercises.length && !muscles.length && <View style={s.wrap}>{customSplits[0]?.days.filter((d) => !d.isRestDay).map((day) => <TouchableOpacity key={day.dayNumber} style={s.chip} onPress={() => {
          const id = day.id || `${customSplits[0].id}_day_${day.dayNumber}`;
          const last = [...history].sort(workoutOrder).reverse().find((w) => w.splitDayId === id && w.trained);
          applySource(last ? { ...workoutSource(last), workoutName: day.name, muscleGroups: day.targetMuscles, splitDayId: id } : { workoutName: day.name, muscleGroups: day.targetMuscles, splitDayId: id });
        }}><Text style={s.muted}>{day.name}</Text></TouchableOpacity>)}</View>}
        {!exercises.length && <TouchableOpacity onPress={() => setRepeatPicker(!repeatPicker)} style={s.secondary}><Repeat2 color="#C084FC" size={16} /><Text style={s.accent}>Repeat previous workout</Text></TouchableOpacity>}
        {repeatPicker && history.filter((w) => w.trained).slice().sort((a, b) => workoutOrder(b, a)).map((w) => <TouchableOpacity key={w.id} style={s.entry} onPress={() => applySource(workoutSource(w))}><Text style={s.label}>{w.workoutName || w.sessionName || 'Workout'}</Text><Text style={s.muted}>{w.date}</Text></TouchableOpacity>)}
        {repeatPicker && !history.some((w) => w.trained) && <Text style={s.muted}>No previous training sessions yet.</Text>}
        <Text style={s.label}>Targeted muscles</Text>
        <Text style={s.muted}>Tap a muscle to choose an exercise for it, then enter the sets and reps.</Text>
        <View style={s.wrap}>{ALL_MUSCLE_GROUPS.map((muscle) => <TouchableOpacity key={muscle.id} style={[s.chip, muscles.includes(muscle.id) && s.selected]} onPress={() => openMusclePicker(muscle.id)}><Text style={s.muted}>{muscle.name}</Text></TouchableOpacity>)}</View>
        {!!muscles.length && <View style={s.wrap}>{muscles.map((m) => {
          const count = exercises.filter((entry) => entry.primaryMuscle === m).length;
          return <TouchableOpacity key={m} style={s.secondary} onPress={() => openMusclePicker(m)}>
            <Plus color="#C084FC" size={16} />
            <Text style={s.accent}>{count ? `${muscleName(m)} (${count})` : `Add ${muscleName(m)} exercise`}</Text>
          </TouchableOpacity>;
        })}
          <TouchableOpacity style={s.secondary} onPress={() => setMuscles([])}><Trash2 color="#FCA5A5" size={16} /><Text style={s.accent}>Clear targets</Text></TouchableOpacity>
        </View>}
        <View style={s.row}><Dumbbell color="#C084FC" size={20} /><Text style={s.title}>Exercises</Text></View>
        {!exercises.length && <Text style={s.muted}>No exercises selected yet. PRs are calculated only from exercises with completed sets.</Text>}
        {exercises.map((entry, index) => <View key={entry.id} style={s.entry}>
          <TouchableOpacity style={s.row} onPress={() => setEditor(entry.id)}><Text style={[s.label, s.flex]}>{index + 1}. {entry.name}</Text><Pencil color="#C084FC" size={18} /></TouchableOpacity>
          <Text style={s.muted}>{entry.sets.every((set) => set.completed) ? `${entry.sets.length} sets entered` : 'Enter today\'s sets'}</Text>
          <View style={s.wrap}>
            <TouchableOpacity accessibilityLabel={`Move ${entry.name} up`} style={[s.icon, index === 0 && s.disabled]} disabled={index === 0} onPress={() => move(index, -1)}><ArrowUp color="#C084FC" size={18} /></TouchableOpacity>
            <TouchableOpacity accessibilityLabel={`Move ${entry.name} down`} style={[s.icon, index === exercises.length - 1 && s.disabled]} disabled={index === exercises.length - 1} onPress={() => move(index, 1)}><ArrowDown color="#C084FC" size={18} /></TouchableOpacity>
            <TouchableOpacity style={s.secondary} onPress={() => { setReplaceId(entry.id); setFilter(undefined); setPicker(true); }}><Copy color="#C084FC" size={16} /><Text style={s.accent}>Replace</Text></TouchableOpacity>
            <TouchableOpacity accessibilityLabel={`Remove ${entry.name}`} style={s.icon} onPress={() => setExercises((current) => current.filter((e) => e.id !== entry.id))}><Trash2 color="#FCA5A5" size={18} /></TouchableOpacity>
          </View>
        </View>)}
        {exercises.length < 30 && <>
          <TouchableOpacity onPress={() => { setFilter(undefined); setPicker(true); }} style={s.secondary}><Plus color="#C084FC" size={18} /><Text style={s.accent}>Add exercise</Text></TouchableOpacity>
        </>}
        <Text style={s.label}>Duration (minutes, optional)</Text><TextInput accessibilityLabel="Workout duration" value={duration} onChangeText={setDuration} keyboardType="number-pad" style={s.input} placeholder="Minutes" placeholderTextColor="#94A3B8" />
      </>}
      <TextInput accessibilityLabel="Workout notes" value={notes} onChangeText={setNotes} multiline maxLength={2000} style={s.input} placeholder="Notes (optional)" placeholderTextColor="#94A3B8" />
      {workoutHistoryLoading && <View style={s.row}><ActivityIndicator color="#C084FC" /><Text style={s.muted}>Loading workout history...</Text></View>}
      {!!workoutHistoryError && <><Text style={s.error}>{workoutHistoryError}</Text><TouchableOpacity style={s.secondary} onPress={() => void loadWorkoutHistory().catch(() => {})}><Text style={s.accent}>Retry history</Text></TouchableOpacity></>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <TouchableOpacity disabled={saving} onPress={save} style={[s.button, saving && s.disabled]}>{saving && <ActivityIndicator color="#FFF" />}<Text style={s.buttonText}>{saving ? 'Saving...' : 'Complete Workout'}</Text></TouchableOpacity>
    </>}
  </TrainingSheet>;
};
