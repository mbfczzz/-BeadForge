import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
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
  const scale = useRef(new Animated.Value(1)).current;

  const onIn = useCallback(() => {
    if (variant === 'text') return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  }, [scale, variant]);

  const onOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  }, [scale]);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? 'transparent' : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      disabled={disabled || loading}
    >
      <Animated.View style={[
        styles.base,
        { backgroundColor: bg, borderRadius: BorderRadius.md, transform: [{ scale }] },
        isOutline && { borderWidth: 1, borderColor: colors.border },
        isText && { height: 'auto' as any, paddingVertical: Spacing.sm },
        (disabled || loading) && styles.disabled,
        style,
      ]}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[styles.label, { color: textColor }]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: { height: 46, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  disabled: { opacity: 0.4 },
  label: { fontSize: FontSize.lg, fontWeight: '600' },
});
