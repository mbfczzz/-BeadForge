import client from './client';
import type { ProfileWalletLog } from './profile';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface WalletBalance {
  balance: number;
  totalCharged: number;
  totalSpent: number;
}

export const walletApi = {
  balance: () =>
    client.get<any, ApiRes<WalletBalance>>('/wallet/balance'),

  logs: () =>
    client.get<any, ApiRes<ProfileWalletLog[]>>('/wallet/logs'),

  charge: (amount: number, method: 'wechat' | 'alipay' = 'wechat') =>
    client.post<any, ApiRes<{ balance: number; charged: number }>>('/wallet/charge', { amount, method }),

  buyPattern: (id: number) =>
    client.post<any, ApiRes<{ balance: number; cost: number }>>(`/wallet/buy-pattern/${id}`),
};
