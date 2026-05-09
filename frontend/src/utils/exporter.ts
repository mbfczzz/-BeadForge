import { Skia, ImageFormat } from '@shopify/react-native-skia';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';

/**
 * 拼豆作品导出工具：PNG（1:1 像素图）+ PDF（购货清单 + 编号网格底图）
 *
 * - PNG：用 Skia 离屏 surface 直接画珠子（圆点），适合做"晒图 / 编辑后再加工"
 * - PDF：用 expo-print 渲染 HTML 出 PDF，包含两页：
 *     1) 网格底图：每 10 格加粗 + 行列编号，便于对照拼实物
 *     2) 颜色清单：色块 + hex + 数量，便于备料 / 购买
 */

const PNG_BEAD_PX_DEFAULT = 24; // 每颗珠子在 PNG 里有 24px，64×64 网格出图 1536×1536，够用

/* ──────────────── PNG 离屏渲染 ──────────────── */

/**
 * 把 grid 渲染为 PNG 字节流（Uint8Array）。
 * - beadPx: 每颗珠子的输出像素大小，默认 24（让 64×64 网格 ≈ 1536px 短边）
 * - 透明珠子留白；非透明珠子画圆形（拼豆的视觉标志）
 */
export function renderGridToPngBytes(grid: string[][], beadPx: number = PNG_BEAD_PX_DEFAULT): Uint8Array {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  if (cols === 0 || rows === 0) {
    throw new Error('网格为空，没有可导出内容');
  }
  const width = cols * beadPx;
  const height = rows * beadPx;

  const surface = Skia.Surface.MakeOffscreen(width, height);
  if (!surface) throw new Error('Skia surface 分配失败（图过大？）');
  const canvas = surface.getCanvas();

  // 白底（透明 PNG 在不少社交平台显示成黑色，统一白底更稳）
  canvas.clear(Skia.Color('white'));

  const radius = beadPx / 2;
  const beadRadius = radius * 0.86; // 留一点缝看出珠粒
  for (let r = 0; r < rows; r++) {
    const row = grid[r];
    if (!row) continue;
    for (let c = 0; c < cols; c++) {
      const color = row[c];
      if (!color || color === 'transparent') continue;
      const paint = Skia.Paint();
      paint.setColor(Skia.Color(color));
      paint.setAntiAlias(true);
      canvas.drawCircle(c * beadPx + radius, r * beadPx + radius, beadRadius, paint);
    }
  }

  const image = surface.makeImageSnapshot();
  const bytes = image.encodeToBytes(ImageFormat.PNG, 100);
  return bytes;
}

/* ──────────────── 颜色统计（PDF 清单用） ──────────────── */

interface ColorCount {
  hex: string;
  count: number;
  /** 1-based 序号，给 PDF 上画"对应坐标"用 */
  index: number;
}

function countColors(grid: string[][]): ColorCount[] {
  const map = new Map<string, number>();
  for (const row of grid) {
    for (const c of row) {
      if (!c || c === 'transparent') continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex, count], i) => ({ hex, count, index: i + 1 }));
}

/* ──────────────── PDF HTML 构造 ──────────────── */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 内嵌 SVG 网格图：每颗珠子一个 <circle>，每 10 格加粗一道线 + 行列编号。
 * SVG 矢量，PDF 打印多大都不糊。
 */
function buildGridSvg(grid: string[][]): string {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const cell = 10; // SVG 单位：每格 10
  const margin = 20; // 留给行列编号
  const w = cols * cell + margin * 2;
  const h = rows * cell + margin * 2;

  const parts: string[] = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%">`);
  // 背景
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="white"/>`);

  // 珠子（圆点）
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r]?.[c];
      if (!color || color === 'transparent') continue;
      const cx = margin + c * cell + cell / 2;
      const cy = margin + r * cell + cell / 2;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${cell * 0.42}" fill="${escapeHtml(color)}"/>`);
    }
  }

  // 网格细线
  for (let c = 0; c <= cols; c++) {
    const x = margin + c * cell;
    const isMajor = c % 10 === 0;
    parts.push(`<line x1="${x}" y1="${margin}" x2="${x}" y2="${margin + rows * cell}" stroke="${isMajor ? '#666' : '#ccc'}" stroke-width="${isMajor ? 0.4 : 0.15}"/>`);
  }
  for (let r = 0; r <= rows; r++) {
    const y = margin + r * cell;
    const isMajor = r % 10 === 0;
    parts.push(`<line x1="${margin}" y1="${y}" x2="${margin + cols * cell}" y2="${y}" stroke="${isMajor ? '#666' : '#ccc'}" stroke-width="${isMajor ? 0.4 : 0.15}"/>`);
  }

  // 行列编号（每 10 格标一次，0-based 起算 → 显示 0/10/20...）
  for (let c = 0; c <= cols; c += 10) {
    const x = margin + c * cell;
    parts.push(`<text x="${x}" y="${margin - 4}" font-size="5" text-anchor="middle" fill="#666">${c}</text>`);
  }
  for (let r = 0; r <= rows; r += 10) {
    const y = margin + r * cell;
    parts.push(`<text x="${margin - 4}" y="${y + 1.6}" font-size="5" text-anchor="end" fill="#666">${r}</text>`);
  }

  parts.push(`</svg>`);
  return parts.join('');
}

