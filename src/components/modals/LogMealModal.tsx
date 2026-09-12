import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { X, Utensils, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';
import { formatLocalDate } from '../../utils/date';

export const LogMealModal: React.FC = () => {
  const { isLogMealModalOpen, closeLogMealModal } = useUIStore();
  const { logCalories } = useFitnessStore();

  const todayStr = formatLocalDate(new Date());
  const [date, setDate] = useState(todayStr);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isLogMealModalOpen) return;
    setDate(formatLocalDate(new Date()));
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setSavedSuccess(false);
  }, [isLogMealModalOpen]);

  const handleSave = async () => {
    const calNum = parseInt(calories, 10);
    if (isNaN(calNum) || calNum <= 0) return;

    await logCalories({
      date,
      calories: calNum,
      protein: protein ? parseInt(protein, 10) : undefined,
      carbohydrates: carbs ? parseInt(carbs, 10) : undefined,
      fats: fats ? parseInt(fats, 10) : undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      closeLogMealModal();
    }, 900);
  };

  return (
    <Modal visible={isLogMealModalOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Utensils size={18} color="#BE123C" />
              </View>
              <Text style={styles.title}>Log Daily Nutrition</Text>
            </View>
            <TouchableOpacity onPress={closeLogMealModal} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {savedSuccess ? (
            <View style={styles.successState}>
              <View style={styles.successIcon}>
                <Check size={28} color="#0B111E" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Nutrition Logged!</Text>
              <Text style={styles.successSubtitle}>Daily nutrition log updated</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.infoText}>
                Enter your total daily calories. Macros are optional.
              </Text>

              {/* Total Calories (Required) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Total Calories (kcal) <Text style={styles.reqStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="e.g. 2400"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              {/* Macros Row */}
              <View style={styles.macroRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="160"
                    placeholderTextColor={THEME.colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Carbs (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="250"
                    placeholderTextColor={THEME.colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Fats (g)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fats}
                    onChangeText={setFats}
                    placeholder="65"
                    placeholderTextColor={THEME.colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Log</Text>
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
    maxWidth: 440,
    backgroundColor: '#F3EFFF',
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
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
    backgroundColor: '#FFE4E9',
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
    fontSize: 13,
    marginBottom: THEME.spacing.md,
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  reqStar: {
    color: '#BE123C',
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
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#E84C68',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: THEME.spacing.sm,
  },
  saveBtnText: {
    color: '#0B111E',
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
    backgroundColor: '#E84C68',
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
