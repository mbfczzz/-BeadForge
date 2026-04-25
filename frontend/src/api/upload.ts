import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface UploadResult {
  url: string;
  size: number;
  type: 'image' | 'gif' | 'video';
}

/**
 * 把后端返回的相对 url（如 "/uploads/2026-04/xxx.jpg"）解析成可用的完整 URL。
 * baseURL 形如 "http://host:8085/api"，需要把 /api 去掉再拼上 path（path 已含 /uploads）
 */
export function resolveUploadUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const base = (client.defaults.baseURL || '').replace(/\/api\/?$/, '');
  return base + (path.startsWith('/') ? path : '/' + path);
}

export const uploadApi = {
  /**
   * 上传单张图片或视频。RN 端需用 { uri, name, type } 形态的伪 file。
   */
  image: (file: { uri: string; name: string; type: string }) => {
    const formData = new FormData();
    formData.append('file', file as any);
    return client.post<any, ApiRes<UploadResult>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
