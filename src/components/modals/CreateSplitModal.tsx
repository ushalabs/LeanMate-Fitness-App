import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Check, Plus, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { ALL_MUSCLE_GROUPS } from '../../constants/muscles';
import { useFitnessStore } from '../../store/useFitnessStore';
import { useUIStore } from '../../store/useUIStore';
import { MuscleGroupId } from '../../types/muscle';
import { WorkoutSplitDay } from '../../types/training';

const muscleName = (id: MuscleGroupId) => ALL_MUSCLE_GROUPS.find((m) => m.id === id)?.name || id.replace('_', ' ');

const daysFromFrequency = (frequency: string) => {
  const max = Number(frequency.split('-')[1]) || 5;
  return Math.min(6, Math.max(2, max));
};

const buildInitialDays = (muscles: MuscleGroupId[], daysPerWeek: number): WorkoutSplitDay[] => {
  const trainingDays = Array.from({ length: daysPerWeek }, (_, idx) => ({
    dayNumber: idx + 1,
    name: `Day ${idx + 1}`,
    isRestDay: false,
    targetMuscles: [] as MuscleGroupId[],
  }));

  muscles.forEach((muscle, idx) => {
    trainingDays[idx % daysPerWeek].targetMuscles.push(muscle);
  });

  const restDays = Array.from({ length: 7 - daysPerWeek }, (_, idx) => ({
    dayNumber: daysPerWeek + idx + 1,
    name: 'Rest Day',
    isRestDay: true,
    targetMuscles: [] as MuscleGroupId[],
  }));

  return [...trainingDays, ...restDays];
};

