import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: 'accent' | 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const FilterChip: React.FC<Props> = ({
  label,
  active = false,
  onPress,
  color = 'accent',
  size = 'sm',
  style,
}) => {
  const { colors } = useTheme();

  const palette = {
    accent: { bg: colors.accentLight, text: colors.accent, border: `${colors.accent}22` },
    default: { bg: colors.inputBg, text: colors.textSecondary, border: colors.border },
    success: { bg: `${colors.success}16`, text: colors.success, border: `${colors.success}22` },
    warning: { bg: `${colors.warning}18`, text: colors.warning, border: `${colors.warning}22` },
    danger: { bg: `${colors.error}16`, text: colors.error, border: `${colors.error}22` },
  }[color];

  const sizeStyle = size === 'md'
    ? { minHeight: wp(34), paddingHorizontal: wp(14), fontSize: fp(12) }
    : { minHeight: wp(28), paddingHorizontal: wp(10), fontSize: fp(10) };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.chip,
        {
          minHeight: sizeStyle.minHeight,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          backgroundColor: active ? palette.bg : colors.surface,
          borderColor: active ? palette.border : colors.border,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize: sizeStyle.fontSize, color: active ? palette.text : colors.textHint }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: wp(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
  },
});
