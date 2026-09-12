import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Utensils, Dumbbell, Scale, BarChart3 } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useUIStore } from '../../store/useUIStore';
import { useRouter } from 'expo-router';

export const QuickActionsWidget: React.FC = () => {
  const { openLogMealModal, openLogWorkoutModal, openUpdateWeightModal } = useUIStore();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Quick Actions</Text>
        <TouchableOpacity style={styles.customizeBtn}>
          <Text style={styles.customizeText}>Customize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsGrid}>
        {/* 1. Log Meal */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}
          onPress={openLogMealModal}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Utensils size={18} color="#10B981" />
          </View>
          <Text style={styles.actionLabel}>Log Meal</Text>
        </TouchableOpacity>

        {/* 2. Log Workout */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: 'rgba(139, 92, 246, 0.3)' }]}
          onPress={openLogWorkoutModal}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Dumbbell size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.actionLabel}>Log Workout</Text>
        </TouchableOpacity>

        {/* 3. Update Weight */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: 'rgba(56, 189, 248, 0.3)' }]}
          onPress={openUpdateWeightModal}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Scale size={18} color="#38BDF8" />
          </View>
          <Text style={styles.actionLabel}>Update Weight</Text>
        </TouchableOpacity>

        {/* 4. View Progress */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}
          onPress={() => router.push('/training/analytics')}
        >
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <BarChart3 size={18} color="#F59E0B" />
          </View>
          <Text style={styles.actionLabel}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    marginBottom: THEME.spacing.lg,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  title: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
  },
  customizeBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  customizeText: {
    color: '#887E9D',
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F6F3FF',
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: '#24183F',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
