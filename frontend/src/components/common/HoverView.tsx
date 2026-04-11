import React, { useState } from 'react';
import { View, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hoverScale?: number;
  hoverLift?: number;
}

/**
 * Hover 交互组件 - state 驱动 + RN Web CSS transition
 */
export const HoverView: React.FC<Props> = ({
  children, onPress, style,
  hoverScale = 1.02, hoverLift = 3,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const tx = pressed ? 0 : hovered ? -hoverLift : 0;
  const sc = pressed ? 0.97 : hovered ? hoverScale : 1;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      // @ts-ignore
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <View style={[
        style,
        { transform: [{ translateY: tx }, { scale: sc }] },
        Platform.OS === 'web' && { transitionDuration: '0.25s', transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' } as any,
      ]}>
        {children}
      </View>
    </Pressable>
  );
};
