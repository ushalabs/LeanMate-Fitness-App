import React, { useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants/theme';

export function TrainingSheet({ visible, title, onClose, children, busy = false, pageKey }: React.PropsWithChildren<{
  visible: boolean; title: string; onClose: () => void; busy?: boolean; pageKey?: string;
}>) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [visible, pageKey]);
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !busy && onClose()}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[s.overlay, { paddingTop: Math.max(16, insets.top), paddingBottom: Math.max(16, insets.bottom) }]}>
      <View style={[s.sheet, { maxHeight: height - Math.max(16, insets.top) - Math.max(16, insets.bottom) }]}>
        <View style={s.row}>
          <Text style={[s.title, s.flex]}>{title}</Text>
          <TouchableOpacity accessibilityLabel="Close" disabled={busy} onPress={onClose} style={s.icon}><X size={22} color={THEME.colors.textSecondary} /></TouchableOpacity>
        </View>
        <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

export const trainingStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(36, 24, 63, 0.48)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  sheet: { width: '100%', maxWidth: 620, backgroundColor: '#F3EFFF', borderRadius: 20, borderWidth: 1, borderColor: THEME.colors.cardBorder, padding: 16, flexShrink: 1 },
  body: { gap: 14, paddingTop: 12, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  flex: { flex: 1, minWidth: 0 },
  title: { color: THEME.colors.textPrimary, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  label: { color: THEME.colors.textPrimary, fontSize: 13, fontWeight: '600', flexShrink: 1 },
  muted: { color: THEME.colors.textSecondary, fontSize: 12, lineHeight: 18, flexShrink: 1 },
  accent: { color: '#5B21B6', fontSize: 12, fontWeight: '700' },
  error: { color: '#B4233D', fontSize: 13, lineHeight: 18 },
  input: { color: THEME.colors.textPrimary, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: THEME.colors.cardBorder, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, fontSize: 14, minWidth: 0 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, borderColor: THEME.colors.cardBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9 },
  selected: { backgroundColor: '#DDD2FF', borderColor: '#7C3AED' },
  button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#8B5CF6', padding: 12, borderRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(185,104,255,0.4)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  entry: { borderBottomWidth: 1, borderBottomColor: THEME.colors.cardBorder, paddingVertical: 12, gap: 10 },
  item: { backgroundColor: '#FFFFFF', padding: 14, borderWidth: 1, borderColor: 'rgba(124,58,237,0.24)', borderRadius: 8, gap: 8 },
  stack: { gap: 10 },
  disabled: { opacity: 0.4 },
});
const s = trainingStyles;
