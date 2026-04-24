import { create } from 'zustand';
import type { ProfileWalletLog } from '../api/profile';
import { MOCK_PROFILE_WALLET_LOGS } from '../mock/profile';
import { usePatternStore, type MarketPattern } from './usePatternStore';

export type UnlockSource = 'free' | 'points' | 'member' | 'author';

interface ResourceAccessState {
  pointsBalance: number;
  pointsLogs: ProfileWalletLog[];
  membershipActive: boolean;
  ownedFileIds: Set<number>;
  downloadedFileIds: Set<number>;
  unlockSourceById: Record<number, UnlockSource>;
  canAccessFile: (file: MarketPattern) => boolean;
  canDownloadImage: (file: MarketPattern) => boolean;
  getUnlockSource: (fileId: number) => UnlockSource | null;
  unlockFree: (fileId: number) => boolean;
  unlockWithPoints: (file: MarketPattern) => boolean;
  unlockWithMember: (fileId: number) => boolean;
  markDownloaded: (fileId: number) => void;
  toggleMockMembership: () => void;
  addPoints: (amount: number) => void;
  signIn: () => void;
}

const DEFAULT_POINTS = 860;

function formatLogTime(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export const useResourceAccessStore = create<ResourceAccessState>((set, get) => ({
  pointsBalance: DEFAULT_POINTS,
  pointsLogs: MOCK_PROFILE_WALLET_LOGS,
  membershipActive: false,
  ownedFileIds: new Set<number>(),
  downloadedFileIds: new Set<number>(),
  unlockSourceById: {},

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

    set((state) => ({
      pointsBalance: state.pointsBalance + reward,
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
  },
}));
