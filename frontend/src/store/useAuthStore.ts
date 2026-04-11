import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../api/client';
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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock 模式 - 不连后端，本地模拟登录/注册
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  stats: EMPTY_STATS,
  isLoading: true,

  login: async (params) => {
    await delay(500);
    // Mock: 任意用户名密码都可登录
    const user: UserInfo = {
      id: 1,
      username: params.username,
      nickname: params.username,
      avatar: null,
      email: null,
      phone: null,
    };
    const token = 'mock-token-' + Date.now();
    await AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
    get().fetchStats();
  },

  register: async (params) => {
    await delay(500);
    const user: UserInfo = {
      id: 1,
      username: params.username,
      nickname: params.nickname || params.username,
      avatar: null,
      email: params.email || null,
      phone: null,
    };
    const token = 'mock-token-' + Date.now();
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
        set({
          token,
          user: { id: 1, username: 'beadlover', nickname: '拼豆爱好者', avatar: null, email: 'hi@beadforge.com', phone: null },
        });
        get().fetchStats();
      }
    } catch {}
    set({ isLoading: false });
  },

  fetchProfile: async () => {},

  fetchStats: async () => {
    await delay(300);
    set({ stats: { designCount: 12, likeCount: 328, followerCount: 56, followingCount: 23 } });
  },

  updateProfile: async (data) => {
    await delay(400);
    set((state) => ({
      user: state.user ? { ...state.user, ...data } as UserInfo : null,
    }));
  },
}));
