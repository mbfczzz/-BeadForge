import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
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
 * 进场：从下方 +30 滑入 + opacity 0→1 + scale 0.85→1（并行 spring）
 * 使用方式：条件渲染 `{message && <Toast message={...} />}`，每次挂载播放进场
 */
export const Toast: React.FC<Props> = ({ message, variant = 'success' }) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!message) return;
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, damping: 14, mass: 0.7, stiffness: 220 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 14, mass: 0.7, stiffness: 220 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, mass: 0.7, stiffness: 220 }),
    ]).start();
  }, [message, opacity, translateY, scale]);

  if (!message) return null;

  const tint = variant === 'success' ? colors.success
             : variant === 'warning' ? colors.warning
             : variant === 'error' ? colors.error
             : colors.accent;

  return (
    <Animated.View
      pointerEvents="none"
      style={[$.wrap, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <Animated.View
        style={[$.box, { backgroundColor: colors.surface, borderColor: tint + '40' }, candyShadow(tint, 'md')]}
      >
        <Feather name={ICON[variant]} size={fp(16)} color={tint} />
        <Text style={[$.text, { color: colors.text }]} numberOfLines={2}>{message}</Text>
      </Animated.View>
    </Animated.View>
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
