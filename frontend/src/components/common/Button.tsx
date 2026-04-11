import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, FontSize, BorderRadius, Spacing } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'outline' | 'text' | 'danger';
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
}

export const Button: React.FC<Props> = ({
  title, onPress, loading = false, disabled = false,
  variant = 'primary', size = 'large', style,
}) => {
  const h = size === 'large' ? 50 : size === 'medium' ? 42 : 34;
  const fs = size === 'large' ? FontSize.lg : FontSize.md;

  const bgMap = { primary: Colors.black, accent: Colors.accent, outline: Colors.white, text: 'transparent', danger: Colors.error };
  const textMap = { primary: Colors.white, accent: Colors.white, outline: Colors.black, text: Colors.accent, danger: Colors.white };
  const bg = bgMap[variant];
  const textColor = textMap[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        { height: h, backgroundColor: bg, borderRadius: h / 2 },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { fontSize: fs, color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  outline: { borderWidth: 1.5, borderColor: Colors.grayLight },
  disabled: { opacity: 0.4 },
  label: { fontWeight: '600' },
});
