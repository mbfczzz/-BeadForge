import axios from 'axios';
import { Platform } from 'react-native';
import { ARK_API_KEY, ARK_ENDPOINT_ID, ARK_BASE_URL, isDoubaoConfigured } from '../config/doubao';

/* ──────────────── 类型 ──────────────── */

interface ArkImageResponse {
  data: { b64_json?: string; url?: string }[];
}

/* ──────────────── 调色板量化 ──────────────── */

/** 将 RGB 映射到最近的调色板颜色 */
function nearestColor(r: number, g: number, b: number, palette: string[]): string {
  let minDist = Infinity;
  let best = palette[0];
  for (const hex of palette) {
    const pr = parseInt(hex.slice(1, 3), 16);
    const pg = parseInt(hex.slice(3, 5), 16);
    const pb = parseInt(hex.slice(5, 7), 16);
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < minDist) { minDist = dist; best = hex; }
  }
  return best;
}

/** 亮度判断：太接近白色视为透明 */
function isNearWhite(r: number, g: number, b: number, a: number): boolean {
  if (a < 128) return true;
  return r > 245 && g > 245 && b > 245;
}

/* ──────────────── 图片 → 像素网格 ──────────────── */

/**
 * 将 base64 图片转为 cols×rows 的珠子颜色网格
 * 使用 Canvas API（仅 Web 端支持，RN 端需要其他方案）
 */
function imageToGrid(
  base64: string,
  cols: number,
  rows: number,
  palette: string[],
): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'web') {
      reject(new Error('图片解析仅支持 Web 端'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d')!;

      // 缩放绘制到目标尺寸
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
      ctx.drawImage(img, 0, 0, cols, rows);

      const imageData = ctx.getImageData(0, 0, cols, rows);
      const pixels = imageData.data;
      const grid: string[][] = [];

      for (let y = 0; y < rows; y++) {
        const row: string[] = [];
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];

          if (isNearWhite(r, g, b, a)) {
            row.push('transparent');
          } else {
            row.push(nearestColor(r, g, b, palette));
          }
        }
        grid.push(row);
      }
      resolve(grid);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  });
}

/* ──────────────── 豆包文生图 API ──────────────── */

/**
 * 调用豆包文生图 API，返回 base64 图片
 */
async function generateImage(prompt: string): Promise<string> {
  const res = await axios.post<ArkImageResponse>(
    `${ARK_BASE_URL}/images/generations`,
    {
      model: ARK_ENDPOINT_ID,
      prompt: `像素风格拼豆图案，简洁可爱，纯色背景，${prompt}`,
      size: '512x512',
      response_format: 'b64_json',
      n: 1,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ARK_API_KEY}`,
      },
      timeout: 30000,
    },
  );

  const item = res.data?.data?.[0];
  if (item?.b64_json) return item.b64_json;
  if (item?.url) {
    // 如果返回的是 URL，再下载为 base64
    const imgRes = await axios.get(item.url, { responseType: 'arraybuffer' });
    const bytes = new Uint8Array(imgRes.data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
    return b64;
  }
  throw new Error('API 未返回图片数据');
}

/* ──────────────── 对外接口 ──────────────── */

/**
 * AI 生成拼豆图案
 *
 * - 已配置 API Key → 调用豆包真实 API → 图片转像素网格
 * - 未配置 → 返回 null（由调用方使用 mock）
 */
export async function doubaoGenerate(
  prompt: string,
  cols: number,
  rows: number,
  palette: string[],
): Promise<string[][] | null> {
  if (!isDoubaoConfigured()) return null;

  const base64 = await generateImage(prompt);
  const grid = await imageToGrid(base64, cols, rows, palette);
  return grid;
}
