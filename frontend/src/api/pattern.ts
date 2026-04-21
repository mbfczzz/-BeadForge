import client from './client';
import type { PageData } from './design';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

/** 后端 /patterns/list 返回的单项结构（见 PatternController.list） */
export interface PatternDTO {
  id: number;
  title: string;
  author: string;
  authorId: number;
  description: string;
  category: string;
  price: number;
  free: boolean;
  cols: number;
  rows: number;
  downloads: number;
  rating: number;
  createdAt: string;
}

export const patternApi = {
  /** 图纸市场列表 */
  list: (params: { page?: number; size?: number; category?: string; sortBy?: 'latest' | 'hot' | 'price_asc' | 'free' } = {}) =>
    client.get<any, ApiRes<PageData<PatternDTO>>>('/patterns/list', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 50,
        category: params.category || undefined,
        sortBy: params.sortBy ?? 'latest',
      },
    }),

  /** 购买/下载图纸（免费自动记录，付费需要先充值） */
  buy: (id: number) =>
    client.post<any, ApiRes<void>>(`/patterns/${id}/buy`),

  /** 我的已购图纸 id 列表 */
  purchased: () =>
    client.get<any, ApiRes<number[]>>('/patterns/purchased'),

  /** 发布图纸到市场 */
  publish: (payload: {
    title: string;
    description: string;
    category: string;
    price: number;
    cols: number;
    rows: number;
    previewData?: string;
    designId?: number;
  }) =>
    client.post<any, ApiRes<PatternDTO>>('/patterns/publish', payload),
};
