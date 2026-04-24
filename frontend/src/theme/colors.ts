/**
 * BeadForge 配色 — 白色 + 淡蓝色 + 简洁风格
 */
export const LightTheme = {
  // 表面
  bg: '#F7FAFF',
  surface: '#FFFFFF',
  surfaceHover: '#F4F8FF',
  navBg: '#FFFFFF',
  navBorder: '#E4ECF7',

  // 文字
  text: '#16324F',
  textSecondary: '#4C6987',
  textHint: '#7F96B2',

  // 边框 / 分割
  border: '#DCE7F5',
  divider: '#EAF1FA',

  // 强调色
  accent: '#4A90FF',
  accentDark: '#3379E6',
  accentLight: '#EAF3FF',
  accentGradStart: '#4A90FF',
  accentGradEnd: '#8FC1FF',

  // 功能色
  gold: '#F5B545',
  error: '#FF5E73',
  success: '#2BBF88',
  warning: '#FFB648',

  // 卡片
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(25,67,118,0.08)',

  // 输入
  inputBg: '#F3F7FD',
  overlay: 'rgba(14, 29, 53, 0.38)',

  // 标签
  tagBg: '#EFF5FD',
  tagText: '#4C6987',

  // 骨架屏
  skeleton: '#E5EEF9',
};

export const DarkTheme = {
  // 表面
  bg: '#07111F',
  surface: '#0F1D31',
  surfaceHover: '#14253D',
  navBg: '#0C1728',
  navBorder: '#182A44',

  // 文字
  text: '#EEF5FF',
  textSecondary: '#AEC3DB',
  textHint: '#7890AD',

  // 边框 / 分割
  border: '#1E324F',
  divider: '#16263D',

  // 强调色
  accent: '#76B2FF',
  accentDark: '#5A9CFF',
  accentLight: '#13263F',
  accentGradStart: '#76B2FF',
  accentGradEnd: '#A1D0FF',

  // 功能色
  gold: '#F5C05A',
  error: '#FF7B8E',
  success: '#4AD7A3',
  warning: '#FFC466',

  // 卡片
  cardBg: '#0F1D31',
  cardShadow: 'rgba(0,0,0,0.42)',

  // 输入
  inputBg: '#13233A',
  overlay: 'rgba(0,0,0,0.56)',

  // 标签
  tagBg: '#13233A',
  tagText: '#AEC3DB',

  // 骨架屏
  skeleton: '#1A2C46',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;
