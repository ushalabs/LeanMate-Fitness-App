import React from 'react';
import { ImageBackground, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Flame, Dumbbell, Scale } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';
import { useTodayDate } from '../../hooks/useTodayDate';
import { getFitnessVisual, VISUAL_ASSETS } from '../../constants/visualAssets';

export const TopMetricCards: React.FC = () => {
  const { width } = useWindowDimensions();
  const { activeGoalPeriod, user, weightEntries, calorieLogs } = useFitnessStore();

  const isDesktop = width >= 1024;
  const isTablet = width >= 640 && width < 1024;
  const today = useTodayDate();
  const todayLog = calorieLogs.find((log) => log.date === today);

  const currentCal = todayLog?.calories || 0;
  const targetCal = activeGoalPeriod.calorieTarget;
  const calPercent = targetCal > 0 ? Math.min(100, Math.round((currentCal / targetCal) * 100)) : 0;

  const proteinCurrent = todayLog?.protein || 0;
  const proteinTarget = activeGoalPeriod.proteinTarget || 0;
  const proteinPercent = proteinTarget > 0 ? Math.min(100, Math.round((proteinCurrent / proteinTarget) * 100)) : 0;
  const proteinLeft = Math.max(0, proteinTarget - proteinCurrent);

  const currentWeight = user.currentWeight;
  const previousWeight = weightEntries.length > 1 ? weightEntries[weightEntries.length - 2].weight : currentWeight;
  const weightChange = parseFloat((currentWeight - previousWeight).toFixed(1));
  const hasWeightHistory = weightEntries.length > 1;

  const caloriesLeft = Math.max(0, targetCal - currentCal);
  const caloriesOver = Math.max(0, currentCal - targetCal);
  const calorieNote =
    !todayLog
      ? 'No logs yet'
      : caloriesOver > 0
        ? `+${caloriesOver} kcal over`
        : `${caloriesLeft} kcal left`;

  return (
    <View style={[styles.grid, isDesktop ? styles.gridDesktop : isTablet ? styles.gridTablet : styles.gridMobile]}>
      <ImageBackground source={VISUAL_ASSETS.nutrition} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
        <View style={styles.cardTopLeft}>
          <View style={styles.titleRow}>
            <Flame size={20} color="#F97316" />
            <Text style={styles.cardTitle}>Calories</Text>
          </View>
        </View>

        <View style={styles.statsArea}>
          <View style={styles.valueRow}>
            <Text style={styles.primaryValue}>
              {currentCal.toLocaleString()}
              <Text style={styles.subValue}> / {targetCal.toLocaleString()} kcal</Text>
            </Text>
            <Text style={styles.percentageText}>{calPercent}%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${calPercent}%`, backgroundColor: '#FFFFFF' }]} />
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusBadgeText}>{calorieNote}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <ImageBackground source={getFitnessVisual(user.sex)} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
        <View style={styles.cardTopLeft}>
          <View style={styles.titleRow}>
            <Dumbbell size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Protein</Text>
          </View>
        </View>

        <View style={styles.statsArea}>
          <View style={styles.valueRow}>
            <Text style={styles.primaryValue}>
              {proteinCurrent}
              <Text style={styles.subValue}> / {proteinTarget} g</Text>
            </Text>
            <Text style={styles.percentageText}>{proteinPercent}%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${proteinPercent}%`, backgroundColor: '#FFFFFF' }]} />
          </View>

          <View style={styles.badgeRow}>
            <Text style={styles.leftoverText}>
              {todayLog ? `${proteinLeft}g left` : 'No log today'}
            </Text>
          </View>
        </View>
      </ImageBackground>

      <ImageBackground source={VISUAL_ASSETS.weight} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
        <View style={styles.cardTopLeft}>
          <View style={styles.titleRow}>
            <Scale size={20} color="#34D399" />
            <Text style={styles.cardTitle}>Weight</Text>
          </View>
        </View>

        <View style={styles.statsArea}>
          <View style={styles.valueRow}>
            <Text style={styles.primaryValue}>{currentWeight} kg</Text>
            <View style={styles.weightChangeBadge}>
              <Text style={styles.weightChangeText}>
                {hasWeightHistory ? `${weightChange >= 0 ? '+' : ''}${weightChange} kg` : 'No history'}
              </Text>
            </View>
          </View>

          <View style={styles.sparklineContainer}>
            <Svg width={120} height={24} viewBox="0 0 120 24">
              {hasWeightHistory && (
                <Path
                  d="M0 18 L24 18 L48 16 L72 16 L96 12 L120 12"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              )}
            </Svg>
            <Text style={styles.sparklineLabel}>This week</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 16,
    marginBottom: THEME.spacing.lg,
  },
  gridDesktop: {
    flexDirection: 'row',
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    minWidth: 200,
    minHeight: 230,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.16)',
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
  cardTopLeft: {
    position: 'absolute',
    top: 18,
    left: 18,
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#24183F',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  statsArea: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  primaryValue: {
    color: '#24183F',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  subValue: {
    color: '#5D5570',
    fontSize: 13,
    fontWeight: '500',
  },
  percentageText: {
    color: '#5D5570',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(36, 24, 63, 0.16)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surplusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  surplusBadgeText: {
    color: '#24183F',
    fontSize: 11,
    fontWeight: '700',
  },
  leftoverText: {
    color: '#5D5570',
    fontSize: 12,
    fontWeight: '500',
  },
  weightChangeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
  },
  weightChangeText: {
    color: '#24183F',
    fontSize: 12,
    fontWeight: '700',
  },
  sparklineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sparklineLabel: {
    color: '#5D5570',
    fontSize: 11,
  },
});
