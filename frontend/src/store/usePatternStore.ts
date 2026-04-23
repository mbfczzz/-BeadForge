import { create } from 'zustand';
import type { HomeBannerItem } from '../api/discovery';
import type { MarketPattern, PatternListingSeed, PublishPatternInput, ResourceAccessMode } from '../api/market';
import { getDefaultHomeBanners } from '../mock/discovery';
import { MOCK_PATTERN_LISTINGS } from '../mock/market';

export type { MarketPattern } from '../api/market';

interface PatternState {
  listings: MarketPattern[];
  myListings: Set<number>;
  refreshing: boolean;
  homeBanners: HomeBannerItem[];
  setHomeBanners: (banners: HomeBannerItem[]) => void;
  publish: (pattern: PublishPatternInput) => number;
  unlist: (id: number) => void;
  isMine: (id: number) => boolean;
  refreshListings: () => Promise<void>;
}

let nextId = 300;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeListing = (item: PatternListingSeed): MarketPattern => {
  const accessMode: ResourceAccessMode = item.accessMode || (item.free ? 'free' : 'points');
  const pointsCost = typeof item.pointsCost === 'number' ? item.pointsCost : (item.free ? 0 : Math.round((item.price || 0) * 10));

  return {
    ...item,
    accessMode,
    pointsCost,
    free: accessMode === 'free',
    price: item.price || 0,
  };
};

export const usePatternStore = create<PatternState>((set, get) => ({
  listings: MOCK_PATTERN_LISTINGS.map(normalizeListing),
  myListings: new Set<number>(),
  refreshing: false,
  homeBanners: getDefaultHomeBanners(),

  setHomeBanners: (banners) => {
    set({
      homeBanners: [...banners]
        .filter((item) => item.enabled !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    });
  },

  publish: (pattern) => {
    const id = nextId++;
    const pointsCost = pattern.accessMode === 'points' ? Math.max(0, pattern.pointsCost || 0) : 0;

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
    await wait(320);
    set({ refreshing: false });
  },
}));
