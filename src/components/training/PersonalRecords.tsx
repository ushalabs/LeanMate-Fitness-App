import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { useFitnessStore } from '../../store/useFitnessStore';
import { prEngine } from '../../services/prEngine';
import { displayWeight, weightUnit } from '../../services/workoutProgression';
import { TrainingSheet, trainingStyles as s } from './TrainingSheet';
import { ExerciseDetail } from './ExerciseDetail';

export function PersonalRecords() {
  const { user, workoutHistory, workoutHistoryLoaded, workoutHistoryLoading, workoutHistoryError, loadWorkoutHistory } = useFitnessStore();
  const [all, setAll] = useState(false);
  const [exercise, setExercise] = useState<string | null>(null);
  useEffect(() => { if (user.uid) void loadWorkoutHistory().catch(() => {}); }, [user.uid, loadWorkoutHistory]);
  const records = useMemo(() => prEngine.dashboard(workoutHistory), [workoutHistory]);
  const imperial = user.preferredUnitSystem === 'imperial';
  const recordList = (count: number) => records.slice(0, count).map((record) => <TouchableOpacity key={record.exerciseId} onPress={() => setExercise(record.exerciseId)} style={s.item}>
    <View style={s.row}><Text style={[s.label, s.flex]}>{record.name}</Text><ChevronRight color="#C084FC" size={18} /></View>
    <Text style={s.muted}>{record.topWeight > 0 ? `${displayWeight(record.topWeight, imperial)} ${weightUnit(imperial)} x ${record.bestSet.reps}` : record.bestSet.durationSeconds ? `${record.bestSet.durationSeconds} sec` : `${record.bestSet.reps} reps`}</Text>
    {record.e1rm > 0 && <Text style={s.accent}>Best estimated 1RM: {displayWeight(record.e1rm, imperial)} {weightUnit(imperial)}</Text>}
  </TouchableOpacity>);
  return <View style={s.stack}>
    <View style={s.row}><Trophy size={20} color="#C084FC" /><Text style={s.title}>Personal Records</Text></View>
    {workoutHistoryLoading && <ActivityIndicator color="#C084FC" />}
    {!!workoutHistoryError && <View style={s.stack}><Text style={s.error}>{workoutHistoryError}</Text><TouchableOpacity onPress={() => void loadWorkoutHistory().catch(() => {})} style={s.secondary}><Text style={s.accent}>Retry history</Text></TouchableOpacity></View>}
    {workoutHistoryLoaded && !records.length && <Text style={s.muted}>Complete workouts to start building your PR history.</Text>}
    {workoutHistoryLoaded && recordList(4)}
    {records.length > 0 && <TouchableOpacity onPress={() => setAll(true)} style={s.secondary}><Text style={s.accent}>View All PRs</Text></TouchableOpacity>}
    <TrainingSheet visible={all || !!exercise} title="Personal Records" pageKey={exercise || 'records'} onClose={() => { setAll(false); setExercise(null); }}>
      {exercise ? <ExerciseDetail key={exercise} exerciseId={exercise} history={workoutHistory} imperial={imperial} onBack={() => setExercise(null)} /> : recordList(records.length)}
    </TrainingSheet>
  </View>;
}
