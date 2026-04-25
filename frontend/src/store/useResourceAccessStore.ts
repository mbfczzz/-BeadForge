import { create } from 'zustand';
import type { ProfileWalletLog } from '../api/profile';
import { walletApi } from '../api/wallet';
import { usePatternStore, type MarketPattern } from './usePatternStore';

export type UnlockSource = 'free' | 'points' | 'member' | 'author';

interface ResourceAccessState {
  pointsBalance: number;
  pointsLogs: ProfileWalletLog[];
  lastSignInDate: string | null;
  membershipActive: boolean;
  ownedFileIds: Set<number>;
  downloadedFileIds: Set<number>;
  unlockSourceById: Record<number, UnlockSource>;
  loadWallet: () => Promise<void>;
  canAccessFile: (file: MarketPattern) => boolean;
  canDownloadImage: (file: MarketPattern) => boolean;
  getUnlockSource: (fileId: number) => UnlockSource | null;
  unlockFree: (fileId: number) => boolean;
  unlockWithPoints: (file: MarketPattern) => boolean;
  unlockWithMember: (fileId: number) => boolean;
  markDownloaded: (fileId: number) => void;
  toggleMockMembership: () => void;
  addPoints: (amount: number) => void;
  signIn: () => boolean;
}

function formatLogTime(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useResourceAccessStore = create<ResourceAccessState>((set, get) => ({
  pointsBalance: 0,
  pointsLogs: [],
  lastSignInDate: null,
  membershipActive: false,
  ownedFileIds: new Set<number>(),
  downloadedFileIds: new Set<number>(),
  unlockSourceById: {},

  loadWallet: async () => {
    try {
      const [balRes, logsRes] = await Promise.all([walletApi.balance(), walletApi.logs()]);
      set({
        pointsBalance: balRes.data?.balance || 0,
        pointsLogs: logsRes.data || [],
      });
    } catch {
      // 未登录或网络错误时保留空状态
    }
  },

  canAccessFile: (file) => {
    const isMine = usePatternStore.getState().isMine(file.id);
    if (isMine) return true;
    if (get().ownedFileIds.has(file.id)) return true;
    if (file.accessMode === 'free') return true;
    if (file.accessMode === 'member') return get().membershipActive;
    return false;
  },

  canDownloadImage: (file) => {
    const isMine = usePatternStore.getState().isMine(file.id);
    if (isMine) return true;
    if (file.accessMode === 'member' && get().membershipActive) return true;
    const source = get().unlockSourceById[file.id];
    return source === 'member' || source === 'author';
  },

  getUnlockSource: (fileId) => get().unlockSourceById[fileId] || null,

  unlockFree: (fileId) => {
    const isMine = usePatternStore.getState().isMine(fileId);
    const nextSource: UnlockSource = isMine ? 'author' : 'free';

    set((state) => {
      const ownedFileIds = new Set(state.ownedFileIds);
      ownedFileIds.add(fileId);
      return {
        ownedFileIds,
        unlockSourceById: {
          ...state.unlockSourceById,
          [fileId]: nextSource,
        },
      };
    });

    return true;
  },

  unlockWithPoints: (file) => {
    const isMine = usePatternStore.getState().isMine(file.id);
    if (isMine) {
      get().unlockFree(file.id);
      return true;
    }

    const cost = Math.max(0, file.pointsCost || 0);
    if (get().pointsBalance < cost) return false;

    set((state) => {
      const ownedFileIds = new Set(state.ownedFileIds);
      ownedFileIds.add(file.id);
      return {
        pointsBalance: state.pointsBalance - cost,
        ownedFileIds,
        unlockSourceById: {
          ...state.unlockSourceById,
          [file.id]: 'points',
        },
      };
    });

    return true;
  },

  unlockWithMember: (fileId) => {
    const isMine = usePatternStore.getState().isMine(fileId);
    if (!isMine && !get().membershipActive) return false;

    set((state) => {
      const ownedFileIds = new Set(state.ownedFileIds);
      ownedFileIds.add(fileId);
      return {
        ownedFileIds,
        unlockSourceById: {
          ...state.unlockSourceById,
          [fileId]: isMine ? 'author' : 'member',
        },
      };
    });

    return true;
  },

  markDownloaded: (fileId) => {
    set((state) => {
      const downloadedFileIds = new Set(state.downloadedFileIds);
      downloadedFileIds.add(fileId);
      return { downloadedFileIds };
    });
  },

  toggleMockMembership: () => {
    set((state) => ({ membershipActive: !state.membershipActive }));
  },

  addPoints: (amount) => {
    set((state) => ({
      pointsBalance: Math.max(0, state.pointsBalance + amount),
      pointsLogs: [
        {
          id: Date.now(),
          title: '积分变动',
          description: `手动增加 ${amount} 积分`,
          amount,
          createdAt: formatLogTime(),
        },
        ...state.pointsLogs,
      ],
    }));
  },

  signIn: () => {
    const reward = 20;
    const today = formatDateKey();
    if (get().lastSignInDate === today) return false;

    set((state) => ({
      pointsBalance: state.pointsBalance + reward,
      lastSignInDate: today,
      pointsLogs: [
        {
          id: Date.now(),
          title: '签到',
          description: '每日签到奖励',
          amount: reward,
          createdAt: formatLogTime(),
        },
        ...state.pointsLogs,
      ],
    }));

    return true;
  },
}));