export const CreateSplitModal: React.FC = () => {
  const { isCreateSplitModalOpen, closeCreateSplitModal, editingSplit } = useUIStore();
  const { activeGoalPeriod, saveCustomSplit } = useFitnessStore();

  const goalMuscles = useMemo(
    () => activeGoalPeriod.targetMuscleGroups.filter((m) => !activeGoalPeriod.excludedMuscleGroups.includes(m)),
    [activeGoalPeriod.excludedMuscleGroups, activeGoalPeriod.targetMuscleGroups]
  );

  const defaultDaysPerWeek = daysFromFrequency(activeGoalPeriod.targetGymFrequency);
  const [splitName, setSplitName] = useState('My Custom Split');
  const [days, setDays] = useState<WorkoutSplitDay[]>(() => buildInitialDays(goalMuscles, defaultDaysPerWeek));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCreateSplitModalOpen) return;
    setSplitName(editingSplit?.name || 'My Custom Split');
    setDays(editingSplit ? editingSplit.days.map((day) => ({ ...day, id: day.id || `${editingSplit.id}_day_${day.dayNumber}`, targetMuscles: [...day.targetMuscles] })) : buildInitialDays(goalMuscles, defaultDaysPerWeek));
    setSaved(false);
    setSaving(false);
    setError('');
  }, [defaultDaysPerWeek, goalMuscles, isCreateSplitModalOpen, editingSplit]);

  const coveredMuscles = useMemo(
    () => new Set(days.flatMap((day) => (day.isRestDay ? [] : day.targetMuscles))),
    [days]
  );
  const missingMuscles = goalMuscles.filter((muscle) => !coveredMuscles.has(muscle));

  const updateDay = (dayNumber: number, patch: Partial<WorkoutSplitDay>) => {
    setDays((current) =>
      current.map((day) =>
        day.dayNumber === dayNumber
          ? {
              ...day,
              ...patch,
              targetMuscles: patch.isRestDay ? [] : patch.targetMuscles ?? day.targetMuscles,
            }
          : day
      )
    );
  };

  const toggleMuscle = (dayNumber: number, muscle: MuscleGroupId) => {
    setDays((current) =>
      current.map((day) => {
        if (day.dayNumber !== dayNumber || day.isRestDay) return day;
        const exists = day.targetMuscles.includes(muscle);
        return {
          ...day,
          targetMuscles: exists
            ? day.targetMuscles.filter((item) => item !== muscle)
            : [...day.targetMuscles, muscle],
        };
      })
    );
  };

  const handleSave = async () => {
    if (saving) return;
    setError('');
    const trimmedName = splitName.trim();
    const activeDays = days.filter((day) => !day.isRestDay);

    if (!trimmedName) {
      setError('Give your custom split a name.');
      Alert.alert('Split name required', 'Give your custom split a name.');
      return;
    }

    if (activeDays.length === 0 || activeDays.every((day) => day.targetMuscles.length === 0)) {
      setError('Add at least one muscle to a training day.');
      Alert.alert('No training days', 'Add at least one muscle to a training day.');
      return;
    }

    if (missingMuscles.length > 0) {
      setError(`Add these goal muscles: ${missingMuscles.map(muscleName).join(', ')}`);
      Alert.alert(
        'Goal muscles missing',
        `Add these goal muscles before saving: ${missingMuscles.map(muscleName).join(', ')}`
      );
      return;
    }

    if (days.some((day) => !day.name.trim())) { setError('Give every day a name.'); return; }
    setSaving(true);
    try {
      await saveCustomSplit({
        ...(editingSplit?.isCustom ? { id: editingSplit.id } : {}),
        name: trimmedName,
        daysPerWeek: activeDays.length,
        rationale: 'Custom split built from your current Goal muscles.',
        days: days.map((day) => ({ ...day, name: day.name.trim() })),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        closeCreateSplitModal();
      }, 700);
    } catch (e: any) {
      setError(e?.message || 'Split not saved. Please try again.');
      Alert.alert('Split not saved', e?.message || 'Please try again.');
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={isCreateSplitModalOpen} transparent animationType="fade" onRequestClose={() => !saving && closeCreateSplitModal()}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                {saved ? <Check size={18} color="#FFFFFF" strokeWidth={3} /> : <Plus size={18} color="#5B21B6" />}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.title}>{saved ? 'Custom Split Saved' : editingSplit ? 'Edit Training Split' : 'Create Custom Split'}</Text>
                <Text style={styles.subtitle}>{goalMuscles.length} goal muscles required</Text>
              </View>
            </View>
            <TouchableOpacity disabled={saving} onPress={closeCreateSplitModal} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {saved ? (
            <View style={styles.successState}>
              <Text style={styles.successTitle}>Training split replaced.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {!!error && <Text style={styles.missingText}>{error}</Text>}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Split Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={splitName}
                  maxLength={100}
                  onChangeText={setSplitName}
                  placeholder="My Custom Split"
                  placeholderTextColor={THEME.colors.textMuted}
                />
              </View>

              <View style={styles.coverageRow}>
                <Text style={styles.coverageText}>{coveredMuscles.size} / {goalMuscles.length} goal muscles included</Text>
                {missingMuscles.length > 0 && (
                  <Text style={styles.missingText}>Missing: {missingMuscles.map(muscleName).join(', ')}</Text>
                )}
              </View>

              <View style={styles.daysList}>
                {days.map((day) => (
                  <View key={day.dayNumber} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <TextInput
                        style={[styles.dayNameInput, day.isRestDay && styles.restDayName]}
                        value={day.name}
                        maxLength={100}
                        onChangeText={(name) => updateDay(day.dayNumber, { name })}
                        placeholder={`Day ${day.dayNumber}`}
                        placeholderTextColor={THEME.colors.textMuted}
                      />
                      <TouchableOpacity
                        style={[styles.restToggle, day.isRestDay && styles.restToggleActive]}
                        onPress={() => updateDay(day.dayNumber, { isRestDay: !day.isRestDay })}
                      >
                        <Text style={[styles.restToggleText, day.isRestDay && styles.restToggleTextActive]}>
                          {day.isRestDay ? 'REST' : 'TRAIN'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {!day.isRestDay && (
                      <View style={styles.muscleWrap}>
                        {goalMuscles.map((muscle) => {
                          const selected = day.targetMuscles.includes(muscle);
                          return (
                            <TouchableOpacity
                              key={muscle}
                              style={[styles.musclePill, selected && styles.musclePillSelected]}
                              onPress={() => toggleMuscle(day.dayNumber, muscle)}
                            >
                              <Text style={[styles.muscleText, selected && styles.muscleTextSelected]}>
                                {muscleName(muscle)}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Custom Split'}</Text>
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
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    backgroundColor: '#F3EFFF',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(185, 104, 255, 0.36)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollArea: {
    maxHeight: 610,
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  coverageRow: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(185, 104, 255, 0.24)',
    padding: 10,
    marginBottom: THEME.spacing.md,
  },
  coverageText: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '800',
  },
  missingText: {
    color: THEME.colors.red,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  daysList: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(185, 104, 255, 0.24)',
    padding: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dayNameInput: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.12)',
    paddingVertical: 6,
  },
  restDayName: {
    color: THEME.colors.textMuted,
  },
  restToggle: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
  },
  restToggleActive: {
    backgroundColor: 'rgba(100, 116, 139, 0.26)',
  },
  restToggleText: {
    color: '#5B21B6',
    fontSize: 10,
    fontWeight: '900',
  },
  restToggleTextActive: {
    color: THEME.colors.textMuted,
  },
  muscleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  musclePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  musclePillSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    borderColor: '#C084FC',
  },
  muscleText: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  muscleTextSelected: {
    color: '#4C1D95',
  },
  saveBtn: {
    backgroundColor: '#C76BFF',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: THEME.spacing.lg,
  },
  saveBtnText: {
    color: '#13051E',
    fontSize: 15,
    fontWeight: '900',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 34,
  },
  successTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});
