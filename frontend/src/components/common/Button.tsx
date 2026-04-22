import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { useTheme, candyShadow } from '../../theme';
import { wp, fp } from '../../utils/responsive';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'text' | 'danger';
  style?: ViewStyle;
}

/**
 * 糖果马卡龙风 Button。
 * 按下：scale → 0.94 + translateY +1（spring）
 * 松开：回弹到 1 / 0（spring）
 * 用 RN 内置 Animated，不依赖 reanimated/moti（Expo Go 全兼容）
 */
export const Button: React.FC<Props> = ({
  title, onPress, loading = false, disabled = false, variant = 'primary', style,
}) => {
  const { colors } = useTheme();

  // 两个 Animated.Value 驱动 scale + translateY
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? colors.surface : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;
  const shadowColor = isPrimary ? colors.accent : isDanger ? colors.error : colors.accent;

  const springTo = useCallback((s: number, y: number) => {
    Animated.spring(scale, { toValue: s, useNativeDriver: true, damping: 14, mass: 0.6, stiffness: 260 }).start();
    Animated.spring(translateY, { toValue: y, useNativeDriver: true, damping: 14, mass: 0.6, stiffness: 260 }).start();
  }, [scale, translateY]);

  const onPressIn = useCallback(() => springTo(0.94, 1), [springTo]);
  const onPressOut = useCallback(() => springTo(1, 0), [springTo]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={isText ? undefined : S.pressableWrap}
    >
      <Animated.View
        style={[
          S.base,
          { backgroundColor: bg, transform: [{ scale }, { translateY }] },
          (isPrimary || isDanger) && candyShadow(shadowColor, 'md'),
          isOutline && { borderWidth: 1, borderColor: colors.border, ...candyShadow(colors.accent, 'xs') },
          isText && S.textOnly,
          (disabled || loading) && S.disabled,
          Platform.OS === 'web' && ({ transitionDuration: '0.2s' } as any),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[S.label, { color: textColor }]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const S = StyleSheet.create({
  pressableWrap: { alignSelf: 'stretch' },
  base: {
    height: wp(48),
    borderRadius: wp(24),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  textOnly: { height: 'auto' as any, paddingVertical: wp(10) },
  disabled: { opacity: 0.4 },
  label: { fontSize: fp(15), fontWeight: '700', letterSpacing: 0.3 },
});
