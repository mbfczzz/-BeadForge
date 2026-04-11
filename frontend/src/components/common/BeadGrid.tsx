import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  pixels: string[][];
  beadSize?: number;
  gap?: number;
  round?: boolean;
}

/**
 * 拼豆像素网格 - memo + useMemo 双重优化
 */
export const BeadGrid = memo<Props>(({ pixels, beadSize = 8, gap = 1, round = true }) => {
  const radius = round ? beadSize / 2 : 1;

  const rows = useMemo(() =>
    pixels.map((row, y) => (
      <View key={y} style={[styles.row, { gap }]}>
        {row.map((color, x) => (
          <View
            key={x}
            style={{
              width: beadSize,
              height: beadSize,
              borderRadius: radius,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    )), [pixels, beadSize, gap, radius]);

  return <View style={styles.grid}>{rows}</View>;
});

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

export const CHERRY_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#228B22','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#228B22','transparent','#228B22','transparent','transparent','transparent'],
  ['transparent','transparent','#228B22','transparent','transparent','transparent','#228B22','transparent','transparent'],
  ['transparent','#228B22','transparent','transparent','transparent','transparent','transparent','#228B22','transparent'],
  ['transparent','transparent','#CC0000','#CC0000','transparent','#CC0000','#CC0000','transparent','transparent'],
  ['transparent','#CC0000','#FF2222','#CC0000','transparent','#CC0000','#FF2222','#CC0000','transparent'],
  ['transparent','#CC0000','#CC0000','#CC0000','transparent','#CC0000','#CC0000','#CC0000','transparent'],
  ['transparent','transparent','#CC0000','transparent','transparent','transparent','#CC0000','transparent','transparent'],
];

export const DIAMOND_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#00BFFF','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#00BFFF','#87CEEB','#00BFFF','transparent','transparent','transparent'],
  ['transparent','transparent','#00BFFF','#87CEEB','#E0F7FF','#87CEEB','#00BFFF','transparent','transparent'],
  ['transparent','#00BFFF','#87CEEB','#E0F7FF','#FFFFFF','#E0F7FF','#87CEEB','#00BFFF','transparent'],
  ['transparent','transparent','#00BFFF','#87CEEB','#E0F7FF','#87CEEB','#00BFFF','transparent','transparent'],
  ['transparent','transparent','transparent','#00BFFF','#87CEEB','#00BFFF','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#00BFFF','transparent','transparent','transparent','transparent'],
];

export const RAINBOW_PATTERN: string[][] = [
  ['transparent','transparent','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','transparent','transparent'],
  ['transparent','#FF0000','#FF6600','#FF6600','#FF6600','#FF6600','#FF6600','#FF0000','transparent'],
  ['#FF0000','#FF6600','#FFFF00','#FFFF00','#FFFF00','#FFFF00','#FFFF00','#FF6600','#FF0000'],
  ['#FF6600','#FFFF00','#00CC00','#00CC00','#00CC00','#00CC00','#00CC00','#FFFF00','#FF6600'],
  ['#FFFF00','#00CC00','#0066FF','#0066FF','#0066FF','#0066FF','#0066FF','#00CC00','#FFFF00'],
  ['transparent','#0066FF','#8B00FF','#8B00FF','#8B00FF','#8B00FF','#8B00FF','#0066FF','transparent'],
  ['transparent','transparent','#8B00FF','#8B00FF','transparent','#8B00FF','#8B00FF','transparent','transparent'],
];

export const ALL_PATTERNS = [
  HEART_PATTERN, CAT_PATTERN, MUSHROOM_PATTERN, FLOWER_PATTERN, STAR_PATTERN,
  CHERRY_PATTERN, DIAMOND_PATTERN, RAINBOW_PATTERN,
];

const styles = StyleSheet.create({
  grid: { alignItems: 'center', gap: 1 },
  row: { flexDirection: 'row' },
});
