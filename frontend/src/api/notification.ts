import client from './client';
import type { ProfileNoticeItem } from './profile';

interface ApiRes<T> {
  code: number;
  message: string;
  data: T;
}

interface PageRes<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export const notificationApi = {
  list: (type?: string, page = 1, size = 20) =>
    client.get<any, ApiRes<PageRes<ProfileNoticeItem>>>('/notifications', {
      params: { type, page, size },
    }),

  unreadCount: () =>
    client.get<any, ApiRes<{ count: number }>>('/notifications/unread-count'),

  markRead: (id: number | string) =>
    client.post<any, ApiRes<void>>(`/notifications/${id}/read`),

  markAllRead: () =>
    client.post<any, ApiRes<{ affected: number }>>('/notifications/read-all'),

  remove: (id: number | string) =>
    client.delete<any, ApiRes<void>>(`/notifications/${id}`),
};
