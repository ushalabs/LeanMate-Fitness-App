import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { THEME } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    clearError();
    const success = await signIn(email, password);
    if (success) {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Flame size={24} color="#7C3AED" />
          </View>
          <Text style={styles.title}>Sign In to LeanMate</Text>
          <Text style={styles.subtitle}>Access your fitness intelligence console</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Mail size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={THEME.colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={THEME.colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={18} color={THEME.colors.textMuted} />
              ) : (
                <Eye size={18} color={THEME.colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Sign In</Text>
              <ArrowRight size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    maxWidth: 420,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DDD2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    color: THEME.colors.red,
    fontSize: 12,
    textAlign: 'center',
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.violet,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
  },
  signupLink: {
    color: '#5B21B6',
    fontSize: 13,
    fontWeight: '700',
  },
});
