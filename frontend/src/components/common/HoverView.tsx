import React, { useRef, useCallback } from 'react';
import { Animated, Platform, ViewStyle, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  /** hover 时缩放 */
  hoverScale?: number;
  /** hover 时上浮 */
  hoverLift?: number;
  activeOpacity?: number;
}

/**
 * 带 hover 动画的触摸组件
 * Web: 鼠标悬浮时上浮+缩放, 移开复原
 * Mobile: activeOpacity
 */
export const HoverView: React.FC<Props> = ({
  children, onPress, style,
  hoverScale = 1, hoverLift = 2,
  activeOpacity = 0.7,
}) => {
  const lift = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

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

  const webProps = Platform.OS === 'web' ? { onMouseEnter: onEnter, onMouseLeave: onLeave } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={{ cursor: 'pointer' } as any}
      {...webProps as any}
    >
      <Animated.View style={[style, { transform: [{ translateY: lift }, { scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};
