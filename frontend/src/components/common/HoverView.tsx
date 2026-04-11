import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hoverScale?: number;
  hoverLift?: number;
}

/**
 * 带 hover 动画的交互组件 - 用 Pressable 确保 Web mouse 事件
 */
export const HoverView: React.FC<Props> = ({
  children, onPress, style,
  hoverScale = 1, hoverLift = 2,
}) => {
  const lift = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const onEnter = useCallback(() => {
    Animated.parallel([
      Animated.spring(lift, { toValue: -hoverLift, useNativeDriver: true, speed: 22, bounciness: 6 }),
      Animated.spring(scale, { toValue: hoverScale, useNativeDriver: true, speed: 22, bounciness: 6 }),
    ]).start();
  }, [lift, scale, hoverLift, hoverScale]);

  const onLeave = useCallback(() => {
    Animated.parallel([
      Animated.spring(lift, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 4 }),
    ]).start();
  }, [lift, scale]);

  const onPressIn = useCallback(() => {
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  }, [pressScale]);

  const onPressOut = useCallback(() => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
  }, [pressScale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onHoverIn={Platform.OS === 'web' ? onEnter : undefined}
      onHoverOut={Platform.OS === 'web' ? onLeave : undefined}
      style={{ cursor: 'pointer' } as any}
    >
      <Animated.View style={[style, {
        transform: [
          { translateY: lift },
          { scale: Animated.multiply(scale, pressScale) },
        ],
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
