import React, { useRef, useState } from 'react';
import { ImageBackground, View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Dumbbell,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  BarChart2,
  Plus,
  Pencil,
  Repeat2,
} from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useUIStore } from '../../../src/store/useUIStore';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';
import { PersonalRecords } from '../../../src/components/training/PersonalRecords';
import { workoutSource } from '../../../src/services/workoutProgression';
import { workoutOrder } from '../../../src/services/prEngine';
import { WorkoutSplitDay } from '../../../src/types/training';
import { getFitnessVisual, getMuscleVisual } from '../../../src/constants/visualAssets';

export default function TrainingScreen() {
  const router = useRouter();
  const { user, workoutLogs, workoutHistory, workoutHistoryLoaded, customSplits, loadWorkoutHistory } = useFitnessStore();
  const { openLogWorkoutModal, openCreateSplitModal, editSplit, startWorkout } = useUIStore();
  const [splitError, setSplitError] = useState('');
  const [allWorkouts, setAllWorkouts] = useState(false);
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  const activeSplit = customSplits[0];
  const sessions = (workoutHistoryLoaded ? workoutHistory : workoutLogs).slice().sort((a, b) => workoutOrder(b, a));
  const startDay = async (day: WorkoutSplitDay) => {
    setSplitError('');
    const uid = useFitnessStore.getState().user.uid;
    try {
      await loadWorkoutHistory();
      if (useFitnessStore.getState().user.uid !== uid) return;
      const splitDayId = day.id || `${activeSplit.id}_day_${day.dayNumber}`;
      const previous = [...useFitnessStore.getState().workoutHistory].sort((a, b) => workoutOrder(b, a)).find((w) => w.trained && w.splitDayId === splitDayId);
      startWorkout({ ...(previous ? workoutSource(previous) : {}), workoutName: day.name, muscleGroups: day.targetMuscles, splitDayId });
    } catch (e: any) { setSplitError(e?.message || 'Could not load this split day. Please try again.'); }
  };

  // Exercises recommendation database for quick reference
  const EXERCISE_RECOMMENDATIONS = [
    {
      muscle: 'Chest',
      exercises: ['Incline Dumbbell Press', 'Machine Chest Press', 'Cable Fly'],
    },
    {
      muscle: 'Lats & Back',
      exercises: ['Lat Pulldown', 'Chest Supported Row', 'Straight-Arm Pulldown'],
    },
    {
      muscle: 'Shoulders',
      exercises: ['Overhead DB Press', 'Egyptian Lateral Raise', 'Reverse Pec Deck'],
    },
    {
      muscle: 'Arms',
      exercises: ['Incline DB Curl', 'Overhead Cable Triceps Ext', 'Hammer Curls'],
    },
    {
      muscle: 'Legs',
      exercises: ['Hack Squat', 'Romanian Deadlift', 'Seated Leg Curl', 'Standing Calf Raise'],
    },
  ];

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, isNarrow && styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.headerRow, isNarrow && styles.headerRowMobile]}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Training & Splits</Text>
          <Text style={styles.subtitle}>Workout logging, split architecture & muscle stimulus</Text>
        </View>

        <View style={[styles.headerActions, isNarrow && styles.headerActionsMobile]}>
          <TouchableOpacity style={styles.createSplitBtn} onPress={openCreateSplitModal}>
            <Pencil size={16} color="#5B21B6" />
            <Text style={styles.createSplitBtnText}>Create Split</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.analyticsBtn} onPress={() => router.push('/training/analytics')}>
            <BarChart2 size={16} color="#8B5CF6" />
            <Text style={styles.analyticsBtnText}>Muscle Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Attendance Banner */}
      <TouchableOpacity onPress={openLogWorkoutModal} activeOpacity={0.85}>
        <ImageBackground source={getFitnessVisual(user.sex)} style={styles.logCard} imageStyle={styles.logImage} resizeMode="cover">
        <View style={styles.logLeft}>
          <View style={styles.iconCircle}>
            <Dumbbell size={22} color="#8B5CF6" />
          </View>
          <View style={styles.logCopy}>
            <Text style={styles.logTitle}>Log Today's Workout</Text>
            <Text style={styles.logSubtitle}>Record exercises, sets & targeted muscle groups</Text>
          </View>
        </View>
        <Plus size={22} color="#8B5CF6" />
        </ImageBackground>
      </TouchableOpacity>

      {/* Active Workout Split */}
      <View style={[styles.sectionHeader, isNarrow && styles.sectionHeaderMobile]}>
        <View style={styles.sectionTitleRow}>
          <Layers size={18} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Active Training Split</Text>
        </View>
        <Text style={styles.splitName}>{activeSplit?.name || 'Push / Pull / Legs (5-Day)'}</Text>
      </View>
      {activeSplit && <TouchableOpacity style={[styles.createSplitBtn, { alignSelf: 'flex-start', marginBottom: 12 }]} onPress={() => editSplit(activeSplit)}><Pencil size={16} color="#5B21B6" /><Text style={styles.createSplitBtnText}>Edit Split</Text></TouchableOpacity>}
      {!!splitError && <Text style={{ color: '#FCA5A5', marginBottom: 12 }}>{splitError}</Text>}

      {/* Split Days List */}
      <View style={styles.daysList}>
        {activeSplit?.days.map((day) => (
          <ImageBackground
            key={day.dayNumber}
            source={getMuscleVisual(day.targetMuscles, user.sex)}
            style={[styles.dayCard, isNarrow && styles.dayCardMobile, day.isRestDay && styles.restDayCard]}
            imageStyle={[styles.dayImage, day.isRestDay && styles.restDayImage]}
            resizeMode="cover"
          >
            <View style={styles.dayTop}>
              <Text style={[styles.dayName, day.isRestDay && styles.restDayName]}>{day.name}</Text>
              <View style={[styles.statusBadge, day.isRestDay ? styles.restBadge : styles.trainBadge]}>
                <Text style={[styles.statusText, day.isRestDay ? styles.restText : styles.trainText]}>
                  {day.isRestDay ? 'REST' : 'TRAIN'}
                </Text>
              </View>
            </View>

            {!day.isRestDay && day.targetMuscles.length > 0 && (
              <View style={styles.musclesWrap}>
                {day.targetMuscles.map((m) => (
                  <View key={m} style={styles.musclePill}>
                    <Text style={styles.musclePillText}>{m.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            )}
            {!day.isRestDay && <TouchableOpacity onPress={() => void startDay(day)} style={[styles.createSplitBtn, { alignSelf: 'flex-start', marginTop: 12 }]}><Repeat2 size={16} color="#5B21B6" /><Text style={styles.createSplitBtnText}>Log / Repeat {day.name}</Text></TouchableOpacity>}
          </ImageBackground>
        ))}
      </View>

      {/* Workout Recommendations Section */}
      <View style={styles.recSection}>
        <View style={styles.sectionTitleRow}>
          <Sparkles size={18} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Recommended High-Stimulus Exercises</Text>
        </View>

        <View style={styles.recGrid}>
          {EXERCISE_RECOMMENDATIONS.map((cat) => (
            <View key={cat.muscle} style={styles.recCard}>
              <Text style={styles.recCategory}>{cat.muscle}</Text>
              {cat.exercises.map((ex, idx) => (
                <View key={idx} style={styles.exerciseItem}>
                  <CheckCircle2 size={13} color="#10B981" />
                  <Text style={styles.exerciseName}>{ex}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* Recent Workouts Logged */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Completed Sessions</Text>
        <View style={styles.workoutList}>
          {sessions.slice(0, allWorkouts ? sessions.length : 5).map((w) => (
            <View key={w.id} style={styles.workoutRow}>
              <View style={styles.workoutRowLeft}>
                <Calendar size={16} color={THEME.colors.textMuted} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.workoutSessionName}>
                    {w.workoutName || w.sessionName || (w.trained ? 'Training Session' : 'Rest Day')}
                  </Text>
                  <Text style={styles.workoutDate}>{w.date}{w.durationMinutes ? ` / ${w.durationMinutes} mins` : ''}{w.exercises?.length ? ` / ${w.exercises.length} exercises` : ''}</Text>
                </View>
              </View>
              {w.trained ? <TouchableOpacity style={styles.createSplitBtn} onPress={() => startWorkout(workoutSource(w))}><Repeat2 size={14} color="#5B21B6" /><Text style={styles.createSplitBtnText}>Repeat</Text></TouchableOpacity> : <Text style={styles.trainedPillText}>Rest</Text>}
            </View>
          ))}
        </View>
        {!sessions.length && <Text style={styles.workoutDate}>No workout sessions yet.</Text>}
        {sessions.length > 5 && <TouchableOpacity style={[styles.createSplitBtn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={() => setAllWorkouts(!allWorkouts)}><Text style={styles.createSplitBtnText}>{allWorkouts ? 'Show recent' : 'View all sessions'}</Text></TouchableOpacity>}
      </View>
      <PersonalRecords />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 24,
    paddingBottom: 112,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.lg,
  },
  headerRowMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionsMobile: {
    flexWrap: 'wrap',
  },
  title: {
    color: '#24183F',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B647A',
    fontSize: 13,
    marginTop: 2,
  },
  analyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  analyticsBtnText: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '700',
  },
  createSplitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E9DDFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  createSplitBtnText: {
    flexShrink: 1,
    color: '#4C1D95',
    fontSize: 12,
    fontWeight: '800',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    minHeight: 210,
    borderWidth: 1,
    borderColor: 'rgba(185, 104, 255, 0.46)',
    marginBottom: THEME.spacing.xl,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
    backgroundColor: 'transparent',
  },
  logImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  dayImage: {
    borderRadius: THEME.borderRadius.lg,
  },
  restDayImage: {
    opacity: 0,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  logCopy: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTitle: {
    color: '#24183F',
    fontSize: 18,
    fontWeight: '900',
  },
  logSubtitle: {
    color: '#5D5570',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeaderMobile: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#24183F',
    fontSize: 16,
    fontWeight: '700',
  },
  splitName: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  daysList: {
    gap: 10,
    marginBottom: THEME.spacing.xl,
  },
  dayCard: {
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    minHeight: 280,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.16)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  dayCardMobile: {
    minHeight: 320,
  },
  restDayCard: {
    minHeight: 86,
    backgroundColor: '#F5F1FF',
  },
  dayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
    paddingRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.86)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  restDayName: {
    color: '#24183F',
    textShadowColor: 'transparent',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  trainBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.76)',
  },
  restBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  trainText: {
    color: '#7C3AED',
  },
  restText: {
    color: THEME.colors.textMuted,
  },
  musclesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  musclePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
  },
  musclePillText: {
    color: '#24183F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  recSection: {
    marginBottom: THEME.spacing.xl,
  },
  recGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  recCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
  },
  recCategory: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 3,
  },
  exerciseName: {
    color: '#6B647A',
    fontSize: 12,
  },
  recentSection: {
    marginBottom: THEME.spacing.xl,
  },
  workoutList: {
    gap: 8,
    marginTop: 10,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
  },
  workoutRowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workoutSessionName: {
    color: '#24183F',
    fontSize: 13,
    fontWeight: '600',
  },
  workoutDate: {
    color: '#887E9D',
    fontSize: 11,
    marginTop: 2,
  },
  trainedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  trainedPillText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
