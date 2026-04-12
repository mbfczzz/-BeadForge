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
 * 按压缩放 + hover 上浮
 * Web: 纯 CSS hover/active (通过 data-class 匹配全局样式)
 * Native: JS state 驱动
 */
export const PressableScale: React.FC<Props> = ({
  children, onPress, style, scale = 0.97, hoverLift = 3, dataClass,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isWeb = Platform.OS === 'web';

  // Native: JS 驱动 transform
  const nativeTransform = !isWeb ? {
    transform: [
      { translateY: pressed ? 0 : hovered ? -hoverLift : 0 },
      { scale: pressed ? scale : hovered ? 1.01 : 1 },
    ],
    opacity: pressed ? 0.9 : 1,
  } : {};

  return (
    <Pressable
      onPress={onPress}
      {...(!isWeb ? {
        onPressIn: () => setPressed(true),
        onPressOut: () => setPressed(false),
        // @ts-ignore
        onHoverIn: () => setHovered(true),
        onHoverOut: () => setHovered(false),
      } : {})}
      android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.06)' } : undefined}
    >
      <View
        {...(isWeb && dataClass ? { dataSet: { class: dataClass } } as any : {})}
        style={[style, nativeTransform]}
      >
        {children}
      </View>
    </Pressable>
  );
};
