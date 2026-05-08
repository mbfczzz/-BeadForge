import client from './client';

/**
 * AI 生成拼豆图案
 *
 * 前端 → 后端 /ai/generate-image → OpenAI 兼容生图 → 后端像素化 → 返回 grid[][]
 * 全平台通用（Web/iOS/Android），像素化在后端完成
 *
 * paletteKey 决定后端用哪套调色板做像素化匹配（"default" / "classic"）。
 *
 * 返回 null 表示失败（调用方 fallback 到 mock）
 */
export async function doubaoGenerate(
  prompt: string,
  cols: number,
  rows: number,
  _palette: string[], // 不再需要，后端有调色板
  paletteKey: string = 'default',
): Promise<string[][] | null> {
  try {
    const res: any = await client.post('/ai/generate-image', {
      prompt,
      cols,
      rows,
      palette: paletteKey,
    }, {
      // 默认 client timeout 15s 不够 — dall-e-2 ~5-10s / dall-e-3 ~15-30s，
      // 加上后端 pixelize + 网络往返，60s 兜底。超时会被 axios 抛成 ECONNABORTED，
      // client.ts 拦截后变成"网络连接失败"误导文案
      timeout: 60_000,
    });
    const grid = res?.data?.grid;
    if (grid && Array.isArray(grid) && grid.length > 0) return grid;
    return null;
  } catch (e) {
    console.warn('AI生图失败:', e);
    return null;
  }
}
