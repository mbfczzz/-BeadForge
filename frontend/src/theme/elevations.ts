import { Platform, ViewStyle } from 'react-native';

/**
 * 糖果马卡龙风格的阴影预设。
 * 比传统黑色阴影更柔 — 用 accent 色（粉）带微光感，层次清晰但不压抑。
 *
 * 用法：  style={[style.card, elevations.candySoft]}
 */

function mk(offsetY: number, blur: number, opacity: number, color = '#FF8FB1', elevation = 2): ViewStyle {
  if (Platform.OS === 'web') {
    // Web 用 box-shadow；用 rgba 实色避免叠加问题
    const [r, g, b] = hexToRgb(color);
    return { boxShadow: `0 ${offsetY}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity})` } as any;
  }
  if (Platform.OS === 'android') return { elevation };
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export const elevations = {
  /** 极轻阴影：标签、小按钮悬浮 */
  candyXs: mk(1, 4, 0.12, '#FF8FB1', 1),
  /** 轻阴影：卡片 */
  candySm: mk(3, 10, 0.15, '#FF8FB1', 2),
  /** 中等：凸出卡片、按钮 */
  candyMd: mk(6, 16, 0.18, '#FF8FB1', 4),
  /** 重阴影：浮动操作、Dialog */
  candyLg: mk(10, 24, 0.22, '#FF8FB1', 8),
  /** 中性灰阴影 — 用于暗模式或需要低饱和场景 */
  neutralSm: mk(2, 8, 0.1, '#000000', 2),
  neutralMd: mk(4, 16, 0.14, '#000000', 4),
};

/** 动态按 accent 色生成阴影（暗模式用 #FF9FC0 等） */
export function candyShadow(accentHex: string, level: 'xs' | 'sm' | 'md' | 'lg' = 'sm'): ViewStyle {
  const presets: Record<string, [number, number, number, number]> = {
    xs: [1, 4, 0.12, 1],
    sm: [3, 10, 0.15, 2],
    md: [6, 16, 0.18, 4],
    lg: [10, 24, 0.22, 8],
  };
  const [y, blur, op, el] = presets[level];
  return mk(y, blur, op, accentHex, el);
}
