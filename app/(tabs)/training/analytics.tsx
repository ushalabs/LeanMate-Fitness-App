import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play } from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { BodyHeatmap } from '../../../src/components/body-map/BodyHeatmap';
import { MuscleListWidget } from '../../../src/components/body-map/MuscleListWidget';
import { muscleStimulusEngine } from '../../../src/services/muscleStimulusEngine';
import { MuscleGroupId } from '../../../src/types/muscle';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';

export default function TrainingAnalyticsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  const { trainingConsistency, muscleCoverage, activeGoalPeriod, workoutLogs } = useFitnessStore();

  const todayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(todayIndex);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(null);

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Balance Score Calculation
  const balanceStats = muscleStimulusEngine.calculateBalanceScore(
    muscleCoverage.stimulusScores,
    activeGoalPeriod.targetMuscleGroups,
    activeGoalPeriod.excludedMuscleGroups
  );

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, isNarrow && styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#24183F" />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Training Intelligence & Heatmap</Text>
          <Text style={styles.headerSubtitle}>Muscle stimulus, weekly timeline & balance analytics</Text>
        </View>
      </View>

      {/* Top 3 Metric Cards */}
      <View style={styles.topMetricsRow}>
        {/* Frequency */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Weekly Consistency</Text>
          <Text style={styles.metricValue}>{trainingConsistency.sessionsPerWeek}</Text>
          <Text style={styles.metricSub}>Goal: {trainingConsistency.benchmarkTarget} days/wk</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{trainingConsistency.statusText}</Text>
          </View>
        </View>

        {/* Coverage */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Muscle Coverage</Text>
          <Text style={styles.metricValue}>
            {muscleCoverage.trainedCount} / {muscleCoverage.targetedCount}
          </Text>
          <Text style={styles.metricSub}>{muscleCoverage.percentage}% covered</Text>
          <View style={[styles.statusPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Text style={[styles.statusPillText, { color: THEME.colors.primary }]}>
              {muscleCoverage.missedMuscles.length === 0 ? 'ALL COVERED' : `${muscleCoverage.missedMuscles.length} MISSED`}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Muscle Balance Score</Text>
          <Text style={[styles.metricValue, { color: '#38BDF8' }]}>{balanceStats.balanceScore}%</Text>
          <Text style={styles.metricSub}>{balanceStats.summary}</Text>
          <View style={[styles.statusPill, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Text style={[styles.statusPillText, { color: '#38BDF8' }]}>
              {balanceStats.needsAttention.length} Need Focus
            </Text>
          </View>
        </View>
      </View>

      {/* Phase 17: Weekly Muscle Timeline Scrubber */}
      <View style={styles.timelineCard}>
        <View style={[styles.timelineHeader, isNarrow && styles.timelineHeaderMobile]}>
          <View style={styles.timelineTitleRow}>
            <Play size={16} color="#10B981" />
            <Text style={styles.timelineTitle}>Weekly Training Footprint Evolution</Text>
          </View>
          <Text style={styles.timelineSubtitle}>
            Filter stimulus accrued through {daysLabels[selectedDayIdx]}
          </Text>
        </View>

        <View style={styles.daysScrubber}>
          {daysLabels.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            const isPastOrCurrent = idx <= selectedDayIdx;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.scrubberBtn,
                  isSelected && styles.scrubberBtnSelected,
                  isPastOrCurrent && !isSelected && styles.scrubberBtnPast,
                ]}
                onPress={() => setSelectedDayIdx(idx)}
              >
                <Text
                  style={[
                    styles.scrubberText,
                    isSelected && styles.scrubberTextSelected,
                    isPastOrCurrent && !isSelected && styles.scrubberTextPast,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Heatmap Visualization & Muscle Breakdown */}
      <View style={[styles.heatmapSection, isDesktop ? styles.heatmapDesktop : styles.heatmapMobile]}>
        <View style={styles.heatmapCard}>
          <Text style={styles.sectionHeader}>Anatomical Muscle Map</Text>
          <BodyHeatmap
            stimulusScores={muscleCoverage.stimulusScores}
            onSelectMuscle={setSelectedMuscle}
            selectedMuscleId={selectedMuscle}
          />
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionHeader}>Stimulus Breakdown by Muscle</Text>
          <MuscleListWidget
            stimulusScores={muscleCoverage.stimulusScores}
            onSelectMuscle={setSelectedMuscle}
            selectedMuscleId={selectedMuscle}
          />
        </View>
      </View>
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
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.lg,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#24183F',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#6B647A',
    fontSize: 12,
    marginTop: 2,
  },
  topMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: THEME.spacing.lg,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#8B5CF6',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.24)',
    alignItems: 'center',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricSub: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 11,
    marginBottom: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  statusPillText: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.24)',
    marginBottom: THEME.spacing.lg,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  timelineHeaderMobile: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineSubtitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
  },
  daysScrubber: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: THEME.borderRadius.lg,
    padding: 4,
    gap: 4,
  },
  scrubberBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  scrubberBtnSelected: {
    backgroundColor: THEME.colors.primary,
  },
  scrubberBtnPast: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  scrubberText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 12,
    fontWeight: '600',
  },
  scrubberTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrubberTextPast: {
    color: '#FFFFFF',
  },
  heatmapSection: {
    gap: 16,
  },
  heatmapDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heatmapMobile: {
    flexDirection: 'column',
  },
  heatmapCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    alignItems: 'center',
  },
  listCard: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
  },
  sectionHeader: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
});
