import React, { useCallback } from 'react';
import { Pressable, StyleProp, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  hoverScale?: number;
  hoverLift?: number;
}

/**
 * 交互组件 — 移动端用 Pressable 原生 style 回调（零 useState），Web 端用 CSS transition
 */
export const HoverView: React.FC<Props> = ({
  children, onPress, style,
  hoverScale = 1.02, hoverLift = 3,
}) => {
  // 移动端：用 Pressable 的 style 函数，pressed 时缩放，不需要 state
  if (Platform.OS !== 'web') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          style as ViewStyle,
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  // Web 端：保留 hover 效果
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }: any) => [
        style as ViewStyle,
        {
          transform: [
            { translateY: pressed ? 0 : hovered ? -hoverLift : 0 },
            { scale: pressed ? 0.97 : hovered ? hoverScale : 1 },
          ],
          transitionDuration: '0.2s',
        } as any,
      ]}
    >
      {children}
    </Pressable>
  );
};
