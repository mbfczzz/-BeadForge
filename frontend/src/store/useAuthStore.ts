import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY } from '../api/client';
import { authApi, LoginParams, RegisterParams, UserInfo } from '../api/auth';
import { userApi } from '../api/user';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isLoading: boolean;

  login: (params: LoginParams) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  login: async (params) => {
    const res = await authApi.login(params);
    const { token, user } = res.data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  register: async (params) => {
    const res = await authApi.register(params);
    const { token, user } = res.data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadToken: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    set({ token, isLoading: false });
    if (token) {
      get().fetchProfile().catch(() => {
        // token 过期，清理
        get().logout();
      });
    }
  },

  fetchProfile: async () => {
    const res = await userApi.getProfile();
    set({ user: res.data });
  },
}));
