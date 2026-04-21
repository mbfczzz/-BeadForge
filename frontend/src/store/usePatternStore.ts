import { create } from 'zustand';
import { patternApi, type PatternDTO } from '../api/pattern';

/** 图纸数据（前端视图模型 — 字段名对后端做了小幅适配） */
export interface MarketPattern {
  id: number;
  title: string;
  author: string;
  authorId: number;
  price: number;
  free: boolean;
  patIdx: number; // 前端显示用：从 ALL_PATTERNS 中选一套花纹；后端不存
  cat: string;
  downloads: number;
  rating: number;
  cols: number;
  rows: number;
  desc: string;
  gridData?: string[][]; // 实际图纸数据（发布时本地缓存，后端 previewData 为 JSON 字符串）
  createdAt: string;
}

interface PatternState {
  /** 市场上所有图纸 */
  listings: MarketPattern[];
  /** 当前用户已购买的图纸 ID */
  purchased: Set<number>;
  /** 当前用户发布的图纸 ID（本地追踪；真实"我的发布"应从后端 /patterns/mine 获取，暂未实现） */
  myListings: Set<number>;

  /** 列表加载状态 */
  loading: boolean;
  error: string | null;
  /** 上次拉取时间（ms），用于节流 */
  lastFetchAt: number;

  /** 拉取图纸市场列表（默认首页前 50 条） */
  fetchListings: (force?: boolean) => Promise<void>;
  /** 拉取我的已购图纸 id 集合（登录后调用） */
  fetchPurchased: () => Promise<void>;

  /** 购买图纸 — 调后端后再刷新本地 */
  buy: (id: number) => Promise<void>;
  /** 发布图纸到市场 — 调后端后再插入 listings */
  publish: (pattern: Omit<MarketPattern, 'id' | 'downloads' | 'rating' | 'createdAt'>) => Promise<number>;
  /** 是否已购买 */
  hasBought: (id: number) => boolean;
  /** 是否是自己发布的 */
  isMine: (id: number) => boolean;
}

/** 后端 DTO → 前端视图模型 */
function toMarketPattern(dto: PatternDTO, patCount: number): MarketPattern {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author || '匿名',
    authorId: dto.authorId,
    price: Number(dto.price || 0),
    free: dto.free,
    patIdx: dto.id % Math.max(1, patCount), // 稳定映射到 ALL_PATTERNS；具体 patCount 由调用方提供，不够准确也只是视觉选色
    cat: dto.category || '抽象',
    downloads: dto.downloads || 0,
    rating: Number(dto.rating || 5),
    cols: dto.cols || 10,
    rows: dto.rows || 10,
    desc: dto.description || '',
    createdAt: dto.createdAt ? dto.createdAt.slice(0, 10) : '',
  };
}

// 这里用一个保守的默认值，避免循环依赖 ALL_PATTERNS；前端展示时实际按 id % 实际常量长度就行
const PAT_COUNT_GUESS = 16;

const FETCH_TTL_MS = 30 * 1000;

export const usePatternStore = create<PatternState>((set, get) => ({
  listings: [],
  purchased: new Set<number>(),
  myListings: new Set<number>(),
  loading: false,
  error: null,
  lastFetchAt: 0,

  fetchListings: async (force = false) => {
    const now = Date.now();
    if (!force && get().listings.length > 0 && now - get().lastFetchAt < FETCH_TTL_MS) return;
    set({ loading: true, error: null });
    try {
      const res = await patternApi.list({ page: 1, size: 50, sortBy: 'latest' });
      const items = (res.data?.records || []).map((d) => toMarketPattern(d, PAT_COUNT_GUESS));
      set({ listings: items, loading: false, lastFetchAt: Date.now() });
    } catch (e: any) {
      set({ loading: false, error: e?.message || '加载失败' });
    }
  },

  fetchPurchased: async () => {
    try {
      const res = await patternApi.purchased();
      set({ purchased: new Set<number>(res.data || []) });
    } catch {
      // 未登录会 401；静默吞掉，保持空集合
    }
  },

  buy: async (id) => {
    await patternApi.buy(id);
    // 乐观更新：加入 purchased，同时本地 downloads+1
    set((s) => {
      const np = new Set(s.purchased); np.add(id);
      const nl = s.listings.map((p) => (p.id === id ? { ...p, downloads: p.downloads + 1 } : p));
      return { purchased: np, listings: nl };
    });
  },

  publish: async (pattern) => {
    const res = await patternApi.publish({
      title: pattern.title,
      description: pattern.desc,
      category: pattern.cat,
      price: pattern.price,
      cols: pattern.cols,
      rows: pattern.rows,
      previewData: pattern.gridData ? JSON.stringify(pattern.gridData) : undefined,
    });
    const created = res.data;
    const mp: MarketPattern = {
      ...pattern,
      id: created?.id ?? Date.now(),
      downloads: 0,
      rating: 5,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    set((s) => {
      const ml = new Set(s.myListings); ml.add(mp.id);
      return { listings: [mp, ...s.listings], myListings: ml };
    });
    return mp.id;
  },

  hasBought: (id) => get().purchased.has(id) || get().myListings.has(id),
  isMine: (id) => get().myListings.has(id),
}));
