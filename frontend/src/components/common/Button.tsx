import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { FontSize, BorderRadius, Spacing, useTheme } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'text' | 'danger';
  style?: ViewStyle;
}

export const Button: React.FC<Props> = ({
  title, onPress, loading = false, disabled = false, variant = 'primary', style,
}) => {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? 'transparent' : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;
  const borderColor = isOutline ? colors.border : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        { backgroundColor: bg, borderColor },
        isOutline && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  outline: { borderWidth: 1 },
  disabled: { opacity: 0.4 },
  label: { fontSize: FontSize.lg, fontWeight: '600' },
});
