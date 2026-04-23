/**
 * BeadForge 配色 — 水墨国风主题
 *
 * 设计意图：
 * - 宣纸米白打底 + 墨色文字 + 朱砂红主强调
 * - 传统色板：朱砂 / 藤黄 / 竹青 / 天青 / 胭脂 / 紫檀 / 琥珀
 * - 保留 `candy` 命名空间（向后兼容），色值换为国风传统色
 * - 阴影改用墨色（#2A1E1A 的淡 alpha），产生"宣纸上墨渍"的质感
 */

/**
 * 传统色板（key 沿用原糖果命名以零成本替换色值；语义对应如下）：
 * - pink:      胭脂红（温润少女红）
 * - peach:     琥珀桃（暖棕）
 * - mint:      竹青（墨绿）
 * - cream:     米黄
 * - lavender:  紫檀（典雅紫）
 * - sky:       天青（宋瓷蓝）
 * - bubblegum: 朱砂红（主强调色）
 * - sunshine:  藤黄（金黄）
 * - mango:     柿红（暖橘）
 * - grape:     青莲（深紫）
 */
export const CandyPaletteLight = {
  pink: '#C94F5D',       // 胭脂红
  peach: '#D9A080',      // 琥珀桃
  mint: '#8FB59A',       // 竹青
  cream: '#E8D58E',      // 米黄
  lavender: '#9B8CB5',   // 紫檀
  sky: '#7BA4C9',        // 天青
  bubblegum: '#C8302B',  // 朱砂红（主强调）
  sunshine: '#D4A017',   // 藤黄
  mango: '#CC7B3F',      // 柿红
  grape: '#6B4F8F',      // 青莲
};

export const CandyPaletteDark = {
  pink: '#E47484',
  peach: '#E8B896',
  mint: '#A7C8B2',
  cream: '#E8D79E',
  lavender: '#B0A3C9',
  sky: '#95B9D9',
  bubblegum: '#E04F48',
  sunshine: '#E8B82B',
  mango: '#E09356',
  grape: '#8A6EB0',
};

export const LightTheme = {
  // 表面 — 宣纸米白
  bg: '#F7F2E7',
  surface: '#FDFBF5',
  surfaceHover: '#F2EBDA',
  navBg: '#FDFBF5',
  navBorder: '#E8DFC8',

  // 文字 — 墨色（比纯黑更温润）
  text: '#2A1E1A',
  textSecondary: '#5A4A3E',
  textHint: '#8A7C6E',

  // 边框 / 分割 — 浅赭
  border: '#E2D5B8',
  divider: '#EBDFCB',

  // 主强调色 — 朱砂红，渐变到柿橘（暖水墨）
  accent: '#C8302B',
  accentDark: '#A22520',
  accentLight: '#FBE8E6',
  accentGradStart: '#C8302B',
  accentGradEnd: '#CC7B3F',

  // 糖果色板（key 名兼容，值已换为国风）
  candy: CandyPaletteLight,

  // 功能色（国风）
  gold: '#D4A017',       // 藤黄
  error: '#A22520',      // 深朱砂
  success: '#4D8A5E',    // 松绿
  warning: '#D4A017',    // 藤黄

  // 卡片 — 墨色阴影（宣纸上的墨渍感）
  cardBg: '#FDFBF5',
  cardShadow: 'rgba(42, 30, 26, 0.12)',
  cardShadowSoft: 'rgba(42, 30, 26, 0.06)',

  // 输入
  inputBg: '#F2EBDA',
  overlay: 'rgba(42, 30, 26, 0.5)',

  // 标签
  tagBg: '#FBE8E6',
  tagText: '#A22520',

  // 骨架屏
  skeleton: '#EBDFCB',
};

export const DarkTheme = {
  // 表面 — 深墨
  bg: '#1A1413',
  surface: '#2A1F1C',
  surfaceHover: '#32251F',
  navBg: '#221A18',
  navBorder: '#3A2D28',

  // 文字 — 雪色
  text: '#EADFD5',
  textSecondary: '#B9AA9C',
  textHint: '#7A6E63',

  // 边框
  border: '#3A2D28',
  divider: '#2E221E',

  // 主强调色
  accent: '#E04F48',
  accentDark: '#C83A33',
  accentLight: '#3A1F1C',
  accentGradStart: '#E04F48',
  accentGradEnd: '#E09356',

  // 糖果色板
  candy: CandyPaletteDark,

  // 功能色
  gold: '#E8B82B',
  error: '#E04F48',
  success: '#6FB085',
  warning: '#E8B82B',

  // 卡片
  cardBg: '#2A1F1C',
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  cardShadowSoft: 'rgba(0, 0, 0, 0.25)',

  // 输入
  inputBg: '#2E221E',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // 标签
  tagBg: '#3A1F1C',
  tagText: '#E47484',

  // 骨架屏
  skeleton: '#2E221E',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;

/** 按 key 稳定取糖果色（用于 Avatar 背景、标签色彩分配等） */
export function candyColorFor(seed: string | number, palette: typeof CandyPaletteLight = CandyPaletteLight): string {
  const keys: (keyof typeof palette)[] = ['pink', 'peach', 'mint', 'cream', 'lavender', 'sky', 'bubblegum', 'sunshine', 'mango', 'grape'];
  const s = typeof seed === 'number' ? seed : Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[keys[Math.abs(s) % keys.length]];
}
