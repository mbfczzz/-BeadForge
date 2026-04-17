import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import client, { TOKEN_KEY } from '../api/client';
import type { LoginParams, RegisterParams, UserInfo } from '../api/auth';
import type { UserStats } from '../api/user';
import {
  MOCK_AUTH_PASSWORD_KEY,
  MOCK_AUTH_STATS_KEY,
  MOCK_AUTH_USER_KEY,
  buildMockUser,
  createMockToken,
  getDefaultMockStats,
  getDefaultMockUser,
  isMockToken,
  validateMockLogin,
} from '../mock/auth';

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

async function readMockUser() {
  const raw = await AsyncStorage.getItem(MOCK_AUTH_USER_KEY);
  return raw ? JSON.parse(raw) as UserInfo : getDefaultMockUser();
}

async function readMockStats() {
  const raw = await AsyncStorage.getItem(MOCK_AUTH_STATS_KEY);
  return raw ? JSON.parse(raw) as UserStats : getDefaultMockStats();
}

async function persistMockSession(user: UserInfo, stats: UserStats, password?: string) {
  await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(MOCK_AUTH_STATS_KEY, JSON.stringify(stats));
  if (password) {
    await AsyncStorage.setItem(MOCK_AUTH_PASSWORD_KEY, password);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  stats: EMPTY_STATS,
  isLoading: true,

  login: async (params) => {
    const mockUser = await readMockUser();
    const mockStats = await readMockStats();
    const mockPassword = await AsyncStorage.getItem(MOCK_AUTH_PASSWORD_KEY) || 'demo123';

    if (validateMockLogin(params, mockUser, mockPassword)) {
      const token = createMockToken(mockUser.username);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await persistMockSession(mockUser, mockStats, mockPassword);
      set({ token, user: mockUser, stats: mockStats });
      return;
    }

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
    const user = buildMockUser(params);
    const stats = getDefaultMockStats();
    const token = createMockToken(user.username);

    await AsyncStorage.setItem(TOKEN_KEY, token);
    await persistMockSession(user, stats, params.password);
    set({ token, user, stats });
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

      if (isMockToken(token)) {
        const user = await readMockUser();
        const stats = await readMockStats();
        set({ token, user, stats, isLoading: false });
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
    const token = get().token;

    if (isMockToken(token)) {
      const user = await readMockUser();
      set({ user });
      return;
    }

    try {
      const response: any = await client.get('/user/profile');
      set({ user: response.data });
    } catch {
      return;
    }
  },

  fetchStats: async () => {
    const token = get().token;

    if (isMockToken(token)) {
      const stats = await readMockStats();
      set({ stats });
      return;
    }

    try {
      const response: any = await client.get('/user/stats');
      set({ stats: response.data });
    } catch {
      return;
    }
  },

  updateProfile: async (data) => {
    const token = get().token;

    if (isMockToken(token)) {
      const current = get().user || await readMockUser();
      const user = { ...current, ...data };
      await AsyncStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user));
      set({ user });
      return;
    }

    try {
      const response: any = await client.put('/user/profile', data);
      set({ user: response.data });
    } catch (error: any) {
      throw new Error(error?.message || '更新失败');
    }
  },
}));
