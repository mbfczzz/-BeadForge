import React from 'react';
import { Pressable, StyleProp, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scale?: number;
  hoverLift?: number;
  dataClass?: string;
}

/**
 * 按压缩放 — 移动端零 state，纯 Pressable style 回调
 */
export const PressableScale: React.FC<Props> = ({
  children, onPress, style, scale = 0.97,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      style as ViewStyle,
      pressed && { opacity: 0.85, transform: [{ scale }] },
      Platform.OS === 'web' && { transitionDuration: '0.15s' } as any,
    ]}
  >
    {children}
  </Pressable>
);
