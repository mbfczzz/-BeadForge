import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing } from '../../theme';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
}

export const StateView: React.FC<Props> = ({ loading, error, empty, emptyText = '暂无内容', onRetry }) => {
  if (loading) {
    return (
      <View style={styles.c}>
        <ActivityIndicator size="large" color={Colors.black} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.c}>
        <Text style={styles.errText}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retry} onPress={onRetry}>
            <Text style={styles.retryText}>重试</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.c}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  c: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  errText: { fontSize: FontSize.md, color: Colors.grayDark, textAlign: 'center' },
  retry: { marginTop: Spacing.md, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.black },
  retryText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
  emptyText: { fontSize: FontSize.md, color: Colors.gray },
});
