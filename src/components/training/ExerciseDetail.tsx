import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { ArrowLeft } from 'lucide-react-native';
import { WorkoutLog } from '../../types/training';
import { EXERCISE_BY_ID } from '../../constants/exercises';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';
import { exerciseHistory, prEngine } from '../../services/prEngine';
import { displayWeight, weightUnit } from '../../services/workoutProgression';
import { trainingStyles as s } from './TrainingSheet';

export function ExerciseDetail({ exerciseId, history, imperial, onBack }: {
  exerciseId: string; history: WorkoutLog[]; imperial: boolean; onBack: () => void;
}) {
  const definition = EXERCISE_BY_ID.get(exerciseId);
  const performances = useMemo(() => exerciseHistory(history, exerciseId), [history, exerciseId]);
  const record = useMemo(() => prEngine.dashboard(history).find((p) => p.exerciseId === exerciseId), [history, exerciseId]);
  const weighted = definition?.tracking === 'weighted';
  const timed = definition?.tracking === 'timed';
  const [metric, setMetric] = useState(weighted ? 'e1rm' : timed ? 'seconds' : 'reps');
  const unit = weightUnit(imperial);
  const points = performances.slice(-20).map((p) => ({ date: p.workout.date, value:
    metric === 'e1rm' ? displayWeight(p.e1rm, imperial) : metric === 'weight' ? displayWeight(p.topWeight, imperial) : metric === 'volume' ? displayWeight(p.volume, imperial) :
      Math.max(...p.entry.sets.map((set) => metric === 'seconds' ? set.durationSeconds || 0 : set.reps || 0)),
  })).filter((p) => metric !== 'e1rm' || p.value > 0);
  const max = Math.max(1, ...points.map((p) => p.value)) * 1.1;
  const positions = points.map((p, i) => ({ x: points.length === 1 ? 160 : 12 + i / (points.length - 1) * 296, y: 138 - p.value / max * 120 }));
  const latest = performances[performances.length - 1];
  return <>
    <TouchableOpacity onPress={onBack} style={s.row}><ArrowLeft size={20} color="#C084FC" /><Text style={s.accent}>Back</Text></TouchableOpacity>
    <Text style={s.title}>{definition?.name || record?.name || 'Exercise history'}</Text>
    <Text style={s.muted}>{ALL_MUSCLE_GROUPS.find((m) => m.id === definition?.primaryMuscle)?.name || definition?.primaryMuscle}</Text>
    {!record ? <Text style={s.muted}>Complete this exercise to start building its history.</Text> : <>
      <View style={s.wrap}>
        {record.topWeight > 0 && <Text style={s.label}>Heaviest: {displayWeight(record.topWeight, imperial)} {unit}</Text>}
        {record.e1rm > 0 && <Text style={s.label}>Best estimated 1RM: {displayWeight(record.e1rm, imperial)} {unit}</Text>}
        {!weighted && <Text style={s.label}>Best: {Math.max(...performances.flatMap((p) => p.entry.sets.map((set) => timed ? set.durationSeconds || 0 : set.reps || 0)))} {timed ? 'sec' : 'reps'}</Text>}
      </View>
      <Text style={s.label}>Latest performance / {latest.workout.date}</Text>
      {latest.entry.sets.map((set, i) => <Text key={i} style={s.muted}>Set {i + 1}: {timed ? `${set.durationSeconds} sec` : `${displayWeight(set.weightKg || 0, imperial)} ${unit} x ${set.reps}`}</Text>)}
      <View style={s.wrap}>{(weighted ? [['e1rm', 'Estimated 1RM'], ['weight', 'Top weight'], ['volume', 'Volume']] : timed ? [['seconds', 'Seconds']] : [['reps', 'Reps'], ['weight', 'Added weight']]).map(([key, label]) => <TouchableOpacity key={key} onPress={() => setMetric(key)} style={[s.chip, key === metric && s.selected]}><Text style={s.muted}>{label}</Text></TouchableOpacity>)}</View>
      <Text style={s.muted}>{metric === 'e1rm' ? `Estimated 1RM (${unit}, sets of 1-12 reps)` : metric === 'volume' ? `Volume (${unit} x reps)` : metric === 'weight' ? `Weight (${unit})` : metric === 'seconds' ? 'Seconds' : 'Reps'} / latest 20 sessions</Text>
      {points.length ? <View accessibilityLabel={`${metric} progression: ${points.map((p) => `${p.date}: ${p.value}`).join(', ')}`}>
        <Text style={s.muted}>{Math.round(max * 10) / 10}</Text>
        <Svg width="100%" height={160} viewBox="0 0 320 160">
          {[18, 78, 138].map((y) => <Line key={y} x1={12} x2={308} y1={y} y2={y} stroke="#334155" strokeDasharray="4 4" />)}
          {positions.length > 1 && <Polyline points={positions.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#C084FC" strokeWidth={2.5} />}
          {positions.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#22D3EE" />)}
        </Svg>
        <View style={{ ...s.row, justifyContent: 'space-between' }}><Text style={s.muted}>{points[0].date}</Text><Text style={s.muted}>{points[points.length - 1].date}</Text></View>
      </View> : <Text style={s.muted}>No valid data for this metric yet.</Text>}
      <Text style={s.label}>Workout history</Text>
      {performances.slice().reverse().map((p) => <View key={p.workout.id} style={s.entry}>
        <Text style={s.label}>{p.workout.date} / {p.workout.workoutName || p.workout.sessionName || 'Workout'}</Text>
        <Text style={s.muted}>Best set: {timed ? `${p.bestSet?.durationSeconds} sec` : `${displayWeight(p.bestSet?.weightKg || 0, imperial)} ${unit} x ${p.bestSet?.reps}`}</Text>
        {p.e1rm > 0 && <Text style={s.muted}>Estimated 1RM: {displayWeight(p.e1rm, imperial)} {unit}</Text>}
        {p.volume > 0 && <Text style={s.muted}>Volume: {displayWeight(p.volume, imperial)} {unit} x reps</Text>}
      </View>)}
    </>}
  </>;
}
