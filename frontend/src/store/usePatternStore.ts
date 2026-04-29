import { create } from 'zustand';
import type { HomeBannerItem } from '../api/discovery';
import { patternApi, type MarketPattern, type PatternListingSeed, type PublishPatternInput, type ResourceAccessMode } from '../api/market';

export type { MarketPattern } from '../api/market';

interface PatternState {
  listings: MarketPattern[];
  myListings: Set<number>;
  refreshing: boolean;
  homeBanners: HomeBannerItem[];
  setHomeBanners: (banners: HomeBannerItem[]) => void;
  publish: (pattern: PublishPatternInput) => Promise<number>;
  unlist: (id: number) => void;
  isMine: (id: number) => boolean;
  refreshListings: () => Promise<void>;
}

const normalizeListing = (item: PatternListingSeed): MarketPattern => {
  const accessMode: ResourceAccessMode = item.accessMode || (item.free ? 'free' : 'points');
  // 全链路约定：1 price 单位 = 1 拼豆币（与后端 WalletController.buyPattern 的 intValue 取数一致）
  const pointsCost = typeof item.pointsCost === 'number' ? item.pointsCost : (item.free ? 0 : Math.max(0, Math.round(item.price || 0)));

  return {
    ...item,
    accessMode,
    pointsCost,
    free: accessMode === 'free',
    price: item.price || 0,
  };
};

export const usePatternStore = create<PatternState>((set, get) => ({
  listings: [],
  myListings: new Set<number>(),
  refreshing: false,
  homeBanners: [],

  setHomeBanners: (banners) => {
    set({
      homeBanners: [...banners]
        .filter((item) => item.enabled !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    });
  },

  publish: async (pattern) => {
    const pointsCost = pattern.accessMode === 'points' ? Math.max(0, pattern.pointsCost || 0) : 0;
    try {
      const res = await patternApi.publish({
        title: pattern.title,
        description: pattern.desc,
        category: pattern.cat,
        price: pointsCost,
        cols: pattern.cols,
        rows: pattern.rows,
        previewData: pattern.gridData ? JSON.stringify(pattern.gridData) : null,
      });
      const id = res.data?.id || Date.now();

      const newPattern: MarketPattern = {
        ...pattern,
        id,
        downloads: 0,
        rating: 5,
        createdAt: new Date().toISOString().slice(0, 10),
        free: pattern.accessMode === 'free',
        pointsCost,
        price: pointsCost,
      };

      set((state) => {
        const myListings = new Set(state.myListings);
        myListings.add(id);
        return {
          listings: [newPattern, ...state.listings],
          myListings,
        };
      });

      return id;
    } catch {
      return -1;
    }
  },

  unlist: (id) => {
    set((state) => {
      const myListings = new Set(state.myListings);
      myListings.delete(id);
      return {
        listings: state.listings.filter((item) => item.id !== id),
        myListings,
      };
    });
  },

  isMine: (id) => get().myListings.has(id),

  refreshListings: async () => {
    if (get().refreshing) return;
    set({ refreshing: true });
    try {
      const [listRes, ownedRes] = await Promise.all([
        patternApi.list(),
        patternApi.myPurchased().catch(() => ({ data: [] as number[] })),
      ]);
      const seeds = (listRes as any).seeds as PatternListingSeed[];
      set({
        listings: seeds.map(normalizeListing),
        myListings: new Set<number>(ownedRes.data || []),
        refreshing: false,
      });
    } catch {
      set({ refreshing: false });
    }
  },
}));
