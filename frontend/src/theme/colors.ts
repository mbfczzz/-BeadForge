/**
 * moely 画廊风格 - 支持亮色/暗色主题
 */
export const LightTheme = {
  bg: '#F6F8FA',
  surface: '#FFFFFF',
  navBg: '#FFFFFF',
  navBorder: '#EAEAEA',
  text: '#333333',
  textSecondary: '#666666',
  textHint: '#999999',
  border: '#EAEAEA',
  accent: '#5B7FFF',
  accentLight: '#EEF2FF',
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.06)',
  inputBg: '#F0F2F5',
  overlay: 'rgba(0,0,0,0.4)',
  divider: '#F0F0F0',
  tagBg: '#F0F2F5',
  tagText: '#666666',
  error: '#E53935',
  success: '#43A047',
};

export const DarkTheme = {
  bg: '#1A1A2E',
  surface: '#232340',
  navBg: '#1E1E36',
  navBorder: '#2A2A45',
  text: '#E0E0E0',
  textSecondary: '#A0A0B0',
  textHint: '#6B6B80',
  border: '#2A2A45',
  accent: '#7B9FFF',
  accentLight: '#2A2A55',
  cardBg: '#232340',
  cardShadow: 'rgba(0,0,0,0.3)',
  inputBg: '#2A2A45',
  overlay: 'rgba(0,0,0,0.6)',
  divider: '#2A2A45',
  tagBg: '#2A2A45',
  tagText: '#A0A0B0',
  error: '#EF5350',
  success: '#66BB6A',
};

/** 默认使用亮色 */
export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;
