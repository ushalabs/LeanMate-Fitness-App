import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { X, Scale, Check } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useFitnessStore } from '../../store/useFitnessStore';

export const UpdateWeightModal: React.FC = () => {
  const { isUpdateWeightModalOpen, closeUpdateWeightModal } = useUIStore();
  const { user, recordWeight } = useFitnessStore();

  const [weight, setWeight] = useState(user.currentWeight ? user.currentWeight.toString() : '66.1');
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    let num = parseFloat(weight);
    if (isNaN(num) || num <= 20) return;

    if (unit === 'lbs') {
      num = parseFloat((num * 0.453592).toFixed(1)); // Convert to kg for internal storage
    }

    await recordWeight(num);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeUpdateWeightModal();
    }, 900);
  };

  return (
    <Modal visible={isUpdateWeightModalOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Scale size={18} color="#38BDF8" />
              </View>
              <Text style={styles.title}>Update Body Weight</Text>
            </View>
            <TouchableOpacity onPress={closeUpdateWeightModal} style={styles.closeBtn}>
              <X size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {saved ? (
            <View style={styles.successState}>
              <View style={[styles.successIcon, { backgroundColor: '#38BDF8' }]}>
                <Check size={28} color="#0B111E" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Weight Recorded!</Text>
              <Text style={styles.successSubtitle}>Historical trend and maintenance updated</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.infoText}>
                We never overwrite past weights. Every entry adds to your historical trend.
              </Text>

              <View style={styles.unitToggleRow}>
                <TouchableOpacity
                  style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
                  onPress={() => setUnit('kg')}
                >
                  <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitBtn, unit === 'lbs' && styles.unitBtnActive]}
                  onPress={() => setUnit('lbs')}
                >
                  <Text style={[styles.unitText, unit === 'lbs' && styles.unitTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>

              {/* Weight Input */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="66.1"
                  placeholderTextColor={THEME.colors.textMuted}
                />
                <Text style={styles.unitSuffix}>{unit}</Text>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Log New Weight</Text>
              </TouchableOpacity>
            </View>
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
    maxWidth: 400,
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
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
    marginBottom: THEME.spacing.lg,
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.full,
    padding: 4,
    marginBottom: THEME.spacing.lg,
    gap: 4,
  },
  unitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.full,
  },
  unitBtnActive: {
    backgroundColor: '#38BDF8',
  },
  unitText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#0B111E',
    fontWeight: '800',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  weightInput: {
    color: THEME.colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 100,
  },
  unitSuffix: {
    color: THEME.colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  saveBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
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
