/**
 * 像素形状生成器：把"起点-终点"或"起点-半径"换成网格坐标列表。
 * 所有函数返回 Array<[row, col]>。后续可直接传给 cloneGrid → 落色逻辑。
 *
 * 命名约定：参数顺序是 (row, col) 而不是 (x, y)，统一全 App 的 grid[r][c] 顺序。
 */

type Cell = [number, number];

/**
 * Bresenham 直线：
 * 起止点之间的整格阶梯，标准像素艺术算法，不会跳格。
 */
export function lineCells(r0: number, c0: number, r1: number, c1: number): Cell[] {
  const out: Cell[] = [];
  let r = r0;
  let c = c0;
  const dr = Math.abs(r1 - r0);
  const dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1;
  const sc = c0 < c1 ? 1 : -1;
  let err = dc - dr;
  // 上限保护：防止极端坐标传入时跑飞
  const maxSteps = dr + dc + 2;
  for (let i = 0; i < maxSteps; i++) {
    out.push([r, c]);
    if (r === r1 && c === c1) break;
    const e2 = 2 * err;
    if (e2 > -dr) { err -= dr; c += sc; }
    if (e2 < dc) { err += dc; r += sr; }
  }
  return out;
}

/** 矩形：filled=true 实心，false 空心边框 */
export function rectCells(r0: number, c0: number, r1: number, c1: number, filled: boolean): Cell[] {
  const rMin = Math.min(r0, r1), rMax = Math.max(r0, r1);
  const cMin = Math.min(c0, c1), cMax = Math.max(c0, c1);
  const out: Cell[] = [];
  if (filled) {
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) out.push([r, c]);
    }
    return out;
  }
  // 空心：上下两条边 + 左右两条边（去除四角重复）
  for (let c = cMin; c <= cMax; c++) {
    out.push([rMin, c]);
    if (rMax !== rMin) out.push([rMax, c]);
  }
  for (let r = rMin + 1; r < rMax; r++) {
    out.push([r, cMin]);
    if (cMax !== cMin) out.push([r, cMax]);
  }
  return out;
}

/**
 * 椭圆 / 圆：起点到终点框出的内切椭圆（与矩形工具同样 drag 体验）。
 * filled=true 实心；空心走 midpoint 算法。
 */
export function ellipseCells(r0: number, c0: number, r1: number, c1: number, filled: boolean): Cell[] {
  const rMin = Math.min(r0, r1), rMax = Math.max(r0, r1);
  const cMin = Math.min(c0, c1), cMax = Math.max(c0, c1);
  const cy = (rMin + rMax) / 2;
  const cx = (cMin + cMax) / 2;
  const ry = (rMax - rMin) / 2;
  const rx = (cMax - cMin) / 2;
  const out: Cell[] = [];
  const seen = new Set<number>();
  const nC = cMax - cMin + 1;
  const push = (r: number, c: number) => {
    const ri = Math.round(r);
    const ci = Math.round(c);
    const k = ri * 100000 + ci;
    if (seen.has(k)) return;
    seen.add(k);
    out.push([ri, ci]);
  };

  if (rx <= 0 || ry <= 0) {
    // 退化为线段或点
    if (rx === 0 && ry === 0) return [[Math.round(cy), Math.round(cx)]];
    return lineCells(rMin, cMin, rMax, cMax);
  }

  if (filled) {
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const dy = (r - cy) / ry;
        const dx = (c - cx) / rx;
        if (dy * dy + dx * dx <= 1) out.push([r, c]);
      }
    }
    return out;
  }
  // 空心：参数化 t 从 0 到 2π，步长足够密保证连续
  const perim = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const steps = Math.max(16, Math.ceil(perim * 2));
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    push(cy + Math.sin(t) * ry, cx + Math.cos(t) * rx);
  }
  // 兜底：步长再密一遍，防止 1×N 极端椭圆漏点
  if (rx >= 1 && ry >= 1) {
    for (let dx = -rx; dx <= rx; dx += 0.5) {
      const dy = ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2));
      push(cy + dy, cx + dx);
      push(cy - dy, cx + dx);
    }
  }
  // 去掉边框范围外的点（数值误差导致的越界）
  return out.filter(([r, c]) => r >= rMin && r <= rMax && c >= cMin && c <= cMax);
}

/** 把目标 cells 加上 mirror（水平 / 垂直 / 双轴）。bounds 用于反算镜像位置 */
export function applyMirror(
  cells: Cell[],
  rows: number,
  cols: number,
  mirrorX: boolean,
  mirrorY: boolean,
): Cell[] {
  if (!mirrorX && !mirrorY) return cells;
  const out: Cell[] = [];
  const seen = new Set<number>();
  const push = (r: number, c: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    const k = r * cols + c;
    if (seen.has(k)) return;
    seen.add(k);
    out.push([r, c]);
  };
  for (const [r, c] of cells) {
    push(r, c);
    if (mirrorX) push(r, cols - 1 - c);
    if (mirrorY) push(rows - 1 - r, c);
    if (mirrorX && mirrorY) push(rows - 1 - r, cols - 1 - c);
  }
  return out;
}
