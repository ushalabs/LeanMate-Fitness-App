import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { useUIStore } from '../../store/useUIStore';
import { useTodayDate } from '../../hooks/useTodayDate';
import { nutritionStreakEngine } from '../../services/nutritionStreakEngine';

export const HeaderBar: React.FC = () => {
  const { user, activeGoalPeriod, calorieLogs } = useFitnessStore();
  const { openGoalSwitcherModal } = useUIStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const today = useTodayDate();

  const firstName = user.fullName.split(' ')[0] || 'there';
  const initials = (user.fullName || user.email || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const nutritionStreak = nutritionStreakEngine.calculate(
    calorieLogs,
    activeGoalPeriod.calorieTarget,
    activeGoalPeriod.proteinTarget,
    today
  );

  const formatGoalName = (goal: string) => {
    switch (goal) {
      case 'lean_bulk':
        return 'Lean Bulk';
      case 'lose_fat':
        return 'Lose Fat';
      case 'maintain':
        return 'Maintain Weight';
      case 'build_muscle':
        return 'Build Muscle';
      case 'gain_weight':
        return 'Gain Weight';
      default:
        return 'Lean Bulk';
    }
  };

  return (
    <View style={styles.header}>
      {/* Left: Greeting & Subtitle */}
      <View style={styles.leftCol}>
        <View style={styles.greetingRow}>
          {user.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
              <Text style={styles.headerAvatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.greetingCopy}>
            <View style={styles.nameRow}>
              <Text style={[styles.greeting, !isDesktop && styles.greetingMobile]}>
                {firstName}
              </Text>
              {nutritionStreak.count > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>+{nutritionStreak.count} Streak</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Right: Goal Badge + Accent */}
      <View style={[styles.rightRow, !isDesktop && styles.rightRowMobile]}>
        {/* Current Goal Tile */}
        <TouchableOpacity style={[styles.goalBadge, !isDesktop && styles.goalBadgeMobile]} onPress={openGoalSwitcherModal} activeOpacity={0.8}>
          <View>
            <Text style={styles.goalTitle}>{formatGoalName(activeGoalPeriod.fitnessGoal)}</Text>
            <Text style={styles.goalSubtitle}>Current Goal</Text>
          </View>
          <ChevronRight size={16} color={THEME.colors.textSecondary} />
        </TouchableOpacity>

        {/* Cursive Accent Quote (Desktop) */}
        {isDesktop && (
          <View style={styles.accentWrapper}>
            <Text style={styles.accentText}>Better Than</Text>
            <Text style={styles.accentTextScript}>Yesterday</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
    flexWrap: 'wrap',
    gap: 16,
  },
  leftCol: {
    flex: 1,
    minWidth: 260,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingCopy: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  headerAvatarFallback: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#7C3AED',
    fontSize: 17,
    fontWeight: '800',
  },
  greeting: {
    color: '#1F1646',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0,
  },
  greetingMobile: {
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  dateHighlight: {
    color: THEME.colors.textMuted,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rightRowMobile: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#A78BFA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.18)',
  },
  goalBadgeMobile: {
    minWidth: 170,
    maxWidth: 190,
    paddingVertical: 10,
  },
  goalTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  goalSubtitle: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10,
  },
  streakBadge: {
    backgroundColor: '#10D79A',
    borderWidth: 1,
    borderColor: 'rgba(16, 215, 154, 0.55)',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#10D79A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 3,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  accentWrapper: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  accentText: {
    color: 'rgba(31, 22, 70, 0.48)',
    fontSize: 11,
    fontStyle: 'italic',
  },
  accentTextScript: {
    color: 'rgba(31, 22, 70, 0.72)',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '600',
    lineHeight: 18,
  },
});
