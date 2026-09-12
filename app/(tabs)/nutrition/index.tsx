import React, { useRef } from 'react';
import { ImageBackground, View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Utensils, TrendingUp, Plus, Trash2, Calendar, Flame } from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useUIStore } from '../../../src/store/useUIStore';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';
import { VISUAL_ASSETS } from '../../../src/constants/visualAssets';

export const NutritionScreen: React.FC = () => {
  const router = useRouter();
  const { calorieLogs, rollingCalories, activeGoalPeriod, deleteCalorieLog } = useFitnessStore();
  const { openLogMealModal } = useUIStore();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  const currentAvg = rollingCalories.current7DayAverage;
  const targetCal = activeGoalPeriod.calorieTarget;
  const loggedCount = rollingCalories.loggedDaysCount;

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
          <Text style={styles.screenTitle}>Nutrition & Calories</Text>
          <Text style={styles.screenSubtitle}>Daily nutrition tracking & rolling energy balance</Text>
        </View>

        <TouchableOpacity style={styles.trendsBtn} onPress={() => router.push('/nutrition/trends')}>
          <TrendingUp size={16} color="#10B981" />
          <Text style={styles.trendsBtnText}>View Trends</Text>
        </TouchableOpacity>
      </View>

      {/* Rolling 7-Day Summary Card */}
      <ImageBackground source={VISUAL_ASSETS.nutrition} style={styles.summaryCard} imageStyle={styles.summaryImage} resizeMode="cover">
        <View style={styles.summaryTop}>
          <View style={styles.summaryIcon}>
            <Flame size={20} color="#F97316" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Rolling 7-Day Average</Text>
            <Text style={styles.summaryValue}>
              {currentAvg.toLocaleString()} <Text style={styles.summaryUnit}>kcal/day</Text>
            </Text>
          </View>

          <View style={styles.compliancePill}>
            <Text style={styles.complianceText}>{rollingCalories.complianceStatus.toUpperCase()}</Text>
          </View>
        </View>

        {/* Phase 24 check: insufficient data indicator */}
        <View style={[styles.daysLoggedRow, isNarrow && styles.daysLoggedRowMobile]}>
          <Text style={styles.daysLoggedText}>
            {loggedCount} of 7 days logged in active window
          </Text>
          <Text style={styles.targetComparison}>
            Target: {targetCal.toLocaleString()} kcal ({currentAvg - targetCal >= 0 ? `+${currentAvg - targetCal}` : currentAvg - targetCal} kcal)
          </Text>
        </View>

        <Text style={styles.complianceDetail}>{rollingCalories.complianceMessage}</Text>
      </ImageBackground>

      {/* Log Meal Banner */}
      <TouchableOpacity onPress={openLogMealModal} activeOpacity={0.85}>
        <ImageBackground source={VISUAL_ASSETS.nutritionSecondary} style={styles.logActionCard} imageStyle={styles.actionImage} resizeMode="cover">
        <View style={styles.logActionLeft}>
          <View style={styles.plusCircle}>
            <Plus size={20} color="#E84C68" />
          </View>
          <View style={styles.logActionCopy}>
            <Text style={styles.logActionTitle}>Log Daily Calories</Text>
            <Text style={styles.logActionSubtitle}>Enter total calories and optional macros</Text>
          </View>
        </View>
        <Utensils size={20} color="#FFFFFF" />
        </ImageBackground>
      </TouchableOpacity>

      {/* Recent Nutrition History */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Recent Intake Logs</Text>
        <Text style={styles.historyCount}>{calorieLogs.length} entries</Text>
      </View>

      <View style={styles.logsList}>
        {calorieLogs.length === 0 && (
          <ImageBackground source={VISUAL_ASSETS.nutrition} style={styles.emptyLogsCard} imageStyle={styles.emptyImage} resizeMode="cover">
            <Utensils size={34} color="#C4B5FD" />
            <Text style={styles.emptyLogsTitle}>No nutrition logs yet</Text>
            <Text style={styles.emptyLogsText}>Start tracking your meals to see your progress here.</Text>
          </ImageBackground>
        )}

        {calorieLogs.slice(0, 14).map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={styles.logLeft}>
              <View style={styles.calendarIcon}>
                <Calendar size={14} color={THEME.colors.textMuted} />
              </View>
              <View>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.logMacros}>
                  P: {log.protein || 0}g • C: {log.carbohydrates || 0}g • F: {log.fats || 0}g
                </Text>
              </View>
            </View>

            <View style={styles.logRight}>
              <Text style={styles.logCalories}>{log.calories} kcal</Text>
              <TouchableOpacity
                onPress={() => deleteCalorieLog(log.date)}
                style={styles.deleteBtn}
              >
                <Trash2 size={15} color={THEME.colors.red} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default NutritionScreen;

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
  screenTitle: {
    color: '#24183F',
    fontSize: 22,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: '#6B647A',
    fontSize: 13,
    marginTop: 2,
  },
  trendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232, 76, 104, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.25)',
  },
  trendsBtnText: {
    color: '#E84C68',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    minHeight: 230,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.22)',
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    shadowColor: '#E84C68',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  summaryImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  actionImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  emptyImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    color: '#5D3140',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryValue: {
    color: '#24183F',
    fontSize: 24,
    fontWeight: '800',
  },
  summaryUnit: {
    color: '#5D3140',
    fontSize: 14,
    fontWeight: '500',
  },
  compliancePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.sm,
  },
  complianceText: {
    color: '#5D3140',
    fontSize: 11,
    fontWeight: '800',
  },
  daysLoggedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 8,
  },
  daysLoggedRowMobile: {
    flexDirection: 'column',
  },
  daysLoggedText: {
    color: '#5D3140',
    fontSize: 12,
  },
  targetComparison: {
    color: '#5D3140',
    fontSize: 12,
    flexShrink: 1,
  },
  complianceDetail: {
    color: '#24183F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    maxWidth: '58%',
    lineHeight: 17,
  },
  logActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.24)',
    marginBottom: THEME.spacing.xl,
    minHeight: 150,
    overflow: 'hidden',
  },
  logActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '58%',
    minWidth: 0,
  },
  logActionCopy: {
    flex: 1,
    minWidth: 0,
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logActionTitle: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
  },
  logActionSubtitle: {
    color: '#5D3140',
    fontSize: 12,
    marginTop: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  historyTitle: {
    color: '#24183F',
    fontSize: 16,
    fontWeight: '700',
  },
  historyCount: {
    color: '#887E9D',
    fontSize: 12,
  },
  logsList: {
    gap: 8,
  },
  emptyLogsCard: {
    minHeight: 150,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.24)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyLogsTitle: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyLogsText: {
    color: '#5D3140',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.14)',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(232, 76, 104, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logDate: {
    color: '#24183F',
    fontSize: 13,
    fontWeight: '600',
  },
  logMacros: {
    color: '#887E9D',
    fontSize: 11,
    marginTop: 2,
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logCalories: {
    color: '#E84C68',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
});
