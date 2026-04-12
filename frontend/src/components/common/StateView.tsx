import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontSize, Spacing, BorderRadius, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
}

export const StateView: React.FC<Props> = ({ loading, error, empty, emptyText = '暂无内容', onRetry }) => {
  const { colors } = useTheme();
  if (loading) return (
    <View style={styles.c}><ActivityIndicator size="large" color={colors.accent} /></View>
  );
  if (error) return (
    <View style={styles.c}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={[styles.t, { color: colors.textSecondary }]}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.btnT}>重试</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  if (empty) return (
    <View style={styles.c}>
      <Text style={styles.emoji}>🔍</Text>
      <Text style={[styles.t, { color: colors.textHint }]}>{emptyText}</Text>
    </View>
  );
  return null;
};

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(48) },
  emoji: { fontSize: fp(32), marginBottom: wp(12) },
  t: { fontSize: fp(14), textAlign: 'center', lineHeight: fp(20) },
  btn: { marginTop: wp(16), paddingHorizontal: wp(24), paddingVertical: wp(10), borderRadius: wp(10) },
  btnT: { color: '#FFF', fontSize: fp(14), fontWeight: '600' },
});
