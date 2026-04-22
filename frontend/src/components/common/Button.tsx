import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { MotiView } from 'moti';
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
 * - primary/danger 用糖果阴影（粉/红色光晕），按下有弹簧 bounce
 * - outline 卡片式，按下微弹
 * - text 纯文本链接
 */
export const Button: React.FC<Props> = ({
  title, onPress, loading = false, disabled = false, variant = 'primary', style,
}) => {
  const { colors } = useTheme();
  const [pressed, setPressed] = React.useState(false);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const bg = isPrimary ? colors.accent : isDanger ? colors.error : isOutline ? colors.surface : 'transparent';
  const textColor = isPrimary || isDanger ? '#FFF' : isOutline ? colors.text : colors.accent;
  const shadowColor = isPrimary ? colors.accent : isDanger ? colors.error : colors.accent;

  const onPressIn = useCallback(() => setPressed(true), []);
  const onPressOut = useCallback(() => setPressed(false), []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={isText ? undefined : S.pressableWrap}
    >
      <MotiView
        animate={{
          scale: pressed ? 0.94 : 1,
          translateY: pressed ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 14,
          mass: 0.6,
          stiffness: 260,
        }}
        style={[
          S.base,
          { backgroundColor: bg },
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
      </MotiView>
    </Pressable>
  );
};

const S = StyleSheet.create({
  pressableWrap: { alignSelf: 'stretch' },
  base: {
    height: wp(48),
    borderRadius: wp(24), // 更肥的胶囊感
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  textOnly: { height: 'auto' as any, paddingVertical: wp(10) },
  disabled: { opacity: 0.4 },
  label: { fontSize: fp(15), fontWeight: '700', letterSpacing: 0.3 },
});
