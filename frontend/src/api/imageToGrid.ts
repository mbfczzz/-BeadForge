import client from './client';

/**
 * 上传一张图片，由后端像素化为拼豆 grid。
 *
 * 链路：前端 picker → multipart 上传 → 后端 /ai/image-to-grid
 *      → (可选 AI 卡通化) → k-means 量化 + 拼豆调色板匹配 → 返回 grid[][]
 *
 * 失败时直接抛错（不再吞成 null），让调用方用 e.message 把后端的具体提示
 * 透回用户（"图片分辨率过高"、"图片解码失败，请换一张" 等）。
 *
 * - paletteKey 决定后端用哪套调色板做最近色匹配；目前 "default"（36 色含肤色）
 *   与 "classic"（24 色无肤色）。
 * - aiEnhance 决定是否先调 GPT 把图卡通化再 pixelize。开启质量更好（尤其
 *   人像 / 复杂背景），但慢 15-30s 且消耗 OpenAI 配额；关闭走纯本地算法。
 */
export interface ImageToGridResult {
  grid: string[][];
  /** 用户请求 AI 增强且后端 AI 调用真的成功；false 表示降级到本地算法了 */
  aiUsed: boolean;
}

export async function imageToGrid(
  uri: string,
  cols: number,
  rows: number,
  paletteKey: string = 'default',
  aiEnhance: boolean = false,
  style: string = 'auto',
): Promise<ImageToGridResult> {
  const filename = uri.split('/').pop() || 'image.jpg';
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const mimeType =
    ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri, name: filename, type: mimeType } as any);
  formData.append('cols', String(cols));
  formData.append('rows', String(rows));
  formData.append('palette', paletteKey);
  formData.append('aiEnhance', String(aiEnhance));
  formData.append('style', style);

  const res: any = await client.post('/ai/image-to-grid', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // AI 增强开启时，整条链路（上传 + AI 重绘 + pixelize）需要更长时间，
    // 给 90 秒预算（dall-e-3 单次约 15-30s + 图片上传 + 像素化）
    timeout: aiEnhance ? 90_000 : 60_000,
  });

  const grid = res?.data?.grid;
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error('图片转换返回为空');
  }
  return {
    grid: grid as string[][],
    aiUsed: res?.data?.aiUsed === true,
  };
}
