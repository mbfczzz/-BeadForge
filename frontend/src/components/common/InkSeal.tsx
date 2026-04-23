import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * InkSeal — 国风红方印章组件。
 *
 * 视觉：朱砂底 + 白字 + 微旋转（-6° 默认，模拟手工盖章的自然偏）。
 * 用于：brand 旁点缀、完成/成就弹印、登录欢迎、创作完成、作品详情标记。
 *
 * 尺寸建议：wp(20)~wp(32)；单字或双字效果最好。
 */

interface Props {
  /** 印章文字，1~2 个汉字最佳 */
  text: string;
  size?: number;
  /** 印章底色，默认朱砂红 */
  color?: string;
  /** 旋转角度（度），默认 -6 */
  rotate?: number;
  /** 边框粗细比例（相对 size） */
  borderRatio?: number;
  style?: any;
}

export const InkSeal: React.FC<Props> = ({
  text,
  size = 28,
  color = '#C8302B',
  rotate = -6,
  borderRatio = 0.08,
  style,
}) => {
  const borderWidth = Math.max(1.5, Math.round(size * borderRatio));
  // 双字用正方形 grid；单字居中
  const chars = Array.from(text).slice(0, 4);
  const isDouble = chars.length === 2;
  const fontSize = isDouble ? size * 0.44 : size * 0.58;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: Math.max(2, size * 0.12),
          backgroundColor: color,
          borderColor: color,
          borderWidth,
          // 留一圈"内嵌白边"模拟印章刻痕
          padding: borderWidth * 0.6,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: `${rotate}deg` }],
          // 微阴影模拟墨迹浸润
          shadowColor: color,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.35,
          shadowRadius: 3,
          elevation: 3,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          alignSelf: 'stretch',
          borderWidth: borderWidth * 0.5,
          borderColor: 'rgba(255,255,255,0.92)',
          borderRadius: Math.max(1, size * 0.06),
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {chars.map((c, i) => (
          <Text
            key={i}
            style={{
              color: '#fff',
              fontSize,
              fontWeight: '900',
              letterSpacing: 0,
              // 每字占一半宽度（双字时）
              width: isDouble ? '50%' : undefined,
              textAlign: 'center',
              includeFontPadding: false,
            }}
          >
            {c}
          </Text>
        ))}
      </View>
    </View>
  );
};
