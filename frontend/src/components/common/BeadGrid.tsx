import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface Props {
  pixels: string[][];
  beadSize?: number;
  gap?: number;
  round?: boolean;
  /** 高光质感（大图预览开启，列表缩略图关闭以提升性能） */
  glossy?: boolean;
}

/**
 * 拼豆像素网格
 * - glossy=true: 带高光+阴影（用于详情页大预览）
 * - glossy=false: 纯色块（用于卡片缩略图，性能优先）
 */
export const BeadGrid = memo<Props>(({ pixels, beadSize = 8, gap = 1, round = true, glossy = false }) => {
  const r = round ? beadSize / 2 : 1;

  const rows = useMemo(() =>
    pixels.map((row, y) => (
      <View key={y} style={[styles.row, { gap }]}>
        {row.map((color, x) => {
          if (color === 'transparent') {
            return <View key={x} style={{ width: beadSize, height: beadSize }} />;
          }
          return (
            <View key={x} style={{
              width: beadSize, height: beadSize, borderRadius: r,
              backgroundColor: color,
            }}>
              {glossy && beadSize >= 8 && (
                <View style={{
                  position: 'absolute',
                  top: Math.max(beadSize * 0.15, 1),
                  left: Math.max(beadSize * 0.15, 1),
                  width: Math.max(beadSize * 0.28, 2),
                  height: Math.max(beadSize * 0.28, 2),
                  borderRadius: beadSize * 0.14,
                  backgroundColor: 'rgba(255,255,255,0.4)',
                }} />
              )}
            </View>
          );
        })}
      </View>
    )), [pixels, beadSize, gap, r, glossy]);

  return <View style={styles.grid}>{rows}</View>;
});

export const HEART_PATTERN: string[][] = [
  ['transparent','transparent','#EF4444','#EF4444','transparent','transparent','#EF4444','#EF4444','transparent','transparent'],
  ['transparent','#EF4444','#F87171','#EF4444','#EF4444','#EF4444','#EF4444','#EF4444','#EF4444','transparent'],
  ['#EF4444','#F87171','#EF4444','#DC2626','#DC2626','#DC2626','#DC2626','#EF4444','#EF4444','#EF4444'],
  ['#EF4444','#EF4444','#DC2626','#DC2626','#B91C1C','#B91C1C','#DC2626','#DC2626','#EF4444','#EF4444'],
  ['#EF4444','#DC2626','#DC2626','#B91C1C','#B91C1C','#B91C1C','#B91C1C','#DC2626','#DC2626','#EF4444'],
  ['transparent','#DC2626','#DC2626','#B91C1C','#B91C1C','#B91C1C','#B91C1C','#DC2626','#DC2626','transparent'],
  ['transparent','transparent','#DC2626','#B91C1C','#B91C1C','#B91C1C','#B91C1C','#DC2626','transparent','transparent'],
  ['transparent','transparent','transparent','#B91C1C','#991B1B','#991B1B','#B91C1C','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#991B1B','#991B1B','transparent','transparent','transparent','transparent'],
];

export const MUSHROOM_PATTERN: string[][] = [
  ['transparent','transparent','transparent','#EF4444','#EF4444','#EF4444','#EF4444','transparent','transparent','transparent'],
  ['transparent','transparent','#EF4444','#DC2626','#FAFAFA','#DC2626','#FAFAFA','#EF4444','transparent','transparent'],
  ['transparent','#EF4444','#DC2626','#FAFAFA','#F5F5F5','#DC2626','#FAFAFA','#F5F5F5','#EF4444','transparent'],
  ['transparent','#DC2626','#DC2626','#B91C1C','#DC2626','#B91C1C','#DC2626','#DC2626','#DC2626','transparent'],
  ['#DC2626','#B91C1C','#FAFAFA','#B91C1C','#B91C1C','#B91C1C','#B91C1C','#FAFAFA','#B91C1C','#DC2626'],
  ['transparent','transparent','transparent','#F5DEB3','#EED9A0','#EED9A0','#F5DEB3','transparent','transparent','transparent'],
  ['transparent','transparent','#F5DEB3','#EED9A0','#E8D08C','#E8D08C','#EED9A0','#F5DEB3','transparent','transparent'],
  ['transparent','transparent','#EED9A0','#E8D08C','#8B6914','#8B6914','#E8D08C','#EED9A0','transparent','transparent'],
  ['transparent','transparent','transparent','#E8D08C','#EED9A0','#EED9A0','#E8D08C','transparent','transparent','transparent'],
];

export const STAR_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#FBBF24','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#FBBF24','#FCD34D','#FBBF24','transparent','transparent','transparent'],
  ['#F59E0B','#FBBF24','#FBBF24','#FCD34D','#FDE68A','#FCD34D','#FBBF24','#FBBF24','#F59E0B'],
  ['transparent','#FBBF24','#FCD34D','#FDE68A','#FEF3C7','#FDE68A','#FCD34D','#FBBF24','transparent'],
  ['transparent','transparent','#FBBF24','#FCD34D','#FDE68A','#FCD34D','#FBBF24','transparent','transparent'],
  ['transparent','#F59E0B','#FBBF24','#FCD34D','#FDE68A','#FCD34D','#FBBF24','#F59E0B','transparent'],
  ['#D97706','#F59E0B','#FBBF24','transparent','#FBBF24','transparent','#FBBF24','#F59E0B','#D97706'],
  ['#D97706','#F59E0B','transparent','transparent','transparent','transparent','transparent','#F59E0B','#D97706'],
  ['#B45309','transparent','transparent','transparent','transparent','transparent','transparent','transparent','#B45309'],
];

