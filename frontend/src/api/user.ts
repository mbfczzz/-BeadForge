import client from './client';
import { UserInfo } from './auth';
import type { CommunityUserData } from './community';

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

  /** 通过 nickname/username 取社区档案（他人主页） */
  getCommunityProfile: (name: string) =>
    client.get<any, ApiRes<CommunityUserData>>(`/user/community/${encodeURIComponent(name)}`),
};
