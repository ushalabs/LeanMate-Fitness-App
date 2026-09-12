import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, Footprints, Flame, Zap, Award } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { useFitnessStore } from '../../src/store/useFitnessStore';
import { ActivityLevel, TrainingIntensity } from '../../src/types/user';

export default function Step3Activity() {
  const router = useRouter();
  const { user, updateUserProfile } = useFitnessStore();

  const [activity, setActivity] = useState<ActivityLevel>(user.activityLevel || 'high');
  const [intensity, setIntensity] = useState<TrainingIntensity>(user.trainingIntensity || 'high');

  const activityOptions = [
    {
      id: 'low' as ActivityLevel,
      title: 'Low (Sedentary)',
      desc: 'Desk job, mostly sitting, under 5,000 daily steps.',
    },
    {
      id: 'moderate' as ActivityLevel,
      title: 'Moderate',
      desc: 'Light daily movement, 6,000 to 9,000 steps per day.',
    },
    {
      id: 'high' as ActivityLevel,
      title: 'High',
      desc: 'Active job, on feet frequently, 10,000+ daily steps.',
    },
    {
      id: 'very_high' as ActivityLevel,
      title: 'Very High',
      desc: 'Heavy manual labor, highly active lifestyle, 15,000+ steps.',
    },
  ];

  const intensityOptions = [
    {
      id: 'low' as TrainingIntensity,
      title: 'Light Intensity',
      desc: 'Casual workouts, leaving 4+ reps in reserve.',
    },
    {
      id: 'moderate' as TrainingIntensity,
      title: 'Moderate Intensity',
      desc: 'Structured effort, 2-3 reps in reserve on compounds.',
    },
    {
      id: 'high' as TrainingIntensity,
      title: 'High Intensity',
      desc: 'Hard resistance training, 0-2 RIR, consistent progressive overload.',
    },
    {
      id: 'very_high' as TrainingIntensity,
      title: 'Very High (Near Failure)',
      desc: 'High-volume advanced bodybuilding/powerlifting training.',
    },
  ];

  const handleNext = async () => {
    try {
      await updateUserProfile({
      activityLevel: activity,
      trainingIntensity: intensity,
    });
      router.push('/(onboarding)/step4-goal');
    } catch (e: any) {
      Alert.alert('Activity profile not saved', e?.message || 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.stepBadge}>Step 3 of 4</Text>
        <Text style={styles.title}>Daily Activity & Intensity</Text>
        <Text style={styles.subtitle}>Calibrate your energy expenditure baseline</Text>

        {/* Activity Level */}
        <Text style={styles.sectionTitle}>Daily Non-Exercise Activity (NEAT)</Text>
        <View style={styles.optionsList}>
          {activityOptions.map((opt) => {
            const isSelected = activity === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardActive]}
                onPress={() => setActivity(opt.id)}
              >
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                  {opt.title}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Training Intensity */}
        <Text style={styles.sectionTitle}>Gym Training Intensity</Text>
        <View style={styles.optionsList}>
          {intensityOptions.map((opt) => {
            const isSelected = intensity === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardActive]}
                onPress={() => setIntensity(opt.id)}
              >
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                  {opt.title}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>Continue to Goal Setup</Text>
          <ArrowRight size={18} color="#FFFFFF" />
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
    maxWidth: 480,
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
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  optionsList: {
    gap: 8,
    marginBottom: THEME.spacing.lg,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  optionCardActive: {
    borderColor: THEME.colors.violet,
    backgroundColor: '#E5DCFF',
  },
  optionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionTitleActive: {
    color: '#5B21B6',
  },
  optionDesc: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    marginTop: THEME.spacing.sm,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
