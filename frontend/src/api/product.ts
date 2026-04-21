import client from './client';
import type { PageData } from './design';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

/** 后端 /products/list 返回的原始 Entity 结构 */
export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number | string;
  originalPrice?: number | string;
  sales?: number;
  rating?: number | string;
  tag?: string;
  color?: string;
  icon?: string;
  category: string;
  specs?: string;
  status?: string;
  createdAt?: string;
}

/** 默认颜色/图标兜底（后端字段可能为空） */
const FALLBACK_COLOR = '#6B7280';
const FALLBACK_ICON = 'box';

/**
 * 解析 specs：后端存字符串，可能是 JSON 数组 ["5mm","48色"]
 * 或分隔字符串。都兜底成 string[]。
 */
export function parseSpecs(raw?: string | null): string[] {
  if (!raw) return [];
  const s = raw.trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string');
    } catch { /* 不是合法 JSON，降级 */ }
  }
  return s.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
}

export const productApi = {
  list: (params: { page?: number; size?: number; category?: string; sortBy?: 'default' | 'sales' | 'price_asc' | 'price_desc' } = {}) =>
    client.get<any, ApiRes<PageData<ProductDTO>>>('/products/list', {
      params: {
        page: params.page ?? 1,
        size: params.size ?? 50,
        category: params.category || undefined,
        sortBy: params.sortBy ?? 'default',
      },
    }),

  detail: (id: number) =>
    client.get<any, ApiRes<ProductDTO>>(`/products/${id}`),
};

/** 视图层用 Product（与 MarketScreen 的旧接口一致，避免大面积改写） */
export interface ProductView {
  id: number;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  sales: number;
  rating: number;
  tag?: string;
  color: string;
  icon: string;
  cat: string;
  specs: string[];
}

export function toProductView(dto: ProductDTO): ProductView {
  return {
    id: dto.id,
    name: dto.name,
    desc: dto.description || '',
    price: Number(dto.price || 0),
    originalPrice: dto.originalPrice != null ? Number(dto.originalPrice) : undefined,
    sales: dto.sales || 0,
    rating: Number(dto.rating || 0),
    tag: dto.tag || undefined,
    color: dto.color || FALLBACK_COLOR,
    icon: dto.icon || FALLBACK_ICON,
    cat: dto.category || '其它',
    specs: parseSpecs(dto.specs),
  };
}
