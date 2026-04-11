import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSize, Spacing, useTheme } from '../../theme';

export const PublishScreen: React.FC = () => {
  const { colors } = useTheme();
  return (
    <View style={[s.c, { backgroundColor: colors.bg }]}>
      <Text style={[s.t, { color: colors.text }]}>发布</Text>
      <Text style={[s.sub, { color: colors.textHint }]}>即将上线</Text>
    </View>
  );
};
const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  t: { fontSize: FontSize.xl, fontWeight: '600' },
  sub: { fontSize: FontSize.md, marginTop: Spacing.sm },
});
