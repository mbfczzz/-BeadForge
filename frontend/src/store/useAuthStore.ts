import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import client, { TOKEN_KEY } from '../api/client';
import type { LoginParams, RegisterParams, UserInfo } from '../api/auth';
import type { UserStats } from '../api/user';

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

const EMPTY_STATS: UserStats = {
  designCount: 0,
  likeCount: 0,
  followerCount: 0,
  followingCount: 0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  stats: EMPTY_STATS,
  isLoading: true,

  login: async (params) => {
    try {
      const response: any = await client.post('/auth/login', params);
      const { token, user } = response.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
      await get().fetchStats();
    } catch (error: any) {
      throw new Error(error?.message || '登录失败');
    }
  },

  register: async (params) => {
    try {
      const response: any = await client.post('/auth/register', params);
      const { token, user } = response.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user, stats: EMPTY_STATS });
      await get().fetchStats();
    } catch (error: any) {
      throw new Error(error?.message || '注册失败');
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, stats: EMPTY_STATS });
  },

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        set({ isLoading: false });
        return;
      }

      set({ token });
      try {
        const response: any = await client.get('/user/profile');
        set({ user: response.data });
        await get().fetchStats();
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        set({ token: null, user: null, stats: EMPTY_STATS });
      }
    } catch {
      set({ token: null, user: null, stats: EMPTY_STATS });
    }

    set({ isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const response: any = await client.get('/user/profile');
      set({ user: response.data });
    } catch {
      return;
    }
  },

  fetchStats: async () => {
    try {
      const response: any = await client.get('/user/stats');
      set({ stats: response.data });
    } catch {
      return;
    }
  },

  updateProfile: async (data) => {
    try {
      const response: any = await client.put('/user/profile', data);
      set({ user: response.data });
    } catch (error: any) {
      throw new Error(error?.message || '更新失败');
    }
  },
}));
