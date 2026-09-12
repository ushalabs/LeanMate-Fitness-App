import React from 'react';
import { ImageBackground, View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText, Circle } from 'react-native-svg';
import { Scale, ChevronDown, TrendingUp } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { VISUAL_ASSETS } from '../../constants/visualAssets';

const formatChartDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const WeightTrendCard: React.FC = () => {
  const { user, weightEntries } = useFitnessStore();
  const sorted = [...weightEntries].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-6);
  const hasHistory = sorted.length > 0;
  const currentWeight = hasHistory ? sorted[sorted.length - 1].weight : user.currentWeight;
  const previousWeight = sorted.length > 1 ? sorted[sorted.length - 2].weight : currentWeight;
  const changeThisWeek = parseFloat((currentWeight - previousWeight).toFixed(1));

  const weights = sorted.map((entry) => entry.weight);
  const minWeight = Math.floor(Math.min(...weights, currentWeight) - 1);
  const maxWeight = Math.ceil(Math.max(...weights, currentWeight) + 1);
  const range = Math.max(1, maxWeight - minWeight);
  const chartHeight = 100;

  const points = sorted.map((entry, index) => {
    const x = sorted.length === 1 ? 170 : 40 + index * (260 / Math.max(1, sorted.length - 1));
    const y = 15 + chartHeight - ((entry.weight - minWeight) / range) * chartHeight;
    return { ...entry, x, y };
  });

  const pathD = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
  const areaD = points.length > 1 ? `${pathD} L${points[points.length - 1].x} 115 L${points[0].x} 115 Z` : '';

  return (
    <ImageBackground source={VISUAL_ASSETS.weight} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Scale size={16} color="#38BDF8" />
          </View>
          <Text style={styles.title}>Body Weight Trend</Text>
        </View>

        <View style={styles.dropdownBadge}>
          <Text style={styles.dropdownText}>1 Month</Text>
          <ChevronDown size={12} color="#6B647A" />
        </View>
      </View>

      <View style={styles.metricRow}>
        <Text style={styles.metricValue}>{currentWeight} kg</Text>
        <View style={styles.deltaBadge}>
          <TrendingUp size={12} color={THEME.colors.primary} />
          <Text style={styles.deltaText}>
            {sorted.length > 1 ? `${changeThisWeek >= 0 ? '+' : ''}${changeThisWeek} kg` : 'No history yet'}
          </Text>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <Svg width="100%" height={140} viewBox="0 0 340 140">
          <Defs>
            <LinearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {[maxWeight, Math.round((maxWeight + minWeight) / 2), minWeight].map((label, idx) => {
            const y = 15 + idx * 50;
            return (
              <React.Fragment key={`${label}-${idx}`}>
                <Line x1={30} y1={y} x2={320} y2={y} stroke="rgba(124, 58, 237, 0.12)" strokeWidth="1" />
                <SvgText x={24} y={y + 4} fill="#887E9D" fontSize="9" textAnchor="end">
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {points.length > 1 && (
            <>
              <Path d={areaD} fill="url(#weightAreaGrad)" />
              <Path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {points.map((point) => (
            <React.Fragment key={point.id}>
              <Circle cx={point.x} cy={point.y} r={4} fill="#38BDF8" stroke="#FFFFFF" strokeWidth={2} />
              <SvgText x={point.x} y={130} fill="#887E9D" fontSize="9" textAnchor="middle">
                {formatChartDate(point.recordedAt)}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
        {!hasHistory && <Text style={styles.emptyText}>Record your first weight to start the trend.</Text>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  dropdownText: {
    color: '#6B647A',
    fontSize: 12,
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  metricValue: {
    color: '#24183F',
    fontSize: 22,
    fontWeight: '800',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  deltaText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },
  emptyText: {
    color: '#887E9D',
    fontSize: 12,
    marginTop: -78,
    marginBottom: 58,
  },
});
