import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Target, Check, Flame, Dumbbell, Shield, TrendingUp, Scale } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import { FitnessGoalType, GymFrequencyTarget } from '../../types/goal';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';
import { MuscleGroupId } from '../../types/muscle';

export const GoalSwitcherModal: React.FC = () => {
  const { isGoalSwitcherModalOpen, closeGoalSwitcherModal } = useUIStore();
  const { activeGoalPeriod, switchGoal } = useFitnessStore();

  const [selectedGoal, setSelectedGoal] = useState<FitnessGoalType>(activeGoalPeriod.fitnessGoal);
  const [frequency, setFrequency] = useState<GymFrequencyTarget>(activeGoalPeriod.targetGymFrequency);
  const [targetMuscles, setTargetMuscles] = useState<MuscleGroupId[]>(activeGoalPeriod.targetMuscleGroups);
  const [excludedMuscles, setExcludedMuscles] = useState<MuscleGroupId[]>(activeGoalPeriod.excludedMuscleGroups);
  const [saved, setSaved] = useState(false);

  const goalOptions = [
    {
      id: 'lean_bulk' as FitnessGoalType,
      title: 'Lean Bulk',
      desc: 'Controlled +150-250 kcal surplus. Maximize hypertrophy, minimize fat.',
      icon: Flame,
      color: '#10B981',
    },
    {
      id: 'lose_fat' as FitnessGoalType,
      title: 'Lose Fat',
      desc: 'Caloric deficit (-400 kcal). Preserve lean mass while leaning down.',
      icon: TrendingUp,
      color: '#EF4444',
    },
    {
      id: 'build_muscle' as FitnessGoalType,
      title: 'Build Muscle',
      desc: 'Standard hypertrophy surplus (+300 kcal) for substantial gains.',
      icon: Dumbbell,
      color: '#8B5CF6',
    },
    {
      id: 'maintain' as FitnessGoalType,
      title: 'Maintain Weight',
      desc: 'Balanced calories at true maintenance. Focus on athletic performance.',
      icon: Shield,
      color: '#38BDF8',
    },
    {
      id: 'gain_weight' as FitnessGoalType,
      title: 'Gain Weight',
      desc: 'High caloric surplus (+500 kcal) for fast mass accrual.',
      icon: Scale,
      color: '#F59E0B',
    },
  ];

  const handleSave = async () => {
    await switchGoal({
      fitnessGoal: selectedGoal,
      targetGymFrequency: frequency,
      targetMuscleGroups: targetMuscles,
      excludedMuscleGroups: excludedMuscles,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeGoalSwitcherModal();
    }, 900);
  };

  return (
    <Modal visible={isGoalSwitcherModalOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Target size={18} color="#7C3AED" />
              </View>
              <Text style={styles.title}>Update Active Fitness Goal</Text>
            </View>
            <TouchableOpacity onPress={closeGoalSwitcherModal} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {saved ? (
            <View style={styles.successState}>
              <View style={[styles.successIcon, { backgroundColor: '#10B981' }]}>
                <Check size={28} color="#0B111E" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>New Goal Period Created!</Text>
              <Text style={styles.successSubtitle}>Historical periods preserved and benchmarks updated</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
              <Text style={styles.infoText}>
                Changing your goal creates a new Goal Period. Past tracking data remains attached to its original goal.
              </Text>

              {/* Goal Tiles */}
              <Text style={styles.sectionHeader}>Select Primary Intention</Text>
              <View style={styles.goalTiles}>
                {goalOptions.map((opt) => {
                  const isSelected = selectedGoal === opt.id;
                  const Icon = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.goalTile, isSelected && styles.goalTileSelected]}
                      onPress={() => setSelectedGoal(opt.id)}
                    >
                      <View style={[styles.goalIconCircle, { backgroundColor: opt.color + '20' }]}>
                        <Icon size={18} color={opt.color} />
                      </View>
                      <View style={styles.goalTextCol}>
                        <Text style={styles.goalTileTitle}>{opt.title}</Text>
                        <Text style={styles.goalTileDesc}>{opt.desc}</Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkPill}>
                          <Check size={14} color="#5B21B6" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Frequency Selector */}
              <Text style={styles.sectionHeader}>Weekly Gym Benchmark</Text>
              <View style={styles.freqRow}>
                {(['2-3', '3-4', '4-5'] as GymFrequencyTarget[]).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.freqBtn, frequency === f && styles.freqBtnActive]}
                    onPress={() => setFrequency(f)}
                  >
                    <Text style={[styles.freqText, frequency === f && styles.freqTextActive]}>
                      {f} days/wk
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Activate New Goal Period</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 24, 63, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#F3EFFF',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  scrollArea: {
    maxHeight: 520,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  infoText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginBottom: THEME.spacing.md,
  },
  sectionHeader: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 6,
  },
  goalTiles: {
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  goalTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    gap: 12,
  },
  goalTileSelected: {
    borderColor: THEME.colors.violet,
    backgroundColor: '#E5DCFF',
  },
  goalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTextCol: {
    flex: 1,
  },
  goalTileTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  goalTileDesc: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  checkPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: THEME.spacing.xl,
  },
  freqBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
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
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  successSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
});
