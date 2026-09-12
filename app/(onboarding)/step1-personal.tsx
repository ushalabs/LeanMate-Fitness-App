import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, User } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { useFitnessStore } from '../../src/store/useFitnessStore';
import { Sex } from '../../src/types/user';

export default function Step1Personal() {
  const router = useRouter();
  const { user, updateUserProfile } = useFitnessStore();

  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth || '1998-04-12');
  const [sex, setSex] = useState<Sex>(user.sex || 'male');

  const handleNext = async () => {
    try {
      await updateUserProfile({
      fullName,
      username,
      dateOfBirth,
      sex,
    });
      router.push('/(onboarding)/step2-body');
    } catch (e: any) {
      Alert.alert('Profile not saved', e?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.stepBadge}>Step 1 of 4</Text>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>Let's start by personalizing your profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={THEME.colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="your_username"
            placeholderTextColor={THEME.colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="1998-04-12"
            placeholderTextColor={THEME.colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Biological Sex (for metabolic rate)</Text>
        <View style={styles.segmentedRow}>
          {(['male', 'female', 'other'] as Sex[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.segmentBtn, sex === s && styles.segmentBtnActive]}
              onPress={() => setSex(s)}
            >
              <Text style={[styles.segmentText, sex === s && styles.segmentTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue to Body Metrics</Text>
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
  inputGroup: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.lg,
    padding: 4,
    gap: 6,
    marginBottom: THEME.spacing.xl,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
  },
  segmentBtnActive: {
    backgroundColor: THEME.colors.violet,
  },
  segmentText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
