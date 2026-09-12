import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ChevronRight, Target, AlertTriangle } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { BodyHeatmap } from './BodyHeatmap';
import { MuscleListWidget } from './MuscleListWidget';
import { useFitnessStore } from '../../store/useFitnessStore';
import { MuscleGroupId } from '../../types/muscle';

export const WeeklyMuscleCoverageCard: React.FC = () => {
  const { muscleCoverage } = useFitnessStore();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupId | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const { targetedCount, trainedCount, missedMuscles, stimulusScores } = muscleCoverage;

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Target size={18} color="#EF4444" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Weekly Muscle Coverage</Text>
            <Text style={styles.subtitle}>Based on your goal: Train all major muscles</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.targetBadge}>
          <Text style={styles.targetBadgeText}>
            {trainedCount} / {targetedCount} targeted
          </Text>
          <ChevronRight size={14} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Missed Muscles Alert if any */}
      {missedMuscles.length > 0 && (
        <View style={styles.missedBanner}>
          <AlertTriangle size={14} color={THEME.colors.red} />
          <Text style={styles.missedBannerText}>
            Missed this cycle: <Text style={styles.missedNames}>{missedMuscles.map(m => m.replace('_', ' ')).join(', ')}</Text>
          </Text>
        </View>
      )}

      {/* Main Content: Heatmap Body + Muscle List */}
      <View style={[styles.contentRow, !isDesktop && styles.contentCol]}>
        <View style={[styles.heatmapCol, !isDesktop && styles.heatmapColMobile]}>
          <BodyHeatmap
            stimulusScores={stimulusScores}
            onSelectMuscle={setSelectedMuscle}
            selectedMuscleId={selectedMuscle}
          />
        </View>

        <View style={[styles.listCol, !isDesktop && styles.listColMobile]}>
          <MuscleListWidget
            stimulusScores={stimulusScores}
            onSelectMuscle={setSelectedMuscle}
            selectedMuscleId={selectedMuscle}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#24183F',
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B647A',
    fontSize: 12,
    marginTop: 2,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    gap: 4,
    flexShrink: 0,
  },
  targetBadgeText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  missedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  missedBannerText: {
    color: '#6B647A',
    fontSize: 12,
    flex: 1,
    minWidth: 0,
  },
  missedNames: {
    color: THEME.colors.red,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  contentCol: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  heatmapCol: {
    flex: 1,
    alignItems: 'center',
  },
  heatmapColMobile: {
    flex: 0,
    alignSelf: 'stretch',
  },
  listCol: {
    flex: 1.2,
  },
  listColMobile: {
    flex: 0,
    alignSelf: 'stretch',
  },
});
