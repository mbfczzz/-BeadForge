import { wp, fp } from '../utils/responsive';

/** moely 风格间距 - 紧凑但不拥挤 */
export const Spacing = {
  xs: wp(5),
  sm: wp(10),
  md: wp(15),
  lg: wp(20),
  xl: wp(30),
  xxl: wp(50),
};

/** moely 字体尺寸 - 12/13/14/15/18/20 */
export const FontSize = {
  xs: fp(12),
  sm: fp(13),
  md: fp(14),
  lg: fp(15),
  xl: fp(18),
  xxl: fp(20),
  title: fp(18),
};

/** moely 圆角 - 小圆角风格 */
export const BorderRadius = {
  sm: wp(4),
  md: wp(8),
  lg: wp(10),
  xl: wp(15),
  full: wp(50),
};
