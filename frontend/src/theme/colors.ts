/**
 * moely 画廊风格 - 优化配色
 */
export const LightTheme = {
  bg: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceHover: '#FAFAFA',
  navBg: 'rgba(255,255,255,0.92)',
  navBorder: 'rgba(0,0,0,0.06)',
  text: '#1A1A1A',
  textSecondary: '#555555',
  textHint: '#AAAAAA',
  border: '#E8E8E8',
  accent: '#5B7FFF',
  accentDark: '#4A6AE0',
  accentLight: '#EEF2FF',
  accentGradStart: '#5B7FFF',
  accentGradEnd: '#8B5CF6',
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.08)',
  inputBg: '#F0F2F5',
  overlay: 'rgba(0,0,0,0.5)',
  divider: '#F0F0F0',
  tagBg: '#F0F2F5',
  tagText: '#666666',
  error: '#E53935',
  success: '#43A047',
  bannerBg: '#FFFFFF',
  // 卡片悬停用
  cardOverlay: 'rgba(0,0,0,0.03)',
};

export const DarkTheme = {
  bg: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceHover: '#222240',
  navBg: 'rgba(15,15,26,0.95)',
  navBorder: 'rgba(255,255,255,0.06)',
  text: '#EAEAEA',
  textSecondary: '#B0B0C0',
  textHint: '#5A5A70',
  border: '#252540',
  accent: '#7B9FFF',
  accentDark: '#6B8FEF',
  accentLight: '#1A2040',
  accentGradStart: '#7B9FFF',
  accentGradEnd: '#A78BFA',
  cardBg: '#1A1A2E',
  cardShadow: 'rgba(0,0,0,0.4)',
  inputBg: '#252540',
  overlay: 'rgba(0,0,0,0.7)',
  divider: '#252540',
  tagBg: '#252540',
  tagText: '#8888A0',
  error: '#EF5350',
  success: '#66BB6A',
  bannerBg: '#1A1A2E',
  cardOverlay: 'rgba(255,255,255,0.02)',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;
