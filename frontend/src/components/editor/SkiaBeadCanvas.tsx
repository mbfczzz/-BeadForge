import React, { forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import {
  Canvas, Group, Path, Skia,
} from '@shopify/react-native-skia';
import {
  GestureDetector, Gesture,
} from 'react-native-gesture-handler';
import {
  useSharedValue, useDerivedValue, withTiming, runOnJS,
} from 'react-native-reanimated';

/**
 * Skia 画布底座（替代 View-per-bead 的 CanvasGrid）
 *
 * 关键设计：
 * - 单 <Canvas>，珠子按颜色批量合并成 ~N 条 Skia Path（N = 调色板色数，~36），
 *   而不是 cols×rows 个 React 节点。100×100 也只发 36 次绘制，60fps 无压力。
 * - <Group> 上挂 transform={[translate, scale]}，拖动/缩放只动一次矩阵，
 *   不重建 Path，GPU 直接放缩。
 * - 单指拖 = 画珠（最大 1 指）；双指 = 平移 + 缩放（最少 2 指）。
 *   依赖 maxPointers/minPointers 自动互斥，不需手动 race。
 *
 * 父组件传：grid + onCellPaint(row,col)。本组件不持有 grid 状态，画完
 * 立即通过 onCellPaint 反馈给父，由父 setState 引起重渲（仅 Path 重建，
 * 还是单 Canvas，仍快）。
 */

export interface SkiaBeadCanvasHandle {
  /** 复位：回到 scale=1, 平移=0 */
  reset: () => void;
}

export interface SkiaBeadCanvasProps {
  grid: string[][];
  cols: number;
  rows: number;
  /** 画布显示宽 / 高（同时也是 Skia Canvas 节点尺寸） */
  width: number;
  height: number;
  /** 是否画网格线 + 每 10 格加粗 */
  showGridLine: boolean;
  /** 画布背景色 */
  bgColor: string;
  /** 网格线颜色（细线 / 主线共用，主线靠加粗区分） */
  gridColor: string;
  /** 用户在 (row, col) 单元上交互（按下或拖入新格） */
  onCellPaint: (row: number, col: number) => void;
  /** 当前 hover 格变化（拖动期间）。null 表示离开画布 */
  onCellHover?: (row: number | null, col: number | null) => void;
  /** 单指开始绘制 / 结束。父用来禁用外层 ScrollView 的滚动 */
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  /** 生成中等场景下禁用全部交互 */
  enabled?: boolean;
  /** 画笔大小（1/3/5）。仅影响 hover 高亮显示，实际绘制目标由父组件计算 */
  brushSize?: number;
  /** 对称模式：开了之后 hover 高亮会同步显示镜像位置 */
  mirrorX?: boolean;
  mirrorY?: boolean;
  /** hover 高亮颜色（一般传 accent 色） */
  hoverColor?: string;
}

export const SkiaBeadCanvas = forwardRef<SkiaBeadCanvasHandle, SkiaBeadCanvasProps>((props, ref) => {
  const {
    grid, cols, rows, width, height,
    showGridLine, bgColor, gridColor,
    onCellPaint, onCellHover, onDrawStart, onDrawEnd,
    enabled = true,
    brushSize = 1, mirrorX = false, mirrorY = false,
    hoverColor = '#4B78FF',
  } = props;

  // 等比缩放珠子大小：让整个 grid 居中铺满 viewport 短边
  const cellSize = useMemo(() => {
    const cw = width / cols;
    const ch = height / rows;
    return Math.min(cw, ch);
  }, [width, height, cols, rows]);
  const contentW = cellSize * cols;
  const contentH = cellSize * rows;
  const offsetX = (width - contentW) / 2;
  const offsetY = (height - contentH) / 2;

  // 用户交互的缩放/平移
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    reset: () => {
      scale.value = withTiming(1, { duration: 200 });
      tx.value = withTiming(0, { duration: 200 });
      ty.value = withTiming(0, { duration: 200 });
    },
  }));

  // 把 grid 按颜色聚合成 N 条 Path，每条包含该色所有珠子的圆角矩形。
  // 比逐颗 <Rect> 快一个数量级（避免 React 在 N² 节点上 reconcile）
  const colorPaths = useMemo(() => {
    const map = new Map<string, ReturnType<typeof Skia.Path.Make>>();
    const inset = Math.max(cellSize * 0.05, 0.3); // 留一点缝看出珠粒
    const r = cellSize * 0.45;
    for (let row = 0; row < rows; row++) {
      const line = grid[row];
      if (!line) continue;
      for (let col = 0; col < cols; col++) {
        const color = line[col];
        if (!color || color === 'transparent') continue;
        let p = map.get(color);
        if (!p) { p = Skia.Path.Make(); map.set(color, p); }
        const rect = Skia.XYWHRect(
          col * cellSize + inset,
          row * cellSize + inset,
          cellSize - inset * 2,
          cellSize - inset * 2,
        );
        p.addRRect(Skia.RRectXY(rect, r, r));
      }
    }
    return Array.from(map.entries());
  }, [grid, rows, cols, cellSize]);

  // 网格线：细线 + 每 10 格加粗
  const gridPaths = useMemo(() => {
    if (!showGridLine) return null;
    const minor = Skia.Path.Make();
    const major = Skia.Path.Make();
    for (let c = 0; c <= cols; c++) {
      const path = c % 10 === 0 ? major : minor;
      path.moveTo(c * cellSize, 0);
      path.lineTo(c * cellSize, contentH);
    }
    for (let r = 0; r <= rows; r++) {
      const path = r % 10 === 0 ? major : minor;
      path.moveTo(0, r * cellSize);
      path.lineTo(contentW, r * cellSize);
    }
    return { minor, major };
  }, [showGridLine, cellSize, cols, rows, contentW, contentH]);

  // 边框（整个 grid 的外框）
  const borderPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.addRect(Skia.XYWHRect(0, 0, contentW, contentH));
    return p;
  }, [contentW, contentH]);

  // 屏幕坐标 → 网格坐标（worklet，跑在 UI 线程）
  const screenToCell = useCallback((screenX: number, screenY: number): [number, number] | null => {
    'worklet';
    const localX = (screenX - offsetX - tx.value) / scale.value;
    const localY = (screenY - offsetY - ty.value) / scale.value;
    const c = Math.floor(localX / cellSize);
    const r = Math.floor(localY / cellSize);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return [r, c];
  }, [offsetX, offsetY, cellSize, rows, cols, tx, ty, scale]);

  // hover 状态：当前手指所在的 (row, col)。-1 = 没在画布上。
  // 用 SharedValue 让 hover 高亮跟着手指走时不走 JS（UI 线程绘制）。
  const hoverRow = useSharedValue(-1);
  const hoverCol = useSharedValue(-1);

  const fireHover = useCallback((r: number | null, c: number | null) => {
    if (onCellHover) onCellHover(r, c);
  }, [onCellHover]);

  // 单指拖 = 画。maxPointers(1) 自动避开双指手势
  const lastCellKey = useSharedValue<string>('');
  const drawGesture = useMemo(() => Gesture.Pan()
    .maxPointers(1)
    .minDistance(0)
    .enabled(enabled)
    .onBegin((e) => {
      const cell = screenToCell(e.x, e.y);
      if (!cell) return;
      lastCellKey.value = `${cell[0]},${cell[1]}`;
      hoverRow.value = cell[0];
      hoverCol.value = cell[1];
      if (onDrawStart) runOnJS(onDrawStart)();
      runOnJS(onCellPaint)(cell[0], cell[1]);
      runOnJS(fireHover)(cell[0], cell[1]);
    })
    .onUpdate((e) => {
      const cell = screenToCell(e.x, e.y);
      if (!cell) {
        // 拖出画布外：hover 高亮藏起来，但保留拖拽手势（拖回来还能继续画）
        if (hoverRow.value !== -1) {
          hoverRow.value = -1;
          hoverCol.value = -1;
          runOnJS(fireHover)(null, null);
        }
        lastCellKey.value = '';
        return;
      }
      const k = `${cell[0]},${cell[1]}`;
      if (k === lastCellKey.value) return;
      lastCellKey.value = k;
      hoverRow.value = cell[0];
      hoverCol.value = cell[1];
      runOnJS(onCellPaint)(cell[0], cell[1]);
      runOnJS(fireHover)(cell[0], cell[1]);
    })
    .onFinalize(() => {
      hoverRow.value = -1;
      hoverCol.value = -1;
      runOnJS(fireHover)(null, null);
      if (onDrawEnd) runOnJS(onDrawEnd)();
    }), [enabled, screenToCell, onCellPaint, onDrawStart, onDrawEnd, lastCellKey, hoverRow, hoverCol, fireHover]);

  // 双指捏合：缩放
  const pinchGesture = useMemo(() => Gesture.Pinch()
    .enabled(enabled)
    .onBegin(() => { savedScale.value = scale.value; })
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.max(0.5, Math.min(8, next));
    }), [enabled, scale, savedScale]);

  // 双指拖：平移（minPointers(2) 让单指走 drawGesture）
  const twoFingerPan = useMemo(() => Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .enabled(enabled)
    .onBegin(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    }), [enabled, tx, ty, savedTx, savedTy]);

  // 三个手势同时活动：单指画 vs 双指捏 / 平移，靠 pointer 数自动互斥
  const composed = useMemo(
    () => Gesture.Simultaneous(drawGesture, pinchGesture, twoFingerPan),
    [drawGesture, pinchGesture, twoFingerPan],
  );

  // 画布组的 transform = 居中 offset + 用户平移 + 缩放
  const transform = useDerivedValue(() => [
    { translateX: offsetX + tx.value },
    { translateY: offsetY + ty.value },
    { scale: scale.value },
  ]);

  // 网格线在缩放后保持视觉 1px / 2px
  const minorWidth = useDerivedValue(() => 1 / scale.value);
  const majorWidth = useDerivedValue(() => 2 / scale.value);
  // hover 高亮线宽（视觉 2px）
  const hoverWidth = useDerivedValue(() => 2 / scale.value);

  // hover 高亮 path：根据 brushSize + mirror 实时算出要圈的所有格子
  const hoverPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const r0 = hoverRow.value;
    const c0 = hoverCol.value;
    if (r0 < 0 || c0 < 0) return path;
    const radius = Math.floor((brushSize - 1) / 2);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const baseR = r0 + dy;
        const baseC = c0 + dx;
        if (baseR < 0 || baseR >= rows || baseC < 0 || baseC >= cols) continue;
        path.addRect(Skia.XYWHRect(baseC * cellSize, baseR * cellSize, cellSize, cellSize));
        if (mirrorX) {
          const mc = cols - 1 - baseC;
          if (mc !== baseC) {
            path.addRect(Skia.XYWHRect(mc * cellSize, baseR * cellSize, cellSize, cellSize));
          }
        }
        if (mirrorY) {
          const mr = rows - 1 - baseR;
          if (mr !== baseR) {
            path.addRect(Skia.XYWHRect(baseC * cellSize, mr * cellSize, cellSize, cellSize));
          }
        }
        if (mirrorX && mirrorY) {
          const mr = rows - 1 - baseR;
          const mc = cols - 1 - baseC;
          if (mr !== baseR && mc !== baseC) {
            path.addRect(Skia.XYWHRect(mc * cellSize, mr * cellSize, cellSize, cellSize));
          }
        }
      }
    }
    return path;
  });

  return (
    <GestureDetector gesture={composed}>
      <View style={{ width, height, backgroundColor: bgColor }}>
        <Canvas style={{ width, height }}>
          <Group transform={transform}>
            {/* 网格外框 */}
            <Path path={borderPath} color={gridColor} style="stroke" strokeWidth={minorWidth} />
            {/* 珠子（按颜色批量） */}
            {colorPaths.map(([color, path]) => (
              <Path key={color} path={path} color={color} />
            ))}
            {/* 网格线 */}
            {gridPaths && (
              <>
                <Path path={gridPaths.minor} color={gridColor} style="stroke" strokeWidth={minorWidth} opacity={0.4} />
                <Path path={gridPaths.major} color={gridColor} style="stroke" strokeWidth={majorWidth} opacity={0.7} />
              </>
            )}
            {/* hover 高亮：画笔 footprint + 镜像位置 */}
            <Path path={hoverPath} color={hoverColor} style="stroke" strokeWidth={hoverWidth} />
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
});

SkiaBeadCanvas.displayName = 'SkiaBeadCanvas';
