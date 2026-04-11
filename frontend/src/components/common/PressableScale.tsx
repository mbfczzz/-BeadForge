import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
  /** hover 时上浮的距离 */
  hoverLift?: number;
}

/**
 * 按压+悬浮交互组件
 * - Press: 缩放+透明度+弹性
 * - Hover(Web): translateY上浮 + 阴影扩大
 */
export const PressableScale: React.FC<Props> = ({
  children, onPress, style, scale = 0.97, hoverLift = 3,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  const onPressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: scale, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(opacityAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim, scale]);

  const onPressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  // Web hover
  const onMouseEnter = useCallback(() => {
    Animated.spring(liftAnim, { toValue: -hoverLift, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  }, [liftAnim, hoverLift]);

  const onMouseLeave = useCallback(() => {
    Animated.spring(liftAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, [liftAnim]);

  const webProps = Platform.OS === 'web' ? { onMouseEnter, onMouseLeave } : {};

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)' } : undefined}
      style={{ cursor: 'pointer' } as any}
      {...webProps as any}
    >
      <Animated.View style={[
        style,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: liftAnim },
          ],
          opacity: opacityAnim,
        },
      ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
