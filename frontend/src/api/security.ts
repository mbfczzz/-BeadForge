import client from './client';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

export interface UserSessionItem {
  id: number;
  name: string;
  meta: string;
  current: boolean;
}

export interface BlacklistItem {
  id: string;
  rawId: number;
  blockedUserId?: number;
  name: string;
  reason: string;
}

export const userSessionApi = {
  list: () => client.get<any, ApiRes<UserSessionItem[]>>('/user-sessions'),

  heartbeat: (deviceId: string, deviceName?: string, deviceMeta?: string) =>
    client.post<any, ApiRes<UserSessionItem>>('/user-sessions/heartbeat', { deviceId, deviceName, deviceMeta }),

  remove: (id: number) => client.delete<any, ApiRes<void>>(`/user-sessions/${id}`),
};

export const userBlacklistApi = {
  list: () => client.get<any, ApiRes<BlacklistItem[]>>('/user-blacklist'),

  add: (targetUserId: number, reason?: string) =>
    client.post<any, ApiRes<BlacklistItem>>('/user-blacklist', { targetUserId, reason }),

  remove: (id: number) => client.delete<any, ApiRes<void>>(`/user-blacklist/${id}`),
};
