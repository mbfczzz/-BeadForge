import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
} from 'react-native';
import { Colors, FontSize, BorderRadius, Spacing } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'blue' | 'outline' | 'text' | 'danger';
  size?: 'large' | 'medium' | 'small';
  style?: ViewStyle;
}

const VARIANT_COLORS = {
  primary: { bg: Colors.primary, shadow: Colors.shadowGreen, text: Colors.white },
  blue: { bg: Colors.blue, shadow: Colors.blueDark, text: Colors.white },
  outline: { bg: Colors.white, shadow: Colors.shadowGray, text: Colors.grayDark },
  text: { bg: 'transparent', shadow: 'transparent', text: Colors.blue },
  danger: { bg: Colors.red, shadow: Colors.redDark, text: Colors.white },
};

/**
 * 多邻国风格 3D 按钮 - 底部加粗阴影
 */
export const Button: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  style,
}) => {
  const colors = VARIANT_COLORS[variant];
  const isText = variant === 'text';
  const height = size === 'large' ? 54 : size === 'medium' ? 46 : 38;
  const fontSize = size === 'large' ? FontSize.lg : size === 'medium' ? FontSize.md : FontSize.sm;

  if (isText) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.6} style={style}>
        <Text style={[styles.textLabel, { fontSize, color: colors.text }]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.wrapper,
        { borderRadius: BorderRadius.xl },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {/* 底部阴影层 */}
      <View style={[styles.shadow, {
        backgroundColor: colors.shadow as string,
        height,
        borderRadius: BorderRadius.xl,
      }]} />
      {/* 按钮主体 - 上移 4px 制造 3D 效果 */}
      <View style={[styles.body, {
        backgroundColor: colors.bg as string,
        height,
        borderRadius: BorderRadius.xl,
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: variant === 'outline' ? Colors.grayBg : undefined,
      }]}>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.label, { fontSize, color: colors.text }]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  body: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  textLabel: {
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  disabled: {
    opacity: 0.45,
  },
});
