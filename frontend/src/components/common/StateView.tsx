import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, FontSize, Spacing } from '../../theme';
import { Button } from './Button';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  emptyIcon?: string;
  onRetry?: () => void;
}

export const StateView: React.FC<Props> = ({
  loading,
  error,
  empty,
  emptyText = '暂无数据',
  emptyIcon = '🦉',
  onRetry,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>😵</Text>
        <Text style={styles.title}>出错啦！</Text>
        <Text style={styles.message}>{error}</Text>
        {onRetry && (
          <View style={styles.retryWrap}>
            <Button title="重试" onPress={onRetry} variant="blue" size="medium" />
          </View>
        )}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{emptyIcon}</Text>
        <Text style={styles.title}>{emptyText}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.dark,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.gray,
    marginTop: Spacing.md,
    fontWeight: '700',
  },
  retryWrap: {
    marginTop: Spacing.lg,
    width: 160,
  },
});
