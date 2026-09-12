import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mountain, ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';

export const GoalProgressBar: React.FC = () => {
  const { openGoalSwitcherModal } = useUIStore();
  const { calorieLogs, workoutLogs, weightEntries } = useFitnessStore();
  const hasActivity = calorieLogs.length > 0 || workoutLogs.length > 0 || weightEntries.length > 0;
  const percent = hasActivity ? Math.min(100, Math.round(((calorieLogs.length + workoutLogs.length + weightEntries.length) / 30) * 100)) : 0;

  return (
    <TouchableOpacity style={styles.container} onPress={openGoalSwitcherModal} activeOpacity={0.85}>
      <View style={styles.left}>
        <Mountain size={20} color="#10B981" />
        <Text style={styles.label}>
          {hasActivity ? (
            <>You're <Text style={styles.highlight}>{percent}%</Text> closer to your goal</>
          ) : (
            'Start logging to track goal progress'
          )}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percent}%` }]} />
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.subtext}>{hasActivity ? 'Keep it up!' : '0%'}</Text>
        <ChevronRight size={14} color={THEME.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    marginTop: THEME.spacing.md,
    gap: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: '#24183F',
    fontSize: 13,
    fontWeight: '600',
  },
  highlight: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  barContainer: {
    flex: 1,
  },
  barBg: {
    height: 8,
    backgroundColor: '#ECE7FF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtext: {
    color: '#6B647A',
    fontSize: 12,
    fontWeight: '500',
  },
});
