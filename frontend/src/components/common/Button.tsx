import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fp, wp } from '../../utils/responsive';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors } = useTheme();
  const isInactive = disabled || loading;

  const sizeStyle = {
    sm: { paddingHorizontal: wp(12), paddingVertical: wp(8), fontSize: fp(12) },
    md: { paddingHorizontal: wp(16), paddingVertical: wp(11), fontSize: fp(13) },
    lg: { paddingHorizontal: wp(18), paddingVertical: wp(13), fontSize: fp(14) },
  }[size];

  const palette = {
    primary: { bg: colors.accent, border: colors.accent, text: '#FFFFFF' },
    outline: { bg: 'transparent', border: colors.accent, text: colors.accent },
    text: { bg: 'transparent', border: 'transparent', text: colors.accent },
    danger: { bg: colors.error, border: colors.error, text: '#FFFFFF' },
  }[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={isInactive}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          opacity: isInactive ? 0.58 : 1,
        },
        variant === 'text' && styles.textButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: palette.text, fontSize: sizeStyle.fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: wp(38),
    borderWidth: 1,
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textButton: {
    alignSelf: 'flex-start',
    minHeight: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  label: {
    fontWeight: '700',
  },
});
