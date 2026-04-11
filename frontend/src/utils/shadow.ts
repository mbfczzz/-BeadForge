import { Platform, ViewStyle } from 'react-native';

/**
 * 跨平台阴影 - Web 用 boxShadow，iOS 用 shadow*，Android 用 elevation
 */
export function shadow(
  offsetY: number = 2,
  radius: number = 4,
  opacity: number = 0.1,
  color: string = '#000',
  elevation: number = 2,
): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: `0 ${offsetY}px ${radius}px rgba(0,0,0,${opacity})` } as any;
  }
  if (Platform.OS === 'android') {
    return { elevation };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}
