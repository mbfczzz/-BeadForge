import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { FontSize, BorderRadius } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

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
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? colors.surface : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;

  const sc = pressed ? 0.97 : hovered ? 1.01 : 1;
  const op = pressed ? 0.85 : 1;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // @ts-ignore
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      disabled={disabled || loading}
    >
      <View style={[
        S.base,
        { backgroundColor: bg, transform: [{ scale: sc }], opacity: op },
        (isPrimary || isDanger) && shadow(3, 8, 0.2, isPrimary ? colors.accent : colors.error, 4),
        isOutline && { borderWidth: 1, borderColor: colors.border, ...shadow(1, 4, 0.04, '#000', 1) },
        isText && S.textOnly,
        (disabled || loading) && S.disabled,
        Platform.OS === 'web' && { transitionDuration: '0.2s' } as any,
        style,
      ]}>
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <Text style={[S.label, { color: textColor }]}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
};

const S = StyleSheet.create({
  base: {
    height: wp(48), borderRadius: wp(12),
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
  },
  textOnly: { height: 'auto' as any, paddingVertical: wp(10) },
  disabled: { opacity: 0.4 },
  label: { fontSize: fp(15), fontWeight: '700', letterSpacing: 0.2 },
});
