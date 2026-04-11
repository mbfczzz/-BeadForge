import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, setOnUnauthorized } from '../api/client';
import { authApi, LoginParams, RegisterParams, UserInfo } from '../api/auth';
import { userApi, UserStats } from '../api/user';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  stats: UserStats;
  isLoading: boolean;

  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateProfile: (data: Partial<UserInfo>) => Promise<void>;
}

const EMPTY_STATS: UserStats = { designCount: 0, likeCount: 0, followerCount: 0, followingCount: 0 };

export const useAuthStore = create<AuthState>((set, get) => {
  // 注入 401 回调
  setOnUnauthorized(() => get().logout());

  return {
    token: null,
    user: null,
    stats: EMPTY_STATS,
    isLoading: true,

    login: async (params) => {
      const res = await authApi.login(params);
      const { token, user } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
      get().fetchStats().catch(() => {});
    },

    register: async (params) => {
      const res = await authApi.register(params);
      const { token, user } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
    },

    logout: async () => {
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, stats: EMPTY_STATS });
    },

    loadToken: async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          set({ token });
          await get().fetchProfile();
          get().fetchStats().catch(() => {});
        }
      } catch {
        await get().logout();
      } finally {
        set({ isLoading: false });
      }
    },

    fetchProfile: async () => {
      const res = await userApi.getProfile();
      set({ user: res.data });
    },

    fetchStats: async () => {
      try {
        const res = await userApi.getStats();
        set({ stats: res.data });
      } catch {
        // stats 接口可能暂未实现，静默失败
      }
    },

    updateProfile: async (data) => {
      const res = await userApi.updateProfile(data);
      set({ user: res.data });
    },
  };
});
