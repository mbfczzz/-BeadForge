import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
}

export const StateView: React.FC<Props> = ({
  loading,
  error,
  empty,
  emptyText = '暂无内容',
  onRetry,
}) => {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accentLight }]}>
          <Feather name="alert-circle" size={fp(18)} color={colors.accent} />
        </View>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{error}</Text>
        {onRetry ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>重试</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.container}>
        <View style={[styles.iconWrap, { backgroundColor: colors.inputBg }]}>
          <Feather name="inbox" size={fp(18)} color={colors.textHint} />
        </View>
        <Text style={[styles.text, { color: colors.textHint }]}>{emptyText}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp(48),
  },
  iconWrap: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(12),
  },
  text: {
    fontSize: fp(14),
    textAlign: 'center',
    lineHeight: fp(20),
  },
  button: {
    marginTop: wp(16),
    paddingHorizontal: wp(24),
    paddingVertical: wp(10),
    borderRadius: wp(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: fp(14),
    fontWeight: '600',
  },
});
