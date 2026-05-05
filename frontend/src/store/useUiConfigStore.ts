import { create } from 'zustand';
import { uiConfigApi, type UiConfigPayload } from '../api/uiConfig';

interface UiConfigState {
  ready: boolean;
  data: UiConfigPayload;
  load: () => Promise<void>;
}

const FALLBACK: UiConfigPayload = {};

export const useUiConfigStore = create<UiConfigState>((set, get) => ({
  ready: false,
  data: FALLBACK,
  load: async () => {
    if (get().ready) return;
    try {
      const res = await uiConfigApi.all();
      set({ data: res.data || FALLBACK, ready: true });
    } catch {
      // 失败时保持 ready=false，下次进入屏幕会自动重试
    }
  },
}));

export function useUiConfig<T>(key: keyof UiConfigPayload, fallback: T): T {
  const data = useUiConfigStore((state) => state.data);
  const value = data[key];
  return (value === undefined || value === null ? fallback : value) as T;
}
