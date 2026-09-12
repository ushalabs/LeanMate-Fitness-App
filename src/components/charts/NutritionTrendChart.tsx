import React from 'react';
import { ImageBackground, View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { UtensilsCrossed, ChevronDown } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { formatLocalDate } from '../../utils/date';
import { VISUAL_ASSETS } from '../../constants/visualAssets';

export const NutritionTrendChart: React.FC = () => {
  const { calorieLogs } = useFitnessStore();
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartHeight = 130;
  const maxCalories = Math.max(3000, ...calorieLogs.map((log) => log.calories));
  const barWidth = 14;

  const weekStart = new Date();
  const day = weekStart.getDay() || 7;
  weekStart.setDate(weekStart.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);

  const data = labels.map((label, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    const dateStr = formatLocalDate(date);
    const log = calorieLogs.find((item) => item.date === dateStr);
    return {
      day: label,
      carbs: log?.carbohydrates || 0,
      protein: log?.protein || 0,
      fats: log?.fats || 0,
      totalCals: log?.calories || 0,
    };
  });

  const hasData = data.some((item) => item.totalCals > 0);

  return (
    <ImageBackground source={VISUAL_ASSETS.nutrition} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <UtensilsCrossed size={16} color="#EF4444" />
          </View>
          <Text style={styles.title}>Nutrition Trend</Text>
        </View>

        <View style={styles.dropdownBadge}>
          <Text style={styles.dropdownText}>This Week</Text>
          <ChevronDown size={12} color="#24183F" />
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width="100%" height={chartHeight + 30} viewBox="0 0 320 160">
          {[0, 1000, 2000, 3000].map((val) => {
            const y = chartHeight - (val / maxCalories) * chartHeight + 10;
            const label = val === 0 ? '0' : `${val / 1000}k`;
            return (
              <React.Fragment key={val}>
                <Line
                  x1={30}
                  y1={y}
                  x2={310}
                  y2={y}
                  stroke="rgba(36, 24, 63, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <SvgText x={22} y={y + 4} fill="#5D5570" fontSize="10" textAnchor="end">
                  {label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {data.map((item, index) => {
            const x = 50 + index * 38;
            const carbsCal = item.carbs * 4;
            const proteinCal = item.protein * 4;
            const fatsCal = item.fats * 9;

            const hCarbs = (carbsCal / maxCalories) * chartHeight;
            const hProtein = (proteinCal / maxCalories) * chartHeight;
            const hFats = (fatsCal / maxCalories) * chartHeight;

            const yCarbs = chartHeight - hCarbs + 10;
            const yProtein = yCarbs - hProtein;
            const yFats = yProtein - hFats;

            return (
              <React.Fragment key={item.day}>
                <Rect x={x} y={yCarbs} width={barWidth} height={hCarbs} rx={2} fill="#38BDF8" />
                <Rect x={x} y={yProtein} width={barWidth} height={hProtein} rx={2} fill="#10B981" />
                <Rect x={x} y={yFats} width={barWidth} height={hFats} rx={2} fill="#F97316" />
                <SvgText x={x + barWidth / 2} y={chartHeight + 25} fill="#5D5570" fontSize="10" textAnchor="middle">
                  {item.day}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
        {!hasData && <Text style={styles.emptyText}>Log nutrition to populate this chart.</Text>}
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
          <Text style={styles.legendText}>Carbs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Protein</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={styles.legendText}>Fats</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 76, 104, 0.22)',
    shadowColor: '#E84C68',
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
    marginBottom: THEME.spacing.sm,
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
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
  chartContainer: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#5D5570',
    fontSize: 12,
    marginTop: -72,
    marginBottom: 52,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 6,
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
    color: '#24183F',
    fontSize: 11,
    fontWeight: '500',
  },
});
