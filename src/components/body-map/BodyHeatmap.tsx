import React, { useMemo, useState } from 'react';
import { Image, Text, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Activity, Flame } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { getMuscleVisual } from '../../constants/visualAssets';
import { useFitnessStore } from '../../store/useFitnessStore';
import { MuscleGroupId, MuscleStimulusScore } from '../../types/muscle';

interface BodyHeatmapProps {
  stimulusScores: Record<MuscleGroupId, MuscleStimulusScore>;
  onSelectMuscle?: (muscleId: MuscleGroupId) => void;
  selectedMuscleId?: MuscleGroupId | null;
}

const formatMuscle = (id: MuscleGroupId) =>
  id
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace('Abs', 'Abs / Core');

const getIntensityCopy = (score: number) => {
  if (score >= 80) return { label: 'High stimulus', color: THEME.colors.stimulusHigh };
  if (score >= 50) return { label: 'Moderate stimulus', color: THEME.colors.stimulusModerate };
  if (score > 0) return { label: 'Light stimulus', color: THEME.colors.stimulusLow };
  return { label: 'Not trained yet', color: THEME.colors.red };
};

export const BodyHeatmap: React.FC<BodyHeatmapProps> = ({
  stimulusScores,
  onSelectMuscle,
  selectedMuscleId,
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back' | 'both'>('both');
  const [visualSize, setVisualSize] = useState({ width: 0, height: 0 });
  const { width } = useWindowDimensions();
  const { user } = useFitnessStore();
  const isWide = width >= 768;

  const rankedMuscles = useMemo(
    () =>
      Object.entries(stimulusScores)
        .filter(([, item]) => !item.isExcluded)
        .sort(([, a], [, b]) => b.score - a.score) as [MuscleGroupId, MuscleStimulusScore][],
    [stimulusScores]
  );

  const selectedScore = selectedMuscleId ? stimulusScores[selectedMuscleId]?.score || 0 : rankedMuscles[0]?.[1].score || 0;
  const selectedName = selectedMuscleId ? formatMuscle(selectedMuscleId) : 'Weekly Muscle Intensity';
  const selectedMuscles = selectedMuscleId ? [selectedMuscleId] : rankedMuscles.slice(0, 3).map(([id]) => id);
  const topWorked = rankedMuscles.filter(([, item]) => item.score > 0).slice(0, 6);
  const focusMuscles = topWorked.length > 0 ? topWorked : rankedMuscles.slice(0, 6);
  const intensity = getIntensityCopy(selectedScore);

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        {(['front', 'back'] as const).map((view) => (
          <TouchableOpacity
            key={view}
            style={[styles.toggleBtn, activeView === view && styles.toggleBtnActive]}
            onPress={() => setActiveView(view)}
          >
            <Text style={[styles.toggleBtnText, activeView === view && styles.toggleBtnTextActive]}>
              {view === 'front' ? 'Front' : 'Back'}
            </Text>
          </TouchableOpacity>
        ))}
        {isWide && (
          <TouchableOpacity
            style={[styles.toggleBtn, activeView === 'both' && styles.toggleBtnActive]}
            onPress={() => setActiveView('both')}
          >
            <Text style={[styles.toggleBtnText, activeView === 'both' && styles.toggleBtnTextActive]}>Both</Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={styles.visualCard}
        onLayout={({ nativeEvent }) => {
          const { width, height } = nativeEvent.layout;
          setVisualSize((current) => current.width === width && current.height === height ? current : { width, height });
        }}
      >
        {visualSize.width > 0 && (
          <Image
            source={getMuscleVisual(selectedMuscles, user.sex)}
            style={[styles.visualImage, visualSize]}
            resizeMode="cover"
            accessible={false}
          />
        )}
        <View style={styles.visualContent}>
        <View style={styles.visualTop}>
          <View style={styles.iconCircle}>
            <Activity size={18} color="#FFFFFF" />
          </View>
          <View style={styles.visualCopy}>
            <Text style={styles.visualEyebrow}>{activeView === 'both' ? 'Full body' : activeView}</Text>
            <Text style={styles.visualTitle}>{selectedName}</Text>
          </View>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{Math.round(selectedScore)}%</Text>
          <View style={[styles.intensityPill, { borderColor: intensity.color }]}>
            <Flame size={13} color={intensity.color} />
            <Text style={[styles.intensityText, { color: intensity.color }]}>{intensity.label}</Text>
          </View>
        </View>

        <View style={styles.muscleChips}>
          {focusMuscles.map(([id, item]) => {
            const chipIntensity = getIntensityCopy(item.score);
            const selected = selectedMuscleId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.muscleChip,
                  { borderColor: chipIntensity.color },
                  selected && { backgroundColor: chipIntensity.color },
                ]}
                onPress={() => onSelectMuscle?.(id)}
              >
                <Text style={[styles.muscleChipText, selected && styles.muscleChipTextSelected]}>
                  {formatMuscle(id)}
                </Text>
                <Text style={[styles.muscleChipScore, selected && styles.muscleChipTextSelected]}>
                  {Math.round(item.score)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F6F3FF',
    borderRadius: THEME.borderRadius.full,
    padding: 3,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.14)',
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
  },
  toggleBtnActive: {
    backgroundColor: '#A78BFA',
  },
  toggleBtnText: {
    color: '#6B647A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  visualCard: {
    alignSelf: 'stretch',
    minHeight: 440,
    borderRadius: THEME.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  visualContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  visualImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  visualTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualCopy: {
    flex: 1,
    minWidth: 0,
  },
  visualEyebrow: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  visualTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  scoreRow: {
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 120,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '900',
    lineHeight: 52,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  intensityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '800',
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  muscleChipText: {
    color: '#24183F',
    fontSize: 11,
    fontWeight: '800',
  },
  muscleChipScore: {
    color: '#6B647A',
    fontSize: 11,
    fontWeight: '800',
  },
  muscleChipTextSelected: {
    color: '#FFFFFF',
  },
});
