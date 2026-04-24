import { create } from 'zustand';
import type { DesignItem } from '../api/design';
import { getMockMyDesignPage, getMockPublicDesignPage } from '../mock/design';
import { useAuthStore } from './useAuthStore';

interface DesignState {
  designs: DesignItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  sortBy: string;
  category: string | null;
  searchKeyword: string;
  setFilter: (sortBy?: string, category?: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  fetchDesigns: (refresh?: boolean) => Promise<void>;
  myDesigns: DesignItem[];
  myPage: number;
  myHasMore: boolean;
  myLoading: boolean;
  fetchMyDesigns: (refresh?: boolean) => Promise<void>;
}

const PAGE_SIZE = 10;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
    void get().fetchDesigns(true);
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
      await wait(250);
      const data = getMockPublicDesignPage({
        page,
        size: PAGE_SIZE,
        sortBy: state.sortBy,
        category: state.category,
        keyword: state.searchKeyword,
      });
      const records = data.records || [];
      const allRecords = refresh ? records : [...state.designs, ...records];

      set({
        designs: allRecords,
        page: page + 1,
        hasMore: allRecords.length < (data.total || 0),
        loading: false,
        refreshing: false,
      });
    } catch (e: any) {
      set({ error: e?.message || '加载失败', loading: false, refreshing: false });
    }
  },

  fetchMyDesigns: async (refresh = false) => {
    const state = get();
    if (state.myLoading || (!refresh && !state.myHasMore)) return;

    const page = refresh ? 1 : state.myPage;
    set({ myLoading: true });

    try {
      await wait(180);
      const userId = useAuthStore.getState().user?.id;
      const data = getMockMyDesignPage({ page, size: PAGE_SIZE, userId });
      const records = data.records || [];
      const all = refresh ? records : [...state.myDesigns, ...records];

      set({
        myDesigns: all,
        myPage: page + 1,
        myHasMore: all.length < (data.total || 0),
        myLoading: false,
      });
    } catch {
      set({ myLoading: false });
    }
  },
}));
