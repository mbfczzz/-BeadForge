import { wp, fp } from '../utils/responsive';

/** 间距 — 紧凑不拥挤 */
export const Spacing = {
  xs: wp(5),
  sm: wp(10),
  md: wp(15),
  lg: wp(20),
  xl: wp(30),
  xxl: wp(50),
};

/** 字号 */
export const FontSize = {
  xs: fp(12),
  sm: fp(13),
  md: fp(14),
  lg: fp(15),
  xl: fp(18),
  xxl: fp(20),
  title: fp(18),
};

/** 圆角 — 糖果马卡龙风更肥厚一点 */
export const BorderRadius = {
  sm: wp(8),       // 原 6 → 8，略肥
  md: wp(12),      // 原 10 → 12
  lg: wp(18),      // 原 14 → 18
  xl: wp(24),      // 原 18 → 24
  xxl: wp(32),     // 新：大气泡卡片
  bubble: wp(28),  // 新：胶囊/按钮
  full: wp(9999),  // 真正的 pill
};
