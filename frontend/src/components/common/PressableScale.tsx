import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
}

/**
 * 按压缩放动画包装器
 */
export const PressableScale: React.FC<Props> = ({ children, onPress, style, scale = 0.97 }) => {
  const anim = useRef(new Animated.Value(1)).current;

  const onIn = useCallback(() => {
    Animated.spring(anim, { toValue: scale, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  }, [anim, scale]);

  const onOut = useCallback(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  }, [anim]);

  return (
    <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut}>
      <Animated.View style={[style, { transform: [{ scale: anim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
