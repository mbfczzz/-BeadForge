import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { FontSize, BorderRadius, Spacing, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';

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
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onIn = useCallback(() => {
    if (variant === 'text') return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(opacity, { toValue: 0.85, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity, variant]);

  const onOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? colors.surface : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      disabled={disabled || loading}
      android_ripple={!isText && Platform.OS === 'android' ? { color: 'rgba(255,255,255,0.15)' } : undefined}
    >
      <Animated.View style={[
        S.base,
        { backgroundColor: bg, transform: [{ scale }], opacity },
        (isPrimary || isDanger) && S.elevated,
        isOutline && S.outlineShadow,
        isText && S.textOnly,
        (disabled || loading) && S.disabled,
        style,
      ]}>
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
  base: {
    height: wp(48), borderRadius: wp(14),
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
  },
  elevated: {
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  outlineShadow: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  textOnly: { height: 'auto' as any, paddingVertical: wp(8) },
  disabled: { opacity: 0.4 },
  label: { fontSize: fp(15), fontWeight: '600' },
});
