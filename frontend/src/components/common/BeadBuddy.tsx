import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';

/**
 * BeadBuddy — BeadForge 的吉祥物。
 *
 * 视觉：一颗"拟物化"的拼豆珠子，有：
 *   - 糖果色底（可换）
 *   - 顶部白色高光（candy shine）
 *   - 底部浅影（阴影内嵌）
 *   - 两只笑眯眯的眼睛 + 粉嫩腮红 + 小嘴
 *
 * 用于：空态、加载欢迎屏、登录引导、成就弹窗等。
 */

export type BuddyMood =
  | 'happy'      // 普通笑眯眯
  | 'love'       // 心形眼
  | 'wink'       // 单眼眨
  | 'sleep'      // 休息
  | 'sparkle'    // 兴奋（闪亮眼）
  | 'cry';       // 难过（用于错误态）

interface Props {
  size?: number;
  /** 糖果色主题：pink / peach / mint / lavender / sky / cream */
  color?: string;
  /** 心情表情 */
  mood?: BuddyMood;
  style?: any;
}

export const BeadBuddy: React.FC<Props> = ({
  size = 120,
  color = '#FFB4C6',
  mood = 'happy',
  style,
}) => {
  // 稍偏暖的颜色做阴影
  const shadowColor = darken(color, 0.25);

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* 主体渐变（顶亮底暗） */}
          <RadialGradient id="body" cx="50%" cy="35%" r="70%">
            <Stop offset="0%" stopColor={lighten(color, 0.2)} stopOpacity={1} />
            <Stop offset="70%" stopColor={color} stopOpacity={1} />
            <Stop offset="100%" stopColor={shadowColor} stopOpacity={1} />
          </RadialGradient>
          {/* 顶部高光 */}
          <RadialGradient id="shine" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* 底部投影（踩在地面上） */}
        <Ellipse cx="50" cy="92" rx="28" ry="3.5" fill="rgba(0,0,0,0.1)" />

        {/* 主体球（拼豆珠造型 — 中间稍扁，带环状切面暗示） */}
        <Circle cx="50" cy="50" r="36" fill="url(#body)" />

        {/* 环状切面（拼豆特征 — 上下各一条暗纹） */}
        <Ellipse cx="50" cy="36" rx="34" ry="3" fill={shadowColor} opacity={0.15} />
        <Ellipse cx="50" cy="64" rx="34" ry="3" fill={shadowColor} opacity={0.15} />

        {/* 顶部椭圆高光 */}
        <Ellipse cx="42" cy="30" rx="14" ry="8" fill="url(#shine)" />

        {/* 腮红 */}
        <Ellipse cx="30" cy="58" rx="5" ry="3" fill="#FF6B9D" opacity={0.4} />
        <Ellipse cx="70" cy="58" rx="5" ry="3" fill="#FF6B9D" opacity={0.4} />

        {/* 表情 */}
        <Face mood={mood} />
      </Svg>
    </View>
  );
};

/** 不同心情表情 */
const Face: React.FC<{ mood: BuddyMood }> = ({ mood }) => {
  switch (mood) {
    case 'love':
      return (
        <G>
          <Heart cx={38} cy={48} />
          <Heart cx={62} cy={48} />
          <Smile />
        </G>
      );
    case 'wink':
      return (
        <G>
          {/* 左眼闭 */}
          <Path d="M34 48 Q38 52 42 48" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* 右眼开 */}
          <Circle cx="62" cy="48" r="2.5" fill="#3D2F3D" />
          <Smile />
        </G>
      );
    case 'sleep':
      return (
        <G>
          <Path d="M34 48 Q38 52 42 48" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M58 48 Q62 52 66 48" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* Zzz */}
          <Path d="M72 32 L78 32 L72 40 L78 40" stroke="#3D2F3D" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </G>
      );
    case 'sparkle':
      return (
        <G>
          {/* 闪亮星形眼睛 */}
          <Star cx={38} cy={48} size={4} />
          <Star cx={62} cy={48} size={4} />
          <OpenMouth />
        </G>
      );
    case 'cry':
      return (
        <G>
          {/* 眯眯眼 */}
          <Path d="M33 46 L43 50" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M57 50 L67 46" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* 泪滴 */}
          <Path d="M40 53 Q38 60 40 65 Q42 60 40 53 Z" fill="#7EC8FF" />
          <Path d="M60 53 Q58 60 60 65 Q62 60 60 53 Z" fill="#7EC8FF" />
          {/* 嘟嘴 */}
          <Ellipse cx="50" cy="66" rx="3" ry="2" fill="#FF6B9D" />
        </G>
      );
    case 'happy':
    default:
      return (
        <G>
          <Circle cx="38" cy="48" r="2.5" fill="#3D2F3D" />
          <Circle cx="62" cy="48" r="2.5" fill="#3D2F3D" />
          <Smile />
        </G>
      );
  }
};

const Smile: React.FC = () => (
  <Path d="M42 60 Q50 67 58 60" stroke="#3D2F3D" strokeWidth={2.5} strokeLinecap="round" fill="none" />
);

const OpenMouth: React.FC = () => (
  <Ellipse cx="50" cy="62" rx="5" ry="4" fill="#3D2F3D" />
);

const Heart: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <Path
    d={`M ${cx} ${cy + 3}
        Q ${cx - 4} ${cy - 2} ${cx - 4} ${cy - 1}
        A 2.2 2.2 0 0 1 ${cx} ${cy - 1}
        A 2.2 2.2 0 0 1 ${cx + 4} ${cy - 1}
        Q ${cx + 4} ${cy - 2} ${cx} ${cy + 3} Z`}
    fill="#FF6B9D"
  />
);

const Star: React.FC<{ cx: number; cy: number; size: number }> = ({ cx, cy, size }) => {
  // 简化五角星
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? size : size / 2;
    const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return <Path d={`M ${pts.join(' L ')} Z`} fill="#FFD94A" />;
};

/** 颜色工具 — 简易 lighten/darken（假设 #RRGGBB 格式） */
function lighten(hex: string, amt: number): string {
  return adjust(hex, amt);
}
function darken(hex: string, amt: number): string {
  return adjust(hex, -amt);
}
function adjust(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const r = clamp(parseInt(h.slice(0, 2), 16) + Math.round(255 * amt));
  const g = clamp(parseInt(h.slice(2, 4), 16) + Math.round(255 * amt));
  const b = clamp(parseInt(h.slice(4, 6), 16) + Math.round(255 * amt));
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function clamp(n: number): number { return Math.max(0, Math.min(255, n)); }
function toHex(n: number): string { return n.toString(16).padStart(2, '0'); }

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
