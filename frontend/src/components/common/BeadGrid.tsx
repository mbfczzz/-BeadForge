import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  /** 像素矩阵：二维数组，每个元素是颜色字符串 */
  pixels: string[][];
  /** 单个珠子大小 */
  beadSize?: number;
  /** 珠子间距 */
  gap?: number;
  /** 圆形珠子 */
  round?: boolean;
}

/**
 * 拼豆像素网格渲染组件 - 将二维颜色矩阵渲染为珠子网格
 */
export const BeadGrid: React.FC<Props> = ({ pixels, beadSize = 8, gap = 1, round = true }) => {
  return (
    <View style={styles.grid}>
      {pixels.map((row, y) => (
        <View key={y} style={[styles.row, { gap }]}>
          {row.map((color, x) => (
            <View
              key={x}
              style={{
                width: beadSize,
                height: beadSize,
                borderRadius: round ? beadSize / 2 : 1,
                backgroundColor: color,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

/** 预设拼豆图案 - 爱心 */
export const HEART_PATTERN: string[][] = [
  ['transparent','transparent','#FF4444','#FF4444','transparent','transparent','#FF4444','#FF4444','transparent','transparent'],
  ['transparent','#FF4444','#FF6666','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','transparent'],
  ['#FF4444','#FF6666','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444'],
  ['#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444'],
  ['#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444'],
  ['transparent','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','transparent'],
  ['transparent','transparent','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','#FF4444','transparent','transparent'],
  ['transparent','transparent','transparent','#FF4444','#FF4444','#FF4444','#FF4444','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#FF4444','#FF4444','transparent','transparent','transparent','transparent'],
];

/** 预设拼豆图案 - 蘑菇 */
export const MUSHROOM_PATTERN: string[][] = [
  ['transparent','transparent','transparent','#FF0000','#FF0000','#FF0000','#FF0000','transparent','transparent','transparent'],
  ['transparent','transparent','#FF0000','#FF0000','#FFFFFF','#FF0000','#FFFFFF','#FF0000','transparent','transparent'],
  ['transparent','#FF0000','#FF0000','#FFFFFF','#FFFFFF','#FF0000','#FFFFFF','#FFFFFF','#FF0000','transparent'],
  ['transparent','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','transparent'],
  ['#FF0000','#FF0000','#FFFFFF','#FF0000','#FF0000','#FF0000','#FF0000','#FFFFFF','#FF0000','#FF0000'],
  ['transparent','transparent','transparent','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','transparent','transparent','transparent'],
  ['transparent','transparent','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','transparent','transparent'],
  ['transparent','transparent','#F5DEB3','#F5DEB3','#8B4513','#8B4513','#F5DEB3','#F5DEB3','transparent','transparent'],
  ['transparent','transparent','transparent','#F5DEB3','#F5DEB3','#F5DEB3','#F5DEB3','transparent','transparent','transparent'],
];

/** 预设拼豆图案 - 星星 */
export const STAR_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#FFD700','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#FFD700','#FFD700','#FFD700','transparent','transparent','transparent'],
  ['#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700'],
  ['transparent','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','transparent'],
  ['transparent','transparent','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','transparent','transparent'],
  ['transparent','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','transparent'],
  ['#FFD700','#FFD700','#FFD700','transparent','#FFD700','transparent','#FFD700','#FFD700','#FFD700'],
  ['#FFD700','#FFD700','transparent','transparent','transparent','transparent','transparent','#FFD700','#FFD700'],
  ['#FFD700','transparent','transparent','transparent','transparent','transparent','transparent','transparent','#FFD700'],
];

/** 预设拼豆图案 - 小花 */
export const FLOWER_PATTERN: string[][] = [
  ['transparent','transparent','#FF69B4','#FF69B4','transparent','#FF69B4','#FF69B4','transparent','transparent'],
  ['transparent','#FF69B4','#FFB6C1','#FF69B4','transparent','#FF69B4','#FFB6C1','#FF69B4','transparent'],
  ['#FF69B4','#FFB6C1','#FF69B4','#FFD700','#FFD700','#FFD700','#FF69B4','#FFB6C1','#FF69B4'],
  ['#FF69B4','#FF69B4','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FF69B4','#FF69B4'],
  ['transparent','transparent','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','transparent','transparent'],
  ['#FF69B4','#FF69B4','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FF69B4','#FF69B4'],
  ['#FF69B4','#FFB6C1','#FF69B4','#FFD700','#FFD700','#FFD700','#FF69B4','#FFB6C1','#FF69B4'],
  ['transparent','#FF69B4','#FFB6C1','#FF69B4','#228B22','#FF69B4','#FFB6C1','#FF69B4','transparent'],
  ['transparent','transparent','#FF69B4','#FF69B4','#228B22','#FF69B4','#FF69B4','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#228B22','transparent','transparent','transparent','transparent'],
];

/** 预设拼豆图案 - 小猫 */
export const CAT_PATTERN: string[][] = [
  ['transparent','#FFA500','#FFA500','transparent','transparent','transparent','#FFA500','#FFA500','transparent'],
  ['#FFA500','#FFD700','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFD700','#FFA500'],
  ['#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500'],
  ['#FFA500','#FFA500','#333333','#FFA500','#FFA500','#FFA500','#333333','#FFA500','#FFA500'],
  ['#FFA500','#FFA500','#FFA500','#FFA500','#FF69B4','#FFA500','#FFA500','#FFA500','#FFA500'],
  ['#FFA500','#FFA500','#FFA500','#333333','#333333','#333333','#FFA500','#FFA500','#FFA500'],
  ['transparent','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','transparent'],
  ['transparent','transparent','#FFA500','#FFA500','#FFA500','#FFA500','#FFA500','transparent','transparent'],
];

const styles = StyleSheet.create({
  grid: { alignItems: 'center', gap: 1 },
  row: { flexDirection: 'row' },
});
