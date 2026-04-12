/**
 * BeadForge 配色 — 温暖中性 + 活力强调色
 * 参考: Apple HIG / 小红书 / Pinterest 的温暖质感
 */
export const LightTheme = {
  // 表面
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFA',
  navBg: '#FFFFFF',
  navBorder: '#F0F0F0',

  // 文字 — 纯中性灰，无色彩倾向
  text: '#1A1A1A',
  textSecondary: '#666666',
  textHint: '#999999',

  // 边框 / 分割
  border: '#EBEBEB',
  divider: '#F0F0F0',

  // 强调色 — 偏紫的靛蓝，有创意感
  accent: '#5B5FFF',
  accentDark: '#4A4ED9',
  accentLight: '#EEEFFF',
  accentGradStart: '#5B5FFF',
  accentGradEnd: '#C084FC',

  // 功能色
  gold: '#F5A623',
  error: '#FF4757',
  success: '#2ED573',
  warning: '#FFA502',

  // 卡片
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.06)',

  // 输入
  inputBg: '#F0F0F0',
  overlay: 'rgba(0,0,0,0.4)',

  // 标签
  tagBg: '#F0F0F0',
  tagText: '#666666',

  // 骨架屏
  skeleton: '#EBEBEB',
};

export const DarkTheme = {
  // 表面 — 纯中性暗，无蓝色倾向
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceHover: '#222222',
  navBg: '#111111',
  navBorder: '#222222',

  // 文字
  text: '#F0F0F0',
  textSecondary: '#A0A0A0',
  textHint: '#666666',

  // 边框 / 分割
  border: '#2A2A2A',
  divider: '#222222',

  // 强调色 — 暗底稍提亮
  accent: '#7B7FFF',
  accentDark: '#6A6EE8',
  accentLight: '#1A1A30',
  accentGradStart: '#7B7FFF',
  accentGradEnd: '#C084FC',

  // 功能色
  gold: '#F5A623',
  error: '#FF6B7A',
  success: '#4CD97B',
  warning: '#FFB74D',

  // 卡片
  cardBg: '#1A1A1A',
  cardShadow: 'rgba(0,0,0,0.4)',

  // 输入
  inputBg: '#1E1E1E',
  overlay: 'rgba(0,0,0,0.6)',

  // 标签
  tagBg: '#1E1E1E',
  tagText: '#A0A0A0',

  // 骨架屏
  skeleton: '#2A2A2A',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;
