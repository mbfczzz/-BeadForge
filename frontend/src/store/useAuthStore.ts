import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { TOKEN_KEY } from '../api/client';
import { LoginParams, RegisterParams, UserInfo } from '../api/auth';
import { UserStats } from '../api/user';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  stats: EMPTY_STATS,
  isLoading: true,

  login: async (params) => {
    try {
      const res: any = await client.post('/auth/login', params);
      const { token, user } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
      get().fetchStats();
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || e?.message || '登录失败');
    }
  },

  register: async (params) => {
    try {
      const res: any = await client.post('/auth/register', params);
      const { token, user } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, token);
      set({ token, user });
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || e?.message || '注册失败');
    }
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
        // 用 token 获取用户信息
        try {
          const res: any = await client.get('/user/profile');
          set({ user: res.data });
          get().fetchStats();
        } catch {
          // token 过期
          await AsyncStorage.removeItem(TOKEN_KEY);
          set({ token: null });
        }
      }
    } catch {}
    set({ isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const res: any = await client.get('/user/profile');
      set({ user: res.data });
    } catch {}
  },

  fetchStats: async () => {
    try {
      const res: any = await client.get('/user/stats');
      set({ stats: res.data });
    } catch {}
  },

  updateProfile: async (data) => {
    try {
      const res: any = await client.put('/user/profile', data);
      set({ user: res.data });
    } catch (e: any) {
      throw new Error(e?.response?.data?.message || '更新失败');
    }
  },
}));
