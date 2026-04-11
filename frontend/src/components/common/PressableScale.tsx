import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
  hoverLift?: number;
  dataClass?: string;
}

/**
 * 按压+悬浮交互 - Pressable 支持 onHoverIn/onHoverOut
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

  const onHoverIn = useCallback(() => {
    Animated.spring(liftAnim, { toValue: -hoverLift, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  }, [liftAnim, hoverLift]);

  const onHoverOut = useCallback(() => {
    Animated.spring(liftAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, [liftAnim]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onHoverIn={Platform.OS === 'web' ? onHoverIn : undefined}
      onHoverOut={Platform.OS === 'web' ? onHoverOut : undefined}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)' } : undefined}
      style={{ cursor: 'pointer' } as any}
    >
      <Animated.View style={[style, {
        transform: [{ scale: scaleAnim }, { translateY: liftAnim }],
        opacity: opacityAnim,
      }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
