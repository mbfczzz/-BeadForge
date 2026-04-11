import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../theme';

export const PublishScreen: React.FC = () => (
  <View style={s.c}><Text style={s.t}>发布</Text><Text style={s.sub}>即将上线</Text></View>
);
const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  t: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.black },
  sub: { fontSize: FontSize.md, color: Colors.gray, marginTop: Spacing.sm },
});
