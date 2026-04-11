import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FontSize, Spacing, BorderRadius, useTheme } from '../../theme';

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
      <Text style={[styles.t, { color: colors.textSecondary }]}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={onRetry}>
          <Text style={styles.btnT}>重试</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  if (empty) return (
    <View style={styles.c}><Text style={[styles.t, { color: colors.textHint }]}>{emptyText}</Text></View>
  );
  return null;
};

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  t: { fontSize: FontSize.md, textAlign: 'center' },
  btn: { marginTop: Spacing.md, paddingHorizontal: 20, paddingVertical: 8, borderRadius: BorderRadius.md },
  btnT: { color: '#FFF', fontSize: FontSize.md, fontWeight: '600' },
});
