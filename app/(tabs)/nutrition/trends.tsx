import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, TrendingUp, Compass, Flame, CheckCircle2 } from 'lucide-react-native';
import Svg, { Path, Circle, Text as SvgText, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';

export default function CalorieTrendsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);
  const { rollingCalories, activeGoalPeriod } = useFitnessStore();

  const {
    current7DayAverage,
    previous7DayAverage,
    changePerDay,
    fourWeekHistory,
    detectedPhase,
    complianceStatus,
    complianceMessage,
  } = rollingCalories;

  const estimatedMaint = activeGoalPeriod.estimatedMaintenance || 2200;
  const diffFromMaint = current7DayAverage - estimatedMaint;

  // Chart points for 4 weeks (4 Weeks Ago -> Last Week)
  const chartHeight = 120;
  const minCal = 2000;
  const maxCal = 2500;
  const getY = (val: number) => chartHeight - ((val - minCal) / (maxCal - minCal)) * chartHeight + 15;

  const points = fourWeekHistory.map((item, idx) => ({
    ...item,
    x: 40 + idx * 80,
    y: getY(item.weekAvg),
  }));

  // Create SVG path string
  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M${curr.x} ${curr.y}` : `${acc} L${curr.x} ${curr.y}`;
  }, '');

  const formatPhaseName = (p: string) => {
    return p.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, isNarrow && styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button & Title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#24183F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calorie Trends & Intelligence</Text>
      </View>

      {/* Top 3-Metric Comparison Cards */}
      <View style={[styles.metricsRow, isNarrow && styles.metricsRowMobile]}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Current 7-Day Avg</Text>
          <Text style={styles.metricValue}>{current7DayAverage.toLocaleString()}</Text>
          <Text style={styles.metricUnit}>kcal / day</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Previous 7-Day Avg</Text>
          <Text style={styles.metricValue}>{previous7DayAverage.toLocaleString()}</Text>
          <Text style={styles.metricUnit}>kcal / day</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Net Difference</Text>
          <Text style={[styles.metricValue, { color: changePerDay >= 0 ? THEME.colors.primary : THEME.colors.red }]}>
            {changePerDay >= 0 ? `+${changePerDay}` : changePerDay}
          </Text>
          <Text style={styles.metricUnit}>kcal / day</Text>
        </View>
      </View>

      {/* 4-Week Trend Graph Card */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <TrendingUp size={18} color="#10B981" />
          <Text style={styles.graphTitle}>4-Week Intake Trajectory</Text>
        </View>

        <View style={styles.chartWrapper}>
          <Svg width="100%" height={chartHeight + 40} viewBox="0 0 320 160">
            <Defs>
              <LinearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Maintenance guideline */}
            <Line
              x1={20}
              y1={getY(estimatedMaint)}
              x2={300}
              y2={getY(estimatedMaint)}
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <SvgText
              x={305}
              y={getY(estimatedMaint) + 3}
              fill="#F59E0B"
              fontSize="9"
              textAnchor="start"
            >
              Maint
            </SvgText>

            {/* Area Fill */}
            <Path
              d={`${pathD} L${points[points.length - 1].x} ${chartHeight + 15} L${points[0].x} ${chartHeight + 15} Z`}
              fill="url(#trendGrad)"
            />

            {/* Line Path */}
            <Path
              d={pathD}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Points & Labels */}
            {points.map((p, idx) => (
              <React.Fragment key={idx}>
                <Circle cx={p.x} cy={p.y} r={4.5} fill="#10B981" stroke="#0B111E" strokeWidth={2} />
                <SvgText
                  x={p.x}
                  y={p.y - 10}
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {p.weekAvg}
                </SvgText>
                <SvgText
                  x={p.x}
                  y={chartHeight + 32}
                  fill="rgba(255, 255, 255, 0.72)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {p.label.replace(' Weeks Ago', 'w ago').replace('Last Week', 'Last Wk')}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>
      </View>

      {/* Intake Phase Detection & Compliance Intelligence */}
      <View style={styles.intelligenceCard}>
        <View style={styles.intelHeader}>
          <Compass size={18} color="#38BDF8" />
          <Text style={styles.intelTitle}>Detected Intake Behavior</Text>
        </View>

        <View style={styles.intelRow}>
          <Text style={styles.intelLabel}>User Goal:</Text>
          <Text style={styles.intelValue}>
            {activeGoalPeriod.fitnessGoal.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.intelRow}>
          <Text style={styles.intelLabel}>Detected Behavior Phase:</Text>
          <Text style={[styles.intelValue, { color: '#38BDF8' }]}>
            {formatPhaseName(detectedPhase)}
          </Text>
        </View>

        <View style={styles.intelRow}>
          <Text style={styles.intelLabel}>Estimated Maintenance:</Text>
          <Text style={styles.intelValue}>~{estimatedMaint} kcal</Text>
        </View>

        <View style={styles.intelRow}>
          <Text style={styles.intelLabel}>Current Energy Surplus:</Text>
          <Text style={[styles.intelValue, { color: THEME.colors.primary }]}>
            {diffFromMaint >= 0 ? `+${diffFromMaint}` : diffFromMaint} kcal/day
          </Text>
        </View>

        <View style={styles.intelRow}>
          <Text style={styles.intelLabel}>Compliance Status:</Text>
          <View style={styles.statusBadge}>
            <CheckCircle2 size={13} color="#10B981" />
            <Text style={styles.statusBadgeText}>
              {complianceStatus === 'aligned' ? 'ON TRACK' : 'NEEDS ATTENTION'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryNotice}>
          <Text style={styles.noticeText}>
            {complianceMessage}
          </Text>
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
    maxWidth: 900,
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
    marginBottom: THEME.spacing.xl,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#24183F',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: THEME.spacing.lg,
  },
  metricsRowMobile: {
    flexDirection: 'column',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#E84C68',
    borderRadius: THEME.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.22)',
    alignItems: 'center',
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  metricUnit: {
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: 11,
    marginTop: 2,
  },
  graphCard: {
    backgroundColor: '#E84C68',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.22)',
    marginBottom: THEME.spacing.lg,
  },
  graphHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: THEME.spacing.md,
  },
  graphTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  intelligenceCard: {
    backgroundColor: '#E84C68',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.22)',
  },
  intelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  intelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  intelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.18)',
  },
  intelLabel: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13,
    flex: 1,
  },
  intelValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  statusBadgeText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  summaryNotice: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  noticeText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
});
