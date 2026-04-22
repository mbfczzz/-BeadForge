/**
 * BeadForge 配色 — 糖果马卡龙（candy macaron）主题
 *
 * 设计意图：
 * - 拼豆 = 彩色糖果珠 → 视觉语言向"可爱、温柔、童趣"靠拢
 * - 主 accent 改为糖果粉橘渐变（#FF8FB1 → #FFB894）
 * - 文字改为微紫灰代替纯黑，避免刚硬
 * - 背景奶油暖白 #FFF7F3 替代冷灰 #F5F5F5
 * - 新增 candy.* 色板：粉/橘/薄荷/奶黄/淡紫/天空蓝，用于装饰元素（标签、气泡、贴纸）
 * - 保留旧字段名（accent / accentLight / accentGradStart 等）以避免大面积破坏旧代码，仅替换色值
 */

/** 糖果色板（马卡龙）— 用于装饰、标签、气泡、随机色分配 */
export const CandyPaletteLight = {
  pink: '#FFB4C6',
  peach: '#FFCDB2',
  mint: '#B8E7D4',
  cream: '#FFE8A3',
  lavender: '#D4B8FF',
  sky: '#B8E0FF',
  bubblegum: '#FF8FB1',
  sunshine: '#FFC870',
  mango: '#FFA576',
  grape: '#B67CFF',
};

export const CandyPaletteDark = {
  pink: '#F095A9',
  peach: '#EBB89E',
  mint: '#9FC7B9',
  cream: '#E6D08A',
  lavender: '#B89EE6',
  sky: '#9AC0DF',
  bubblegum: '#FF9FC0',
  sunshine: '#F0B25D',
  mango: '#E8926A',
  grape: '#A06EE8',
};

export const LightTheme = {
  // 表面 — 奶油暖白
  bg: '#FFF7F3',
  surface: '#FFFFFF',
  surfaceHover: '#FFF1EA',
  navBg: '#FFFFFF',
  navBorder: '#FFEDE2',

  // 文字 — 微紫灰，比纯黑更柔和
  text: '#3D2F3D',
  textSecondary: '#7A6C7A',
  textHint: '#B0A5B0',

  // 边框 — 淡粉橘
  border: '#FFE5D6',
  divider: '#FFF0E5',

  // 主强调色 — 糖果粉 + 粉橘渐变
  accent: '#FF8FB1',
  accentDark: '#F07193',
  accentLight: '#FFE8F0',
  accentGradStart: '#FF8FB1',
  accentGradEnd: '#FFB894',

  // 糖果色板
  candy: CandyPaletteLight,

  // 功能色（糖果化）
  gold: '#FFB740',
  error: '#FF7A8F',
  success: '#6ED39F',
  warning: '#FFB156',

  // 卡片 — 粉色微阴影
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(255, 143, 177, 0.15)',
  cardShadowSoft: 'rgba(255, 143, 177, 0.08)',

  // 输入
  inputBg: '#FFF0E5',
  overlay: 'rgba(61, 47, 61, 0.4)',

  // 标签
  tagBg: '#FFE8F0',
  tagText: '#C16888',

  // 骨架屏
  skeleton: '#FFEDE2',
};

export const DarkTheme = {
  // 表面 — 葡萄紫暗调
  bg: '#1A1220',
  surface: '#26182D',
  surfaceHover: '#2F1F38',
  navBg: '#1F1425',
  navBorder: '#2A1E33',

  // 文字
  text: '#F5EDF5',
  textSecondary: '#BCA8BC',
  textHint: '#7A6A7A',

  // 边框
  border: '#3A2A44',
  divider: '#2E1F38',

  // 主强调色 — 暗底稍提亮
  accent: '#FF9FC0',
  accentDark: '#EB8BAD',
  accentLight: '#3A1F2E',
  accentGradStart: '#FF9FC0',
  accentGradEnd: '#FFB894',

  // 糖果色板
  candy: CandyPaletteDark,

  // 功能色
  gold: '#FFC568',
  error: '#FF8FA0',
  success: '#7EDBA6',
  warning: '#FFC47A',

  // 卡片
  cardBg: '#26182D',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  cardShadowSoft: 'rgba(0, 0, 0, 0.25)',

  // 输入
  inputBg: '#2A1E33',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // 标签
  tagBg: '#3A1F2E',
  tagText: '#EBA5BF',

  // 骨架屏
  skeleton: '#2E1F38',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;

/** 按 key 稳定取糖果色（用于 Avatar 背景、标签色彩分配等） */
export function candyColorFor(seed: string | number, palette: typeof CandyPaletteLight = CandyPaletteLight): string {
  const keys: (keyof typeof palette)[] = ['pink', 'peach', 'mint', 'cream', 'lavender', 'sky', 'sunshine', 'mango', 'grape'];
  const s = typeof seed === 'number' ? seed : Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[keys[Math.abs(s) % keys.length]];
}
