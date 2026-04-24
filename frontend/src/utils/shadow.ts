import { Platform, ViewStyle } from 'react-native';

/**
 * 跨平台轻阴影。
 * Web 使用 boxShadow，iOS 使用 shadow*，Android 使用 elevation。
 */
export function shadow(
  offsetY: number = 2,
  radius: number = 4,
  opacity: number = 0.1,
  color: string = '#000',
  elevation: number = 2,
): ViewStyle {
  const softOffsetY = Math.max(1, Math.round(offsetY * 0.45));
  const softRadius = Math.max(2, Math.round(radius * 0.5));
  const softOpacity = Number(Math.max(0.015, opacity * 0.45).toFixed(3));
  const softElevation = Math.max(1, Math.round(elevation * 0.45));

  if (Platform.OS === 'web') {
    return { boxShadow: `0 ${softOffsetY}px ${softRadius}px rgba(0,0,0,${softOpacity})` } as any;
  }
  if (Platform.OS === 'android') {
    return { elevation: softElevation };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: softOffsetY },
    shadowOpacity: softOpacity,
    shadowRadius: softRadius,
  };
}
