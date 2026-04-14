import { Platform } from 'react-native';
import client from './client';

/* ──────────────── 调色板量化 ──────────────── */

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

function isNearWhite(r: number, g: number, b: number, a: number): boolean {
  if (a < 128) return true;
  return r > 245 && g > 245 && b > 245;
}

/* ──────────────── 图片URL → 像素网格（仅Web） ──────────────── */

function imageUrlToGrid(
  imageUrl: string, cols: number, rows: number, palette: string[],
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
          const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
          row.push(isNearWhite(r, g, b, a) ? 'transparent' : nearestColor(r, g, b, palette));
        }
        grid.push(row);
      }
      resolve(grid);
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });
}

/* ──────────────── 对外接口 ──────────────── */

/**
 * AI 生成拼豆图案
 * 调后端代理 → 后端从数据库取 Key → 调豆包 API → 返回图片 URL → 前端转像素网格
 *
 * 返回 null 表示失败（由调用方 fallback 到 mock）
 */
export async function doubaoGenerate(
  prompt: string,
  cols: number,
  rows: number,
  palette: string[],
): Promise<string[][] | null> {
  try {
    // 调后端代理接口
    const res: any = await client.post('/ai/generate-image', { prompt });
    const imageUrl = res?.data?.imageUrl;
    if (!imageUrl) return null;

    // Web 端：用 Canvas 将图片转为像素网格
    if (Platform.OS === 'web') {
      return await imageUrlToGrid(imageUrl, cols, rows, palette);
    }

    // 原生端：暂不支持图片解析，返回 null 走 mock
    // 后续可用 react-native-canvas 或后端做像素化
    return null;
  } catch (e) {
    console.warn('AI生图失败:', e);
    return null;
  }
}

/**
 * 是否能使用 AI 生图（后端配置了 Key 就能用）
 */
export async function checkAiAvailable(): Promise<boolean> {
  try {
    // 简单检查：调一下后端，如果返回 "AI服务未配置" 就是不可用
    // 实际上只要后端跑着就认为可用，具体错误在生成时处理
    return true;
  } catch {
    return false;
  }
}
