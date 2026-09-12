import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, ArrowRight, ShieldCheck, Dumbbell, Utensils } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Flame size={28} color="#7C3AED" />
          </View>
          <Text style={styles.logoTitle}>LeanMate</Text>
        </View>

        <Text style={styles.tagline}>Discipline Builds Freedom</Text>
        <Text style={styles.description}>
          A personalized fitness intelligence platform continuously evaluating your actual nutrition and training against your selected goals.
        </Text>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Utensils size={18} color="#10B981" />
            <Text style={styles.featureText}>Rolling 7-day calorie & macro intelligence</Text>
          </View>
          <View style={styles.featureItem}>
            <Dumbbell size={18} color="#8B5CF6" />
            <Text style={styles.featureText}>Interactive anatomical muscle stimulus heatmap</Text>
          </View>
          <View style={styles.featureItem}>
            <ShieldCheck size={18} color="#38BDF8" />
            <Text style={styles.featureText}>True goal compliance and weight trajectory</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.primaryBtnText}>Get Started with Account</Text>
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
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xxl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DDD2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    color: '#5B21B6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  description: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: THEME.spacing.xl,
  },
  features: {
    width: '100%',
    gap: 12,
    marginBottom: THEME.spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  featureText: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    paddingVertical: 15,
    borderRadius: THEME.borderRadius.xl,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
