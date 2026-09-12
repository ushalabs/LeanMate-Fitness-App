import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../../constants/theme';
import { MuscleGroupId, MuscleStimulusScore } from '../../types/muscle';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';

interface MuscleListWidgetProps {
  stimulusScores: Record<MuscleGroupId, MuscleStimulusScore>;
  onSelectMuscle?: (id: MuscleGroupId) => void;
  selectedMuscleId?: MuscleGroupId | null;
}

export const MuscleListWidget: React.FC<MuscleListWidgetProps> = ({
  stimulusScores,
  onSelectMuscle,
  selectedMuscleId,
}) => {
  // Sort priority: targeted muscles first, then by score descending, with missed (0%) highlighted
  const sortedMuscles = [...ALL_MUSCLE_GROUPS].sort((a, b) => {
    const scoreA = stimulusScores[a.id]?.score ?? 0;
    const scoreB = stimulusScores[b.id]?.score ?? 0;
    return scoreB - scoreA;
  });

  const getDotColor = (item: MuscleStimulusScore | undefined) => {
    if (!item) return THEME.colors.stimulusNone;
    if (item.isExcluded) return THEME.colors.stimulusExcluded;
    if (item.score >= 80) return THEME.colors.stimulusHigh;
    if (item.score >= 50) return THEME.colors.stimulusModerate;
    if (item.score > 0) return THEME.colors.stimulusLow;
    return THEME.colors.stimulusNone;
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {sortedMuscles.map((muscle) => {
          const scoreItem = stimulusScores[muscle.id];
          const score = scoreItem?.score ?? 0;
          const isZero = score === 0;
          const isSelected = selectedMuscleId === muscle.id;
          const isExcluded = scoreItem?.isExcluded;

          return (
            <TouchableOpacity
              key={muscle.id}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => onSelectMuscle?.(muscle.id)}
            >
              <View style={styles.left}>
                <View style={[styles.dot, { backgroundColor: getDotColor(scoreItem) }]} />
                <Text
                  style={[
                    styles.name,
                    isExcluded && styles.nameExcluded,
                    isSelected && styles.nameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {muscle.name}
                </Text>
              </View>

              <Text
                style={[
                  styles.scoreText,
                  isZero && !isExcluded ? styles.scoreZero : null,
                  score >= 80 ? styles.scoreHigh : null,
                  isExcluded ? styles.scoreExcluded : null,
                ]}
              >
                {isExcluded ? 'Excluded' : `${score}%`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend Footer */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.colors.stimulusHigh }]} />
          <Text style={styles.legendText}>High (≥80%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.colors.stimulusModerate }]} />
          <Text style={styles.legendText}>Moderate (50–79%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.colors.stimulusLow }]} />
          <Text style={styles.legendText}>Low (&lt;50%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.colors.stimulusNone }]} />
          <Text style={styles.legendText}>Not trained</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.colors.stimulusExcluded }]} />
          <Text style={styles.legendText}>Excluded</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 220,
  },
  grid: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rowSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.10)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  name: {
    color: '#24183F',
    fontSize: 12,
    fontWeight: '500',
  },
  nameSelected: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  nameExcluded: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  scoreText: {
    color: '#6B647A',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreHigh: {
    color: THEME.colors.primary,
  },
  scoreZero: {
    color: THEME.colors.red,
    fontWeight: '700',
  },
  scoreExcluded: {
    color: THEME.colors.neutral,
    fontSize: 11,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124, 58, 237, 0.12)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: '#887E9D',
    fontSize: 10,
  },
});
