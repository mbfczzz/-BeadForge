import { Dimensions, Platform, StatusBar, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** 设计稿基准宽度 375 (iPhone SE / 标准设计稿) */
const BASE_WIDTH = 375;

/**
 * 按屏幕宽度等比缩放 (宽度自适应)
 * 例: wp(16) 在 375 宽的屏幕 = 16, 在 414 宽 = 17.6
 */
export function wp(size: number): number {
  return PixelRatio.roundToNearestPixel((SCREEN_W / BASE_WIDTH) * size);
}

/**
 * 字体缩放 - 限制最大放大比例避免平板字体过大
 */
export function fp(size: number): number {
  const scale = Math.min(SCREEN_W / BASE_WIDTH, 1.3); // 最大放大 1.3x
  return PixelRatio.roundToNearestPixel(size * scale);
}

/** 屏幕宽高 */
export const screenW = SCREEN_W;
export const screenH = SCREEN_H;

/** 是否平板 (宽度 > 600) */
export const isTablet = SCREEN_W > 600;

/** 是否小屏 (宽度 < 360) */
export const isSmall = SCREEN_W < 360;

/** 是否 iOS */
export const isIOS = Platform.OS === 'ios';

/** 是否 Android */
export const isAndroid = Platform.OS === 'android';

/** 状态栏高度 */
export const STATUS_BAR_H = Platform.select({
  ios: 44, // iPhone X+ 刘海屏
  android: StatusBar.currentHeight || 24,
  default: 0,
});

/** 底部安全区高度 (iPhone X+ 底部横条) */
export const BOTTOM_SAFE_H = Platform.select({
  ios: 34,
  default: 0,
});

/** 瀑布流列数 - 根据屏幕宽度自适应 */
export function getColumnCount(): number {
  if (SCREEN_W >= 768) return 4;  // 平板
  if (SCREEN_W >= 480) return 3;  // 大屏手机
  return 2;                        // 普通手机
}

/** 卡片宽度计算 */
export function getCardWidth(padding: number, gap: number, cols: number): number {
  return (SCREEN_W - padding * 2 - gap * (cols - 1)) / cols;
}

/** Banner 宽度 */
export function getBannerWidth(padding: number): number {
  return SCREEN_W - padding * 2;
}
