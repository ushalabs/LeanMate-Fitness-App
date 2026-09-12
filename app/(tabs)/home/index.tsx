import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { THEME } from '../../../src/constants/theme';
import { HeaderBar } from '../../../src/components/layout/HeaderBar';
import { TopMetricCards } from '../../../src/components/dashboard/TopMetricCards';
import { WeeklyMuscleCoverageCard } from '../../../src/components/body-map/WeeklyMuscleCoverageCard';
import { ThisWeekWidget } from '../../../src/components/dashboard/ThisWeekWidget';
import { QuickActionsWidget } from '../../../src/components/dashboard/QuickActionsWidget';
import { NutritionTrendChart } from '../../../src/components/charts/NutritionTrendChart';
import { WeightTrendCard } from '../../../src/components/charts/WeightTrendCard';
import { WorkoutConsistencyCard } from '../../../src/components/charts/WorkoutConsistencyCard';
import { AchievementsCard } from '../../../src/components/dashboard/AchievementsCard';
import { GoalProgressBar } from '../../../src/components/dashboard/GoalProgressBar';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1080;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, isDesktop ? styles.contentDesktop : styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Bar */}
      <HeaderBar />

      {/* 2. Top Metric Cards (Calories, Protein, Weight) */}
      <TopMetricCards />

      {/* 3. Middle Section */}
      <View style={[styles.middleSection, isDesktop ? styles.middleDesktop : styles.middleMobile]}>
        {/* Left Col: Weekly Muscle Coverage with Human Heatmap */}
        <View style={isDesktop ? styles.middleLeftCol : styles.fullWidth}>
          <WeeklyMuscleCoverageCard />
        </View>

        {/* Right Col: This Week, Quick Actions & Nutrition Trend */}
        <View style={isDesktop ? styles.middleRightCol : styles.fullWidth}>
          <ThisWeekWidget />
          <View style={{ height: 16 }} />
          <QuickActionsWidget />
          <NutritionTrendChart />
        </View>
      </View>

      {/* 4. Bottom Section: Weight Trend, Workout Consistency, Achievements */}
      <View style={[styles.bottomSection, isDesktop ? styles.bottomDesktop : styles.bottomMobile]}>
        <WeightTrendCard />
        <WorkoutConsistencyCard />
        <AchievementsCard />
      </View>

      {/* 5. Bottom Goal Progress Bar */}
      <GoalProgressBar />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 112,
  },
  contentDesktop: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  middleSection: {
    marginBottom: THEME.spacing.lg,
  },
  middleDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  middleMobile: {
    flexDirection: 'column',
    gap: 16,
  },
  middleLeftCol: {
    flex: 1.35,
  },
  middleRightCol: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  bottomSection: {
    gap: 16,
  },
  bottomDesktop: {
    flexDirection: 'row',
  },
  bottomMobile: {
    flexDirection: 'column',
  },
});
