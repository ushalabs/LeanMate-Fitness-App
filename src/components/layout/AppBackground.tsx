import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

interface AppBackgroundProps {
  children: React.ReactNode;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ children }) => (
  <LinearGradient
    colors={['#FFFFFF', '#F8F6FF', '#F2F7FF']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.root}
  >
    <View style={styles.sweepTop} />
    <View style={styles.sweepBottom} />
    <View style={styles.content}>{children}</View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sweepTop: {
    position: 'absolute',
    top: -90,
    right: -120,
    width: 360,
    height: 260,
    transform: [{ rotate: '-22deg' }],
    borderRadius: 42,
    backgroundColor: 'rgba(176, 144, 255, 0.18)',
  },
  sweepBottom: {
    position: 'absolute',
    left: -140,
    bottom: -80,
    width: 420,
    height: 260,
    transform: [{ rotate: '-26deg' }],
    borderRadius: 48,
    backgroundColor: 'rgba(255, 94, 121, 0.10)',
  },
  content: {
    flex: 1,
  },
});