export const FLOWER_PATTERN: string[][] = [
  ['transparent','transparent','#EC4899','#F472B6','transparent','#F472B6','#EC4899','transparent','transparent'],
  ['transparent','#EC4899','#F9A8D4','#EC4899','transparent','#EC4899','#F9A8D4','#EC4899','transparent'],
  ['#DB2777','#F9A8D4','#EC4899','#FBBF24','#FCD34D','#FBBF24','#EC4899','#F9A8D4','#DB2777'],
  ['#EC4899','#EC4899','#FBBF24','#FCD34D','#FDE68A','#FCD34D','#FBBF24','#EC4899','#EC4899'],
  ['transparent','transparent','#FBBF24','#FCD34D','#FEF3C7','#FCD34D','#FBBF24','transparent','transparent'],
  ['#EC4899','#EC4899','#FBBF24','#FCD34D','#FDE68A','#FCD34D','#FBBF24','#EC4899','#EC4899'],
  ['#DB2777','#F9A8D4','#EC4899','#FBBF24','#FCD34D','#FBBF24','#EC4899','#F9A8D4','#DB2777'],
  ['transparent','#EC4899','#F9A8D4','#EC4899','#16A34A','#EC4899','#F9A8D4','#EC4899','transparent'],
  ['transparent','transparent','#EC4899','#DB2777','#15803D','#DB2777','#EC4899','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#166534','transparent','transparent','transparent','transparent'],
];

export const CAT_PATTERN: string[][] = [
  ['transparent','#F97316','#FB923C','transparent','transparent','transparent','#FB923C','#F97316','transparent'],
  ['#F97316','#FCD34D','#F97316','#FB923C','#FB923C','#FB923C','#F97316','#FCD34D','#F97316'],
  ['#FB923C','#F97316','#FB923C','#FB923C','#FCD34D','#FB923C','#FB923C','#F97316','#FB923C'],
  ['#FB923C','#F97316','#1E1B2E','#F97316','#FB923C','#F97316','#1E1B2E','#F97316','#FB923C'],
  ['#F97316','#FB923C','#FB923C','#FB923C','#EC4899','#FB923C','#FB923C','#FB923C','#F97316'],
  ['#EA580C','#F97316','#FB923C','#1E1B2E','#1E1B2E','#1E1B2E','#FB923C','#F97316','#EA580C'],
  ['transparent','#EA580C','#F97316','#FB923C','#F97316','#FB923C','#F97316','#EA580C','transparent'],
  ['transparent','transparent','#EA580C','#F97316','#EA580C','#F97316','#EA580C','transparent','transparent'],
];

export const CHERRY_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#16A34A','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#22C55E','transparent','#22C55E','transparent','transparent','transparent'],
  ['transparent','transparent','#16A34A','transparent','transparent','transparent','#16A34A','transparent','transparent'],
  ['transparent','#15803D','transparent','transparent','transparent','transparent','transparent','#15803D','transparent'],
  ['transparent','transparent','#DC2626','#EF4444','transparent','#EF4444','#DC2626','transparent','transparent'],
  ['transparent','#DC2626','#F87171','#EF4444','transparent','#EF4444','#F87171','#DC2626','transparent'],
  ['transparent','#B91C1C','#DC2626','#B91C1C','transparent','#B91C1C','#DC2626','#B91C1C','transparent'],
  ['transparent','transparent','#991B1B','transparent','transparent','transparent','#991B1B','transparent','transparent'],
];

export const DIAMOND_PATTERN: string[][] = [
  ['transparent','transparent','transparent','transparent','#38BDF8','transparent','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','#38BDF8','#7DD3FC','#38BDF8','transparent','transparent','transparent'],
  ['transparent','transparent','#0EA5E9','#7DD3FC','#BAE6FD','#7DD3FC','#0EA5E9','transparent','transparent'],
  ['transparent','#0284C7','#0EA5E9','#BAE6FD','#E0F2FE','#BAE6FD','#0EA5E9','#0284C7','transparent'],
  ['transparent','transparent','#0284C7','#0EA5E9','#BAE6FD','#0EA5E9','#0284C7','transparent','transparent'],
  ['transparent','transparent','transparent','#0284C7','#0EA5E9','#0284C7','transparent','transparent','transparent'],
  ['transparent','transparent','transparent','transparent','#0369A1','transparent','transparent','transparent','transparent'],
];

export const RAINBOW_PATTERN: string[][] = [
  ['transparent','transparent','#EF4444','#EF4444','#EF4444','#EF4444','#EF4444','transparent','transparent'],
  ['transparent','#EF4444','#F97316','#F97316','#F97316','#F97316','#F97316','#EF4444','transparent'],
  ['#EF4444','#F97316','#FBBF24','#FBBF24','#FBBF24','#FBBF24','#FBBF24','#F97316','#EF4444'],
  ['#F97316','#FBBF24','#22C55E','#22C55E','#22C55E','#22C55E','#22C55E','#FBBF24','#F97316'],
  ['#FBBF24','#22C55E','#3B82F6','#3B82F6','#3B82F6','#3B82F6','#3B82F6','#22C55E','#FBBF24'],
  ['transparent','#3B82F6','#8B5CF6','#8B5CF6','#8B5CF6','#8B5CF6','#8B5CF6','#3B82F6','transparent'],
  ['transparent','transparent','#7C3AED','#7C3AED','transparent','#7C3AED','#7C3AED','transparent','transparent'],
];

export const ALL_PATTERNS = [
  HEART_PATTERN, CAT_PATTERN, MUSHROOM_PATTERN, FLOWER_PATTERN, STAR_PATTERN,
  CHERRY_PATTERN, DIAMOND_PATTERN, RAINBOW_PATTERN,
];

const styles = StyleSheet.create({
  grid: { alignItems: 'center', gap: 1 },
  row: { flexDirection: 'row' },
});
