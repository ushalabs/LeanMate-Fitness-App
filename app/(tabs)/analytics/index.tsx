import React, { useRef } from 'react';
import { ImageBackground, View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Scale,
  Flame,
  Dumbbell,
  Target,
  ChevronRight,
} from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';
import { performanceTrend } from '../../../src/services/workoutProgression';
import { getFitnessVisual, getMuscleVisual, VISUAL_ASSETS } from '../../../src/constants/visualAssets';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);
  const { user, rollingCalories, trainingConsistency, muscleCoverage, weightTrends, activeGoalPeriod, calorieLogs, workoutLogs, workoutHistoryLoaded, workoutHistory, weightEntries } =
    useFitnessStore();
  const hasAnyLogs = calorieLogs.length > 0 || workoutLogs.length > 0 || weightEntries.length > 0;
  const progression = performanceTrend(workoutHistoryLoaded ? workoutHistory : workoutLogs, trainingConsistency.adherencePercentage, muscleCoverage.percentage);

  const questions = [
    {
      q: '1. Am I eating according to my goal?',
      answer: rollingCalories.complianceMessage,
      status: rollingCalories.complianceStatus === 'aligned' ? 'yes' : 'warning',
      metric: `${rollingCalories.current7DayAverage} kcal/day (Target: ${activeGoalPeriod.calorieTarget})`,
      actionPath: '/nutrition/trends',
    },
    {
      q: '2. Am I training as often as I planned?',
      answer: `${trainingConsistency.sessionsPerWeek} sessions / week vs benchmark ${trainingConsistency.benchmarkTarget}`,
      status: trainingConsistency.status === 'green' ? 'yes' : 'no',
      metric: `${trainingConsistency.adherencePercentage}% of target frequency reached`,
      actionPath: '/training',
    },
    {
      q: '3. Am I training the muscles I intended to train?',
      answer:
        muscleCoverage.missedMuscles.length === 0
          ? 'All target muscle groups covered'
          : `Missed: ${muscleCoverage.missedMuscles.map((m) => m.replace('_', ' ')).join(', ')}`,
      status: muscleCoverage.missedMuscles.length === 0 ? 'yes' : 'warning',
      metric: `${muscleCoverage.trainedCount} of ${muscleCoverage.targetedCount} target muscle groups stimulated`,
      actionPath: '/training/analytics',
    },
    {
      q: '4. Is my fitness behavior improving or inconsistent?',
      answer: progression.answer,
      status: progression.status === 'improving' ? 'yes' : progression.status === 'insufficient' ? 'insufficient' : 'warning',
      metric: progression.metric,
      actionPath: '/training',
    },
  ];

  const summaryText = hasAnyLogs
    ? `Current intake average is ${rollingCalories.current7DayAverage} kcal/day. Training volume is ${trainingConsistency.sessionsPerWeek} sessions/week, with ${muscleCoverage.trainedCount} of ${muscleCoverage.targetedCount} target muscle groups stimulated.`
    : 'LeanMate has no personal history to analyze yet. Once you log nutrition, workouts, and weights, this section will summarize real trends from your own data.';

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, isNarrow && styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Fitness Intelligence Matrix</Text>
        <Text style={styles.subtitle}>
          Continuous evaluation of actual daily behavior vs selected goal
        </Text>
      </View>

      {/* The 4 Major Questions Cards */}
      <View style={styles.questionsContainer}>
        {questions.map((item, idx) => {
          const isGreen = item.status === 'yes';
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(item.actionPath as any)}
              activeOpacity={0.85}
            >
              <ImageBackground
                source={
                  idx === 0
                    ? VISUAL_ASSETS.nutrition
                    : idx === 1
                      ? getFitnessVisual(user.sex)
                      : idx === 2
                        ? getMuscleVisual(activeGoalPeriod.targetMuscleGroups, user.sex)
                        : VISUAL_ASSETS.weight
                }
                style={styles.card}
                imageStyle={styles.cardImage}
                resizeMode="cover"
              >
              <View style={[styles.cardTop, isNarrow && styles.cardTopMobile]}>
                <View style={styles.questionRow}>
                  <View style={[styles.questionIndex, idx === 1 && styles.questionIndexPurple, idx === 2 && styles.questionIndexBlue, idx === 3 && styles.questionIndexViolet]}>
                    <Text style={styles.questionIndexText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.questionText}>{item.q.replace(/^\d+\.\s*/, '')}</Text>
                </View>
                {isGreen ? (
                  <View style={[styles.badge, styles.badgeGreen]}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={styles.badgeTextGreen}>ALIGNED</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeAmber]}>
                    <AlertTriangle size={13} color="#F59E0B" />
                    <Text style={styles.badgeTextAmber}>{item.status === 'insufficient' ? 'NO TREND YET' : 'ATTENTION'}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.answerText}>{item.answer}</Text>

              <View style={styles.cardBottom}>
                <Text style={styles.metricText}>{item.metric}</Text>
                <ChevronRight size={16} color={THEME.colors.textMuted} />
              </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Holistic Correlation Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryTitleRow}>
          <TrendingUp size={18} color="#10B981" />
          <Text style={styles.summaryTitle}>Behavioral Correlation Analysis</Text>
        </View>
        <Text style={styles.summaryBody}>
          {summaryText}
        </Text>
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
    paddingTop: 30,
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    color: '#24183F',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6B647A',
    fontSize: 13,
    marginTop: 4,
  },
  questionsContainer: {
    gap: 16,
    marginBottom: THEME.spacing.xl,
  },
  card: {
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.16)',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
    backgroundColor: 'transparent',
    minHeight: 205,
  },
  cardImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTopMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  questionIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  questionIndexPurple: {
    backgroundColor: '#A855F7',
    shadowColor: '#A855F7',
  },
  questionIndexBlue: {
    backgroundColor: '#0EA5E9',
    shadowColor: '#0EA5E9',
  },
  questionIndexViolet: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
  },
  questionIndexText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  badgeTextGreen: {
    color: THEME.colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextAmber: {
    color: THEME.colors.amber,
    fontSize: 10,
    fontWeight: '800',
  },
  answerText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    maxWidth: '66%',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    maxWidth: '66%',
  },
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  summaryTitle: {
    color: THEME.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryBody: {
    color: '#6B647A',
    fontSize: 13,
    lineHeight: 20,
  },
});
