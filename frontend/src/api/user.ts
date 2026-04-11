import client from './client';
import { UserInfo } from './auth';

export const userApi = {
  getProfile: () =>
    client.get<any, { code: number; data: UserInfo }>('/user/profile'),

  updateProfile: (data: Partial<UserInfo>) =>
    client.put<any, { code: number; data: UserInfo }>('/user/profile', data),
};
