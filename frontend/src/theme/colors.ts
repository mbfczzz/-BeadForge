/**
 * 高级画廊风 - 莫兰迪色调 + 精致对比度
 */
export const LightTheme = {
  bg: '#F7F7FB',
  surface: '#FFFFFF',
  surfaceHover: '#F9F9FD',
  navBg: '#FFFFFF',
  navBorder: '#EDEDF3',
  text: '#1B1B2F',
  textSecondary: '#4A4A68',
  textHint: '#9C9CB8',
  border: '#E6E6F0',
  accent: '#6366F1',       // indigo-500
  accentDark: '#4F46E5',
  accentLight: '#EEF2FF',
  accentGradStart: '#6366F1',
  accentGradEnd: '#A855F7', // purple
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(99,102,241,0.08)',
  inputBg: '#F1F1F8',
  overlay: 'rgba(27,27,47,0.5)',
  divider: '#F0F0F6',
  tagBg: '#F1F1F8',
  tagText: '#6366F1',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  bannerBg: '#FFFFFF',
  cardOverlay: 'rgba(0,0,0,0.02)',
  skeleton: '#E8E8F0',
};

export const DarkTheme = {
  bg: '#0C0C1D',
  surface: '#161631',
  surfaceHover: '#1E1E40',
  navBg: '#12122A',
  navBorder: '#1E1E3A',
  text: '#F0F0F8',
  textSecondary: '#A8A8C8',
  textHint: '#5C5C7A',
  border: '#222244',
  accent: '#818CF8',       // indigo-400
  accentDark: '#6366F1',
  accentLight: '#1A1A40',
  accentGradStart: '#818CF8',
  accentGradEnd: '#C084FC',
  cardBg: '#161631',
  cardShadow: 'rgba(0,0,0,0.5)',
  inputBg: '#1E1E3A',
  overlay: 'rgba(0,0,0,0.75)',
  divider: '#1E1E3A',
  tagBg: '#1E1E3A',
  tagText: '#818CF8',
  error: '#F87171',
  success: '#4ADE80',
  warning: '#FBBF24',
  bannerBg: '#161631',
  cardOverlay: 'rgba(255,255,255,0.02)',
  skeleton: '#222244',
};

export type ThemeColors = typeof LightTheme;
export const Colors = LightTheme;
