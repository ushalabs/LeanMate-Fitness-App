import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  Home,
  Utensils,
  Dumbbell,
  BarChart3,
  Target,
  Users,
  ChevronRight,
  Flame,
} from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useFitnessStore } from '../../store/useFitnessStore';

export const SidebarNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useFitnessStore();
  const initials = (user.fullName || user.email || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'Training', path: '/training', icon: Dumbbell },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Community', path: '/community', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && (pathname === '/' || pathname === '/home' || pathname.startsWith('/home'))) {
      return true;
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.sidebar}>
      {/* Brand Logo */}
      <View style={styles.brandRow}>
        <View style={styles.brandIconWrapper}>
          <Flame size={20} color="#10B981" />
        </View>
        <View>
          <Text style={styles.brandTitle}>LeanMate</Text>
          <Text style={styles.brandSubtitle}>Discipline Builds Freedom</Text>
        </View>
      </View>

      {/* Nav List */}
      <View style={styles.navGroup}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.path as any)}
              activeOpacity={0.8}
            >
              <Icon
                size={18}
                color={active ? '#10B981' : THEME.colors.textSecondary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Area: User Card */}
      <View style={styles.bottomArea}>
        {/* User Card */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => router.push('/profile')}
          activeOpacity={0.85}
        >
          {user.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userTier}>Free Plan</Text>
          </View>
          <ChevronRight size={16} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        {/* Footer Slogan */}
        <Text style={styles.footerQuote}>“A healthier you, a freer tomorrow.”</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: THEME.colors.cardBorder,
    paddingVertical: THEME.spacing.xl,
    paddingHorizontal: THEME.spacing.md,
    justifyContent: 'space-between',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: THEME.spacing.xl,
    paddingHorizontal: 8,
  },
  brandIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: THEME.colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  navGroup: {
    gap: 6,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.lg,
  },
  navItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  navLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  navLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  bottomArea: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7F4FF',
    padding: 10,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarFallback: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: THEME.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  userTier: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  footerQuote: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
  },
});
