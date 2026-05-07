import client from './client';

/**
 * 上传一张图片，由后端像素化为拼豆 grid。
 *
 * 链路：前端 picker → multipart 上传 → 后端 /ai/image-to-grid
 *      → BufferedImage 双线性缩放 → 24 色拼豆调色板匹配 → 返回 grid[][]
 *
 * 失败时直接抛错（不再吞成 null），让调用方用 e.message 把后端的具体提示
 * 透回用户（"图片分辨率过高"、"图片解码失败，请换一张" 等）。
 * client.ts 的响应拦截器已经把 server `{code, message}` 包成 Error(message)。
 */
export async function imageToGrid(
  uri: string,
  cols: number,
  rows: number,
): Promise<string[][]> {
  const filename = uri.split('/').pop() || 'image.jpg';
  const ext = (filename.split('.').pop() || 'jpg').toLowerCase();
  const mimeType =
    ext === 'png' ? 'image/png'
    : ext === 'webp' ? 'image/webp'
    : ext === 'gif' ? 'image/gif'
    : 'image/jpeg';

  const formData = new FormData();
  // RN 端 file 要传 { uri, name, type } 形态的伪 file
  formData.append('file', { uri, name: filename, type: mimeType } as any);
  formData.append('cols', String(cols));
  formData.append('rows', String(rows));

  const res: any = await client.post('/ai/image-to-grid', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 上传 + 后端处理；20MB 图片在弱网下传输 + 像素化要给足时间
    timeout: 60_000,
  });

  const grid = res?.data?.grid;
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error('图片转换返回为空');
  }
  return grid as string[][];
}
