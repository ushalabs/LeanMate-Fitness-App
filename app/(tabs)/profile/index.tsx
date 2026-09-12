import React, { useRef } from 'react';
import { Alert, Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, useWindowDimensions } from 'react-native';
import { Scale, Ruler, Target, Calendar, Edit3, Plus, Camera, LogOut } from 'lucide-react-native';
import { THEME } from '../../../src/constants/theme';
import { useFitnessStore } from '../../../src/store/useFitnessStore';
import { useUIStore } from '../../../src/store/useUIStore';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { WeightTrendCard } from '../../../src/components/charts/WeightTrendCard';
import { useScrollToTopOnFocus } from '../../../src/hooks/useScrollToTopOnFocus';
import { getFitnessVisual, VISUAL_ASSETS } from '../../../src/constants/visualAssets';

export default function ProfileScreen() {
  const { user, activeGoalPeriod, weightEntries } = useFitnessStore();
  const { openEditProfileModal, openUpdateWeightModal } = useUIStore();
  const { signOut } = useAuthStore();
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTopOnFocus(scrollRef);

  const sortedWeights = [...weightEntries].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const initials = (user.fullName || user.email || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const performSignOut = async () => {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert('Log out failed', e?.message || 'Please try again.');
    }
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      void performSignOut();
      return;
    }

    Alert.alert('Log out?', 'You can sign back in anytime with your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => void performSignOut(),
      },
    ]);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={[styles.content, isNarrow && styles.contentMobile]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Card */}
      <ImageBackground source={getFitnessVisual(user.sex)} style={styles.profileHeaderCard} imageStyle={styles.profileImage} resizeMode="cover">
        <View style={[styles.avatarRow, isNarrow && styles.avatarRowMobile]}>
          <TouchableOpacity style={styles.avatarButton} onPress={openEditProfileModal} activeOpacity={0.85}>
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarCameraBadge}>
              <Camera size={13} color="#0B111E" />
            </View>
          </TouchableOpacity>
          <View style={[styles.headerInfo, isNarrow && styles.headerInfoMobile]}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userHandle}>@{user.username}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>Free Tier</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.editBtn, isNarrow && styles.editBtnMobile]} onPress={openEditProfileModal}>
            <Edit3 size={16} color={THEME.colors.textPrimary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Scale size={16} color="#38BDF8" />
            <Text style={styles.statValue}>{user.currentWeight} kg</Text>
            <Text style={styles.statLabel}>Current Weight</Text>
          </View>

          <View style={styles.statTile}>
            <Ruler size={16} color="#10B981" />
            <Text style={styles.statValue}>{user.height} cm</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>

          <View style={styles.statTile}>
            <Target size={16} color="#F59E0B" />
            <Text style={styles.statValue}>
              {activeGoalPeriod.fitnessGoal.replace('_', ' ')}
            </Text>
            <Text style={styles.statLabel}>Active Goal</Text>
          </View>

          <View style={styles.statTile}>
            <Calendar size={16} color="#8B5CF6" />
            <Text style={styles.statValue}>{activeGoalPeriod.targetGymFrequency}x</Text>
            <Text style={styles.statLabel}>Weekly Target</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Weight Trend Chart */}
      <View style={{ marginBottom: THEME.spacing.xl }}>
        <WeightTrendCard />
      </View>

      {/* Weight History Table */}
      <ImageBackground source={VISUAL_ASSETS.weightSecondary} style={styles.historySection} imageStyle={styles.historyImage} resizeMode="cover">
        <View style={[styles.historyHeader, isNarrow && styles.historyHeaderMobile]}>
          <View style={styles.historyCopy}>
            <Text style={styles.historyTitle}>Weight History Records</Text>
            <Text style={styles.historySubtitle}>
              Never overwritten — chronological progress timeline
            </Text>
          </View>

          <TouchableOpacity style={[styles.logWeightBtn, isNarrow && styles.logWeightBtnMobile]} onPress={openUpdateWeightModal}>
            <Plus size={15} color="#0B111E" />
            <Text style={styles.logWeightBtnText}>Record Weight</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.table}>
          {sortedWeights.map((entry, idx) => {
            const dateStr = entry.recordedAt.split('T')[0];
            const prevEntry = sortedWeights[idx + 1];
            const diff = prevEntry ? parseFloat((entry.weight - prevEntry.weight).toFixed(1)) : 0;

            return (
              <View key={entry.id} style={styles.tableRow}>
                <View style={styles.tableDateCol}>
                  <Calendar size={14} color={THEME.colors.textMuted} />
                  <Text style={styles.tableDate}>{dateStr}</Text>
                </View>

                <View style={styles.tableSourcePill}>
                  <Text style={styles.tableSourceText}>{entry.source.replace('_', ' ')}</Text>
                </View>

                <View style={styles.tableRightCol}>
                  <Text style={styles.tableWeight}>{entry.weight} kg</Text>
                  {prevEntry && (
                    <Text
                      style={[
                        styles.tableDiff,
                        diff > 0 ? styles.diffPositive : diff < 0 ? styles.diffNegative : styles.diffNeutral,
                      ]}
                    >
                      {diff > 0 ? `+${diff}` : diff} kg
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ImageBackground>

      <TouchableOpacity style={styles.logoutCard} onPress={handleSignOut} activeOpacity={0.85}>
        <View style={styles.logoutIcon}>
          <LogOut size={18} color="#9F1239" />
        </View>
        <View style={styles.logoutCopy}>
          <Text style={styles.logoutTitle}>Log Out</Text>
        </View>
      </TouchableOpacity>
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
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  profileHeaderCard: {
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.xl,
    minHeight: 320,
    borderWidth: 1,
    borderColor: 'rgba(185, 104, 255, 0.28)',
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
  },
  profileImage: {
    borderRadius: THEME.borderRadius.xxl,
  },
  historyImage: {
    borderRadius: THEME.borderRadius.xl,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: THEME.spacing.xl,
  },
  avatarRowMobile: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  avatarButton: {
    position: 'relative',
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  avatarFallback: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerInfoMobile: {
    flexBasis: 150,
    flexGrow: 1,
    flexShrink: 0,
  },
  userName: {
    color: '#24183F',
    fontSize: 20,
    fontWeight: '800',
  },
  userHandle: {
    color: '#5D5570',
    fontSize: 13,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  tierText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  editBtnMobile: {
    marginLeft: 84,
    marginTop: -6,
  },
  editBtnText: {
    color: THEME.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statTile: {
    flex: 1,
    minWidth: 110,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#24183F',
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 4,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  statLabel: {
    color: '#5D5570',
    fontSize: 11,
    textAlign: 'center',
  },
  historySection: {
    borderRadius: THEME.borderRadius.xxl,
    padding: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.lg,
  },
  historyHeaderMobile: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  historyCopy: {
    flex: 1,
    minWidth: 0,
  },
  historyTitle: {
    color: '#24183F',
    fontSize: 16,
    fontWeight: '700',
  },
  historySubtitle: {
    color: '#887E9D',
    fontSize: 12,
    marginTop: 2,
  },
  logWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C76BFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.lg,
  },
  logWeightBtnMobile: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  logWeightBtnText: {
    color: '#13051E',
    fontSize: 12,
    fontWeight: '800',
  },
  table: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.12)',
  },
  tableDateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableDate: {
    color: '#24183F',
    fontSize: 13,
    fontWeight: '600',
  },
  tableSourcePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tableSourceText: {
    color: '#887E9D',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  tableRightCol: {
    alignItems: 'flex-end',
  },
  tableWeight: {
    color: '#24183F',
    fontSize: 14,
    fontWeight: '700',
  },
  tableDiff: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  diffPositive: {
    color: THEME.colors.primary,
  },
  diffNegative: {
    color: '#38BDF8',
  },
  diffNeutral: {
    color: THEME.colors.textMuted,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: '#FDE8EC',
    borderWidth: 1,
    borderColor: '#E7A2B0',
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: THEME.spacing.lg,
  },
  logoutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8CCD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCopy: {
    flexShrink: 0,
  },
  logoutTitle: {
    color: '#9F1239',
    fontSize: 14,
    fontWeight: '800',
  },
});
