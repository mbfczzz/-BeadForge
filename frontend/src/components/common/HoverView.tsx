import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  hoverScale?: number;
  hoverLift?: number;
}

export const HoverView: React.FC<Props> = ({
  children, onPress, style,
  hoverScale = 1, hoverLift = 2,
}) => {
  const lift = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  const doEnter = useCallback(() => {
    Animated.parallel([
      Animated.spring(lift, { toValue: -hoverLift, useNativeDriver: true, speed: 22, bounciness: 6 }),
      Animated.spring(scale, { toValue: hoverScale, useNativeDriver: true, speed: 22, bounciness: 6 }),
    ]).start();
  }, [lift, scale, hoverLift, hoverScale]);

  const doLeave = useCallback(() => {
    Animated.parallel([
      Animated.spring(lift, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 4 }),
    ]).start();
  }, [lift, scale]);

  const doIn = useCallback(() => {
    Animated.spring(pressScale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  }, [pressScale]);

  const doOut = useCallback(() => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
  }, [pressScale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={doIn}
      onPressOut={doOut}
      // @ts-ignore - RN Web supports these
      onHoverIn={doEnter}
      onHoverOut={doLeave}
    >
      {({ pressed }: any) => (
        <Animated.View style={[style, {
          transform: [
            { translateY: lift },
            { scale: Animated.multiply(scale, pressScale) },
          ],
        }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
};
