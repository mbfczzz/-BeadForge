import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons';
import { useTheme, candyShadow } from '../../theme';
import { wp, fp } from '../../utils/responsive';

interface Props {
  message: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
}

const ICON: Record<NonNullable<Props['variant']>, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  info: 'info',
  warning: 'alert-triangle',
  error: 'x-circle',
};

/**
 * 糖果风 Toast。
 * 进场：spring 弹性滑入 + 放大（from → animate）。
 * 无出场动画（需要 AnimatePresence 才会生效，大多数调用方不用）。
 * 使用方式：条件渲染 `{message && <Toast message={...} />}`。
 */
export const Toast: React.FC<Props> = ({ message, variant = 'success' }) => {
  const { colors } = useTheme();
  if (!message) return null;

  const tint = variant === 'success' ? colors.success
             : variant === 'warning' ? colors.warning
             : variant === 'error' ? colors.error
             : colors.accent;

  return (
    <MotiView
      pointerEvents="none"
      from={{ opacity: 0, translateY: 30, scale: 0.85 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 14, mass: 0.7, stiffness: 220 }}
      style={$.wrap}
    >
      <MotiView
        style={[$.box, { backgroundColor: colors.surface, borderColor: tint + '40' }, candyShadow(tint, 'md')]}
      >
        <Feather name={ICON[variant]} size={fp(16)} color={tint} />
        <Text style={[$.text, { color: colors.text }]} numberOfLines={2}>{message}</Text>
      </MotiView>
    </MotiView>
  );
};

const $ = StyleSheet.create({
  wrap: {
    position: 'absolute', bottom: wp(90), left: 0, right: 0,
    alignItems: 'center', zIndex: 999,
  },
  box: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(18), paddingVertical: wp(11),
    borderRadius: wp(9999),
    borderWidth: 1,
    maxWidth: '85%',
  },
  text: { fontSize: fp(14), fontWeight: '600', marginLeft: wp(8), letterSpacing: 0.2 },
});
