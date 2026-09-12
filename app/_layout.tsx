import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { THEME } from '../src/constants/theme';
import { LogMealModal } from '../src/components/modals/LogMealModal';
import { LogWorkoutModal } from '../src/components/modals/LogWorkoutModal';
import { UpdateWeightModal } from '../src/components/modals/UpdateWeightModal';
import { GoalSwitcherModal } from '../src/components/modals/GoalSwitcherModal';
import { EditProfileModal } from '../src/components/modals/EditProfileModal';
import { CreateSplitModal } from '../src/components/modals/CreateSplitModal';
import { useAuthStore } from '../src/store/useAuthStore';
import { useFitnessStore } from '../src/store/useFitnessStore';
import { AppBackground } from '../src/components/layout/AppBackground';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { initializeAuthListener, isAuthenticated, isInitialized, isLoading } = useAuthStore();
  const { user } = useFitnessStore();

  useEffect(() => {
    initializeAuthListener();
  }, [initializeAuthListener]);

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    const routeGroup = segments[0];
    const inAuthGroup = routeGroup === '(auth)';
    const inOnboardingGroup = routeGroup === '(onboarding)';

    if (!isAuthenticated) {
      if (!inAuthGroup) router.replace('/(auth)/sign-in');
      return;
    }

    if (!user.onboardingCompleted) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/step1-personal');
      return;
    }

    if (inAuthGroup || inOnboardingGroup || !routeGroup) {
      router.replace('/(tabs)/home');
    }
  }, [
    isAuthenticated,
    isInitialized,
    isLoading,
    router,
    segments,
    user.onboardingCompleted,
  ]);

  if (!isInitialized || isLoading) {
    return (
    <AppBackground>
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <ActivityIndicator color={THEME.colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading LeanMate...</Text>
      </View>
    </AppBackground>
    );
  }

  return (
    <AppBackground>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Slot />

      {/* Global Quick Action Modals */}
      <LogMealModal />
      <LogWorkoutModal />
      <UpdateWeightModal />
      <GoalSwitcherModal />
      <EditProfileModal />
      <CreateSplitModal />
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
