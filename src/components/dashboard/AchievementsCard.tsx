import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';

export const AchievementsCard: React.FC = () => {
  const { calorieLogs, workoutLogs, weightEntries } = useFitnessStore();
  const hasActivity = calorieLogs.length > 0 || workoutLogs.length > 0 || weightEntries.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Trophy size={16} color="#F59E0B" />
          </View>
          <Text style={styles.title}>Achievements</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{hasActivity ? 'Achievements will unlock from your logs' : 'No achievements yet'}</Text>
        <Text style={styles.emptySubtitle}>Log meals, workouts, and weight updates to earn milestones.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#F6F3FF',
    borderRadius: THEME.borderRadius.md,
    padding: 12,
  },
  emptyTitle: {
    color: '#24183F',
    fontSize: 13,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#887E9D',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
});
