import { create } from 'zustand';
import { designApi, type DesignItem } from '../api/design';

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
  myStatus: string | null;  // null = 全部
  setMyStatus: (status: string | null) => void;
  fetchMyDesigns: (refresh?: boolean) => Promise<void>;

  // 创作首页用：最近草稿（独立缓存，避免和 myDesigns/tab 状态相互干扰）
  recentDrafts: DesignItem[];
  recentDraftsLoading: boolean;
  recentDraftsStale: boolean;
  loadRecentDrafts: () => Promise<void>;
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
  myStatus: null,

  setMyStatus: (status) => {
    if (get().myStatus === status) return;
    set({ myStatus: status, myDesigns: [], myPage: 1, myHasMore: true });
    void get().fetchMyDesigns(true);
  },

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
      const res = await designApi.getPublicList(page, PAGE_SIZE, state.sortBy, state.category || undefined);
      const data = res.data;
      const records = data?.records || [];
      const allRecords = refresh ? records : [...state.designs, ...records];

      set({
        designs: allRecords,
        page: page + 1,
        hasMore: allRecords.length < (data?.total || 0),
        loading: false,
        refreshing: false,
      });
    } catch (e: any) {
      set({ error: e?.message || '加载失败', loading: false, refreshing: false });
    }
  },

  recentDrafts: [],
  recentDraftsLoading: false,
  recentDraftsStale: false,

  loadRecentDrafts: async () => {
    // 在跑就标记 stale，跑完会自动再 fetch 一次；避免 saveDraft 完成后想刷新被 loading guard 卡掉
    if (get().recentDraftsLoading) {
      set({ recentDraftsStale: true });
      return;
    }
    set({ recentDraftsLoading: true, recentDraftsStale: false });
    try {
      const res = await designApi.getMyDesigns(1, 10, 'DRAFT');
      set({
        recentDrafts: res.data?.records || [],
        recentDraftsLoading: false,
      });
      // 期间被标记过 stale → 再补一次确保拉到最新（如刚保存完的草稿）
      if (get().recentDraftsStale) {
        set({ recentDraftsStale: false });
        void get().loadRecentDrafts();
      }
    } catch {
      set({ recentDraftsLoading: false, recentDraftsStale: false });
    }
  },

  fetchMyDesigns: async (refresh = false) => {
    const state = get();
    if (state.myLoading || (!refresh && !state.myHasMore)) return;

    const page = refresh ? 1 : state.myPage;
    set({ myLoading: true });

    try {
      const res = await designApi.getMyDesigns(page, PAGE_SIZE, state.myStatus || undefined);
      const data = res.data;
      const records = data?.records || [];
      const all = refresh ? records : [...state.myDesigns, ...records];

      set({
        myDesigns: all,
        myPage: page + 1,
        myHasMore: all.length < (data?.total || 0),
        myLoading: false,
      });
    } catch {
      set({ myLoading: false });
    }
  },
}));
