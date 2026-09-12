import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Target, Plus } from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useUIStore } from '../../../src/store/useUIStore';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';

export default function GoalsScreen() {
  const { goalPeriods, activeGoalPeriod } = useFitnessStore();
  const { openGoalSwitcherModal } = useUIStore();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

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
          <Text style={styles.title}>Goal Periods Architecture</Text>
          <Text style={styles.subtitle}>
            Historical preservation — goals evolve, past logs remain untouched
          </Text>
        </View>

        <TouchableOpacity style={styles.newGoalBtn} onPress={openGoalSwitcherModal}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newGoalBtnText}>Change Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goal Periods List */}
      <View style={styles.list}>
        {goalPeriods.map((period) => (
          <View key={period.id} style={[styles.periodCard, period.active && styles.activePeriodCard]}>
            <View style={[styles.periodTop, isNarrow && styles.periodTopMobile]}>
              <View style={styles.periodTitleRow}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: period.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)' },
                  ]}
                >
                  <Target size={18} color={period.active ? '#10B981' : THEME.colors.textMuted} />
                </View>
                <View style={styles.periodCopy}>
                  <Text style={styles.periodName}>
                    {period.fitnessGoal.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.periodDates}>
                    {period.startDate} → {period.active ? 'Present (Active)' : period.endDate || 'Archived'}
                  </Text>
                </View>
              </View>

              <View style={[styles.badge, period.active ? styles.badgeActive : styles.badgeArchived]}>
                <Text style={[styles.badgeText, period.active ? styles.badgeTextActive : styles.badgeTextArchived]}>
                  {period.active ? 'ACTIVE' : 'ARCHIVED'}
                </Text>
              </View>
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Daily Calorie Target</Text>
                <Text style={styles.metricVal}>{period.calorieTarget} kcal</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Gym Frequency</Text>
                <Text style={styles.metricVal}>{period.targetGymFrequency} days / wk</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Target Muscles</Text>
                <Text style={styles.metricVal}>{period.targetMuscleGroups.length} groups</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Maintenance Est</Text>
                <Text style={styles.metricVal}>~{period.estimatedMaintenance} kcal</Text>
              </View>
            </View>

            {period.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{period.notes}</Text>
              </View>
            )}
          </View>
        ))}
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
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.xl,
  },
  headerRowMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.violet,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: THEME.borderRadius.lg,
  },
  newGoalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 16,
  },
  periodCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  activePeriodCard: {
    borderColor: 'rgba(124, 58, 237, 0.52)',
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.md,
  },
  periodTopMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  periodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  periodCopy: {
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodName: {
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  periodDates: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeArchived: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextActive: {
    color: THEME.colors.primary,
  },
  badgeTextArchived: {
    color: THEME.colors.textMuted,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  metricItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  metricLabel: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  metricVal: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  notesBox: {
    backgroundColor: '#F7F4FF',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    marginTop: 12,
  },
  notesText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
