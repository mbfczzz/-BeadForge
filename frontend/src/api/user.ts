import client from './client';
import { UserInfo } from './auth';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface UserStats {
  designCount: number;
  likeCount: number;
  followerCount: number;
  followingCount: number;
}

export const userApi = {
  getProfile: () =>
    client.get<any, ApiRes<UserInfo>>('/user/profile'),

  updateProfile: (data: Partial<UserInfo>) =>
    client.put<any, ApiRes<UserInfo>>('/user/profile', data),

  getStats: () =>
    client.get<any, ApiRes<UserStats>>('/user/stats'),
};
