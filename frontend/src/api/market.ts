import type { HomeBannerItem } from './discovery';
import client from './client';

export type ResourceAccessMode = 'free' | 'points' | 'member';

export interface MaterialProduct {
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
  imageUrls?: string;
  services?: string;
  promotions?: string;
  detailSections?: string;
}

export interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sales: number;
  rating: number;
  tag?: string;
  color: string;
  icon: string;
  category: string;
  specs?: string;
  imageUrls?: string;
  services?: string;
  promotions?: string;
  detailSections?: string;
}

interface PageData<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

function stringifyArray(value: unknown): string | undefined {
  return Array.isArray(value) && value.length > 0 ? JSON.stringify(value) : undefined;
}

export function productDataToMaterialProduct(product: ProductData): MaterialProduct {
  let specs: string[] = [];
  let embeddedImageUrls: string | undefined;
  let embeddedServices: string | undefined;
  let embeddedPromotions: string | undefined;
  let embeddedDetailSections: string | undefined;

  if (product.specs) {
    try {
      const parsed = JSON.parse(product.specs);
      if (Array.isArray(parsed)) {
        specs = parsed;
      } else if (parsed && typeof parsed === 'object') {
        specs = Array.isArray(parsed.items) ? parsed.items : Array.isArray(parsed.specs) ? parsed.specs : [];
        embeddedImageUrls = stringifyArray(parsed.imageUrls);
        embeddedServices = stringifyArray(parsed.services);
        embeddedPromotions = stringifyArray(parsed.promotions);
        embeddedDetailSections = stringifyArray(parsed.detailSections);
      }
    } catch {
      specs = product.specs.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
    }
  }

  return {
    id: product.id,
    name: product.name,
    desc: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    sales: Number(product.sales || 0),
    rating: Number(product.rating || 5),
    tag: product.tag,
    color: product.color || '#EF4444',
    icon: product.icon || 'box',
    cat: product.category || '珠子',
    specs,
    imageUrls: product.imageUrls || embeddedImageUrls,
    services: product.services || embeddedServices,
    promotions: product.promotions || embeddedPromotions,
    detailSections: product.detailSections || embeddedDetailSections,
  };
}

export const marketApi = {
  getProducts: (page = 1, size = 50) =>
    client.get<any, ApiRes<PageData<ProductData>>>('/products/list', {
      params: { page, size },
    }),
};

interface BackendPatternListing {
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

function backendListingToSeed(p: BackendPatternListing): PatternListingSeed {
  return {
    id: p.id,
    title: p.title,
    author: p.author,
    authorId: p.authorId,
    price: Number(p.price || 0),
    free: !!p.free,
    patIdx: Math.abs(p.id) % 8,
    cat: p.category || '其他',
    downloads: p.downloads || 0,
    rating: Number(p.rating || 5),
    cols: p.cols || 9,
    rows: p.rows || 9,
    desc: p.description || '',
    createdAt: typeof p.createdAt === 'string' ? p.createdAt.slice(0, 10) : '',
  };
}

export const patternApi = {
  list: (page = 1, size = 50, category?: string, sortBy: 'latest' | 'hot' | 'free' | 'price_asc' = 'latest') =>
    client
      .get<any, ApiRes<PageData<BackendPatternListing>>>('/patterns/list', {
        params: { page, size, category, sortBy },
      })
      .then((res) => ({
        ...res,
        seeds: (res.data?.records || []).map(backendListingToSeed),
      })),

  publish: (data: any) => client.post<any, ApiRes<any>>('/patterns/publish', data),

  buy: (id: number) => client.post<any, ApiRes<void>>(`/patterns/${id}/buy`),

  myPurchased: () => client.get<any, ApiRes<number[]>>('/patterns/purchased'),
};

export interface PatternListingSeed {
  id: number;
  title: string;
  author: string;
  authorId: number;
  price: number;
  free: boolean;
  patIdx: number;
  cat: string;
  downloads: number;
  rating: number;
  cols: number;
  rows: number;
  desc: string;
  gridData?: string[][];
  createdAt: string;
  accessMode?: ResourceAccessMode;
  pointsCost?: number;
}

export interface MarketPattern extends PatternListingSeed {
  accessMode: ResourceAccessMode;
  pointsCost: number;
}

export interface PublishPatternInput {
  title: string;
  author: string;
  authorId: number;
  patIdx: number;
  cat: string;
  cols: number;
  rows: number;
  desc: string;
  gridData?: string[][];
  accessMode: ResourceAccessMode;
  pointsCost?: number;
}

export interface MarketTabDef {
  key: 'material' | 'pattern';
  icon: string;
  label: string;
  sub: string;
}

export interface PatternStoreSnapshot {
  listings: MarketPattern[];
  homeBanners: HomeBannerItem[];
}
