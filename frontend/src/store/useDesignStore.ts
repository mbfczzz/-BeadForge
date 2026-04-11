import { create } from 'zustand';
import { designApi, DesignItem } from '../api/design';

interface DesignState {
  /** 首页列表 */
  designs: DesignItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  /** 筛选条件 */
  sortBy: string;
  category: string | null;
  searchKeyword: string;

  /** 操作 */
  setFilter: (sortBy?: string, category?: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  fetchDesigns: (refresh?: boolean) => Promise<void>;

  /** 我的作品 */
  myDesigns: DesignItem[];
  myPage: number;
  myHasMore: boolean;
  myLoading: boolean;
  fetchMyDesigns: (refresh?: boolean) => Promise<void>;
}

const PAGE_SIZE = 10;

export const useDesignStore = create<DesignState>((set, get) => ({
  designs: [],
  page: 1,
  hasMore: true,
  loading: false,
  refreshing: false,
  error: null,

  sortBy: 'latest',
  category: null,
  searchKeyword: '',

  myDesigns: [],
  myPage: 1,
  myHasMore: true,
  myLoading: false,

  setFilter: (sortBy, category) => {
    const updates: Partial<DesignState> = {};
    if (sortBy !== undefined) updates.sortBy = sortBy;
    if (category !== undefined) updates.category = category;
    set({ ...updates, designs: [], page: 1, hasMore: true });
    get().fetchDesigns(true);
  },

  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword });
  },

  fetchDesigns: async (refresh = false) => {
    const state = get();
    if (state.loading || (!refresh && !state.hasMore)) return;

    const page = refresh ? 1 : state.page;
    set({ loading: true, refreshing: refresh, error: null });

    try {
      const res = await designApi.getPublicList(page, PAGE_SIZE, state.sortBy, state.category || undefined);
      const { records, total } = res.data;
      const allRecords = refresh ? records : [...state.designs, ...records];
      set({
        designs: allRecords,
        page: page + 1,
        hasMore: allRecords.length < total,
        loading: false,
        refreshing: false,
      });
    } catch (e: any) {
      set({ loading: false, refreshing: false, error: e.message });
    }
  },

  fetchMyDesigns: async (refresh = false) => {
    const state = get();
    if (state.myLoading || (!refresh && !state.myHasMore)) return;

    const page = refresh ? 1 : state.myPage;
    set({ myLoading: true });

    try {
      const res = await designApi.getMyDesigns(page, PAGE_SIZE);
      const { records, total } = res.data;
      const allRecords = refresh ? records : [...state.myDesigns, ...records];
      set({
        myDesigns: allRecords,
        myPage: page + 1,
        myHasMore: allRecords.length < total,
        myLoading: false,
      });
    } catch {
      set({ myLoading: false });
    }
  },
}));
