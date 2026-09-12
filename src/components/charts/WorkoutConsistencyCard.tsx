import React from 'react';
import { ImageBackground, View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { Activity, ChevronDown } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { getFitnessVisual } from '../../constants/visualAssets';

export const WorkoutConsistencyCard: React.FC = () => {
  const { trainingConsistency, user } = useFitnessStore();
  const { sessionsPerWeek, adherencePercentage, weeklyBreakdown } = trainingConsistency;

  const chartHeight = 85;
  const maxSessions = 6;
  const barWidth = 8;

  return (
    <ImageBackground source={getFitnessVisual(user.sex)} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Activity size={16} color="#10B981" />
          </View>
          <Text style={styles.title}>Workout Consistency</Text>
        </View>

        <View style={styles.dropdownBadge}>
          <Text style={styles.dropdownText}>4 Weeks</Text>
          <ChevronDown size={12} color="#24183F" />
        </View>
      </View>

      {/* Metric Row */}
      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>
          {sessionsPerWeek} <Text style={styles.unitText}>sessions/week</Text>
        </Text>
        <Text style={styles.percentageBadge}>{adherencePercentage}% of your goal</Text>
      </View>

      {/* Bar Chart comparing Completed vs Planned */}
      <View style={styles.chartWrapper}>
        <Svg width="100%" height={chartHeight + 25} viewBox="0 0 280 110">
          {weeklyBreakdown.map((item, idx) => {
            const groupX = 35 + idx * 62;
            const hCompleted = Math.max(12, (item.completed / maxSessions) * chartHeight);
            const hPlanned = Math.max(12, (item.planned / maxSessions) * chartHeight);

            const yCompleted = chartHeight - hCompleted + 5;
            const yPlanned = chartHeight - hPlanned + 5;

            return (
              <React.Fragment key={item.weekLabel}>
                {/* Completed Bar (Green) */}
                <Rect
                  x={groupX}
                  y={yCompleted}
                  width={barWidth}
                  height={hCompleted}
                  rx={4}
                  fill="#10B981"
                />
                {/* Planned Bar (Slate Grey) */}
                <Rect
                  x={groupX + barWidth + 4}
                  y={yPlanned}
                  width={barWidth}
                  height={hPlanned}
                  rx={4}
                  fill="rgba(36, 24, 63, 0.32)"
                />
                {/* Week Label */}
                <SvgText
                  x={groupX + barWidth + 2}
                  y={chartHeight + 22}
                  fill="#5D5570"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {item.weekLabel}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(36, 24, 63, 0.32)' }]} />
          <Text style={styles.legendText}>Planned</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 240,
    backgroundColor: 'transparent',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.24)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
  },
  dropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  dropdownText: {
    color: '#24183F',
    fontSize: 12,
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricValue: {
    color: '#24183F',
    fontSize: 20,
    fontWeight: '800',
  },
  unitText: {
    color: '#5D5570',
    fontSize: 13,
    fontWeight: '500',
  },
  percentageBadge: {
    color: '#5D5570',
    fontSize: 12,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#5D5570',
    fontSize: 11,
  },
});
