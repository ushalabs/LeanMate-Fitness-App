import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';

export default function CommunityScreen() {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Athletic Community</Text>
        <Text style={styles.subtitle}>Accountability, consistency leaderboards & shared momentum</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Trophy size={18} color="#F59E0B" />
          <Text style={styles.cardTitle}>Weekly Consistency Leaderboard</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No leaderboard data yet</Text>
          <Text style={styles.emptyText}>Community rankings will appear after real community data is connected.</Text>
        </View>
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
    padding: 24,
    paddingBottom: 112,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: THEME.spacing.xl,
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
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: THEME.spacing.lg,
  },
  cardTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  emptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