function buildColorListHtml(grid: string[][]): string {
  const list = countColors(grid);
  const total = list.reduce((s, c) => s + c.count, 0);
  const rows = list.map((c) => `
    <tr>
      <td style="width:32px;text-align:center;">${c.index}</td>
      <td style="width:32px;"><div style="width:18px;height:18px;border-radius:50%;background:${escapeHtml(c.hex)};border:1px solid #ddd;"></div></td>
      <td style="font-family:monospace;">${escapeHtml(c.hex.toUpperCase())}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;">${c.count}</td>
      <td style="text-align:right;color:#888;font-variant-numeric:tabular-nums;">${((c.count / total) * 100).toFixed(1)}%</td>
    </tr>`).join('');

  return `
    <h2 style="font-size:16px;margin:0 0 8px 0;">颜色清单 · ${list.length} 色 / ${total} 颗</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead>
        <tr style="border-bottom:1px solid #ccc;color:#666;">
          <th style="text-align:center;padding:4px;">#</th>
          <th></th>
          <th style="text-align:left;padding:4px;">色号</th>
          <th style="text-align:right;padding:4px;">数量</th>
          <th style="text-align:right;padding:4px;">占比</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildPdfHtml(grid: string[][], title: string): string {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const total = grid.reduce((s, r) => s + r.filter((c) => c && c !== 'transparent').length, 0);
  const colorListHtml = buildColorListHtml(grid);
  const svg = buildGridSvg(grid);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 16mm; }
    body { font-family: -apple-system, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif; color: #222; margin: 0; padding: 0; }
    .header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; }
    .title { font-size: 18px; font-weight: 700; }
    .meta { font-size: 11px; color: #777; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">${escapeHtml(title)}</div>
    <div class="meta">${cols} × ${rows} · ${total} 颗</div>
  </div>
  ${svg}
  <div class="page-break"></div>
  ${colorListHtml}
</body>
</html>
  `;
}

/* ──────────────── 公开 API ──────────────── */

function nowFilenameStem(name: string): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const safe = name.replace(/[^\w一-龥-]/g, '_').slice(0, 30) || 'BeadForge';
  return `${safe}-${stamp}`;
}

/**
 * 把 grid 导出成 PNG，写到 cache 目录，返回文件 URI。
 * 调用方可选择再调 saveToAlbum / share。
 */
export async function exportGridAsPng(grid: string[][], name: string): Promise<string> {
  const bytes = renderGridToPngBytes(grid);
  const stem = nowFilenameStem(name);
  const file = new File(Paths.cache, `${stem}.png`);
  if (file.exists) file.delete();
  file.create();
  file.write(bytes);
  return file.uri;
}

/**
 * 把 grid 导出成 PDF（编号底图 + 颜色清单），返回文件 URI。
 */
export async function exportGridAsPdf(grid: string[][], name: string): Promise<string> {
  const html = buildPdfHtml(grid, name || 'BeadForge 拼豆图');
  // expo-print 内部已经写到临时目录返回 file:// URI
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

/**
 * 保存 PNG 到系统相册。需要 MediaLibrary 权限。
 * 返回相册资产标识（成功）或抛错（权限拒绝 / IO 失败）
 */
export async function savePngToAlbum(uri: string): Promise<MediaLibrary.Asset> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  if (!perm.granted) throw new Error('PERMISSION_DENIED');
  return MediaLibrary.createAssetAsync(uri);
}

/**
 * 拉起系统分享面板。PNG 走图片分享，PDF 走文档分享，由 mimeType 控制。
 */
export async function shareFile(uri: string, mimeType: 'image/png' | 'application/pdf'): Promise<void> {
  const ok = await Sharing.isAvailableAsync();
  if (!ok) throw new Error('SHARING_UNAVAILABLE');
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: '分享拼豆作品' });
}
