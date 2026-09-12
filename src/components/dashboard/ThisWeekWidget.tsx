import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Check, Quote } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { formatLocalDate } from '../../utils/date';

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const ThisWeekWidget: React.FC = () => {
  const { workoutLogs, activeGoalPeriod } = useFitnessStore();
  const weekStart = startOfWeek(new Date());
  const todayStr = formatLocalDate(new Date());
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const targetMax = Number(activeGoalPeriod.targetGymFrequency.split('-')[1]) || 0;

  const days = labels.map((day, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    const dateStr = formatLocalDate(date);
    return {
      day,
      dateNum: date.getDate(),
      attended: workoutLogs.some((log) => log.trained && log.date === dateStr),
      isToday: dateStr === todayStr,
    };
  });

  const attendedCount = days.filter((d) => d.attended).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Calendar size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>This Week</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{attendedCount} / {targetMax} workouts</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {days.map((item) => (
          <View key={item.day} style={[styles.dayCol, item.isToday && styles.todayCol]}>
            <Text style={[styles.dayLabel, item.isToday && styles.todayLabel]}>{item.day}</Text>
            <Text style={[styles.dateNumber, item.isToday && styles.todayDateNumber]}>{item.dateNum}</Text>

            <View style={styles.indicatorWrapper}>
              {item.attended ? (
                <View style={styles.checkCircle}>
                  <Check size={12} color="#0B111E" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.quoteRow}>
        <View style={styles.quoteIconCircle}>
          <Quote size={12} color="#10B981" />
        </View>
        <Text style={styles.quoteText}>
          {attendedCount === 0 ? 'Log your first workout to start tracking this week.' : 'Workout history updated from your logs.'}
        </Text>
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  countBadgeText: {
    color: '#6B647A',
    fontSize: 12,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    backgroundColor: '#F6F3FF',
    borderRadius: THEME.borderRadius.lg,
    padding: 10,
  },
  dayCol: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: THEME.borderRadius.md,
  },
  todayCol: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  dayLabel: {
    color: '#887E9D',
    fontSize: 11,
    fontWeight: '600',
  },
  todayLabel: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  dateNumber: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 4,
  },
  todayDateNumber: {
    color: THEME.colors.primary,
  },
  indicatorWrapper: {
    marginTop: 2,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.colors.textMuted,
  },
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F6F3FF',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  quoteIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    color: '#6B647A',
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
});
