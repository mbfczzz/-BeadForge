import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontSize, Spacing, useTheme } from '../../theme';

export const MarketScreen: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[s.c, { backgroundColor: colors.bg }]}>
      <Text style={[s.t, { color: colors.text }]}>市场</Text>
      <Text style={[s.sub, { color: colors.textHint }]}>即将上线</Text>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  t: { fontSize: FontSize.xl, fontWeight: '600' },
  sub: { fontSize: FontSize.md, marginTop: Spacing.sm },
});
