import type { HomeBannerItem } from './discovery';

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
}

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
