import client from './client';

/**
 * AI 生成拼豆图案
 *
 * 前端 → 后端 /ai/generate-image → 豆包API生图 → 后端像素化 → 返回 grid[][]
 * 全平台通用（Web/iOS/Android），像素化在后端完成
 *
 * 返回 null 表示失败（调用方 fallback 到 mock）
 */
export async function doubaoGenerate(
  prompt: string,
  cols: number,
  rows: number,
  _palette: string[], // 不再需要，后端有调色板
): Promise<string[][] | null> {
  try {
    const res: any = await client.post('/ai/generate-image', { prompt, cols, rows });
    const grid = res?.data?.grid;
    if (grid && Array.isArray(grid) && grid.length > 0) return grid;
    return null;
  } catch (e) {
    console.warn('AI生图失败:', e);
    return null;
  }
}
