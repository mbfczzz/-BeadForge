import { useRef, useCallback, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Web hover 检测 hook
 * 返回 { hovered, hoverProps } —— 将 hoverProps 展开到 View/TouchableOpacity 上
 */
export function useHover() {
  const [hovered, setHovered] = useState(false);

  const hoverProps = Platform.OS === 'web'
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  return { hovered, hoverProps };
}
