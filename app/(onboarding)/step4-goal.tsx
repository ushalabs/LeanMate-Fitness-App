import React, { useState } from 'react';
import { ActivityIndicator, Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Flame, Dumbbell, Shield, TrendingUp, Scale, Check } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { useFitnessStore } from '../../src/store/useFitnessStore';
import { FitnessGoalType, GymFrequencyTarget } from '../../src/types/goal';
import { ALL_MUSCLE_GROUPS, DEFAULT_TARGET_MUSCLES } from '../../src/constants/muscles';
import { MuscleGroupId } from '../../src/types/muscle';

export default function Step4Goal() {
  const router = useRouter();
  const { completeOnboarding } = useFitnessStore();

  const [goal, setGoal] = useState<FitnessGoalType>('lean_bulk');
  const [frequency, setFrequency] = useState<GymFrequencyTarget>('4-5');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroupId[]>(DEFAULT_TARGET_MUSCLES);
  const [excludedMuscles, setExcludedMuscles] = useState<MuscleGroupId[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMuscle = (id: MuscleGroupId) => {
    if (excludedMuscles.includes(id)) {
      // Un-exclude
      setExcludedMuscles(excludedMuscles.filter((m) => m !== id));
      setSelectedMuscles([...selectedMuscles, id]);
    } else if (selectedMuscles.includes(id)) {
      // Exclude deliberately
      setSelectedMuscles(selectedMuscles.filter((m) => m !== id));
      setExcludedMuscles([...excludedMuscles, id]);
    } else {
      setSelectedMuscles([...selectedMuscles, id]);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeOnboarding({
        fitnessGoal: goal,
        targetGymFrequency: frequency,
        targetMuscleGroups: selectedMuscles,
        excludedMuscleGroups: excludedMuscles,
      });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Onboarding not completed', e?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalTiles = [
    { id: 'lean_bulk' as FitnessGoalType, title: 'Lean Bulk', desc: '+150-250 kcal surplus. Maximize hypertrophy, minimize fat.' },
    { id: 'lose_fat' as FitnessGoalType, title: 'Lose Fat', desc: '-400 kcal deficit. Preserve muscle while dropping body fat.' },
    { id: 'build_muscle' as FitnessGoalType, title: 'Build Muscle', desc: '+300 kcal surplus. Consistent hypertrophy focus.' },
    { id: 'maintain' as FitnessGoalType, title: 'Maintain Weight', desc: 'Caloric balance at true maintenance.' },
    { id: 'gain_weight' as FitnessGoalType, title: 'Gain Weight', desc: '+500 kcal surplus. High-growth mass phase.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.stepBadge}>Step 4 of 4</Text>
        <Text style={styles.title}>Goal Configuration</Text>
        <Text style={styles.subtitle}>Set your fitness targets and muscle intentions</Text>

        {/* Primary Goal */}
        <Text style={styles.sectionHeader}>1. Select Your Primary Goal</Text>
        <View style={styles.goalTiles}>
          {goalTiles.map((item) => {
            const isSelected = goal === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.goalTile, isSelected && styles.goalTileActive]}
                onPress={() => setGoal(item.id)}
              >
                <View style={styles.goalContent}>
                  <Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>
                    {item.title}
                  </Text>
                  <Text style={styles.goalDesc}>{item.desc}</Text>
                </View>
                {isSelected && <Check size={16} color={THEME.colors.violet} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Gym Frequency Benchmark */}
        <Text style={styles.sectionHeader}>2. Weekly Training Benchmark</Text>
        <View style={styles.freqRow}>
          {(['2-3', '3-4', '4-5'] as GymFrequencyTarget[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
              onPress={() => setFrequency(f)}
            >
              <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                {f} days / wk
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Muscle Targets & Exclusions */}
        <Text style={styles.sectionHeader}>
          3. Muscle Targets ({selectedMuscles.length} targeted, {excludedMuscles.length} excluded)
        </Text>
        <Text style={styles.subtext}>
          Tap any muscle to toggle deliberate exclusion. Excluded muscles will NEVER count as missed.
        </Text>

        <View style={styles.muscleChips}>
          {ALL_MUSCLE_GROUPS.map((m) => {
            const isExcluded = excludedMuscles.includes(m.id);
            const isTarget = selectedMuscles.includes(m.id);

            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.chip,
                  isTarget && styles.chipTarget,
                  isExcluded && styles.chipExcluded,
                ]}
                onPress={() => toggleMuscle(m.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isTarget && styles.chipTextTarget,
                    isExcluded && styles.chipTextExcluded,
                  ]}
                >
                  {m.name} {isExcluded ? '(Excluded)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.finishBtn, isSubmitting && styles.finishBtnDisabled]}
          onPress={handleFinish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.finishBtnText}>Initialize First Goal Period</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  stepBadge: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  subtext: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  goalTiles: {
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  goalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  goalTileActive: {
    borderColor: THEME.colors.violet,
    backgroundColor: '#E5DCFF',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalTitleActive: {
    color: '#5B21B6',
  },
  goalDesc: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  freqBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  freqBtnActive: {
    borderColor: THEME.colors.violet,
    backgroundColor: '#E5DCFF',
  },
  freqText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  freqTextActive: {
    color: '#5B21B6',
    fontWeight: '800',
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: THEME.spacing.xl,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  chipTarget: {
    borderColor: THEME.colors.violet,
    backgroundColor: '#E5DCFF',
  },
  chipExcluded: {
    borderColor: '#475569',
    backgroundColor: 'rgba(71, 85, 105, 0.2)',
  },
  chipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  chipTextTarget: {
    color: '#5B21B6',
    fontWeight: '600',
  },
  chipTextExcluded: {
    color: THEME.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
  },
  finishBtnDisabled: {
    opacity: 0.7,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
