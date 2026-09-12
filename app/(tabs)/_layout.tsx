import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs, Slot } from 'expo-router';
import Svg, { Circle, Defs, G, LinearGradient as SvgLinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { THEME } from '../../src/constants/theme';
import { SidebarNav } from '../../src/components/layout/SidebarNav';

type TabIconName = 'home' | 'nutrition' | 'training' | 'analytics' | 'profile';

const TAB_ICON_GRADIENTS: Record<TabIconName, [string, string, string]> = {
  home: ['#C76BFF', '#38BDF8', '#10D79A'],
  nutrition: ['#FDBA3B', '#F97316', '#C76BFF'],
  training: ['#C76BFF', '#A855F7', '#7C3AED'],
  analytics: ['#38BDF8', '#06B6D4', '#10D79A'],
  profile: ['#10D79A', '#10B981', '#38BDF8'],
};

const TabIcon = ({ name, focused }: { name: TabIconName; focused: boolean }) => {
  const gradientId = `${name}TabIconGradient`;
  const gradient = `url(#${gradientId})`;
  const [start, middle, end] = TAB_ICON_GRADIENTS[name];
  const opacity = focused ? 1 : 0.72;

  return (
    <View style={styles.tabIconWrap}>
      <Svg width={30} height={30} viewBox="0 0 30 30">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="2" y1="2" x2="28" y2="28">
            <Stop offset="0%" stopColor={start} />
            <Stop offset="48%" stopColor={middle} />
            <Stop offset="100%" stopColor={end} />
          </SvgLinearGradient>
        </Defs>

        {name === 'home' && (
          <G opacity={opacity}>
            <Path
              d="M5 14.1L15 5.8l10 8.3v10.4a1.7 1.7 0 0 1-1.7 1.7h-5.1v-7.5h-6.4v7.5H6.7A1.7 1.7 0 0 1 5 24.5V14.1Z"
              fill={gradient}
              stroke={gradient}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          </G>
        )}

        {name === 'nutrition' && (
          <G opacity={opacity} fill={gradient}>
            <Rect x={5.8} y={4.7} width={2.5} height={9.8} rx={1.2} />
            <Rect x={9.6} y={4.7} width={2.5} height={9.8} rx={1.2} />
            <Rect x={13.4} y={4.7} width={2.5} height={9.8} rx={1.2} />
            <Path d="M6.1 12.2h9.4c-.3 2.6-1.9 4.4-4.2 4.9v8.2H9.1v-8.2c-2.1-.5-3.7-2.3-3-4.9Z" />
            <Path d="M21.8 4.8c-2.4 2.2-3.9 5.9-3.8 10.3h4.7v10.2H25V5.6c0-1.1-1.4-1.5-3.2-.8Z" />
          </G>
        )}

        {name === 'training' && (
          <G opacity={opacity} fill={gradient}>
            <Rect x={4.2} y={12.2} width={4.2} height={8.1} rx={2.1} />
            <Rect x={8.8} y={10.3} width={4.1} height={11.9} rx={2} />
            <Rect x={13.4} y={14.2} width={3.2} height={4} rx={1.2} />
            <Rect x={17.1} y={10.3} width={4.1} height={11.9} rx={2} />
            <Rect x={21.6} y={12.2} width={4.2} height={8.1} rx={2.1} />
          </G>
        )}

        {name === 'analytics' && (
          <G opacity={opacity} fill={gradient}>
            <Rect x={6} y={15.8} width={4.2} height={9.4} rx={1.8} />
            <Rect x={12.9} y={11.2} width={4.2} height={14} rx={1.8} />
            <Rect x={19.8} y={5.4} width={4.2} height={19.8} rx={1.8} />
          </G>
        )}

        {name === 'profile' && (
          <G opacity={opacity} fill={gradient}>
            <Circle cx={15} cy={8.6} r={5.1} />
            <Path d="M5.7 24.8c.8-5.4 4.1-8.3 9.3-8.3s8.5 2.9 9.3 8.3c.1.8-.5 1.5-1.3 1.5H7c-.8 0-1.4-.7-1.3-1.5Z" />
          </G>
        )}
      </Svg>
    </View>
  );
};

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <SidebarNav />
        <View style={styles.desktopContent}>
          <Slot />
        </View>
      </View>
    );
  }

  // Mobile Bottom Tabs
  return (
    <SafeAreaView style={styles.mobileContainer} edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: {
            backgroundColor: 'transparent',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: 'rgba(124, 58, 237, 0.14)',
            height: 72,
            paddingBottom: 12,
            paddingTop: 8,
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.08,
            shadowRadius: 18,
            elevation: 12,
          },
          tabBarActiveTintColor: '#8B5CF6',
          tabBarInactiveTintColor: '#8A83A3',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="nutrition/index"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ focused }) => <TabIcon name="nutrition" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="training/index"
          options={{
            title: 'Training',
            tabBarIcon: ({ focused }) => <TabIcon name="training" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="analytics/index"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ focused }) => <TabIcon name="analytics" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
          }}
        />

        {/* Hidden sub-tabs */}
        <Tabs.Screen name="nutrition/trends" options={{ href: null }} />
        <Tabs.Screen name="training/analytics" options={{ href: null }} />
        <Tabs.Screen name="goals/index" options={{ href: null }} />
        <Tabs.Screen name="settings/index" options={{ href: null }} />
        <Tabs.Screen name="community/index" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  desktopContent: {
    flex: 1,
    height: '100%',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabIconWrap: {
    width: 34,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
