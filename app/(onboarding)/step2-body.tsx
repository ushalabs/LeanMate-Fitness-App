import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Scale, Ruler } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { useFitnessStore } from '../../src/store/useFitnessStore';
import { UnitSystem } from '../../src/types/user';

export default function Step2Body() {
  const router = useRouter();
  const { user, updateUserProfile } = useFitnessStore();

  const [height, setHeight] = useState(user.height ? user.height.toString() : '170');
  const [weight, setWeight] = useState(user.currentWeight ? user.currentWeight.toString() : '66.1');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(user.preferredUnitSystem || 'metric');

  const handleNext = async () => {
    try {
      await updateUserProfile({
      height: parseInt(height, 10) || 170,
      currentWeight: parseFloat(weight) || 66.1,
      preferredUnitSystem: unitSystem,
    });
      router.push('/(onboarding)/step3-activity');
    } catch (e: any) {
      Alert.alert('Body metrics not saved', e?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepBadge}>Step 2 of 4</Text>
        <Text style={styles.title}>Body Metrics</Text>
        <Text style={styles.subtitle}>Essential parameters for accurate maintenance calorie estimation</Text>

        {/* Unit Selector */}
        <View style={styles.unitRow}>
          <TouchableOpacity
            style={[styles.unitBtn, unitSystem === 'metric' && styles.unitBtnActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[styles.unitText, unitSystem === 'metric' && styles.unitTextActive]}>
              Metric (kg, cm)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unitSystem === 'imperial' && styles.unitBtnActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[styles.unitText, unitSystem === 'imperial' && styles.unitTextActive]}>
              Imperial (lbs, in)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</Text>
          <View style={styles.inputWrapper}>
            <Ruler size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="170"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        {/* Current Weight */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Text>
          <View style={styles.inputWrapper}>
            <Scale size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="66.1"
              placeholderTextColor={THEME.colors.textMuted}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue to Activity Profile</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
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
  unitRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 4,
    gap: 6,
    marginBottom: THEME.spacing.lg,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  unitBtnActive: {
    backgroundColor: THEME.colors.violet,
  },
  unitText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    marginTop: THEME.spacing.md,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
