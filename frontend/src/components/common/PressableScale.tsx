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

export const PressableScale: React.FC<Props> = ({
  children, onPress, style, scale = 0.97, hoverLift = 3,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;

  const doIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: scale, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(opacityAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim, scale]);

  const doOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const hoverIn = useCallback(() => {
    Animated.spring(liftAnim, { toValue: -hoverLift, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  }, [liftAnim, hoverLift]);

  const hoverOut = useCallback(() => {
    Animated.spring(liftAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }).start();
  }, [liftAnim]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={doIn}
      onPressOut={doOut}
      // @ts-ignore - RN Web supports these
      onHoverIn={hoverIn}
      onHoverOut={hoverOut}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)' } : undefined}
    >
      {({ pressed }: any) => (
        <Animated.View style={[style, {
          transform: [{ scale: scaleAnim }, { translateY: liftAnim }],
          opacity: opacityAnim,
        }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
};
