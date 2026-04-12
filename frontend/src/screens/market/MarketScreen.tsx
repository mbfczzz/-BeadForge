import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

export const MarketScreen: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[s.c, { backgroundColor: colors.bg }]}>
      <Text style={s.emoji}>🛍️</Text>
      <Text style={[s.t, { color: colors.text }]}>图案市场</Text>
      <Text style={[s.sub, { color: colors.textHint }]}>发现和交易精品图案，即将上线</Text>
    </SafeAreaView>
  );
};
const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(32) },
  emoji: { fontSize: fp(40), marginBottom: wp(12) },
  t: { fontSize: fp(18), fontWeight: '700', letterSpacing: 0.3 },
  sub: { fontSize: fp(13), marginTop: wp(8), textAlign: 'center', lineHeight: fp(19) },
});
