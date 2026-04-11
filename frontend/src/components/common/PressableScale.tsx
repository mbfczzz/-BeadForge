import React, { useState } from 'react';
import { View, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
  hoverLift?: number;
  dataClass?: string;
}

/**
 * 按压缩放 + hover 上浮 - state 驱动
 */
export const PressableScale: React.FC<Props> = ({
  children, onPress, style, scale = 0.97, hoverLift = 3,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const tx = pressed ? 0 : hovered ? -hoverLift : 0;
  const sc = pressed ? scale : hovered ? 1.01 : 1;
  const op = pressed ? 0.88 : 1;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // @ts-ignore
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)' } : undefined}
    >
      <View style={[
        style,
        { transform: [{ translateY: tx }, { scale: sc }], opacity: op },
        Platform.OS === 'web' && { transitionDuration: '0.2s', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' } as any,
      ]}>
        {children}
      </View>
    </Pressable>
  );
};
