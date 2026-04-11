import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, ViewStyle, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scale?: number;
  dataClass?: string;
}

/**
 * 按压交互组件 - 缩放+透明度+弹性回弹+Web hover
 */
export const PressableScale: React.FC<Props> = ({ children, onPress, style, scale = 0.97, dataClass }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const onIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: scale, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(opacityAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim, scale]);

  const onOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  // Web dataSet for CSS hover
  const webProps = dataClass ? { dataSet: { class: dataClass } } : {};

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)', borderless: false } : undefined}
      {...webProps as any}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
