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

  /**
   * 购买/下载图纸 — 统一走钱包通道：
   * - 免费图纸：直接登记 purchase（服务端识别 isFree=1 免扣费）
   * - 付费图纸：扣拼豆币（余额不足会返回 400）
   * 返回 { balance?, cost? }，免费场景可能为 null
   */
  buy: (id: number) =>
    client.post<any, ApiRes<{ balance?: number; cost?: number } | null>>(`/wallet/buy-pattern/${id}`),

  /** 我的已购图纸 id 列表 */
  purchased: () =>
    client.get<any, ApiRes<number[]>>('/patterns/purchased'),

  /**
   * 发布图纸到市场。
   * 后端返回的是 PatternListing entity（不是 PatternDTO），
   * 字段略有差异（isFree: 0/1 而非 free: boolean；无 author）——
   * 前端只消费 id，其余字段请不要直接使用。
   */
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
    client.post<any, ApiRes<{ id: number }>>('/patterns/publish', payload),
};
